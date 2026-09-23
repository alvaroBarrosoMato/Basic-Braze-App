import React from 'react';
import { ExternalLink, CheckCircle2, Terminal, Code, BookOpen, Layers, ShieldCheck, Cpu } from 'lucide-react';

interface DocumentationViewProps {
  onOpenCodeModal: () => void;
  onOpenInspector: () => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  onOpenCodeModal,
  onOpenInspector,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-orange-600 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Developer Reference Guide</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Braze Web SDK Integration &amp; Deployment
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Complete guide for initializing the Braze Web SDK 6.13, configuring dynamic placement banners, tracking customer journeys, and pushing your repository to GitHub.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCodeModal}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Dump Code &amp; Git Push</span>
          </button>
        </div>
      </div>

      {/* Official Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="https://braze.com/docs/developer_guide/banners#placement-ids"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-500/50 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-600">
              <Layers className="w-4 h-4" />
              <span>Placement IDs Documentation</span>
            </div>
            <p className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
              Braze Developer Guide: Banners
            </p>
            <p className="text-xs text-slate-500">
              Official docs on managing dynamic placements and handling banner lifecycle.
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-600 transition-colors" />
        </a>

        <a
          href="https://braze.com/docs/developer_guide/sdk_integration"
          target="_blank"
          rel="noopener noreferrer"
          className="p-4 bg-white rounded-xl border border-slate-200 hover:border-orange-500/50 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <Cpu className="w-4 h-4" />
              <span>SDK Setup Documentation</span>
            </div>
            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Braze Developer Guide: Web SDK Integration
            </p>
            <p className="text-xs text-slate-500">
              Core setup, API keys, clusters, and Content Cards integration patterns.
            </p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </a>
      </div>

      {/* Step by Step Implementation Checklist */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Step-by-Step Integration Verification</span>
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">Install &amp; Initialize SDK</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">@braze/web-sdk</code> to your package.json. Initialize with your API Key <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-orange-600">6c30e0b3-6ded-45c8-9a8d-7eadbb065447</code>, your cluster URL (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-emerald-600 font-bold">sdk.fra-02.braze.eu</code>), and set <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">allowUserSuppliedJavascript: true</code>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">Dynamic Placement Banners (`my_first_banner`)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Call <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">braze.subscribeToBannersUpdates()</code> to register a real-time subscriber. When a banner targeting <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-orange-600">my_first_banner</code> arrives, call <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">braze.insertBanner(banner, containerNode)</code>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">Customer Identification &amp; Segmentation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Whenever a user logs in, call <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">braze.changeUser(userId)</code>. Update custom attributes and traits (<code className="font-mono">setEmail</code>, <code className="font-mono">setFirstName</code>, <code className="font-mono">setCustomUserAttribute</code>). The SDK will automatically refresh banner and campaign eligibility!
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              4
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">Logging Events &amp; Revenue Purchases</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">braze.logCustomEvent(name, properties)</code> and <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">braze.logPurchase(productId, price, currency)</code> to fuel behavioral triggers and canvas journeys in Braze.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              5
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900">Deploy &amp; Push to GitHub</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Initialize git, commit your changes, and push to GitHub so your team can deploy this frontend directly to Vercel, Netlify, or Cloud Run.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GitHub Push Helper Card */}
      <section className="bg-slate-900 text-slate-100 rounded-2xl p-6 md:p-8 space-y-4 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-orange-400" />
            <h3 className="text-base font-bold text-white">Push Code to GitHub</h3>
          </div>
          <button
            onClick={onOpenCodeModal}
            className="text-xs text-orange-400 hover:text-orange-300 font-medium"
          >
            View Full Code Dump →
          </button>
        </div>

        <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto whitespace-pre leading-relaxed">
{`# 1. Push to GitHub with the updated base: './' and GitHub Actions workflow
git add .
git commit -m "fix: add base './' and GitHub Actions workflow for GitHub Pages"
git push origin main

# 2. In your GitHub repo:
# Go to Settings > Pages
# Under "Build and deployment" > "Source", select "GitHub Actions"
# The workflow will automatically build and publish to https://alvarobarrosomato.github.io/Basic-Braze-App/!`}
        </pre>
      </section>
    </div>
  );
};
