import React from 'react';

export const Card = ({
  children,
  variant = 'surface', // surface or secondary
  interactive = false,
  className = '',
  onClick,
  ...props
}) => {
  const bgClasses = variant === 'secondary' ? 'bg-rx-surface' : 'bg-rx-card';
  const interactiveClasses = interactive
    ? 'hover:-translate-y-0.5 hover:border-rx-accent/50 hover:shadow-lg hover:shadow-rx cursor-pointer transition-all duration-200'
    : '';

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-rx-border text-rx-main overflow-hidden ${bgClasses} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-5 sm:p-6 border-b border-rx-border flex flex-col gap-1 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base sm:text-lg font-bold text-rx-main tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-xs text-rx-muted leading-relaxed ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-5 sm:p-6 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-5 sm:p-6 pt-0 border-t border-rx-border mt-auto flex items-center justify-between gap-3 ${className}`}>
    {children}
  </div>
);

export default Card;
