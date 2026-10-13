import { Outlet } from 'react-router-dom';
import { Zap, Smartphone, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';

import heroImage from '../assets/hero-tanzania.jpg';

export default function AuthLayout() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT — High-quality lifestyle photography with brand overlay (visible on tablet, laptop, and desktop) */}
      <div className="relative hidden md:flex md:w-1/2 min-h-screen">
        <img
          src={heroImage}
          alt="MeaBit Wallet user enjoying simple digital payments on smartphone"
          className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/30" />

        <div className="relative z-10 flex w-full items-start justify-between p-8 xl:p-10">
          <Logo variant="light" />
        </div>

        <div className="relative z-10 mt-auto w-full p-8 xl:p-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-md mb-4 border border-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('brand.badge')}</span>
          </div>

          <p className="max-w-md text-3xl font-extrabold leading-tight tracking-tight text-white xl:text-4xl drop-shadow-xs">
            {t('brand.tagline')}
          </p>
          <span className="mt-3 block text-base font-normal leading-relaxed text-white/90 max-w-md">
            {t('brand.heroCaption')}
          </span>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            {[
              { icon: Zap, label: t('brand.featLightning') },
              { icon: Smartphone, label: t('brand.featPhone') },
              { icon: ShieldCheck, label: t('brand.featSecure') },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-medium text-white/95">
                <Icon className="h-4 w-4 text-emerald-300" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — auth form panel */}
      <div className="flex min-h-screen w-full flex-1 flex-col bg-white md:w-1/2">
        <div className="flex items-center justify-between p-5 md:justify-end md:px-10 md:pt-8">
          <div className="md:hidden">
            <Logo />
          </div>
          <LanguageSwitcher />
        </div>

        {/* Mobile / Narrow screen card: Photo of woman on the LEFT side */}
        <div className="px-6 pt-1 pb-4 md:hidden">
          <div className="flex items-center gap-3.5 rounded-2xl border border-brand-100 bg-gradient-to-r from-brand-50/70 to-emerald-50/40 p-3 shadow-xs">
            {/* LEFT SIDE: Woman holding phone photo */}
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl shadow-sm ring-1 ring-black/5">
              <img
                src={heroImage}
                alt="MeaBit Wallet user enjoying simple digital payments on smartphone"
                className="h-full w-full object-cover object-[center_25%]"
              />
            </div>
            {/* RIGHT SIDE: Inspiring product info */}
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-100/90 px-2 py-0.5 text-[10px] font-semibold text-brand-800">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-pulse" />
                <span>{t('brand.badge')}</span>
              </div>
              <p className="mt-1 text-sm font-bold text-slate-900 leading-snug">{t('brand.tagline')}</p>
              <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{t('brand.heroCaption')}</p>
            </div>
          </div>
        </div>

        <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-6 pb-10 md:px-8">
          <Outlet />
        </main>

        <footer className="px-6 pb-6 text-center text-xs text-slate-400 md:px-10">
          © {new Date().getFullYear()} MeaBit Wallet · Secure & Seamless Finance
        </footer>
      </div>
    </div>
  );
}
