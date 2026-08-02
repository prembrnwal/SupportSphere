import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  BarChart3,
  Users2,
  ShieldCheck,
  Clock,
  Workflow,
  Star,
  ChevronDown,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui';
import { testimonials, faqs } from '@/lib/dummyData';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { initials } from '@/lib/utils';

const features = [
  {
    icon: Zap,
    title: 'Lightning-fast ticketing',
    desc: 'Create, triage, and resolve tickets in seconds with a workflow built for speed.',
  },
  {
    icon: Workflow,
    title: 'Smart assignment',
    desc: 'Automatically route tickets to the right agent based on category and workload.',
  },
  {
    icon: BarChart3,
    title: 'Real-time analytics',
    desc: 'Track ticket volume, resolution time, and team performance at a glance.',
  },
  {
    icon: Users2,
    title: 'Team collaboration',
    desc: 'Comment, mention, and collaborate on tickets without leaving the platform.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise-grade security',
    desc: 'SOC 2 compliant infrastructure with encryption at rest and in transit.',
  },
  {
    icon: Clock,
    title: 'SLA tracking',
    desc: 'Set SLA rules and get automated alerts before deadlines are missed.',
  },
];

const whyUs = [
  { stat: '40%', label: 'Faster resolution times reported by teams' },
  { stat: '10k+', label: 'Support teams trust SupportHub daily' },
  { stat: '99.9%', label: 'Uptime SLA across all plans' },
  { stat: '24/7', label: 'Platform monitoring and support' },
];

const liveQueueTickets = [
  {
    id: 'TCK-1019',
    title: 'SSO login loop after certificate rotation',
    priority: 'Urgent',
    status: 'Open',
    priorityBg: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    statusBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    statusDot: 'bg-teal-500',
  },
  {
    id: 'TCK-1042',
    title: 'Invoice shows duplicate seat charges',
    priority: 'High',
    status: 'In progress',
    priorityBg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    statusBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    statusDot: 'bg-indigo-500',
  },
  {
    id: 'TCK-1055',
    title: 'Webhook events missing on plan upgrade',
    priority: 'Medium',
    status: 'Open',
    priorityBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
    statusBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    statusDot: 'bg-teal-500',
  },
];

