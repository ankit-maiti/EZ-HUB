'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Inbox, 
  UserCheck, 
  PlusCircle, 
  ChevronDown, 
  ShieldCheck, 
  User as UserIcon,
} from 'lucide-react';
import { NewRequestModal } from './NewRequestModal';

export function Navbar({ onRequestCreated }: { onRequestCreated?: () => void }) {
  const pathname = usePathname();
  const { currentUser, users, setCurrentUser, isManager } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-espresso-950 border-b border-espresso-800 text-earth-100 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand and Logo */}
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-lg bg-terracotta-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow group-hover:bg-terracotta-500 transition">
                  EZ
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base tracking-tight text-white">EZ-HUB</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-espresso-900 text-terracotta-300 font-semibold border border-espresso-700">
                      OPS
                    </span>
                  </div>
                  <p className="text-[11px] text-earth-300 leading-tight">Lala Tech Operations</p>
                </div>
              </Link>

              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center space-x-1">
                <Link
                  href="/"
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    pathname === '/'
                      ? 'bg-espresso-800 text-earth-50 shadow-inner'
                      : 'text-earth-200 hover:bg-espresso-900 hover:text-white'
                  }`}
                >
                  <Inbox className="w-4 h-4 text-terracotta-400" />
                  <span>Operations</span>
                </Link>

                <Link
                  href="/my-work"
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    pathname === '/my-work'
                      ? 'bg-espresso-800 text-earth-50 shadow-inner'
                      : 'text-earth-200 hover:bg-espresso-900 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-clay-400" />
                  <span>My Work</span>
                  {currentUser && (
                    <span className="text-[10px] bg-espresso-800 px-1.5 py-0.5 rounded-full text-earth-300 border border-espresso-700">
                      {currentUser.name.split(' ')[0]}
                    </span>
                  )}
                </Link>
              </nav>
            </div>

            {/* Actions & User Switcher */}
            <div className="flex items-center space-x-3">
              {/* Quick Capture Request */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-terracotta-600 hover:bg-terracotta-500 active:bg-terracotta-700 text-white text-xs font-semibold px-3.5 py-2 rounded-md shadow transition focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:ring-offset-2 focus:ring-offset-espresso-950"
              >
                <PlusCircle className="w-4 h-4 text-terracotta-200" />
                <span className="hidden sm:inline">Capture Request</span>
                <span className="sm:hidden">New</span>
              </button>

              {/* User Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-espresso-900 hover:bg-espresso-800 border border-espresso-700 text-earth-100 text-xs px-3 py-1.5 rounded-md transition shadow-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-espresso-800 flex items-center justify-center text-earth-200">
                    {isManager ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <UserIcon className="w-3.5 h-3.5 text-clay-300" />
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-medium text-earth-100 truncate max-w-[110px]">
                      {currentUser?.name || 'Select User'}
                    </div>
                    <div className="text-[10px] text-earth-400">
                      {isManager ? 'Manager' : 'Employee'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-earth-400" />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-espresso-950 border border-espresso-800 rounded-lg shadow-2xl z-50 py-1 text-xs">
                      <div className="px-3 py-2 border-b border-espresso-800 text-[11px] font-medium text-earth-400">
                        Switch Active Role / User:
                      </div>
                      {users.map((u) => {
                        const selected = currentUser?.id === u.id;
                        return (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => {
                              setCurrentUser(u);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-espresso-900 transition ${
                              selected ? 'bg-espresso-900/90 font-semibold text-terracotta-300' : 'text-earth-200'
                            }`}
                          >
                            <div>
                              <div className="font-medium">{u.name}</div>
                              <div className="text-[10px] text-earth-400">{u.email}</div>
                            </div>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                u.role === 'MANAGER'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-clay-500/20 text-clay-300 border border-clay-500/30'
                              }`}
                            >
                              {u.role}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Capture Request Modal */}
      {isModalOpen && (
        <NewRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            if (onRequestCreated) onRequestCreated();
          }}
        />
      )}
    </>
  );
}
