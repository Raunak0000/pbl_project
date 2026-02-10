
import React from 'react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onEnter: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onLogin, onRegister }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-slate-50 dark:bg-[#0D1117] text-slate-900 dark:text-slate-100 min-h-screen font-sans antialiased selection:bg-blue-500/30">
      
      {/* Background Gradient Blob */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/70 dark:bg-[#0D1117]/70 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">S</div>
             <span className="text-xl font-bold tracking-tight">syncSpace</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400 hidden md:inline">@{user?.username}</span>
                <button onClick={onEnter} className="text-sm bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-full font-medium hover:opacity-90 transition-all shadow-lg shadow-slate-500/20">
                  Dashboard
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={onLogin} className="text-sm font-medium hover:text-blue-600 px-3 py-2 transition-colors">
                  Log In
                </button>
                <button onClick={onRegister} className="text-sm bg-blue-600 text-white px-5 py-2 rounded-full font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30">
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-32 pb-20 md:pt-40 md:pb-32 flex flex-col items-center text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-8 border border-blue-100 dark:border-blue-800">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          v2.0 is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 max-w-5xl mx-auto leading-[1.1]">
          Sync your team, <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 animate-gradient-x">
            master your workflow.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          The minimalist workspace for focused teams. Combine powerful Kanban boards with intelligent calendars and AI-assisted writing.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          {isAuthenticated ? (
             <button onClick={onEnter} className="h-12 px-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-lg hover:scale-105 transition-transform duration-200 shadow-xl shadow-slate-500/20 flex items-center gap-2">
               Enter Workspace
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </button>
          ) : (
            <>
              <button onClick={onRegister} className="h-12 px-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-lg hover:scale-105 transition-transform duration-200 shadow-xl shadow-slate-500/20">
                Start for Free
              </button>
              <button onClick={onLogin} className="h-12 px-8 rounded-full bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-lg hover:bg-slate-50 dark:hover:bg-[#21262D] transition-colors">
                Existing User
              </button>
            </>
          )}
        </div>

        {/* CSS-Only UI Mockup */}
        <div className="w-full max-w-5xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-slate-100 dark:bg-[#0D1117] rounded-xl border border-slate-200 dark:border-[#30363D] shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] flex">
                {/* Mock Sidebar */}
                <div className="w-16 md:w-48 border-r border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] flex flex-col p-4 gap-4 hidden sm:flex">
                    <div className="h-6 w-24 bg-slate-200 dark:bg-[#30363D] rounded mb-4"></div>
                    <div className="space-y-2">
                        <div className="h-8 w-full bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800/30"></div>
                        <div className="h-8 w-3/4 bg-slate-50 dark:bg-[#0D1117] rounded"></div>
                        <div className="h-8 w-5/6 bg-slate-50 dark:bg-[#0D1117] rounded"></div>
                    </div>
                </div>
                {/* Mock Board */}
                <div className="flex-1 p-6 bg-slate-50 dark:bg-[#0D1117] overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <div className="h-8 w-48 bg-slate-200 dark:bg-[#21262D] rounded"></div>
                        <div className="flex gap-2">
                             <div className="h-8 w-8 rounded-full bg-blue-500"></div>
                             <div className="h-8 w-8 rounded-full bg-green-500"></div>
                        </div>
                    </div>
                    <div className="flex gap-6 flex-1">
                        {[1, 2, 3].map((col) => (
                            <div key={col} className="flex-1 bg-slate-100 dark:bg-[#161B22] rounded-lg p-4 border border-slate-200 dark:border-[#30363D] flex flex-col gap-3">
                                <div className="h-4 w-20 bg-slate-300 dark:bg-[#30363D] rounded mb-2"></div>
                                <div className="h-24 bg-white dark:bg-[#21262D] rounded border border-slate-200 dark:border-[#30363D] shadow-sm p-3">
                                    <div className="h-3 w-3/4 bg-slate-200 dark:bg-[#30363D] rounded mb-2"></div>
                                    <div className="h-2 w-1/2 bg-slate-100 dark:bg-[#0D1117] rounded"></div>
                                </div>
                                <div className="h-24 bg-white dark:bg-[#21262D] rounded border border-slate-200 dark:border-[#30363D] shadow-sm p-3 opacity-70">
                                    <div className="h-3 w-2/3 bg-slate-200 dark:bg-[#30363D] rounded mb-2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* Bento Grid Features Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Orchestrate your work</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Everything you need to manage projects, designed in a modular grid for maximum efficiency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1: Kanban (Large) */}
            <div className="md:col-span-2 bg-white dark:bg-[#161B22] rounded-3xl p-8 border border-slate-200 dark:border-[#30363D] relative overflow-hidden group hover:border-blue-500/50 transition-colors shadow-sm">
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Visual Kanban Boards</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">Drag, drop, and move tasks seamlessly. Visualize your progress in real-time with intuitive columns.</p>
                </div>
                <div className="absolute right-0 bottom-0 w-1/2 h-3/4 bg-slate-50 dark:bg-[#0D1117] rounded-tl-2xl border-t border-l border-slate-200 dark:border-[#30363D] p-4 group-hover:scale-[1.02] transition-transform duration-500 origin-bottom-right">
                    <div className="flex gap-3 h-full">
                        <div className="w-1/2 bg-slate-200 dark:bg-[#21262D] rounded-lg"></div>
                        <div className="w-1/2 bg-slate-200 dark:bg-[#21262D] rounded-lg"></div>
                    </div>
                </div>
            </div>

            {/* Feature 2: AI (Tall) */}
            <div className="bg-gradient-to-b from-blue-600 to-violet-600 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between group shadow-lg shadow-blue-500/20">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">AI Assisted</h3>
                    <p className="text-blue-100">Stuck on a description? Let Gemini AI write it for you with a single click.</p>
                </div>
                <div className="mt-6 bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs font-mono text-blue-100">Generating content...</span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded mb-1"></div>
                    <div className="h-2 w-2/3 bg-white/20 rounded"></div>
                </div>
            </div>

            {/* Feature 3: Calendar (Wide) */}
            <div className="md:col-span-3 bg-slate-100 dark:bg-[#0D1117] rounded-3xl p-1 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#30363D_1px,transparent_1px)] [background-size:16px_16px] border border-slate-200 dark:border-[#30363D]">
                 <div className="bg-white/50 dark:bg-[#161B22]/80 backdrop-blur-sm p-8 rounded-[20px] flex flex-col md:flex-row items-center gap-8 h-full border border-white/50 dark:border-white/5">
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">Integrated Calendar View</h3>
                        <p className="text-slate-500 dark:text-slate-400">Switch contexts instantly. See deadlines, plan sprints, and manage your time without leaving the board.</p>
                    </div>
                    <div className="flex-1 w-full grid grid-cols-7 gap-2 opacity-80">
                        {Array.from({length: 14}).map((_, i) => (
                            <div key={i} className={`aspect-square rounded-md border border-slate-200 dark:border-[#30363D] ${i === 4 || i === 9 ? 'bg-blue-500 border-blue-500' : 'bg-white dark:bg-[#0D1117]'}`}></div>
                        ))}
                    </div>
                 </div>
            </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-32 border-t border-slate-200 dark:border-[#30363D]">
          <div className="container mx-auto px-6 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to streamline?</h2>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">Join the mock backend environment and experience the flow today.</p>
              
              {isAuthenticated ? (
                <button onClick={onEnter} className="bg-blue-600 text-white text-lg font-bold py-4 px-10 rounded-full hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 transition-all">
                    Go to Dashboard
                </button>
              ) : (
                <button onClick={onRegister} className="bg-slate-900 dark:bg-white text-white dark:text-black text-lg font-bold py-4 px-10 rounded-full hover:scale-105 hover:shadow-xl transition-all">
                    Create Free Account
                </button>
              )}
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#161B22] border-t border-slate-200 dark:border-[#30363D] py-12">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-slate-900 dark:bg-white rounded flex items-center justify-center text-white dark:text-black font-bold text-xs">S</div>
                  <span className="font-bold tracking-tight">syncSpace</span>
              </div>
              <div className="flex gap-6 text-sm text-slate-500 dark:text-slate-400">
                  <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
                  <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
                  <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">GitHub</a>
              </div>
              <div className="text-xs text-slate-400">
                  © {new Date().getFullYear()} syncSpace Inc.
              </div>
          </div>
      </footer>

    </div>
  );
};

export default LandingPage;
