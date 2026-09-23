import React from 'react';
import { Terminal, Code, Bell, User as UserIcon } from 'lucide-react';
import type { CurrentUserAttributes } from '../types/braze';

interface BrazeHeaderProps {
  appName?: string;
  activeTab: 'store' | 'banners' | 'inspector' | 'guide';
  setActiveTab: (tab: 'store' | 'banners' | 'inspector' | 'guide') => void;
  currentUser: CurrentUserAttributes;
  onOpenUserModal: () => void;
  onOpenCodeModal: () => void;
  onToggleInspector: () => void;
  unreadCardsCount: number;
}

export const BrazeHeader: React.FC<BrazeHeaderProps> = ({
  appName = 'Website',
  activeTab,
  setActiveTab,
  currentUser,
  onOpenUserModal,
  onOpenCodeModal,
  onToggleInspector,
  unreadCardsCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('store')}
            className="text-lg font-bold tracking-tight text-slate-900 hover:text-orange-600 transition-colors flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
            <span>{appName}</span>
          </button>
        </div>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setActiveTab('store')}
            className={`transition-colors pb-0.5 ${
              activeTab === 'store'
                ? 'text-orange-600 border-b-2 border-orange-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Storefront
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`transition-colors pb-0.5 ${
              activeTab === 'banners'
                ? 'text-orange-600 border-b-2 border-orange-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Banners &amp; Placements
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={`transition-colors pb-0.5 ${
              activeTab === 'inspector'
                ? 'text-orange-600 border-b-2 border-orange-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SDK Telemetry
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`transition-colors pb-0.5 ${
              activeTab === 'guide'
                ? 'text-orange-600 border-b-2 border-orange-600 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Braze Docs &amp; Git
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenUserModal}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            title="Edit Identified User in Braze SDK"
          >
            <UserIcon className="w-3.5 h-3.5 text-orange-600" />
            <span className="truncate max-w-[120px]">{currentUser.firstName || currentUser.userId}</span>
          </button>

          <button
            onClick={onToggleInspector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium transition-colors"
            title="Open Live SDK Inspector Console"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">SDK Inspector</span>
          </button>

          <button
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 text-xs font-medium transition-colors shadow-sm"
            title="Dump Code & GitHub Setup Guide"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Dump Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};
