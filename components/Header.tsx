'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { ChevronDownIcon, ChevronUpIcon } from './ui/icons';

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const roles = session?.user?.roles ?? [];
  const canViewConnections = roles.includes('db_admin');
  const canViewMetadata = roles.includes('metadata_editor');
  const canManageUsers = roles.includes('user_admin');

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  const logoutFromProfileMenu = async () => {
    closeProfileMenu();
    await handleLogout();
  };

  const logoutFromMobileMenu = async () => {
    closeMenu();
    await handleLogout();
  };

  if (!session) {
    return null;
  }

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)] transition-colors relative">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xl font-bold text-[var(--color-foreground)] hover:text-[var(--color-muted-foreground)] transition-colors"
              onClick={closeMenu}
            >
              Dashboard Platform
            </Link>
            <nav className="hidden md:flex gap-4">
              {canViewConnections && (
                <Link
                  href="/database-connections"
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Connections
                </Link>
              )}
              {canViewMetadata && (
                <Link
                  href="/data-sources"
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Data Sources
                </Link>
              )}
              {canViewMetadata && (
                <Link
                  href="/data-sets"
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Data Sets
                </Link>
              )}
              <Link
                href="/dashboards"
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboards
              </Link>
              {canManageUsers && (
                <Link
                  href="/users"
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Users
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="relative hidden sm:flex items-center">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
                aria-expanded={isProfileMenuOpen}
                aria-haspopup="menu"
                type="button"
              >
                <span className="max-w-[220px] truncate">{session.user?.email}</span>
                {isProfileMenuOpen ? (
                  <ChevronUpIcon className="w-4 h-4" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4" />
                )}
              </button>
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-10 z-50 w-48 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                  <Link
                    href="/profile/edit"
                    onClick={closeProfileMenu}
                    className="block px-4 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/groups"
                    onClick={closeProfileMenu}
                    className="block px-4 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
                  >
                    My Groups
                  </Link>
                  <button
                    onClick={logoutFromProfileMenu}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
                    type="button"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            {/* Hamburger menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div
        className={`
          md:hidden absolute top-16 left-0 right-0 bg-[var(--color-surface)] border-b border-[var(--color-border)]
          transition-all duration-300 ease-in-out overflow-hidden
          ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <nav className="flex flex-col px-4 py-4 space-y-2">
          {canViewConnections && (
            <Link
              href="/database-connections"
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={closeMenu}
            >
              Connections
            </Link>
          )}
          {canViewMetadata && (
            <Link
              href="/data-sources"
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={closeMenu}
            >
              Data Sources
            </Link>
          )}
          {canViewMetadata && (
            <Link
              href="/data-sets"
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={closeMenu}
            >
              Data Sets
            </Link>
          )}
          <Link
            href="/dashboards"
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
            onClick={closeMenu}
          >
            Dashboards
          </Link>
          {canManageUsers && (
            <Link
              href="/users"
              className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] px-3 py-2 rounded-md text-sm font-medium transition-colors"
              onClick={closeMenu}
            >
              Users
            </Link>
          )}
          <div className="pt-2 mt-2 border-t border-[var(--color-border)]">
            <div className="px-3 py-2 text-sm text-[var(--color-muted-foreground)]">
              {session.user?.email}
            </div>
            <Link
              href="/profile/edit"
              className="block px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
              onClick={closeMenu}
            >
              Edit Profile
            </Link>
            <Link
              href="/groups"
              className="block px-3 py-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
              onClick={closeMenu}
            >
              My Groups
            </Link>
            <button
              onClick={logoutFromMobileMenu}
              className="w-full mt-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm text-[var(--color-primary-foreground)] hover:opacity-90 transition-colors"
              type="button"
            >
              Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

