import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

function stripMarkdownForSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`+/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickSpanishVoice(
  voices: ReadonlyArray<SpeechSynthesisVoice>,
): SpeechSynthesisVoice | null {
  const by =
    (prefix: string) =>
    (v: SpeechSynthesisVoice) =>
      v.lang.toLowerCase().startsWith(prefix);
  return (
    voices.find(by('es-es')) ??
    voices.find(by('es-mx')) ??
    voices.find(by('es-ar')) ??
    voices.find((v) => v.lang.toLowerCase().startsWith('es')) ??
    null
  );
}

/** Shared across all `useSpeechSynthesis()` subscribers (multiple message bubbles). */
let speakingIdStore: string | null = null;
const speakingListeners = new Set<() => void>();

function emitSpeaking() {
  speakingListeners.forEach((l) => l());
}

function setSpeakingId(id: string | null) {
  speakingIdStore = id;
  emitSpeaking();
}

function subscribeSpeaking(onChange: () => void) {
  speakingListeners.add(onChange);
  return () => {
    speakingListeners.delete(onChange);
  };
}

function getSpeakingSnapshot() {
  return speakingIdStore;
}

/** Avoid clearing global state when `cancel()` ends a superseded utterance. */
let activeSpeechForId: string | null = null;

export function useSpeechSynthesis() {
  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speakingId = useSyncExternalStore(
    subscribeSpeaking,
    getSpeakingSnapshot,
    () => null,
  );

  const [voicesTick, setVoicesTick] = useState(0);

  useEffect(() => {
    if (!isSupported) return;
    const synth = window.speechSynthesis;
    const load = () => setVoicesTick((n) => n + 1);
    load();
    synth.addEventListener('voiceschanged', load);
    return () => {
      synth.removeEventListener('voiceschanged', load);
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    activeSpeechForId = null;
    setSpeakingId(null);
  }, [isSupported]);

  const speak = useCallback(
    (id: string, rawText: string) => {
      if (!isSupported) return;
      void voicesTick;
      const plain = stripMarkdownForSpeech(rawText);
      if (!plain) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(plain);
      utterance.lang = 'es-ES';
      const voice = pickSpanishVoice(window.speechSynthesis.getVoices());
      if (voice) {
        utterance.voice = voice;
      }

      activeSpeechForId = id;
      setSpeakingId(id);

      utterance.onend = () => {
        if (activeSpeechForId === id) {
          activeSpeechForId = null;
          setSpeakingId(null);
        }
      };
      utterance.onerror = () => {
        if (activeSpeechForId === id) {
          activeSpeechForId = null;
          setSpeakingId(null);
        }
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, voicesTick],
  );

  const isSpeaking = speakingId !== null;

  return useMemo(
    () => ({
      isSupported,
      isSpeaking,
      speakingId,
      speak,
      stop,
    }),
    [isSpeaking, isSupported, speak, speakingId, stop],
  );
}
