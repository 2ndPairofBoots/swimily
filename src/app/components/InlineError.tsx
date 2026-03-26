import Button from './Button';
import Card from './Card';

export default function InlineError({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="p-6">
      <p className="text-sm font-bold text-white light:text-gray-900">{title}</p>
      {message && <p className="text-sm text-gray-400 light:text-gray-600 mt-2">{message}</p>}
      {onRetry && (
        <div className="mt-4">
          <Button fullWidth size="lg" variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}
    </Card>
  );
}

