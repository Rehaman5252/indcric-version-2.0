'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Gift, User, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/rewards', icon: Gift, label: 'Rewards' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide nav on auth pages and quiz pages
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/quiz') ||
    pathname.startsWith('/walkthrough')
  ) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-900/40 bg-black/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              // id only on Rewards tab for guided tour
              id={item.href === '/rewards' ? 'nav-rewards-tab' : undefined}
              className="relative flex flex-1 flex-col items-center justify-center text-xs"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-highlight"
                  className="absolute inset-x-2 -top-1 bottom-0 rounded-full bg-amber-500/10"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}

              <Icon
                className={cn(
                  'mb-1 h-5 w-5',
                  isActive ? 'text-amber-400' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-[11px] font-medium',
                  isActive ? 'text-amber-200' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}