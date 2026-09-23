import React, { useState } from 'react';
import { Layers, RefreshCw, CheckCircle, Info, Sparkles, ExternalLink, Play, Eye, MousePointer } from 'lucide-react';
import { BrazeBanner } from './BrazeBanner';
import { brazeService } from '../services/brazeService';

export const BannersPlacementsView: React.FC = () => {
  const [activePlacement, setActivePlacement] = useState('my_first_banner');
  const [customPlacementInput, setCustomPlacementInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await brazeService.requestBannersRefresh([activePlacement]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAddPlacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPlacementInput.trim()) {
      setActivePlacement(customPlacementInput.trim());
      setCustomPlacementInput('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Intro Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-orange-600 mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Braze Web SDK Banner Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Placement IDs &amp; Dynamic Banner Updates
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Manage banner placements and ensure dynamic updates stream in real-time from the Braze dashboard using{' '}
            <code className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
              subscribeToBannersUpdates()
            </code>{' '}
            and{' '}
            <code className="font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
              requestBannersRefresh()
            </code>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://braze.com/docs/developer_guide/banners#placement-ids"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
          >
            <span>Braze Banners Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Placement</span>
          </button>
        </div>
      </div>

      {/* Placement Selector Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Placement:
          </span>
          <button
            onClick={() => setActivePlacement('my_first_banner')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
              activePlacement === 'my_first_banner'
                ? 'bg-orange-600 text-white font-bold shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            my_first_banner (Primary)
          </button>
          <button
            onClick={() => setActivePlacement('header_promo')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
              activePlacement === 'header_promo'
                ? 'bg-orange-600 text-white font-bold shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            header_promo
          </button>
        </div>

        <form onSubmit={handleAddPlacement} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={customPlacementInput}
            onChange={(e) => setCustomPlacementInput(e.target.value)}
            placeholder="Custom Placement ID..."
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-mono focus:border-orange-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Set Placement
          </button>
        </form>
      </div>

      {/* Live Banner Slot */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-slate-600">
            Rendered Placement Slot
          </span>
          <span className="font-mono text-orange-600">
            Container ID: braze-banner-{activePlacement}
          </span>
        </div>
        <BrazeBanner placementId={activePlacement} />
      </div>

      {/* Architecture Deep Dive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Architecture Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <Info className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            How Dynamic Updates Work via Braze SDK
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Braze Banners let marketers create targeted, dynamic web banners in the Braze dashboard and inject them directly into your frontend without deploying new code.
          </p>

          <ol className="space-y-3 text-xs text-slate-700 list-decimal list-inside leading-relaxed pt-2">
            <li>
              <strong>Placement Definition:</strong> Every banner slot is tagged with a unique placement ID like <code className="font-mono text-orange-600">my_first_banner</code>.
            </li>
            <li>
              <strong>Event Subscription:</strong> <code className="font-mono text-slate-900 bg-slate-100 px-1 py-0.5 rounded">braze.subscribeToBannersUpdates()</code> maintains a real-time subscriber. When a user qualifies for a campaign, the subscriber is instantly triggered.
            </li>
            <li>
              <strong>Automatic Insertion:</strong> Calling <code className="font-mono text-slate-900 bg-slate-100 px-1 py-0.5 rounded">braze.insertBanner(banner, container)</code> safely inserts the banner HTML into the DOM and records impression analytics.
            </li>
            <li>
              <strong>User Segmentation:</strong> When a user logs in via <code className="font-mono text-slate-900 bg-slate-100 px-1 py-0.5 rounded">braze.changeUser()</code>, the SDK refreshes banners specifically matching that user’s segments and tags.
            </li>
          </ol>
        </div>

        {/* Code Pattern Card */}
        <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-6 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-orange-400">Implementation Pattern</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">TypeScript</span>
          </div>

          <pre className="text-[11px] font-mono text-slate-300 bg-slate-900/80 p-4 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre leading-relaxed">
{`// 1. Subscribe to updates
braze.subscribeToBannersUpdates((bannersMap) => {
  const banner = bannersMap['${activePlacement}'];
  if (banner) {
    const el = document.getElementById('banner-slot');
    braze.insertBanner(banner, el);
    
    // Listen for user dismissal
    banner.subscribeToDismissedEvent(() => {
      console.log('Banner was dismissed');
    });
  }
});

// 2. Refresh from Braze backend
braze.requestBannersRefresh(['${activePlacement}']);`}
          </pre>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            Note: Remember to pass <code className="text-orange-300 font-mono">allowUserSuppliedJavascript: true</code> in <code className="text-orange-300 font-mono">braze.initialize()</code> so HTML banner scripts execute properly.
          </p>
        </div>
      </div>
    </div>
  );
};
