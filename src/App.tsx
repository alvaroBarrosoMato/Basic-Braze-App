/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Terminal, ShieldCheck, Sparkles, Layers, Activity, Code, User, ArrowUpRight } from 'lucide-react';
import { brazeService } from './services/brazeService';
import type { CurrentUserAttributes, BrazeConfig, TelemetryLog } from './types/braze';
import { BrazeHeader } from './components/BrazeHeader';
import { StorefrontView } from './components/StorefrontView';
import { BannersPlacementsView } from './components/BannersPlacementsView';
import { DocumentationView } from './components/DocumentationView';
import { UserModal } from './components/UserModal';
import { SdkConsoleDrawer } from './components/SdkConsoleDrawer';
import { CodeExportModal } from './components/CodeExportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'store' | 'banners' | 'inspector' | 'guide'>('store');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<CurrentUserAttributes>(brazeService.getCurrentUser());
  const [config, setConfig] = useState<BrazeConfig>(brazeService.getConfig());
  const [logs, setLogs] = useState<TelemetryLog[]>(brazeService.getLogs());

  useEffect(() => {
    // Initialize Braze Web SDK on first mount
    brazeService.init().catch((err) => {
      console.warn('Braze init caught error:', err);
    });

    const unsubLogs = brazeService.addLogListener((updatedLogs) => {
      setLogs(updatedLogs);
    });

    return () => {
      unsubLogs();
    };
  }, []);

  const handleConfigUpdated = (newConfig: BrazeConfig) => {
    setConfig(newConfig);
  };

  const handleUserUpdated = (updated: CurrentUserAttributes) => {
    setCurrentUser(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-orange-500 selection:text-white">
      {/* Top Bar with Top Bar Contract */}
      <BrazeHeader
        appName={config.appName || 'Website'}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onToggleInspector={() => setIsInspectorOpen(true)}
        unreadCardsCount={0}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'store' && (
          <StorefrontView
            currentUser={currentUser}
            onOpenInspector={() => setIsInspectorOpen(true)}
            onOpenUserModal={() => setIsUserModalOpen(true)}
          />
        )}

        {activeTab === 'banners' && (
          <BannersPlacementsView />
        )}

        {activeTab === 'inspector' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Braze SDK Activity &amp; Telemetry Stream
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Real-time events captured from @braze/web-sdk 6.13.0
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => brazeService.refreshBanners()}
                  className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors shadow-sm"
                >
                  Refresh Placement: {config.placementId}
                </button>
                <button
                  onClick={() => brazeService.clearLogs()}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 p-4 space-y-3 font-mono text-xs shadow-xl min-h-[500px]">
              <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SDK Status: Active</span>
                  <span aria-hidden="true">·</span>
                  <span>Endpoint: {config.baseUrl}</span>
                  <span aria-hidden="true">·</span>
                  <span>App: {config.appName}</span>
                </div>
                <span>{logs.length} logged entries</span>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No SDK telemetry events recorded yet.</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              log.type === 'success'
                                ? 'bg-emerald-400'
                                : log.type === 'banner'
                                ? 'bg-orange-400'
                                : log.type === 'event'
                                ? 'bg-cyan-400'
                                : log.type === 'warn'
                                ? 'bg-amber-400'
                                : 'bg-blue-400'
                            }`}
                          />
                          <span className="text-white font-semibold">{log.action}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                      </div>

                      {log.details && (
                        <pre className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-900 overflow-x-auto whitespace-pre-wrap break-all">
                          {typeof log.details === 'object'
                            ? JSON.stringify(log.details, null, 2)
                            : String(log.details)}
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <DocumentationView
            onOpenCodeModal={() => setIsCodeModalOpen(true)}
            onOpenInspector={() => setIsInspectorOpen(true)}
          />
        )}
      </main>

      {/* Floating Bottom Quick HUD */}
      <aside aria-label="SDK Telemetry HUD" className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        <button
          onClick={() => setIsInspectorOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-full text-xs font-mono shadow-lg border border-slate-700 transition-transform active:scale-95"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">Braze SDK</span>
          <span className="text-orange-400">my_first_banner</span>
          <Terminal className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>
      </aside>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Website</span>
            <span aria-hidden="true">·</span>
            <span>Braze Web SDK 6.13.0</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-orange-600">Placement ID: {config.placementId}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="hover:text-slate-900 transition-colors flex items-center gap-1 font-medium"
            >
              <Code className="w-3.5 h-3.5 text-orange-600" />
              <span>Dump Code &amp; GitHub Setup</span>
            </button>
            <a
              href="https://braze.com/docs/developer_guide/banners#placement-ids"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <span>Braze Docs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals and Drawers */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={handleUserUpdated}
      />

      <SdkConsoleDrawer
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        config={config}
        onConfigUpdated={handleConfigUpdated}
      />

      <CodeExportModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        apiKey={config.apiKey}
        endpoint={config.baseUrl}
        placementId={config.placementId}
      />
    </div>
  );
}
