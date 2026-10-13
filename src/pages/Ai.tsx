import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Mic,
  Pause,
  Play,
  Send as SendIcon,
  Square,
  Volume2,
} from 'lucide-react';
import { Avatar, Button, PageHeader } from '../components/ui';
import { useLanguage } from '../i18n/LanguageContext';
import { aiService } from '../services/aiService';
import { voiceService, type VoiceState } from '../services/voiceService';
import type { ChatMessage } from '../types';
import { cn } from '../utils/cn';

export default function Ai() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [speaking, setSpeaking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Seed greeting when language changes and no messages yet
  useEffect(() => {
    setMessages([
      {
        id: 'greet',
        role: 'assistant',
        text: t('ai.greeting'),
        timestamp: Date.now(),
      },
    ]);
  }, [language, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || thinking) return;
    setInput('');
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: q, timestamp: Date.now() }]);
    setThinking(true);
    const answer = await aiService.ask(q, language);
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: 'assistant', text: answer.text, timestamp: Date.now() },
    ]);
    setThinking(false);
  }

  async function handleVoice() {
    if (voiceState === 'listening') return;
    setVoiceState('listening');
    const transcript = await voiceService.listen();
    setVoiceState('processing');
    await new Promise((r) => setTimeout(r, 600));
    setVoiceState('idle');
    if (transcript) await ask(transcript);
  }

  async function speak(text: string) {
    if (speaking) {
      voiceService.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    await voiceService.speak(text);
    setSpeaking(false);
  }

  const suggestions = aiService.suggestions(language);

  return (
    <div className="animate-fade-in mx-auto flex h-[calc(100vh-11rem)] max-w-3xl flex-col lg:h-[calc(100vh-9rem)]">
      <PageHeader title={t('ai.title')} description={t('ai.desc')} />

      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        {messages.map((m) => (
          <div key={m.id} className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role === 'assistant' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'rounded-br-sm bg-brand-700 text-white'
                  : 'rounded-bl-sm bg-slate-100 text-slate-800'
              )}
            >
              <p>{m.text}</p>
              <p className={cn('tnum mt-1.5 text-[10px]', m.role === 'user' ? 'text-white/60' : 'text-slate-400')}>
                {new Date(m.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {thinking && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Bot className="h-4 w-4" />
            {t('ai.processing')}
            <span className="flex gap-0.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-500 [animation-delay:240ms]" />
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Voice status bar */}
      {voiceState !== 'idle' && (
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 animate-slide-up">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-600" />
          </span>
          <p className="text-sm font-bold text-brand-800">
            {voiceState === 'listening' ? t('ai.listening') : t('ai.processing')}
          </p>
          <p className="ml-auto text-[11px] font-medium text-brand-600">{t('ai.voiceDemo')}</p>
        </div>
      )}

      {/* Suggested questions */}
      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="mt-3 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={handleVoice}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all',
            voiceState === 'listening'
              ? 'animate-pulse-ring bg-red-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
          aria-label={t('ai.askWithVoice')}
        >
          <Mic className="h-5 w-5" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('ai.placeholder')}
          className="h-11 flex-1 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button
          type="submit"
          disabled={!input.trim() || thinking}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white transition-opacity hover:bg-brand-800 disabled:opacity-40"
          aria-label={t('common.continue')}
        >
          <SendIcon className="h-4.5 w-4.5" />
        </button>
      </form>

      {/* Playback controls on last AI message */}
      {messages.length > 1 && (
        <div className="mt-2 flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => speak(messages[messages.length - 1].text)}>
            {speaking ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            {speaking ? t('ai.stop') : t('ai.play')}
          </Button>
          <span className="text-[11px] text-slate-400">{t('ai.voiceDemo')}</span>
        </div>
      )}
    </div>
  );
}
