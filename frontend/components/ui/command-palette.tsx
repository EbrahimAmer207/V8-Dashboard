'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import {
  Bell,
  BookOpen,
  Calendar,
  FileCheck2,
  FolderOpen,
  Stethoscope,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Users,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const { setTheme } = useTheme();
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm bg-slate-950/60 transition-all duration-300"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full max-w-[600px] z-10 overflow-hidden rounded-[20px] border border-white/10 bg-slate-900/95 shadow-[0_20px_80px_-10px_rgba(0,0,0,0.8)] ring-1 ring-white/5"
            role="dialog"
            aria-modal="true"
          >
            <Command
              className="flex h-full w-full flex-col bg-transparent text-slate-100"
              shouldFilter={true}
              loop
            >
              <div className="flex items-center border-b border-white/10 px-4">
                <Search className="mr-2 h-5 w-5 shrink-0 text-slate-400" />
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search..."
                  className="flex h-14 w-full rounded-md bg-transparent py-3 text-base outline-none disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-slate-400"
                />
                <div className="hidden items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 sm:flex">
                  esc
                </div>
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
                <Command.Empty className="py-10 text-center text-sm text-slate-400">
                  No results found.
                </Command.Empty>

                <Command.Group heading="Suggestions" className="px-2 py-1.5 text-xs font-medium text-slate-400">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/dashboard'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <LayoutDashboard className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-cyan-300" />
                    Go to Dashboard
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/settings'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <Settings className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-emerald-300" />
                    Settings
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Theme" className="px-2 py-1.5 text-xs font-medium text-slate-400 mt-2">
                  <Command.Item
                    onSelect={() => runCommand(() => setTheme('light'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <Sun className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-amber-400" />
                    Change to Light Theme
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => setTheme('dark'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <Moon className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-indigo-400" />
                    Change to Dark Theme
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Vitality of Enfinity" className="px-2 py-1.5 text-xs font-medium text-slate-400 mt-2">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/operations?tab=requests'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <FileCheck2 className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-sky-300" />
                    Clinical operations — requests
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/operations?tab=cases'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <FolderOpen className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-emerald-300" />
                    Clinical operations — cases
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/operations?tab=sessions'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <Calendar className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-violet-300" />
                    Clinical operations — sessions
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/notifications'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <Bell className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-amber-300" />
                    Notifications
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/chat'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <MessageSquare className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-violet-300" />
                    Chat / Support
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/users'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <Users className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-rose-300" />
                    Users
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/therapists'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <Stethoscope className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-teal-300" />
                    Therapists
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/content'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <BookOpen className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-emerald-300" />
                    Content library
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/analytics'))}
                    className="group flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-sm transition-colors aria-selected:bg-white/10 aria-selected:text-white mt-1"
                  >
                    <ShieldCheck className="mr-3 h-4 w-4 text-slate-400 group-aria-selected:text-fuchsia-300" />
                    Analytics
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
