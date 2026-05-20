import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  /** Optional action(s) shown on the right, e.g. an "Add Task" button. */
  action?: ReactNode;
}

/** The title row at the top of a page — gradient text, friendly and bold. */
export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-title font-extrabold text-transparent">
        {title}
      </h1>
      {action}
    </div>
  );
}
