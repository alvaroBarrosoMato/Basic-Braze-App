import React, { useState } from 'react';
import { ShoppingCart, Star, Heart, ArrowRight, CheckCircle2, Shield, Zap, Sparkles } from 'lucide-react';
import { BrazeBanner } from './BrazeBanner';
import { brazeService } from '../services/brazeService';
import type { CurrentUserAttributes } from '../types/braze';

interface StorefrontViewProps {
  currentUser: CurrentUserAttributes;
  onOpenInspector: () => void;
  onOpenUserModal: () => void;
}

const PRODUCTS = [
  {
    id: 'prod_studio_display',
    name: 'Retina Studio Display Pro',
    category: 'Displays',
    price: 899.00,
    rating: 4.9,
    reviews: 142,
    badge: 'Popular',
    image: '/src/assets/images/hero_banner_sample_1790175656900.jpg',
    description: 'Precision 5K retina panel with nano-texture glass and calibrated color profiles for designers.',
  },
  {
    id: 'prod_mechanical_board',
    name: 'Precision Tactile Keyboard',
    category: 'Peripherals',
    price: 189.00,
    rating: 4.8,
    reviews: 89,
    badge: 'New',
    image: '/src/assets/images/braze_app_icon_1790175642898.jpg',
    description: 'Aircraft-grade anodized aluminum chassis with custom lubricated switches and hot-swap sockets.',
  },
  {
    id: 'prod_desk_mat',
    name: 'Merino Wool Desk Canvas',
    category: 'Workspace',
    price: 79.00,
    rating: 4.7,
    reviews: 210,
    badge: null,
    image: '/src/assets/images/hero_banner_sample_1790175656900.jpg',
    description: 'High-density organic felted wool surface with non-slip natural rubber backing for ultra-smooth glide.',
  },
];

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  currentUser,
  onOpenInspector,
  onOpenUserModal,
}) => {
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [recentlyPurchased, setRecentlyPurchased] = useState<string | null>(null);

  const handleAddToCart = (product: typeof PRODUCTS[0]) => {
    setCartItems(prev => [...prev, product.id]);
    brazeService.logCustomEvent('added_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      currency: 'USD',
      user_tier: currentUser.customAttributes['account_tier'] || 'standard',
    });
  };

  const handleBuyNow = (product: typeof PRODUCTS[0]) => {
    setRecentlyPurchased(product.name);
    brazeService.logPurchase(product.id, product.price, 'USD', 1, {
      product_name: product.name,
      category: product.category,
      payment_method: 'card',
    });
    brazeService.logCustomEvent('order_completed', {
      order_id: `ord_${Math.floor(Math.random() * 90000 + 10000)}`,
      total_amount: product.price,
      items_count: 1,
    });
    setTimeout(() => setRecentlyPurchased(null), 4000);
  };

  const handleToggleFavorite = (product: typeof PRODUCTS[0]) => {
    const isFav = favoriteItems.includes(product.id);
    const updated = isFav ? favoriteItems.filter(id => id !== product.id) : [...favoriteItems, product.id];
    setFavoriteItems(updated);
    brazeService.logCustomEvent(isFav ? 'removed_from_wishlist' : 'added_to_wishlist', {
      product_id: product.id,
      product_name: product.name,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Dynamic Placement Banner: my_first_banner */}
      <BrazeBanner placementId="my_first_banner" />

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-8 md:p-12 shadow-xl border border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-10" />
        <img
          src="/src/assets/images/hero_banner_sample_1790175656900.jpg"
          alt="Modern Workstation Hero"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
        />

        <div className="relative z-20 max-w-2xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-orange-400">
            <span>Braze Web SDK 6.13.0 Live Integration</span>
            <span aria-hidden="true">·</span>
            <span>App: Website</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
            Next-Generation Workspaces Crafted for High Flow
          </h1>

          <p className="text-base text-slate-300 max-w-xl leading-relaxed">
            Experience our curated hardware collection with real-time lifecycle messaging powered by Braze. Try adding products to cart or purchasing to see live events stream in the SDK inspector.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                brazeService.logCustomEvent('clicked_hero_cta', {
                  target: 'explore_catalog',
                  user: currentUser.userId,
                });
                const el = document.getElementById('featured-products');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenInspector}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl backdrop-blur-md border border-white/10 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-orange-400" />
              <span>Inspect Braze Telemetry</span>
            </button>
          </div>
        </div>

        {/* User Context Badge */}
        <div className="relative z-20 mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Active Braze Profile:</span>
            <span className="font-semibold text-white">{currentUser.firstName} {currentUser.lastName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-orange-300">{currentUser.email}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">Tier: {String(currentUser.customAttributes['account_tier'] || 'standard')}</span>
          </div>

          <button
            onClick={onOpenUserModal}
            className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            Switch User Profile →
          </button>
        </div>
      </section>

      {/* Purchase Success Toast Notification */}
      {recentlyPurchased && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between shadow-sm animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Purchase successfully recorded in Braze SDK!</p>
              <p className="text-xs text-emerald-700">Logged <code className="font-mono">braze.logPurchase()</code> for {recentlyPurchased}.</p>
            </div>
          </div>
          <button
            onClick={onOpenInspector}
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            View in Log Stream
          </button>
        </div>
      )}

      {/* Featured Products Collection */}
      <section id="featured-products" className="space-y-6 pt-4">
        <div className="flex items-end justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-orange-600">
              Interactive Hardware Catalog
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Engineered Essentials
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Cart Items: <strong className="text-slate-900">{cartItems.length}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRODUCTS.map((prod) => {
            const isCarted = cartItems.includes(prod.id);
            const isFaved = favoriteItems.includes(prod.id);

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() => handleToggleFavorite(prod)}
                      className={`p-2 rounded-full backdrop-blur-md transition-colors ${
                        isFaved
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-slate-700 hover:bg-white hover:text-red-500'
                      }`}
                      title="Save to Wishlist (Logs Braze Event)"
                    >
                      <Heart className={`w-4 h-4 ${isFaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{prod.category}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-semibold text-slate-700">{prod.rating}</span>
                        <span className="text-slate-400">({prod.reviews})</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-lg font-bold text-slate-900 font-mono">
                      ${prod.price.toFixed(2)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAddToCart(prod)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                          isCarted
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                        }`}
                        title="Calls braze.logCustomEvent('added_to_cart')"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{isCarted ? 'Added' : 'Add'}</span>
                      </button>

                      <button
                        onClick={() => handleBuyNow(prod)}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                        title="Calls braze.logPurchase()"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Adjacency Callouts */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Dynamic Banners</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Placements like <code className="font-mono text-orange-600 bg-orange-50 px-1 py-0.5 rounded">my_first_banner</code> listen via <code className="font-mono">subscribeToBannersUpdates()</code> for immediate dashboard updates.
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">User Identification</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Switch users or set custom attributes on the fly with <code className="font-mono">braze.changeUser()</code> and <code className="font-mono">getUser().setFirstName()</code>.
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Lifecycle Telemetry</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Real-time tracking of impressions, clicks, custom events, and purchases with full inspector logs and GitHub export.
          </p>
        </div>
      </section>
    </div>
  );
};
