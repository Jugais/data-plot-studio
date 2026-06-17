// src/app/components/Button.tsx
import React from 'react';

type Variant = 'primary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantCls: Record<Variant, string> = {
  primary: 'bg-slate-800 hover:bg-indigo-800 text-white shadow-sm',
  ghost:   'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-200',
  danger:  'bg-transparent hover:bg-red-50 text-red-500 border border-red-200',
};

const sizeCls: Record<Size, string> = {
  sm: 'text-xs px-3 py-1',
  md: 'text-xs px-4 py-1.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => (
  <button
    className={`
      inline-flex items-center gap-2 font-medium rounded-full transition-colors
      ${variantCls[variant]} ${sizeCls[size]} ${className}
    `.trim()}
    {...props}
  >
    {icon && <span className="shrink-0">{icon}</span>}
    {children}
  </button>
);
