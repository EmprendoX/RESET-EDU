import {
  Briefcase,
  ClipboardList,
  FileText,
  GraduationCap,
  HelpCircle,
  Target,
} from 'lucide-react';
import type { MentorMode } from '@/types/ai';
import { cn } from '@/lib/utils/cn';

interface Props {
  onPick: (params: { mode: MentorMode; prompt: string }) => void;
  disabled?: boolean;
  className?: string;
}

const ACTIONS: Array<{
  mode: MentorMode;
  label: string;
  prompt: string;
  Icon: typeof GraduationCap;
}> = [
  {
    mode: 'class',
    label: 'Explícame',
    prompt: 'Explícame esta lección como si fueras mi profesor.',
    Icon: GraduationCap,
  },
  {
    mode: 'summary',
    label: 'Resumen',
    prompt: 'Resúmeme lo más importante de esta lección.',
    Icon: FileText,
  },
  {
    mode: 'business_application',
    label: 'Aplicar a mi negocio',
    prompt: '¿Cómo aplico esta lección a mi negocio?',
    Icon: Briefcase,
  },
  {
    mode: 'exercise',
    label: 'Ejercicio',
    prompt: 'Dame un ejercicio práctico de esta lección.',
    Icon: Target,
  },
  {
    mode: 'action_plan',
    label: 'Plan de acción',
    prompt: 'Dame un plan de acción para implementar lo aprendido.',
    Icon: ClipboardList,
  },
  {
    mode: 'evaluation',
    label: 'Evalúame',
    prompt: 'Hazme preguntas para evaluar si entendí.',
    Icon: HelpCircle,
  },
];

export function AIQuickActions({ onPick, disabled, className }: Props) {
  return (
    <div
      className={cn(
        'scrollbar-thin -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1',
        className,
      )}
    >
      {ACTIONS.map(({ mode, label, prompt, Icon }) => (
        <button
          key={mode}
          type="button"
          onClick={() => onPick({ mode, prompt })}
          disabled={disabled}
          className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full border border-ai-200 bg-ai-50 px-3 py-1.5 text-xs font-medium text-ai-700 transition hover:bg-ai-100 disabled:opacity-60"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}
