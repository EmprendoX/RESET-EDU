import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export function QuickNoteButton({ onClick, disabled }: Props) {
  return (
    <Button
      variant="primary"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      leftIcon={<Plus className="h-4 w-4" />}
    >
      Nueva nota
    </Button>
  );
}
