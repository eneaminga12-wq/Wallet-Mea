import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  Bitcoin,
  Bot,
  Home,
  LogOut,
  Menu,
  QrCode as QrIcon,
  Radio,
  Send,
  Settings,
  ShoppingBag,
  Users,
  BarChart3,
  X,
} from 'lucide-react';
import Logo from '../components/Logo';
import Avatar from '../components/ui/Avatar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { cn } from '../utils/cn';

interface NavItem {
  to: string;
  labelKey: string;
  icon: typeof Home;
}

const PRIMARY_NAV: NavItem[] = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: Home },
  { to: '/send', labelKey: 'nav.send', icon: Send },
  { to: '/receive', labelKey: 'nav.receive', icon: QrIcon },
  { to: '/buy', labelKey: 'nav.buy', icon: Bitcoin },
  { to: '/pay', labelKey: 'nav.pay', icon: ShoppingBag },
  { to: '/vikoba', labelKey: 'nav.vikoba', icon: Users },
  { to: '/ai', labelKey: 'nav.ai', icon: Bot },
];

const SECONDARY_NAV: NavItem[] = [
  { to: '/transactions', labelKey: 'nav.transactions', icon: BarChart3 },
  { to: '/analytics', labelKey: 'nav.analytics', icon: BarChart3 },
  { to: '/contacts', labelKey: 'nav.contacts', icon: Users },
  { to: '/notifications', labelKey: 'nav.notifications', icon: Bell },
  { to: '/sms-ussd', labelKey: 'nav.smsUssd', icon: Radio },
  { to: '/profile', labelKey: 'nav.profile', icon: Users },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];

const MOBILE_NAV: NavItem[] = [
  { to: '/dashboard', labelKey: 'nav.home', icon: Home },
  { to: '/send', labelKey: 'nav.send', icon: Send },
  { to: '/receive', labelKey: 'nav.receive', icon: QrIcon },
  { to: '/vikoba', labelKey: 'nav.vikoba', icon: Users },
  { to: '/ai', labelKey: 'nav.ai', icon: Bot },
];

export default function AppShell() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { unreadCount } = useWallet();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f7f8f8]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-slate-100 px-5">
          <Logo />
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {t(item.labelKey as never)}
            </NavLink>
          ))}
          <p className="px-3 pb-1 pt-4 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            More
          </p>
          {SECONDARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {t(item.labelKey as never)}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-slate-50"
          >
            <Avatar src={user?.avatar} name={user?.fullName ?? 'MeaBit User'} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800">{user?.fullName}</p>
              <p className="truncate text-xs text-slate-400">{user?.phone}</p>
            </div>
            <LogOut
              className="h-4 w-4 shrink-0 text-slate-400 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                logout();
                navigate('/');
              }}
            />
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              onClick={() => setMoreOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <button
              onClick={() => navigate('/notifications')}
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => navigate('/profile')} className="p-1 lg:hidden">
              <Avatar src={user?.avatar} name={user?.fullName ?? 'MeaBit User'} size="sm" />
            </button>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 lg:flex"
            >
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-36 sm:pb-32 lg:pb-16">
          <Outlet />
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-md grid-cols-5">
            {MOBILE_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={'/' + item.to.replace(/^\//, '')}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[10px] font-bold',
                    isActive ? 'text-brand-700' : 'text-slate-400'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {t(item.labelKey as never)}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile "More" drawer */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/45 animate-fade-in" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <Logo />
              <button onClick={() => setMoreOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-0.5 p-3">
              {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold',
                      isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-600 hover:bg-slate-50'
                    )
                  }
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {t(item.labelKey as never)}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-[18px] w-[18px]" />
                {t('nav.logout')}
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
