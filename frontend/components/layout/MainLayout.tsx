'use client';

import React, { ReactNode, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Command,
  Database,
  FileCheck2,
  FolderOpen,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Mic,
  Search,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Stethoscope,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CommandPalette } from '@/components/ui/command-palette';
import { AIAssistantWidget } from '@/components/ai/ai-assistant';
import { OnboardingTour } from '@/components/onboarding/onboarding-tour';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { fetchDashboardSnapshot } from '@/lib/api/dashboard-snapshot';
import { canViewAnalytics } from '@/lib/rbac';
import type { User } from '@/types';
import { AppBreadcrumbs } from '@/components/navigation/app-breadcrumbs';

/* ───────── Configuration ───────── */

type NavItemConfig = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
  analyticsOnly?: boolean;
};

const navGroups: Array<{ title: string; items: NavItemConfig[] }> = [
  {
    title: 'Overview',
    items: [{ href: '/dashboard', label: 'Command center', icon: LayoutDashboard }],
  },
  {
    title: 'Operations',
    items: [
      { href: '/operations', label: 'Clinical operations', icon: FileCheck2 },
      { href: '/clinical', label: 'Health hub', icon: Database, adminOnly: true },
    ],
  },
  {
    title: 'People',
    items: [
      { href: '/users', label: 'Users', icon: Users, adminOnly: true },
      { href: '/therapists', label: 'Therapists', icon: Stethoscope, adminOnly: true },
      { href: '/chat', label: 'Chat & support', icon: MessageSquare },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/content', label: 'Content library', icon: BookOpen },
      { href: '/podcasts', label: 'Podcasts', icon: Mic },
      { href: '/social', label: 'Social community', icon: Share2 },
    ],
  },
  {
    title: 'Signals',
    items: [
      { href: '/analytics', label: 'Analytics', icon: Sparkles, analyticsOnly: true },
      { href: '/notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/settings/rbac', label: 'Access control', icon: Shield, adminOnly: true },
      { href: '/settings/logs', label: 'Activity logs', icon: History, adminOnly: true },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function filterNavItem(item: NavItemConfig, role: User['role'] | string | undefined) {
  const upperRole = role?.toUpperCase() ?? '';
  if (item.adminOnly && !['ADMIN', 'MODERATOR'].includes(upperRole)) return false;
  if (item.analyticsOnly && !canViewAnalytics(role as User['role'])) return false;
  return true;
}

function isPathActive(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function getCurrentItem(pathname: string) {
  for (const group of navGroups) {
    const match = group.items.find((item) => isPathActive(pathname, item.href));
    if (match) return match;
  }
  return { href: pathname, label: 'Workspace', icon: LayoutDashboard };
}

/* ───────── Sidebar ───────── */

interface SidebarProps {
  isMobileOpen: boolean;
  isCollapsed: boolean;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}

function Sidebar({ isMobileOpen, isCollapsed, onCloseMobile, onToggleDesktop }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const NavLink = ({ item }: { item: NavItemConfig }) => {
    const Icon = item.icon;
    const active = isPathActive(pathname, item.href);

    const link = (
      <Link
        href={item.href}
        onClick={onCloseMobile}
        className={cn(
          'group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-all duration-150',
          active
            ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)] dark:bg-white/[0.08] dark:text-white'
            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
          isCollapsed && 'justify-center px-2',
        )}
      >
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors',
            active
              ? 'bg-[var(--bg-elevated)] text-[var(--accent-strong)] shadow-[var(--shadow-xs)] dark:bg-white/10 dark:text-white'
              : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {!isCollapsed ? <span className="truncate">{item.label}</span> : null}
      </Link>
    );

    if (isCollapsed) {
      return <Tooltip content={item.label} side="right">{link}</Tooltip>;
    }

    return link;
  };

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      ) : null}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[var(--border)] bg-[var(--bg-elevated)] transition-all duration-300 ease-out',
          isCollapsed ? 'w-[72px]' : 'w-[260px]',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="flex h-14 items-center gap-3 border-b border-[var(--border)] px-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-sm)]">
            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          {!isCollapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-[var(--text-primary)] leading-tight">
                Vitality of Enfinity
              </p>
              <p className="truncate text-[11px] text-[var(--text-muted)]">Operations hub</p>
            </div>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-7 w-7 shrink-0 lg:inline-flex"
            onClick={onToggleDesktop}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close navigation"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <nav className="space-y-5">
            {navGroups.map((group) => {
              const visible = group.items.filter((item) => filterNavItem(item, user?.role));
              if (!visible.length) return null;

              return (
                <div key={group.title}>
                  {!isCollapsed ? (
                    <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                      {group.title}
                    </p>
                  ) : null}
                  <div className="space-y-0.5">
                    {visible.map((item) => (
                      <NavLink key={item.href} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border)] p-3">
          {!isCollapsed ? (
            <div className="mb-2 rounded-[var(--radius-md)] bg-[var(--surface-muted)] px-3 py-2">
              <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-[11px] text-[var(--text-muted)]">
                {user?.role ?? 'Workspace'}
              </p>
            </div>
          ) : null}

          {isCollapsed ? (
            <Tooltip content="Sign out" side="right">
              <button
                type="button"
                onClick={() => {
                  logout();
                  window.location.href = '/auth/login';
                }}
                className="flex w-full items-center justify-center rounded-[var(--radius-md)] p-2.5 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={() => {
                logout();
                window.location.href = '/auth/login';
              }}
              className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

/* ───────── Topbar ───────── */

interface TopbarProps {
  isSidebarCollapsed: boolean;
  onMenuClick: () => void;
  onToggleDesktop: () => void;
}

function Topbar({ isSidebarCollapsed, onMenuClick, onToggleDesktop }: TopbarProps) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const currentItem = useMemo(() => getCurrentItem(pathname), [pathname]);

  const { data: liveSnapshot } = useQuery({
    queryKey: ['dashboard-snapshot'],
    queryFn: () => fetchDashboardSnapshot(),
    enabled: true,
    refetchInterval: 8000,
  });

  const headerNotifications = useMemo(
    () => liveSnapshot?.notifications?.slice(0, 5) ?? [],
    [liveSnapshot?.notifications],
  );

  const unreadHeader = useMemo(
    () => liveSnapshot?.notifications?.filter((item) => item.unread).length ?? 0,
    [liveSnapshot?.notifications],
  );

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-elevated)]/80 px-4 backdrop-blur-xl sm:px-6">
      {/* Left: Menu + Title */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 lg:hidden" onClick={onMenuClick}>
          <Menu className="h-4 w-4" />
        </Button>

        <div className="min-w-0">
          <AppBreadcrumbs />
          <h1 className="truncate text-sm font-semibold text-[var(--text-primary)]">
            {currentItem.label}
          </h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Search trigger → opens CommandPalette */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-8 w-8 sm:inline-flex"
          aria-label="Search"
          onClick={() => {
            // Trigger command palette via keyboard shortcut simulation
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Quick actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hidden h-8 w-8 sm:inline-flex" aria-label="Quick actions">
              <Zap className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/operations?tab=requests">Review requests</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/operations?tab=cases">Open active cases</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/operations?tab=sessions">Clinical sessions</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/chat">Jump into chat</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/notifications">Signal inbox</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {unreadHeader > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {unreadHeader > 9 ? '9+' : unreadHeader}
                </span>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <span className="text-[11px] font-normal text-[var(--text-muted)]">{unreadHeader} unread</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {headerNotifications.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-[var(--text-muted)]">You are fully caught up.</div>
            ) : (
              headerNotifications.map((notification) => (
                <DropdownMenuItem key={notification.id} asChild>
                  <Link href="/notifications" className="flex cursor-pointer flex-col gap-1 py-2.5">
                    <span className="font-medium text-[var(--text-primary)]">{notification.title}</span>
                    <span className="line-clamp-2 text-xs text-[var(--text-muted)]">{notification.body}</span>
                  </Link>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="cursor-pointer justify-center text-[var(--accent)]">
                View all
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-left transition-colors hover:bg-[var(--surface-muted)]"
            >
              <Avatar className="h-7 w-7 text-[10px]">
                <AvatarFallback>
                  {`${user?.firstName?.[0] ?? 'A'}${user?.lastName?.[0] ?? 'D'}`}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-[var(--text-primary)]">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <ChevronDown className="hidden h-3 w-3 text-[var(--text-muted)] sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Overview</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Preferences</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                window.location.href = '/auth/login';
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

/* ───────── Main Layout ───────── */

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="page-shell flex min-h-screen min-w-0">
      <Sidebar
        isMobileOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onCloseMobile={() => setSidebarOpen(false)}
        onToggleDesktop={() => setSidebarCollapsed((value) => !value)}
      />

      <div
        className={cn(
          'relative z-10 flex min-h-screen min-w-0 flex-1 flex-col transition-all duration-300',
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[260px]',
        )}
      >
        <Topbar
          isSidebarCollapsed={sidebarCollapsed}
          onMenuClick={() => setSidebarOpen((value) => !value)}
          onToggleDesktop={() => setSidebarCollapsed((value) => !value)}
        />
        <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-4 pb-8 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      {mounted && <OnboardingTour />}
      {mounted && <CommandPalette />}
      {mounted && <AIAssistantWidget />}
    </div>
  );
}
