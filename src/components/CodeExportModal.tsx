import React, { useState } from 'react';
import { X, Copy, Check, GitBranch, FileCode, CheckCircle, ExternalLink, Terminal, Bookmark } from 'lucide-react';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  endpoint: string;
  placementId: string;
}

const SNIPPET_BRAZE_SERVICE = `import * as braze from '@braze/web-sdk';
import type { Banner } from '@braze/web-sdk';

// 1. Initialize Braze Web SDK
export function initBraze() {
  braze.initialize('6c30e0b3-6ded-45c8-9a8d-7eadbb065447', {
    baseUrl: 'sdk.fra-02.braze.eu', // EU-02 Frankfurt Cluster (Verified)
    enableLogging: true,
    allowUserSuppliedJavascript: true, // Required for Banner HTML execution
    manageServiceWorkerExternally: true,
  });

  // 2. Open session
  braze.openSession();

  // 3. Automatically show In-App Messages
  braze.automaticallyShowInAppMessages();

  // 4. Identify user (e.g. Alvaro Barroso)
  braze.changeUser('alvaro_barroso');
  const user = braze.getUser();
  if (user) {
    user.setFirstName('Alvaro');
    user.setLastName('Barroso');
    user.setEmail('alvaro.barroso@braze.com');
    user.setCustomUserAttribute('account_tier', 'enterprise');
  }

  // 5. Subscribe to dynamic Banner updates (Placement: my_first_banner)
  braze.subscribeToBannersUpdates((bannersMap) => {
    const banner = bannersMap['my_first_banner'];
    if (banner) {
      console.log('Dynamic Braze Banner received:', banner);
      const container = document.getElementById('braze-banner-my_first_banner');
      if (container) {
        braze.insertBanner(banner, container);
      }
    }
  });

  // 6. Request initial banner refresh
  braze.requestBannersRefresh(['my_first_banner'], () => {
    console.log('Banners refreshed from Braze backend');
  });
}
`;

const SNIPPET_BANNER_COMPONENT = `import React, { useEffect, useRef, useState } from 'react';
import * as braze from '@braze/web-sdk';
import type { Banner } from '@braze/web-sdk';

export const BrazeBanner: React.FC<{ placementId: string }> = ({ placementId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeBanner, setActiveBanner] = useState<Banner | null>(null);

  useEffect(() => {
    // Subscribe to dynamic banner updates from Braze dashboard
    const sub = braze.subscribeToBannersUpdates((banners) => {
      const banner = banners[placementId];
      if (banner) {
        setActiveBanner(banner);
        if (containerRef.current) {
          // insertBanner automatically renders HTML and logs impressions
          braze.insertBanner(banner, containerRef.current);
        }
        // Listen for dismiss events
        banner.subscribeToDismissedEvent(() => {
          setActiveBanner(null);
        });
      }
    });

    // Request refresh for this placement
    braze.requestBannersRefresh([placementId]);
  }, [placementId]);

  return (
    <div className="w-full my-4">
      {/* Container where Braze SDK renders the banner */}
      <div ref={containerRef} id={\`braze-banner-\${placementId}\`} />
      {!activeBanner && (
        <div className="text-xs text-slate-500 p-4 border border-dashed rounded-lg text-center">
          Waiting for campaign with placement ID: <strong>{placementId}</strong>
        </div>
      )}
    </div>
  );
};
`;

const SNIPPET_PACKAGE_JSON = `{
  "name": "website-braze-web-sdk",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@braze/web-sdk": "^6.13.0",
    "lucide-react": "^0.546.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^6.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vite": "^8.0.0"
  }
}
`;