export function LandingPage() {
  const [mobileNav, setMobileNav] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const dashboardTarget = user?.role === 'admin' ? '/admin' : '/dashboard';

  const handleConfirmLogout = () => {
    logout();
    setLogoutModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0d12] text-slate-900 dark:text-slate-100 overflow-x-hidden antialiased">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-[#0b0d12]/90 backdrop-blur-sm transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white shadow-xs">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Helpdesk</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Features</a>
            <a href="#why-us" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Why us</a>
            <a href="#testimonials" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Customers</a>
            <a href="#faq" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">FAQ</a>
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={dashboardTarget}
                  className="flex items-center gap-2 rounded-full border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 px-3.5 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white text-[10px]">
                    {initials(user.name)}
                  </div>
                  <span>{user.name}</span>
                </Link>
                <Link to={dashboardTarget}>
                  <button className="inline-flex items-center gap-1.5 text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full transition-colors shadow-xs">
                    <LayoutDashboard className="h-4 w-4" />
                    Go to Dashboard
                  </button>
                </Link>
                <button
                  onClick={() => setLogoutModalOpen(true)}
                  title="Logout"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 transition-colors">
                    Sign in
                  </button>
                </Link>
                <Link to="/register">
                  <button className="text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-full transition-colors shadow-xs">
                    Start free
                  </button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-1 text-slate-700 dark:text-slate-300" onClick={() => setMobileNav((v) => !v)}>
            {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileNav && (
          <div className="md:hidden border-t border-slate-100 dark:border-white/10 px-6 py-4 space-y-3 bg-white dark:bg-[#0b0d12]">
            <a href="#features" onClick={() => setMobileNav(false)} className="block text-sm font-medium py-1">Features</a>
            <a href="#why-us" onClick={() => setMobileNav(false)} className="block text-sm font-medium py-1">Why us</a>
            <a href="#testimonials" onClick={() => setMobileNav(false)} className="block text-sm font-medium py-1">Customers</a>
            <a href="#faq" onClick={() => setMobileNav(false)} className="block text-sm font-medium py-1">FAQ</a>
            
            {isAuthenticated ? (
              <div className="space-y-2 pt-2">
                <Link to={dashboardTarget} onClick={() => setMobileNav(false)} className="block">
                  <button className="w-full text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-full py-2.5 transition-colors flex items-center justify-center gap-2">
                    <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
                  </button>
                </Link>
                <button
                  onClick={() => { logout(); setMobileNav(false); }}
                  className="w-full text-sm font-medium text-red-600 border border-red-200 dark:border-red-900 rounded-full py-2 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1" onClick={() => setMobileNav(false)}>
                  <button className="w-full text-sm font-medium border border-slate-200 dark:border-white/20 rounded-full py-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Sign in</button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileNav(false)}>
                  <button className="w-full text-sm font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-full py-2 transition-colors">Start free</button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Hero Section with Seamless Background Blend */}
      <section className="relative px-6 lg:px-8 pt-12 pb-16 bg-gradient-to-b from-[#e6f4f3] via-[#dcf0ed] via-60% to-white dark:from-[#091817] dark:via-[#0c211f] dark:via-60% dark:to-[#0b0d12]">
        <div className="max-w-4xl mx-auto flex flex-col items-start pt-4">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/80 dark:border-teal-700/50 bg-white/70 dark:bg-teal-950/40 px-3.5 py-1.5 text-xs font-medium text-teal-800 dark:text-teal-300 mb-6 shadow-xs">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600 dark:text-teal-400">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>SLA-aware triage, built in</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-slate-900 dark:text-white mb-6">
            Support that stays{' '}
            <span className="text-teal-600 dark:text-teal-400">calm</span>
            <br />
            <span className="text-teal-600 dark:text-teal-400">under load</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl leading-relaxed">
            Helpdesk gives customer teams a single workspace for intake, triage,
            assignment and resolution — with the reporting your leadership
            already asks for.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 mb-10">
            {isAuthenticated ? (
              <>
                <Link to={dashboardTarget}>
                  <button className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors shadow-xs">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link to="/profile">
                  <button className="inline-flex items-center gap-2 border border-slate-300/80 dark:border-white/20 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-sm font-medium px-6 py-3 rounded-full transition-colors">
                    <UserIcon className="h-4 w-4" />
                    My Account
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register">
                  <button className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors shadow-xs">
                    Create your workspace
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="inline-flex items-center gap-2 border border-slate-300/80 dark:border-white/20 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-sm font-medium px-6 py-3 rounded-full transition-colors">
                    Explore the demo
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-10 sm:gap-14 mb-12">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">−42%</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">First response</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">3.1x</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Tickets / agent</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">4.8/5</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">CSAT</p>
            </div>
          </div>

          {/* Live Queue Preview Card */}
          <div className="w-full bg-white dark:bg-[#141a1a] rounded-2xl shadow-xl shadow-teal-900/5 dark:shadow-black/40 border border-slate-200/80 dark:border-white/10 overflow-hidden relative">
            <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">Live Queue</p>
                <p className="text-base font-bold text-slate-900 dark:text-white">Northwind workspace</p>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                All SLAs on track
              </div>
            </div>

            <div className="p-4 space-y-2.5">
              {liveQueueTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50/80 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4 hover:bg-slate-100/70 dark:hover:bg-white/8 transition-colors cursor-pointer"
                >
                  <div className="space-y-1">
                    <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{ticket.id}</p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{ticket.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ticket.priorityBg}`}>
                      {ticket.priority}
                    </span>
                    <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${ticket.statusBg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${ticket.statusDot}`} />
                      {ticket.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-6 bg-gradient-to-b from-transparent to-white dark:to-[#141a1a]" />
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 lg:px-8 pt-12 pb-24 bg-white dark:bg-[#0b0d12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Everything your team needs</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-base">
              Purpose-built tools to help support teams move faster and stay organized.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-[#12141b] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs hover:border-teal-300 dark:hover:border-teal-700 transition-colors group"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-500/15 text-teal-600 dark:text-teal-400 mb-4 group-hover:bg-teal-100 dark:group-hover:bg-teal-500/25 transition-colors">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="px-6 lg:px-8 py-24 bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                Why teams choose Helpdesk
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                We built Helpdesk after years of wrestling with clunky, outdated support software. Every
                interaction is designed to be fast, clear, and genuinely pleasant to use.
              </p>
              <ul className="space-y-3.5">
                {[
                  'Setup in under 5 minutes, no engineering required',
                  'Beautiful UI your agents will actually enjoy using',
                  'Transparent pricing that scales with your team',
                  'Dedicated onboarding and migration support',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {whyUs.map((w) => (
                <div key={w.label} className="bg-white dark:bg-[#12141b] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 text-center shadow-xs">
                  <p className="text-3xl font-extrabold text-teal-600 dark:text-teal-400 tracking-tight">{w.stat}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{w.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-6 lg:px-8 py-24 bg-white dark:bg-[#0b0d12]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Loved by support teams</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-base">Don&apos;t just take our word for it.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white dark:bg-[#12141b] border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-400 font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 lg:px-8 py-24 bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Frequently asked questions</h2>
          </div>
          <div className="space-y-3.5">
            {faqs.map((f, i) => (
              <div key={f.q} className="bg-white dark:bg-[#12141b] border border-slate-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  <span>{f.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/5 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-8 py-24 bg-white dark:bg-[#0b0d12]">
        <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden bg-gradient-to-r from-teal-600 to-teal-800 shadow-xl">
          <div className="p-12 sm:p-16 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">Ready to transform your support workflow?</h2>
            <p className="text-teal-100 mb-8 max-w-md mx-auto text-base">
              Join thousands of teams delivering faster, better customer support with Helpdesk.
            </p>
            {isAuthenticated ? (
              <Link to={dashboardTarget}>
                <button className="inline-flex items-center gap-2 bg-white text-teal-800 hover:bg-teal-50 text-sm font-bold px-7 py-3.5 rounded-full transition-colors shadow-xs">
                  <LayoutDashboard className="h-4 w-4" /> Go to Dashboard
                </button>
              </Link>
            ) : (
              <Link to="/register">
                <button className="inline-flex items-center gap-2 bg-white text-teal-800 hover:bg-teal-50 text-sm font-bold px-7 py-3.5 rounded-full transition-colors shadow-xs">
                  Get started for free <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 dark:border-white/10 px-6 lg:px-8 py-12 bg-white dark:bg-[#0b0d12]">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">Helpdesk</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Modern support management for growing teams.</p>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Integrations', 'Changelog'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security'] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-6 border-t border-slate-200/70 dark:border-white/10 text-xs text-slate-400 text-center">
          © {new Date().getFullYear()} Helpdesk. All rights reserved.
        </div>
      </footer>

      <ConfirmDialog
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Confirm Sign Out"
        description="Are you sure you want to log out of SupportHub? You will need to sign in again to access your account."
        confirmLabel="Log Out"
        variant="danger"
      />
    </div>
  );
}
