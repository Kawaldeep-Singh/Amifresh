import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PlaceholderStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function PlaceholderState({ icon: Icon, title, description }: PlaceholderStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-surface rounded-xl border border-border shadow-sm">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary-light">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-text-main">{title}</h3>
      <p className="max-w-sm text-sm text-text-muted">
        {description}
      </p>
    </div>
  );
}
