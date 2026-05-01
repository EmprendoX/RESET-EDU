import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

function getRecognitionCtor():
  | (new () => SpeechRecognition)
  | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {},
) {
  const {
    lang = 'es-ES',
    continuous = true,
    interimResults = true,
  } = options;

  const isSupported = useMemo(() => Boolean(getRecognitionCtor()), []);

  const [isListening, setIsListening] = useState(false);
  /** Cumulative final transcript for the current listening session. */
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const accumulatedFinalRef = useRef('');

  const tearDownInstance = useCallback(() => {
    const r = recognitionRef.current;
    if (!r) return;
    r.onresult = null;
    r.onerror = null;
    r.onend = null;
    recognitionRef.current = null;
  }, []);

  const stop = useCallback(() => {
    const r = recognitionRef.current;
    if (r) {
      try {
        r.stop();
      } catch {
        try {
          r.abort();
        } catch {
          /* ignore */
        }
      }
    }
    setIsListening(false);
    tearDownInstance();
  }, [tearDownInstance]);

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    setError(null);
    accumulatedFinalRef.current = '';
    setTranscript('');
    setInterimTranscript('');

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const piece = result[0]?.transcript ?? '';
        if (result.isFinal) {
          accumulatedFinalRef.current += piece;
        } else {
          interim += piece;
        }
      }
      setTranscript(accumulatedFinalRef.current);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.message || event.error || 'speech_recognition_error');
      setIsListening(false);
      tearDownInstance();
    };

    recognition.onend = () => {
      setIsListening(false);
      tearDownInstance();
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'speech_start_failed');
      setIsListening(false);
      tearDownInstance();
    }
  }, [continuous, interimResults, lang, tearDownInstance]);

  useEffect(() => {
    return () => {
      const r = recognitionRef.current;
      if (r) {
        try {
          r.abort();
        } catch {
          /* ignore */
        }
      }
      tearDownInstance();
    };
  }, [tearDownInstance]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    start,
    stop,
    error,
  };
}
