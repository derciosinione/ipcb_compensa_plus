import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconClassName,
  size = 'md'
}: EmptyStateProps) {
  const sizes = {
    sm: {
      container: 'p-8',
      iconCircle: 'w-16 h-16',
      icon: 'w-8 h-8',
      title: 'text-lg',
      description: 'text-sm'
    },
    md: {
      container: 'p-12',
      iconCircle: 'w-24 h-24',
      icon: 'w-10 h-10',
      title: 'text-xl',
      description: 'text-sm'
    },
    lg: {
      container: 'p-16',
      iconCircle: 'w-32 h-32',
      icon: 'w-14 h-14',
      title: 'text-2xl',
      description: 'text-base'
    }
  };

  const sizeConfig = sizes[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800',
        sizeConfig.container,
        className
      )}
    >
      <div
        className={cn(
          'bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4',
          sizeConfig.iconCircle,
          iconClassName
        )}
      >
        <Icon className={cn('text-slate-400', sizeConfig.icon)} />
      </div>
      <h2 className={cn('font-bold text-slate-900 dark:text-slate-100', sizeConfig.title)}>
        {title}
      </h2>
      <p className={cn('text-slate-500 dark:text-slate-400 text-center mt-1', sizeConfig.description)}>
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
