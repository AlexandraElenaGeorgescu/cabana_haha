import { Quote, User, Vote, Complaint, CategoryId } from '../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig, hasSupabaseConfig } from './supabaseConfig';
import { logger } from '../utils/logger';

// --- INITIALIZATION ---
let supabase: SupabaseClient | null = null;
let isOfflineMode = true;
let dbStatus: 'connecting' | 'connected' | 'error' | 'offline' = 'offline';

// Initialize Supabase - much simpler than Firebase!
const initSupabase = async (): Promise<void> => {
    try {
        if (hasSupabaseConfig()) {
            dbStatus = 'connecting';
            logger.debug("🔄 Initializare Supabase...");
            
            supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
            
            // Test connection
            try {
                const { error } = await supabase.from('users').select('count').limit(1);
                if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (that's OK)
                    throw error;
                }
                isOfflineMode = false;
                dbStatus = 'connected';
                logger.info("✅ Supabase conectat! Database ready.");
            } catch (testError: unknown) {
                const error = testError as { message?: string };
                logger.warn("⚠️ Supabase connection test failed, but continuing:", error?.message || String(testError));
                // Still try to use it - might just need tables created
                isOfflineMode = false;
                dbStatus = 'connected';
                logger.info("✅ Supabase initialized (tables may need to be created)");
            }
        } else {
            logger.warn("⚠️ Config Supabase gol. Trecem pe LocalStorage.");
            dbStatus = 'offline';
        }
    } catch (e: unknown) {
        logger.error("❌ Eroare Supabase:", e);
        logger.warn("🛡️ Activat scutul anti-crash. Rulez din LocalStorage.");
        supabase = null;
        isOfflineMode = true;
        dbStatus = 'error';
    }
};

// Initialize immediately
initSupabase();

const KEYS = {
  USER: 'cabana_me',
  ALL_USERS: 'cabana_users',
  VOTES: 'cabana_votes',
  QUOTES: 'cabana_quotes',
  COMPLAINTS: 'cabana_complaints',
};

// --- LOCAL STORAGE HELPERS (The Safety Net) ---
const localData = {
  users: () => {
      try { return JSON.parse(localStorage.getItem(KEYS.ALL_USERS) || '[]'); } catch { return []; }
  },
  votes: () => {
      try { return JSON.parse(localStorage.getItem(KEYS.VOTES) || '[]'); } catch { return []; }
  },
  quotes: () => {
      try { return JSON.parse(localStorage.getItem(KEYS.QUOTES) || '[]'); } catch { return []; }
  },
  complaints: () => {
      try { return JSON.parse(localStorage.getItem(KEYS.COMPLAINTS) || '[]'); } catch { return []; }
  },
};

// --- PUBLIC API ---

