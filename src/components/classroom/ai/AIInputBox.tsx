import { useEffect, useRef, useState } from 'react';
import { Mic, Send, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { MentorMode } from '@/types/ai';
import { truncate } from '@/lib/utils/format';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  initialValue?: string;
  selectedTextPreview?: string;
  onClearSelection?: () => void;
  currentMode?: MentorMode;
}

const MODE_LABEL: Record<MentorMode, string> = {
  class: 'Clase',
  qna: 'Preguntas',
  business_application: 'Aplicación',
  summary: 'Resumen',
  action_plan: 'Plan',
  exercise: 'Ejercicio',
  evaluation: 'Evaluación',
};

export function AIInputBox({
  onSend,
  disabled,
  initialValue,
  selectedTextPreview,
  onClearSelection,
  currentMode,
}: Props) {
  const [value, setValue] = useState(initialValue ?? '');
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const dictationPrefixRef = useRef('');

  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript,
    interimTranscript,
    start: startSpeech,
    stop: stopSpeech,
  } = useSpeechRecognition({ lang: 'es-ES' });

  useEffect(() => {
    if (initialValue !== undefined) {
      setValue(initialValue);
      taRef.current?.focus();
    }
  }, [initialValue]);

  useEffect(() => {
    if (!isListening) return;
    setValue(
      dictationPrefixRef.current + transcript + interimTranscript,
    );
  }, [interimTranscript, isListening, transcript]);

  function handleMicToggle() {
    if (disabled) return;
    if (isListening) {
      stopSpeech();
      return;
    }
    dictationPrefixRef.current = value;
    startSpeech();
  }

  function handleSend() {
    if (isListening) stopSpeech();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  }

  return (
    <div className="border-t border-reset-border bg-reset-bg-1 p-2.5">
      {selectedTextPreview ? (
        <div className="mb-2 flex items-start gap-2 rounded-lg border border-brand-500/30 bg-brand-500/10 px-2.5 py-1.5 text-xs text-brand-200">
          <span className="font-medium">Selección:</span>
          <span className="line-clamp-2 flex-1">
            {truncate(selectedTextPreview, 200)}
          </span>
          {onClearSelection ? (
            <button
              type="button"
              onClick={onClearSelection}
              aria-label="Quitar selección del contexto"
              className="focus-ring -mr-1 inline-flex h-5 w-5 items-center justify-center rounded-md text-brand-300 hover:bg-brand-500/20"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-end gap-2 rounded-xl border border-reset-border bg-reset-bg-2 p-1.5 focus-within:border-ai-500/40 focus-within:ring-1 focus-within:ring-ai-500/30">
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            } else if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={2}
          disabled={disabled || isListening}
          placeholder="Escribe tu pregunta o usa los botones rápidos arriba…"
          aria-label="Mensaje al mentor IA"
          className={cn(
            'scrollbar-thin max-h-40 min-h-[40px] flex-1 resize-none border-0 bg-transparent p-2 text-sm text-white placeholder:text-reset-text-dim focus:outline-none',
          )}
        />
        {isSpeechSupported ? (
          <Button
            type="button"
            variant={isListening ? 'ai' : 'ghost'}
            size="icon"
            onClick={handleMicToggle}
            disabled={disabled}
            aria-label={
              isListening ? 'Detener dictado por voz' : 'Dictar por voz'
            }
            aria-pressed={isListening}
            className={cn(isListening && 'animate-pulse')}
          >
            <Mic className="h-4 w-4" aria-hidden />
          </Button>
        ) : null}
        <Button
          variant="ai"
          size="icon"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Enviar al mentor IA"
        >
          <Send className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      {currentMode ? (
        <p className="mt-1.5 flex items-center gap-1 text-[11px] text-reset-text-dim">
          <Sparkles className="h-3 w-3" aria-hidden />
          Enter para enviar · Modo activo: {MODE_LABEL[currentMode]}
        </p>
      ) : null}
    </div>
  );
}
