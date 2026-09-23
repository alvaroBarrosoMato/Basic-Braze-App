import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, Sparkles, X, AlertCircle, Eye, MousePointerClick, ShieldCheck } from 'lucide-react';
import { brazeService } from '../services/brazeService';
import type { BannerState } from '../types/braze';

interface BrazeBannerProps {
  placementId?: string;
  onEventFired?: (name: string, data?: Record<string, unknown>) => void;
}

export const BrazeBanner: React.FC<BrazeBannerProps> = ({
  placementId = 'my_first_banner',
  onEventFired,
}) => {
  const [bannerState, setBannerState] = useState<BannerState>(brazeService.getBannerState());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [impressionsLogged, setImpressionsLogged] = useState(0);

  useEffect(() => {
    const unsubscribe = brazeService.addBannerListener((state) => {
      setBannerState(state);
    });
    return unsubscribe;
  }, []);

  // When live banner changes from Braze SDK
  useEffect(() => {
    if (bannerState.banner && containerRef.current && bannerState.source === 'live') {
      try {
        brazeService.insertBanner(bannerState.banner, containerRef.current);
        setImpressionsLogged(prev => prev + 1);
        onEventFired?.('banner_impression', { placementId: bannerState.placementId });
      } catch (err) {
        console.error('Error inserting banner:', err);
      }
    }
  }, [bannerState.banner, bannerState.source, onEventFired, bannerState.placementId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await brazeService.requestBannersRefresh([placementId]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleDismiss = () => {
    if (bannerState.banner) {
      brazeService.dismissBanner(bannerState.banner);
    } else {
      brazeService.toggleSimulatorBanner(false);
    }
    onEventFired?.('banner_dismissed', { placementId });
  };

  const handleSimulatedClick = () => {
    brazeService.logCustomEvent('banner_clicked', {
      placementId,
      source: 'simulator',
      timestamp: new Date().toISOString(),
    });
    onEventFired?.('banner_click', { placementId, action: 'claimed_offer' });
    alert('Braze Banner Click Logged! Event "banner_clicked" recorded in Braze SDK.');
  };

  const handleToggleSimulator = () => {
    const isCurrentlySimulator = bannerState.source === 'simulator';
    brazeService.toggleSimulatorBanner(!isCurrentlySimulator);
  };

  return (
    <section className="w-full my-4" aria-label="Marketing Banner Placement">
      {/* Placement Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 text-white rounded-t-xl text-xs font-mono border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Placement ID:</span>
          <span className="text-orange-400 font-semibold">{placementId}</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">
            Status: {bannerState.source === 'live' ? 'Live Braze Campaign' : bannerState.source === 'simulator' ? 'Simulator Active' : 'Listening for Dashboard'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {bannerState.lastUpdated && (
            <span className="text-slate-400 text-[11px] hidden md:inline">
              Updated: {bannerState.lastUpdated}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Trigger braze.requestBannersRefresh(['my_first_banner'])"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Banner Slot */}
      <div className="relative rounded-b-xl border border-t-0 border-slate-200 bg-white overflow-hidden shadow-sm transition-all">
        {/* If live Braze banner is loaded into DOM container */}
        {bannerState.source === 'live' && (
          <div className="p-4 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
            <div ref={containerRef} id={`braze-banner-${placementId}`} className="braze-banner-container" />
          </div>
        )}

        {/* If simulator banner is active */}
        {bannerState.source === 'simulator' && bannerState.rawHtml && (
          <div className="p-4 bg-slate-50">
            <div className="relative bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white rounded-xl p-5 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-orange-400/40">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                  <Sparkles className="w-6 h-6 text-amber-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-orange-200">
                      Braze Dynamic Placement: {placementId}
                    </span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-medium">
                      Preview / Test
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-white mt-0.5">
                    Spring Growth Sprint: Upgrade to Pro &amp; Get 30% Off
                  </h3>
                  <p className="text-sm text-orange-100/90 mt-0.5">
                    Targeted via Braze Web SDK 6.13 with real-time impression &amp; click tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleSimulatedClick}
                  className="px-5 py-2.5 bg-white text-orange-700 font-semibold text-sm rounded-lg hover:bg-orange-50 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <MousePointerClick className="w-4 h-4" />
                  <span>Claim Promo</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-2 text-orange-200 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
                  title="Dismiss this Banner"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                Impressions logged: 1 (via SDK listener)
              </span>
              <span className="text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Dynamic update subscription active
              </span>
            </div>
          </div>
        )}

        {/* If no banner is returned yet from Braze dashboard */}
        {bannerState.source === 'none' && (
          <div className="p-6 bg-slate-50/80 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Waiting for active Braze Campaign for Placement: <span className="font-mono text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">{placementId}</span>
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  The Braze Web SDK is initialized and actively subscribed to <code className="font-mono text-slate-800 font-medium">subscribeToBannersUpdates()</code>.
                  To show a live banner, create a Banner campaign in your Braze dashboard with Placement ID <strong className="text-slate-900 font-mono">{placementId}</strong> and publish it.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={handleToggleSimulator}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Preview Sample Banner</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Check Backend</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
