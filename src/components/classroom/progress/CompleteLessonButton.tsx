import { Check, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  isCompleted: boolean;
  isPending?: boolean;
  onComplete: () => void;
  size?: 'sm' | 'md';
  hideLabelOnMobile?: boolean;
}

export function CompleteLessonButton({
  isCompleted,
  isPending,
  onComplete,
  size = 'md',
  hideLabelOnMobile,
}: Props) {
  if (isCompleted) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        leftIcon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
      >
        <span className={hideLabelOnMobile ? 'hidden md:inline' : undefined}>
          Lección completada
        </span>
      </Button>
    );
  }
  return (
    <Button
      variant="secondary"
      size={size}
      onClick={onComplete}
      loading={isPending}
      leftIcon={<Check className="h-4 w-4" />}
    >
      <span className={hideLabelOnMobile ? 'hidden md:inline' : undefined}>
        Marcar completada
      </span>
    </Button>
  );
}