export const storage = {
  isCloudEnabled: () => !isOfflineMode && !!supabase && dbStatus === 'connected',
  getDbStatus: () => dbStatus,

  getCurrentUser: (): string | null => {
    return localStorage.getItem(KEYS.USER);
  },

  login: async (name: string) => {
    localStorage.setItem(KEYS.USER, name);
    
    if (supabase && !isOfflineMode) {
      try {
        // Check if user exists
        const { data: existing } = await supabase
          .from('users')
          .select('name')
          .eq('name', name)
          .single();
        
        if (!existing) {
          // Add new user
          await supabase
            .from('users')
            .insert({ name, joined_at: new Date().toISOString() });
        }
      } catch (e: unknown) {
        logger.warn("Cloud login fail, fallback local", e);
        // Fallback to local
        const users = localData.users();
        if (!users.includes(name)) {
          users.push(name);
          localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
          window.dispatchEvent(new Event('storage-update'));
        }
      }
    } else {
      // Local logic
      const users = localData.users();
      if (!users.includes(name)) {
        users.push(name);
        localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
        window.dispatchEvent(new Event('storage-update'));
      }
    }
  },

  logout: () => {
    localStorage.removeItem(KEYS.USER);
  },

  // --- REAL TIME LISTENERS ---

  subscribeToUsers: (callback: (users: string[]) => void) => {
    if (supabase && !isOfflineMode) {
      try {
        // Initial load
        supabase
          .from('users')
          .select('name')
          .order('joined_at', { ascending: true })
          .then(({ data, error }: { data: { name: string }[] | null; error: unknown }) => {
            if (!error && data) {
              callback(data.map((u) => u.name));
            } else {
              callback(localData.users());
            }
          });

        // Real-time subscription
        const channel = supabase
          .channel('users-changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'users' },
            () => {
              supabase
                .from('users')
                .select('name')
                .order('joined_at', { ascending: true })
                .then(({ data }: { data: { name: string }[] | null }) => {
                  if (data) callback(data.map((u) => u.name));
                });
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (e) {
        callback(localData.users());
        return () => {};
      }
    } else {
      callback(localData.users());
      const handler = () => callback(localData.users());
      window.addEventListener('storage-update', handler);
      return () => window.removeEventListener('storage-update', handler);
    }
  },

  subscribeToVotes: (callback: (votes: Vote[]) => void) => {
    // Always load from localStorage first - INSTANT
    const initialVotes = localData.votes();
    callback(initialVotes);
    
    if (supabase && !isOfflineMode) {
      try {
        // Load from Supabase IMMEDIATELY (no delay) - async fire and forget
        (async () => {
          try {
            const { data, error } = await supabase
              .from('votes')
              .select('*');
            
            if (error) {
              logger.warn("Supabase votes error:", error);
              return;
            }
            
            if (data) {
              // Merge with localStorage (local takes priority for immediate updates)
              const localVotes = localData.votes();
              const allVotes = [...data, ...localVotes];
              // Remove duplicates by voter+category (keep local version)
              const uniqueVotes = Array.from(
                new Map(allVotes.map(v => [`${v.voter}-${v.category}`, v])).values()
              );
              
              // Update localStorage with merged data so it persists
              localStorage.setItem(KEYS.VOTES, JSON.stringify(uniqueVotes));
              
              callback(uniqueVotes);
            }
          } catch (err) {
            logger.warn("Supabase votes error:", err);
            // Keep using localStorage
          }
        })();

        // Real-time subscription - use event data directly (FAST!)
        const channel = supabase
          .channel('votes-changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'votes' },
            async () => {
              // Get fresh data from Supabase but FAST
              try {
                const { data, error } = await supabase
                  .from('votes')
                  .select('*');
                
                if (!error && data) {
                  // Merge with localStorage
                  const localVotes = localData.votes();
                  const allVotes = [...data, ...localVotes];
                  const uniqueVotes = Array.from(
                    new Map(allVotes.map(v => [`${v.voter}-${v.category}`, v])).values()
                  );
                  
                  // Update localStorage with merged data
                  localStorage.setItem(KEYS.VOTES, JSON.stringify(uniqueVotes));
                  
                  callback(uniqueVotes);
                }
              } catch (err) {
                logger.error("Real-time update error:", err);
              }
            }
          )
          .subscribe();

        // Also listen to localStorage updates for immediate feedback
        const storageHandler = () => {
          const localVotes = localData.votes();
          // Update IMMEDIATELY with localStorage data (no waiting for Supabase)
          callback(localVotes);
          
          // Then merge with Supabase in background (async, non-blocking)
          supabase
            .from('votes')
            .select('*')
            .then(({ data, error }: { data: Vote[] | null; error: unknown }) => {
              if (!error && data) {
                const allVotes = [...data, ...localVotes];
                const uniqueVotes = Array.from(
                  new Map(allVotes.map(v => [`${v.voter}-${v.category}`, v])).values()
                );
                // Update again with merged data
                callback(uniqueVotes);
                // Also update localStorage with merged data
                localStorage.setItem(KEYS.VOTES, JSON.stringify(uniqueVotes));
              }
            })
            .catch(() => {
              // If Supabase fails, keep using localStorage (already updated above)
            });
        };
        window.addEventListener('storage-update', storageHandler);

        return () => {
          supabase.removeChannel(channel);
          window.removeEventListener('storage-update', storageHandler);
        };
      } catch(e) {
        logger.error("Votes subscription error:", e);
        // Keep using localStorage
        const handler = () => callback(localData.votes());
        window.addEventListener('storage-update', handler);
        return () => window.removeEventListener('storage-update', handler);
      }
    } else {
      // LocalStorage only - listen for updates
      const handler = () => callback(localData.votes());
      window.addEventListener('storage-update', handler);
      return () => window.removeEventListener('storage-update', handler);
    }
  },

  subscribeToQuotes: (callback: (quotes: Quote[]) => void) => {
    // Always load from localStorage first - INSTANT
    callback(localData.quotes());
    
    if (supabase && !isOfflineMode) {
      try {
        // Load from Supabase IMMEDIATELY (no delay) - async fire and forget
        (async () => {
          try {
            const { data, error } = await supabase
              .from('quotes')
              .select('*')
              .order('timestamp', { ascending: false });
            
            if (error) {
              logger.warn("Supabase quotes error:", error);
              return;
            }
            
            if (data) {
              // Map Supabase data to Quote interface
              const mappedQuotes: Quote[] = data.map((q: { id?: string | number; text: string; author: string; added_by?: string; addedBy?: string; timestamp?: number }) => ({
                id: q.id?.toString() || Date.now().toString(),
                text: q.text,
                author: q.author,
                addedBy: q.added_by || q.addedBy || 'Unknown', // Map added_by back to addedBy
                timestamp: q.timestamp || Date.now()
              }));
              // Merge with localStorage (local takes priority for immediate updates)
              const localQuotes = localData.quotes();
              const allQuotes = [...mappedQuotes, ...localQuotes];
              // Remove duplicates by ID
              const uniqueQuotes = Array.from(
                new Map(allQuotes.map(q => [q.id, q])).values()
              );
              callback(uniqueQuotes.sort((a, b) => b.timestamp - a.timestamp));
            }
          } catch (err) {
            logger.warn("Supabase quotes error:", err);
            // Keep using localStorage
          }
        })();

        // Real-time subscription - use async/await for faster updates
        const channel = supabase
          .channel('quotes-changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'quotes' },
            async () => {
              try {
                const { data, error } = await supabase
                  .from('quotes')
                  .select('*')
                  .order('timestamp', { ascending: false });
                
                if (!error && data) {
                  const mappedQuotes: Quote[] = data.map((q: { id?: string | number; text: string; author: string; added_by?: string; addedBy?: string; timestamp?: number }) => ({
                    id: q.id?.toString() || Date.now().toString(),
                    text: q.text,
                    author: q.author,
                    addedBy: q.added_by || q.addedBy || 'Unknown',
                    timestamp: q.timestamp || Date.now()
                  }));
                  callback(mappedQuotes.sort((a, b) => b.timestamp - a.timestamp));
                }
              } catch (err) {
                logger.error("Real-time quotes update error:", err);
              }
            }
          )
          .subscribe();

        // Also listen to localStorage updates for immediate feedback
        const storageHandler = () => {
          const localQuotes = localData.quotes();
          // Merge with Supabase data if available
          supabase
            .from('quotes')
            .select('*')
            .order('timestamp', { ascending: false })
            .then(({ data, error }: { data: { id?: string | number; text: string; author: string; added_by?: string; addedBy?: string; timestamp?: number }[] | null; error: unknown }) => {
              if (!error && data) {
                const mappedQuotes: Quote[] = data.map((q) => ({
                  id: q.id?.toString() || Date.now().toString(),
                  text: q.text,
                  author: q.author,
                  addedBy: q.added_by || q.addedBy || 'Unknown',
                  timestamp: q.timestamp || Date.now()
                }));
                const allQuotes = [...mappedQuotes, ...localQuotes];
                const uniqueQuotes = Array.from(
                  new Map(allQuotes.map(q => [q.id, q])).values()
                );
                callback(uniqueQuotes.sort((a, b) => b.timestamp - a.timestamp));
              } else {
                callback(localQuotes);
              }
            })
            .catch(() => callback(localQuotes));
        };
        window.addEventListener('storage-update', storageHandler);

        return () => {
          supabase.removeChannel(channel);
          window.removeEventListener('storage-update', storageHandler);
        };
      } catch(e) {
        logger.error("Quotes subscription error:", e);
        // Keep using localStorage
        const handler = () => callback(localData.quotes());
        window.addEventListener('storage-update', handler);
        return () => window.removeEventListener('storage-update', handler);
      }
    } else {
      // LocalStorage only - listen for updates
      const handler = () => callback(localData.quotes());
      window.addEventListener('storage-update', handler);
      return () => window.removeEventListener('storage-update', handler);
    }
  },

  // --- ACTIONS ---

  addVote: async (vote: Vote) => {
    // Always save to localStorage first for immediate feedback
    const votes = localData.votes();
    const filtered = votes.filter((v: Vote) => !(v.voter === vote.voter && v.category === vote.category));
    filtered.push(vote);
    localStorage.setItem(KEYS.VOTES, JSON.stringify(filtered));
    window.dispatchEvent(new Event('storage-update'));
    
    // Then try to save to Supabase
    if (supabase && !isOfflineMode) {
      try {
        const { data, error } = await supabase
          .from('votes')
          .upsert({
            voter: vote.voter,
            candidate: vote.candidate,
            category: vote.category
          }, { 
            onConflict: 'voter,category',
            ignoreDuplicates: false
          });
        
        if (error) {
          logger.warn("Cloud vote failed:", error);
          // Keep in localStorage even if cloud fails
        } else {
          logger.debug("✅ Vote saved to Supabase:", data);
        }
      } catch (e) {
        logger.error("Cloud vote error:", e);
        // Keep in localStorage even if cloud fails
      }
    }
  },

  removeVote: async (voter: string, category: CategoryId) => {
    // Remove from localStorage first for immediate feedback
    const votes = localData.votes();
    const filtered = votes.filter((v: Vote) => !(v.voter === voter && v.category === category));
    localStorage.setItem(KEYS.VOTES, JSON.stringify(filtered));
    window.dispatchEvent(new Event('storage-update'));
    
    // Then try to remove from Supabase
    if (supabase && !isOfflineMode) {
      try {
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('voter', voter)
          .eq('category', category);
        
        if (error) {
          logger.warn("Cloud vote removal failed:", error);
          // Keep removed from localStorage even if cloud fails
        } else {
          logger.debug("✅ Vote removed from Supabase");
        }
      } catch (e) {
        logger.error("Cloud vote removal error:", e);
        // Keep removed from localStorage even if cloud fails
      }
    }
  },

  addQuote: async (quote: Quote) => {
    // Always save to localStorage first for immediate feedback
    const quotes = localData.quotes();
    quotes.push(quote);
    localStorage.setItem(KEYS.QUOTES, JSON.stringify(quotes));
    window.dispatchEvent(new Event('storage-update'));
    
    // Then try to save to Supabase
    if (supabase && !isOfflineMode) {
      try {
        // Map Quote interface to Supabase table structure
        const { data, error } = await supabase
          .from('quotes')
          .insert({
            id: quote.id, // Use the provided ID
            text: quote.text,
            author: quote.author,
            added_by: quote.addedBy, // Map addedBy to added_by
            timestamp: quote.timestamp
          });
        
        if (error) {
          logger.warn("Cloud quote failed:", error);
          // Don't remove from localStorage, keep it there
        } else {
          logger.debug("✅ Quote saved to Supabase:", data);
        }
      } catch (e) {
        logger.error("Cloud quote error:", e);
        // Keep in localStorage even if cloud fails
      }
    }
  },

  subscribeToComplaints: (callback: (complaints: Complaint[]) => void) => {
    // Always load from localStorage first - INSTANT
    callback(localData.complaints());
    
    if (supabase && !isOfflineMode) {
      try {
        // Load from Supabase IMMEDIATELY (no delay) - async fire and forget
        (async () => {
          try {
            const { data, error } = await supabase
              .from('complaints')
              .select('*')
              .order('timestamp', { ascending: false });
            
            if (error) {
              logger.warn("Supabase complaints error:", error);
              return;
            }
            
            if (data) {
              // Map Supabase data to Complaint interface
              const mappedComplaints: Complaint[] = data.map((c: { id?: string | number; text: string; ai_reply?: string; aiReply?: string; timestamp?: number }) => ({
                id: c.id?.toString() || Date.now().toString(),
                text: c.text,
                aiReply: c.ai_reply || c.aiReply || '',
                timestamp: c.timestamp || Date.now()
              }));
              // Merge with localStorage (local takes priority for immediate updates)
              const localComplaints = localData.complaints();
              const allComplaints = [...mappedComplaints, ...localComplaints];
              // Remove duplicates by ID
              const uniqueComplaints = Array.from(
                new Map(allComplaints.map(c => [c.id, c])).values()
              );
              callback(uniqueComplaints.sort((a, b) => b.timestamp - a.timestamp));
            }
          } catch (err) {
            logger.warn("Supabase complaints error:", err);
            // Keep using localStorage
          }
        })();

        // Real-time subscription - use async/await for faster updates
        const channel = supabase
          .channel('complaints-changes')
          .on('postgres_changes',
            { event: '*', schema: 'public', table: 'complaints' },
            async () => {
              try {
                const { data, error } = await supabase
                  .from('complaints')
                  .select('*')
                  .order('timestamp', { ascending: false });
                
                if (!error && data) {
                  const mappedComplaints: Complaint[] = data.map((c: { id?: string | number; text: string; ai_reply?: string; aiReply?: string; timestamp?: number }) => ({
                    id: c.id?.toString() || Date.now().toString(),
                    text: c.text,
                    aiReply: c.ai_reply || c.aiReply || '',
                    timestamp: c.timestamp || Date.now()
                  }));
                  callback(mappedComplaints.sort((a, b) => b.timestamp - a.timestamp));
                }
              } catch (err) {
                logger.error("Real-time complaints update error:", err);
              }
            }
          )
          .subscribe();

        // Also listen to localStorage updates for immediate feedback
        const storageHandler = () => {
          const localComplaints = localData.complaints();
          // Merge with Supabase data if available
          supabase
            .from('complaints')
            .select('*')
            .order('timestamp', { ascending: false })
            .then(({ data, error }: { data: { id?: string | number; text: string; ai_reply?: string; aiReply?: string; timestamp?: number }[] | null; error: unknown }) => {
              if (!error && data) {
                const mappedComplaints: Complaint[] = data.map((c) => ({
                  id: c.id?.toString() || Date.now().toString(),
                  text: c.text,
                  aiReply: c.ai_reply || c.aiReply || '',
                  timestamp: c.timestamp || Date.now()
                }));
                const allComplaints = [...mappedComplaints, ...localComplaints];
                const uniqueComplaints = Array.from(
                  new Map(allComplaints.map(c => [c.id, c])).values()
                );
                callback(uniqueComplaints.sort((a, b) => b.timestamp - a.timestamp));
              } else {
                callback(localComplaints);
              }
            })
            .catch(() => callback(localComplaints));
        };
        window.addEventListener('storage-update', storageHandler);

        return () => {
          supabase.removeChannel(channel);
          window.removeEventListener('storage-update', storageHandler);
        };
      } catch(e) {
        logger.error("Complaints subscription error:", e);
        // Keep using localStorage
        const handler = () => callback(localData.complaints());
        window.addEventListener('storage-update', handler);
        return () => window.removeEventListener('storage-update', handler);
      }
    } else {
      // LocalStorage only - listen for updates
      const handler = () => callback(localData.complaints());
      window.addEventListener('storage-update', handler);
      return () => window.removeEventListener('storage-update', handler);
    }
  },

  addComplaint: async (complaint: Complaint) => {
    // Always save to localStorage first for immediate feedback
    const complaints = localData.complaints();
    complaints.push(complaint);
    localStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(complaints));
    window.dispatchEvent(new Event('storage-update'));
    
    // Then try to save to Supabase
    if (supabase && !isOfflineMode) {
      try {
        // Map Complaint interface to Supabase table structure
        const { data, error } = await supabase
          .from('complaints')
          .insert({
            id: complaint.id, // Use the provided ID
            text: complaint.text,
            ai_reply: complaint.aiReply, // Map aiReply to ai_reply
            timestamp: complaint.timestamp
          });
        
        if (error) {
          logger.warn("Cloud complaint failed:", error);
          // Don't remove from localStorage, keep it there
        } else {
          logger.debug("✅ Complaint saved to Supabase:", data);
        }
      } catch (e) {
        logger.error("Cloud complaint error:", e);
        // Keep in localStorage even if cloud fails
      }
    }
  },
  
  getUsersSync: () => localData.users(),
};
