import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  RotateCcw,
  Bell,
  ShoppingCart,
  Send,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Terminal,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';
import { brazeService } from '../services/brazeService';
import type { TelemetryLog, BrazeConfig } from '../types/braze';

interface SdkConsoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  config: BrazeConfig;
  onConfigUpdated: (newConfig: BrazeConfig) => void;
}

const CLUSTERS = [
  { label: 'EU-02 Frankfurt (Verified)', value: 'sdk.fra-02.braze.eu' },
  { label: 'EU-01 (Frankfurt)', value: 'sdk.fra-01.braze.eu' },
  { label: 'US-01 (Virginia)', value: 'sdk.iad-01.braze.com' },
  { label: 'US-02 (Virginia)', value: 'sdk.iad-02.braze.com' },
  { label: 'US-03 (Virginia)', value: 'sdk.iad-03.braze.com' },
  { label: 'US-04 (Virginia)', value: 'sdk.iad-04.braze.com' },
  { label: 'US-05 (Virginia)', value: 'sdk.iad-05.braze.com' },
  { label: 'US-06 (Virginia)', value: 'sdk.iad-06.braze.com' },
  { label: 'US-08 (Virginia)', value: 'sdk.iad-08.braze.com' },
  { label: 'AU-01 (Sydney)', value: 'sdk.syd-01.braze.com' },
];