export const CodeExportModal: React.FC<CodeExportModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  endpoint,
  placementId,
}) => {
  const [activeTab, setActiveTab] = useState<'git' | 'service' | 'banner' | 'pkg' | 'checklist'>('git');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const gitCommands = `# === ZERO-CONSOLE DEPLOY FROM BRANCH (GITHUB WEB UI) ===
# We generated the production bundle inside the '/docs' directory with '.nojekyll' and relative paths.
#
# Follow these 3 simple clicks in GitHub (NO CONSOLE NEEDED):
# 1. Open your GitHub repo: https://github.com/alvaroBarrosoMato/Basic-Braze-App
# 2. Click "Settings" (top menu) -> Click "Pages" (left sidebar)
# 3. Under "Build and deployment":
#      - Source: Select "Deploy from a branch"
#      - Branch: Select "main"
#      - Folder: Select "/docs" (IMPORTANT: change from "/ (root)" to "/docs")
#      - Click "Save"
#
# GitHub Pages will immediately publish the pre-compiled app from /docs!
# Your site will open live at: https://alvarobarrosomato.github.io/Basic-Braze-App/
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-3xl w-full max-h-[90vh] shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Braze Web SDK Code Dump &amp; GitHub Setup</h3>
              <p className="text-xs text-slate-400">Placement ID: <span className="font-mono text-orange-400">{placementId}</span> · SDK v6.13.0</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center border-b border-slate-800 px-4 bg-slate-950/30 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('git')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'git'
                ? 'border-orange-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-orange-400" />
            <span>Push to GitHub</span>
          </button>
          <button
            onClick={() => setActiveTab('service')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'service'
                ? 'border-orange-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>brazeService.ts</span>
          </button>
          <button
            onClick={() => setActiveTab('banner')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'banner'
                ? 'border-orange-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>BrazeBanner.tsx</span>
          </button>
          <button
            onClick={() => setActiveTab('pkg')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'pkg'
                ? 'border-orange-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>package.json</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'checklist'
                ? 'border-orange-500 text-white font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span>Braze Dashboard Checklist</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs">
          {activeTab === 'git' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-sans font-medium text-sm">
                  Run these commands in your project terminal:
                </span>
                <button
                  onClick={() => copyToClipboard(gitCommands, 'git')}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-sans font-semibold transition-colors"
                >
                  {copiedKey === 'git' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'git' ? 'Copied Commands!' : 'Copy Git Commands'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
                {gitCommands}
              </pre>
            </div>
          )}

          {activeTab === 'service' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-sans text-xs">
                  Full Braze SDK initialization &amp; subscription service
                </span>
                <button
                  onClick={() => copyToClipboard(SNIPPET_BRAZE_SERVICE, 'service')}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-sans font-semibold transition-colors"
                >
                  {copiedKey === 'service' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'service' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
                {SNIPPET_BRAZE_SERVICE}
              </pre>
            </div>
          )}

          {activeTab === 'banner' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-sans text-xs">
                  React banner component subscribing dynamically to <code className="text-orange-400">my_first_banner</code>
                </span>
                <button
                  onClick={() => copyToClipboard(SNIPPET_BANNER_COMPONENT, 'banner')}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-sans font-semibold transition-colors"
                >
                  {copiedKey === 'banner' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'banner' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
                {SNIPPET_BANNER_COMPONENT}
              </pre>
            </div>
          )}

          {activeTab === 'pkg' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-sans text-xs">
                  Dependencies including <code className="text-orange-400">@braze/web-sdk: ^6.13.0</code>
                </span>
                <button
                  onClick={() => copyToClipboard(SNIPPET_PACKAGE_JSON, 'pkg')}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-1.5 text-xs font-sans font-semibold transition-colors"
                >
                  {copiedKey === 'pkg' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'pkg' ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
                {SNIPPET_PACKAGE_JSON}
              </pre>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="font-sans space-y-4 text-xs text-slate-300">
              <h4 className="text-sm font-bold text-white mb-2">
                Braze Dashboard Campaign Configuration Guide
              </h4>
              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-mono font-bold flex items-center justify-center shrink-0">1</span>
                  <div>
                    <strong className="text-white">Verify App Name and API Key:</strong> In your Braze Dashboard, go to <em>Settings &gt; App Settings</em>. Find <strong>Website</strong> with API Key <code className="font-mono text-orange-400">{apiKey}</code>.
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-mono font-bold flex items-center justify-center shrink-0">2</span>
                  <div>
                    <strong className="text-white">Create a Banner Campaign:</strong> Go to <em>Messaging &gt; Campaigns &gt; Create Campaign &gt; Banner</em>.
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-mono font-bold flex items-center justify-center shrink-0">3</span>
                  <div>
                    <strong className="text-white">Assign Placement ID:</strong> Set the Placement ID field to:
                    <div className="mt-1 font-mono text-orange-300 font-bold bg-slate-900 px-2 py-1 rounded inline-block">
                      {placementId}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-mono font-bold flex items-center justify-center shrink-0">4</span>
                  <div>
                    <strong className="text-white">Compose Message Creative:</strong> Provide your banner HTML markup, buttons, and liquid personalization (e.g., <code className="text-orange-400">{"{{${first_name}}}"}</code>).
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 font-mono font-bold flex items-center justify-center shrink-0">5</span>
                  <div>
                    <strong className="text-white">Dynamic Refresh Verification:</strong> Once published, click <strong>"Refresh"</strong> in this web portal or trigger <code className="font-mono text-slate-200">braze.requestBannersRefresh(['{placementId}'])</code> to see the campaign render live!
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs font-sans text-slate-400">
          <span>Braze Web SDK version 6.13.0 integration</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
