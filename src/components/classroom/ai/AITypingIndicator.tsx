import { Sparkles } from 'lucide-react';

export function AITypingIndicator() {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-ai-100 bg-ai-50 px-3 py-2 text-sm text-ai-700">
      <Sparkles className="h-4 w-4 text-ai-500" aria-hidden />
      <span>El mentor está pensando</span>
      <span className="inline-flex gap-0.5" aria-hidden>
        <Dot delay="0ms" />
        <Dot delay="180ms" />
        <Dot delay="360ms" />
      </span>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-ai-500"
      style={{ animationDelay: delay }}
    />
  );
}
