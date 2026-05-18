import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  /** Optional action(s) shown on the right, e.g. an "Add Task" button. */
  action?: ReactNode;
}

/** The title row at the top of a page. */
export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h1 className="text-title">{title}</h1>
      {action}
    </div>
  );
}
