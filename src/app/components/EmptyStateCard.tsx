import type React from 'react';
import Card from './Card';

export default function EmptyStateCard({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="p-12">
      <div className="text-center">
        {icon ? <div className="mx-auto mb-4 flex justify-center">{icon}</div> : null}
        <p className="text-white light:text-gray-900 font-semibold mb-2">{title}</p>
        {description && <p className="text-gray-400 light:text-gray-600 text-sm mb-6">{description}</p>}
        {action}
      </div>
    </Card>
  );
}

