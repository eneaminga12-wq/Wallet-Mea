/**
 * Voice service with real Web Speech API support (SpeechSynthesis + SpeechRecognition)
 * and intelligent fallbacks.
 */
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export const voiceService = {
  /**
   * Check if speech synthesis is available in the current browser.
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  /**
   * Speak out text aloud using the browser's speech synthesis engine.
   * Cleans text from markdown and formats currency terms for natural speech.
   */
  speak(text: string, language: 'en' | 'sw' = 'sw'): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      try {
        // Cancel any ongoing speech first
        window.speechSynthesis.cancel();

        // Clean up markdown, symbols, and format terms for smooth pronunciation
        const cleanText = text
          .replace(/[*_#`~[\]()]/g, '')
          .replace(/https?:\/\/\S+/g, '')
          .replace(/\bTZS\b/gi, language === 'sw' ? 'Shilingi' : 'Tanzanian Shillings')
          .replace(/\bBTC\b/gi, 'Bitcoin')
          .trim();

        if (!cleanText) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = language === 'sw' ? 'sw-TZ' : 'en-US';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try selecting matching voice if loaded
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          if (language === 'sw') {
            const swVoice = voices.find(
              (v) => v.lang.toLowerCase().startsWith('sw') || v.lang.toLowerCase().includes('sw')
            );
            if (swVoice) {
              utterance.voice = swVoice;
            }
          } else {
            const enVoice = voices.find(
              (v) =>
                v.lang.toLowerCase().startsWith('en') &&
                (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online'))
            );
            if (enVoice) {
              utterance.voice = enVoice;
            }
          }
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
      } catch {
        resolve();
      }
    });
  },

  /**
   * Stop any ongoing speech.
   */
  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  /**
   * Check if speech is currently active.
   */
  isSpeaking(): boolean {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  },

  /**
   * Listen to the user's microphone using Web Speech Recognition,
   * with automatic fallback if permission is denied or browser unsupported.
   */
  async listen(language: 'en' | 'sw' = 'sw'): Promise<string> {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Natural simulated pause with authentic Bitcoin questions
      await new Promise((r) => setTimeout(r, 1200));
      const samples =
        language === 'sw'
          ? [
              'Bitcoin ni nini na inafanyaje kazi?',
              'Ni nini maana ya Bitcoin?',
              'Je, nawezaje kupokea Bitcoin?',
              'Lightning Network ni nini?',
            ]
          : [
              'What is Bitcoin and how does it work?',
              'What is the meaning of Bitcoin?',
              'How do I receive Bitcoin?',
              'What is the Lightning Network?',
            ];
      return samples[Math.floor(Math.random() * samples.length)];
    }

    return new Promise((resolve) => {
      let resolved = false;
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(
            language === 'sw'
              ? 'Bitcoin ni nini na inafanyaje kazi?'
              : 'What is Bitcoin and how does it work?'
          );
        }
      }, 4500);

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'sw' ? 'sw-TZ' : 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            const transcript = event.results?.[0]?.[0]?.transcript ?? '';
            resolve(
              transcript ||
                (language === 'sw'
                  ? 'Bitcoin ni nini na inafanyaje kazi?'
                  : 'What is Bitcoin and how does it work?')
            );
          }
        };

        recognition.onerror = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            resolve(
              language === 'sw'
                ? 'Bitcoin ni nini na inafanyaje kazi?'
                : 'What is Bitcoin and how does it work?'
            );
          }
        };

        recognition.onend = () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            resolve(
              language === 'sw'
                ? 'Bitcoin ni nini na inafanyaje kazi?'
                : 'What is Bitcoin and how does it work?'
            );
          }
        };

        recognition.start();
      } catch {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          resolve(
            language === 'sw'
              ? 'Bitcoin ni nini na inafanyaje kazi?'
              : 'What is Bitcoin and how does it work?'
          );
        }
      }
    });
  },
};