export const SdkConsoleDrawer: React.FC<SdkConsoleDrawerProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
}) => {
  const [logs, setLogs] = useState<TelemetryLog[]>(brazeService.getLogs());
  const [activeTab, setActiveTab] = useState<'stream' | 'actions' | 'config'>('stream');

  // Custom event trigger form
  const [eventName, setEventName] = useState('viewed_promotion');
  const [eventPropKey, setEventPropKey] = useState('campaign_id');
  const [eventPropVal, setEventPropVal] = useState('summer_launch_2026');

  // Purchase trigger form
  const [productId, setProductId] = useState('item_studio_display');
  const [purchasePrice, setPurchasePrice] = useState('149.00');

  // Config settings form
  const [apiKeyInput, setApiKeyInput] = useState(config.apiKey);
  const [endpointInput, setEndpointInput] = useState(config.baseUrl);
  const [placementIdInput, setPlacementIdInput] = useState(config.placementId);

  useEffect(() => {
    const unsub = brazeService.addLogListener((updatedLogs) => {
      setLogs(updatedLogs);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleFireEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;
    brazeService.logCustomEvent(eventName.trim(), {
      [eventPropKey.trim() || 'default_key']: eventPropVal.trim() || true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleFirePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(purchasePrice) || 99.0;
    brazeService.logPurchase(productId.trim() || 'item_default', priceNum, 'USD', 1, {
      checkout_flow: 'web_portal',
      sdk_version: '6.13.0',
    });
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BrazeConfig = {
      ...config,
      apiKey: apiKeyInput.trim(),
      baseUrl: endpointInput.trim(),
      placementId: placementIdInput.trim() || 'my_first_banner',
    };
    onConfigUpdated(updated);
    await brazeService.init(updated);
    setActiveTab('stream');
  };

  const getLogIcon = (type: TelemetryLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
      case 'warn':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      case 'banner':
        return <Layers className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />;
      case 'event':
        return <Play className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-950 text-slate-100 shadow-2xl flex flex-col border-l border-slate-800 animate-in slide-in-from-right duration-200">
      {/* Top Bar */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">Braze SDK Inspector</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                v6.13.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Live Web SDK telemetry and event dispatcher</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-800 px-4 bg-slate-900/40 text-xs font-medium">
        <button
          onClick={() => setActiveTab('stream')}
          className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'stream'
              ? 'border-orange-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Live Logs ({logs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'actions'
              ? 'border-orange-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Dispatch Events</span>
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'config'
              ? 'border-orange-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>SDK Config</span>
        </button>
      </div>

      {/* Tab: Live Logs */}
      {activeTab === 'stream' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Endpoint: <code className="text-orange-300 font-mono">{config.baseUrl}</code></span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => brazeService.refreshBanners()}
                className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
                title="Call braze.requestBannersRefresh(['my_first_banner'])"
              >
                Refresh Banners
              </button>
              <button
                onClick={() => brazeService.clearLogs()}
                className="px-2 py-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No SDK logs recorded yet.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      {getLogIcon(log.type)}
                      <span className="text-slate-200 font-medium truncate">{log.action}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
                  </div>

                  {log.details && (
                    <pre className="mt-1.5 text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-900 overflow-x-auto whitespace-pre-wrap break-all">
                      {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : String(log.details)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Dispatch Events & Triggers */}
      {activeTab === 'actions' && (
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick presets */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Quick Trigger Presets
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => brazeService.logCustomEvent('viewed_homepage', { page: 'home', source: 'navigation' })}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs transition-colors"
              >
                <div className="font-semibold text-slate-200">viewed_homepage</div>
                <div className="text-[11px] text-slate-400">Trigger page view event</div>
              </button>
              <button
                onClick={() => brazeService.logCustomEvent('added_to_cart', { item_id: 'studio_monitor', price: 299 })}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs transition-colors"
              >
                <div className="font-semibold text-slate-200">added_to_cart</div>
                <div className="text-[11px] text-slate-400">Log shopping cart addition</div>
              </button>
              <button
                onClick={() => brazeService.requestPushPermission()}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs transition-colors"
              >
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Bell className="w-3 h-3 text-orange-400" />
                  <span>Push Permission</span>
                </div>
                <div className="text-[11px] text-slate-400">Prompt Web Push</div>
              </button>
              <button
                onClick={() => brazeService.requestBannersRefresh(['my_first_banner'])}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs transition-colors"
              >
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <RotateCcw className="w-3 h-3 text-cyan-400" />
                  <span>Refresh Banners</span>
                </div>
                <div className="text-[11px] text-slate-400">placement: my_first_banner</div>
              </button>
            </div>
          </div>

          {/* Custom Event Builder */}
          <form onSubmit={handleFireEvent} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>Log Custom Event (braze.logCustomEvent)</span>
            </h4>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Event Name</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
                placeholder="e.g. completed_tutorial"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Property Key</label>
                <input
                  type="text"
                  value={eventPropKey}
                  onChange={(e) => setEventPropKey(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
                  placeholder="key"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Property Value</label>
                <input
                  type="text"
                  value={eventPropVal}
                  onChange={(e) => setEventPropVal(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
                  placeholder="value"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Play className="w-3 h-3" />
              <span>Dispatch Custom Event</span>
            </button>
          </form>

          {/* Log Purchase Builder */}
          <form onSubmit={handleFirePurchase} className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log Purchase (braze.logPurchase)</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Product ID</label>
                <input
                  type="text"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
                  placeholder="item_sku_101"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
                  placeholder="99.00"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <ShoppingCart className="w-3 h-3" />
              <span>Dispatch Purchase</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab: SDK Config */}
      {activeTab === 'config' && (
        <form onSubmit={handleSaveConfig} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Braze API Key (from Dashboard App Settings)
            </label>
            <input
              type="text"
              required
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Braze Cluster SDK Endpoint
            </label>
            <input
              type="text"
              required
              value={endpointInput}
              onChange={(e) => setEndpointInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
              placeholder="e.g. sdk.fra-01.braze.eu or sdk.iad-01.braze.com"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CLUSTERS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setEndpointInput(c.value)}
                  className={`px-2 py-1 text-[10px] rounded border transition-colors ${
                    endpointInput === c.value
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 font-semibold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Target Banner Placement ID
            </label>
            <input
              type="text"
              required
              value={placementIdInput}
              onChange={(e) => setPlacementIdInput(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono focus:border-orange-500 focus:outline-none"
              placeholder="my_first_banner"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Used in <code className="text-slate-400">requestBannersRefresh(['my_first_banner'])</code> and <code className="text-slate-400">subscribeToBannersUpdates()</code>
            </p>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              Reinitialize Braze Web SDK
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
