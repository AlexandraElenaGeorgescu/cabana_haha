import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'neutral';
}

export const BrutalButton: React.FC<Props> = ({ children, variant = 'primary', className = '', ...props }) => {
  let colors = 'bg-lime-400 text-black hover:bg-lime-300'; // Default aka Primary
  
  if (variant === 'danger') colors = 'bg-red-500 text-white hover:bg-red-600';
  if (variant === 'success') colors = 'bg-cyan-400 text-black hover:bg-cyan-300';
  if (variant === 'neutral') colors = 'bg-white text-black hover:bg-gray-100';

  return (
    <button
      className={`
        ${colors}
        font-bold py-3 px-6 
        border-4 border-black 
        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] 
        active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
        active:translate-x-[4px] active:translate-y-[4px] 
        transition-all duration-75 uppercase tracking-wider
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};