import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Box, CreditCard, Layout, Zap, CheckCircle2, Hexagon, Terminal } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onLogin, onRegister }) => {
  const { isAuthenticated, user } = useAuth();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="min-h-screen bg-cloud dark:bg-brand-dark text-slate-900 dark:text-slate-200 font-sans selection:bg-accent-primary/30 selection:text-brand-dark">
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern-light dark:bg-grid-pattern bg-[size:40px_40px] opacity-[0.05] dark:opacity-[0.07]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cloud dark:to-brand-dark"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-cloud-border dark:border-white/10 bg-cloud/80 dark:bg-brand-dark/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-brand-dark font-bold font-mono group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight font-mono">syncSpace_</span>
          </div>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium font-mono text-slate-500 dark:text-slate-400 hidden md:inline">
                  user: {user?.username}
                </span>
                <button
                  onClick={onEnter}
                  className="bg-slate-900 dark:bg-white text-white dark:text-brand-dark px-5 py-2 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  Dashboard <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={onLogin}
                  className="text-sm font-semibold hover:text-accent-primary transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={onRegister}
                  className="bg-accent-primary text-brand-dark px-5 py-2 rounded-md font-bold text-sm hover:bg-accent-primary/90 transition-colors shadow-[0_0_15px_rgba(212,255,0,0.3)] hover:shadow-[0_0_25px_rgba(212,255,0,0.5)]"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
              <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                System Online v2.0
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] text-slate-900 dark:text-white mb-8">
              Precision tools for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-400 dark:to-white">
                chaotic workflows.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12">
              SyncSpace isn't just a project management tool. It's a high-performance workspace engine designed for teams who demand clarity, speed, and absolute control.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <button
                  onClick={onEnter}
                  className="h-14 px-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-brand-dark font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl"
                >
                  <Terminal className="w-5 h-5" />
                  Initialize Workspace
                </button>
              ) : (
                <>
                  <button
                    onClick={onRegister}
                    className="h-14 px-8 rounded-lg bg-accent-primary text-brand-dark font-bold text-lg hover:bg-accent-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(212,255,0,0.25)] flex items-center gap-2"
                  >
                    Start Building <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onLogin}
                    className="h-14 px-8 rounded-lg border border-slate-200 dark:border-white/20 hover:bg-slate-100 dark:hover:bg-white/10 font-semibold text-lg transition-all"
                  >
                    View Demo
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="relative z-10 py-24 px-6 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-brand-surface/50">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <motion.div
              style={{ y }}
              className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-dark p-8 md:p-12 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 group"
            >
              <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center mb-6 text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Fluid Kanban Systems</h3>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8 max-w-md">
                Drag, drop, and organize with zero friction. Our physics-based board engine feels tangible and responsive.
              </p>

              <div className="rounded-xl bg-slate-100 dark:bg-brand-surface border border-slate-200 dark:border-white/5 p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20">
                  <Hexagon className="w-24 h-24 text-slate-900 dark:text-white" strokeWidth={0.5} />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 space-y-3">
                    <div className="h-2 w-20 bg-slate-300 dark:bg-white/20 rounded-full"></div>
                    <div className="h-24 bg-white dark:bg-brand-dark rounded-lg border border-slate-200 dark:border-white/5 shadow-sm p-3">
                      <div className="h-2 w-12 bg-accent-secondary/50 rounded-full mb-2"></div>
                      <div className="h-2 w-3/4 bg-slate-200 dark:bg-white/10 rounded-full mb-1"></div>
                      <div className="h-2 w-1/2 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3 pt-6">
                    <div className="h-24 bg-white dark:bg-brand-dark rounded-lg border border-slate-200 dark:border-white/5 shadow-sm p-3 transform translate-y-2">
                      <div className="h-2 w-12 bg-accent-primary/50 warning rounded-full mb-2"></div>
                      <div className="h-2 w-3/4 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="h-2 w-20 bg-slate-300 dark:bg-white/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-dark p-8 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 group">
              <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center mb-6 text-slate-900 dark:text-white group-hover:rotate-12 transition-transform duration-300">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Real-time Sync</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Sub-millisecond latency. See your team's cursors and edits as they happen.
              </p>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-brand-surface border border-slate-100 dark:border-white/5">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/20 border-2 border-white dark:border-brand-dark"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-status-success rounded-full border-2 border-white dark:border-brand-dark"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-16 bg-slate-300 dark:bg-white/20 rounded-full"></div>
                  <div className="h-1.5 w-10 bg-slate-200 dark:bg-white/10 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-brand-dark p-8 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 group">
              <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center mb-6 text-slate-900 dark:text-white group-hover:scale-90 transition-transform duration-300">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Block-Based Editor</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                A powerful Notion-style editor for documents, specs, and notes.
              </p>
              <div className="space-y-2 font-mono text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-brand-surface p-4 rounded-lg border border-slate-100 dark:border-white/5">
                <p><span className="text-accent-tertiary">#</span> Q3_Roadmap.md</p>
                <p className="pl-2 border-l border-slate-200 dark:border-white/10">- [x] Launch MVP</p>
                <p className="pl-2 border-l border-slate-200 dark:border-white/10">- [ ] Scale users</p>
              </div>
            </div>

            {/* Card 4 - Wide */}
            <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-accent-secondary/5 dark:bg-accent-secondary/5 p-8 md:p-12 shadow-sm hover:shadow-xl hover:border-accent-secondary/30 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-secondary/10 dark:bg-accent-secondary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Command Center</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg">
                    Access everything with <kbd className="px-2 py-1 rounded bg-white dark:bg-brand-surface border border-slate-200 dark:border-white/10 text-xs font-mono font-bold mx-1">Cmd + K</kbd>. Navigate between boards, task, and settings without lifting your hands from the keyboard.
                  </p>
                </div>
                <div className="w-full md:w-1/3 bg-white dark:bg-brand-dark rounded-lg border border-slate-200 dark:border-white/10 shadow-lg p-4">
                  <div className="flex items-center gap-2 mb-3 px-2 py-1 rounded bg-slate-100 dark:bg-white/5">
                    <Terminal className="w-4 h-4 text-slate-400" />
                    <div className="h-4 w-1 bg-accent-secondary animate-pulse"></div>
                  </div>
                  <div className="space-y-1">
                    {['Go to Marketing Board', 'Create new Task', 'Switch Theme'].map((item, i) => (
                      <div key={i} className={`px-3 py-2 rounded flex items-center justify-between ${i === 0 ? 'bg-accent-secondary/10 text-accent-secondary' : 'text-slate-500 dark:text-slate-400'}`}>
                        <span className="text-xs font-medium">{item}</span>
                        {i === 0 && <CornerDownLeft size={10} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 dark:border-white/5 bg-cloud dark:bg-brand-dark">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 dark:bg-white rounded flex items-center justify-center text-white dark:text-brand-dark font-bold font-mono text-xs">S</div>
            <span className="font-bold tracking-tight text-slate-900 dark:text-white">syncSpace_</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} Orbital Systems Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Icon component helper
const CornerDownLeft = ({ size = 16, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="9 10 4 15 9 20" />
    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
  </svg>
);

export default LandingPage;
