import * as braze from '@braze/web-sdk';
import type { Banner, Card } from '@braze/web-sdk';
import type { BrazeConfig, TelemetryLog, CurrentUserAttributes, BannerState } from '../types/braze';

type LogListener = (logs: TelemetryLog[]) => void;
type BannerListener = (state: BannerState) => void;
type ContentCardsListener = (cards: Card[]) => void;

class BrazeService {
  private static instance: BrazeService;
  private config: BrazeConfig = {
    apiKey: '6c30e0b3-6ded-45c8-9a8d-7eadbb065447',
    baseUrl: 'sdk.fra-02.braze.eu',
    appName: 'Website',
    placementId: 'my_first_banner',
    allowUserSuppliedJavascript: true,
    enableLogging: true,
  };

  private logs: TelemetryLog[] = [];
  private logListeners: Set<LogListener> = new Set();
  private bannerListeners: Set<BannerListener> = new Set();
  private cardsListeners: Set<ContentCardsListener> = new Set();

  private bannerState: BannerState = {
    banner: null,
    placementId: 'my_first_banner',
    lastUpdated: null,
    source: 'none',
  };

  private contentCards: Card[] = [];
  private isSdkInitialized = false;
  private currentUser: CurrentUserAttributes = {
    userId: 'alvaro_barroso',
    email: 'alvaro.barroso@braze.com',
    firstName: 'Alvaro',
    lastName: 'Barroso',
    country: 'ES',
    customAttributes: {
      account_tier: 'enterprise',
      sdk_test_env: 'production_web',
      preferred_theme: 'dark',
    },
  };

  private constructor() {
    this.loadPersistedConfig();
  }

  public static getInstance(): BrazeService {
    if (!BrazeService.instance) {
      BrazeService.instance = new BrazeService();
    }
    return BrazeService.instance;
  }

  private loadPersistedConfig() {
    try {
      const savedConfig = localStorage.getItem('braze_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.baseUrl === 'sdk.iad-01.braze.com') {
          parsed.baseUrl = 'sdk.fra-02.braze.eu';
          localStorage.setItem('braze_config', JSON.stringify({ ...this.config, ...parsed }));
        }
        this.config = { ...this.config, ...parsed };
      }
      const savedUser = localStorage.getItem('braze_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn('Could not load stored Braze config:', e);
    }
  }

  public getConfig(): BrazeConfig {
    return { ...this.config };
  }

  public getCurrentUser(): CurrentUserAttributes {
    return { ...this.currentUser };
  }

  public getBannerState(): BannerState {
    return { ...this.bannerState };
  }

  public getContentCards(): Card[] {
    return [...this.contentCards];
  }

  public getLogs(): TelemetryLog[] {
    return [...this.logs];
  }

  public addLogListener(listener: LogListener): () => void {
    this.logListeners.add(listener);
    listener([...this.logs]);
    return () => this.logListeners.delete(listener);
  }

  public addBannerListener(listener: BannerListener): () => void {
    this.bannerListeners.add(listener);
    listener({ ...this.bannerState });
    return () => this.bannerListeners.delete(listener);
  }

  public addContentCardsListener(listener: ContentCardsListener): () => void {
    this.cardsListeners.add(listener);
    listener([...this.contentCards]);
    return () => this.cardsListeners.delete(listener);
  }

  private emitLog(type: TelemetryLog['type'], action: string, details?: Record<string, unknown> | string | number | null) {
    const logItem: TelemetryLog = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      action,
      details,
    };
    this.logs = [logItem, ...this.logs.slice(0, 99)];
    this.logListeners.forEach(listener => listener([...this.logs]));
  }

  private emitBannerState(state: BannerState) {
    this.bannerState = state;
    this.bannerListeners.forEach(listener => listener({ ...state }));
  }

  private emitContentCards(cards: Card[]) {
    this.contentCards = cards;
    this.cardsListeners.forEach(listener => listener([...cards]));
  }

  /**
   * Initializes the Braze Web SDK.
   */
  public async init(newConfig?: Partial<BrazeConfig>): Promise<boolean> {
    if (newConfig) {
      this.config = { ...this.config, ...newConfig };
      localStorage.setItem('braze_config', JSON.stringify(this.config));
    }

    try {
      this.emitLog('info', 'braze.initialize() requested', {
        apiKey: `${this.config.apiKey.slice(0, 8)}...${this.config.apiKey.slice(-4)}`,
        baseUrl: this.config.baseUrl,
        appName: this.config.appName,
        allowUserSuppliedJavascript: this.config.allowUserSuppliedJavascript,
      });

      // Braze initialize call
      const initSuccess = braze.initialize(this.config.apiKey, {
        baseUrl: this.config.baseUrl,
        enableLogging: this.config.enableLogging,
        allowUserSuppliedJavascript: this.config.allowUserSuppliedJavascript,
        manageServiceWorkerExternally: true,
      });

      this.isSdkInitialized = braze.isInitialized();

      if (this.isSdkInitialized || initSuccess) {
        this.emitLog('success', 'Braze SDK Initialized', {
          version: '6.13.0',
          cluster: this.config.baseUrl,
          app: this.config.appName,
        });

        // Open session
        braze.openSession();
        this.emitLog('info', 'braze.openSession() called', { status: 'session_active' });

        // Auto show in-app messages
        braze.automaticallyShowInAppMessages();
        this.emitLog('info', 'braze.automaticallyShowInAppMessages() active');

        // Apply current user attributes
        this.applyCurrentUser();

        // Subscribe to dynamic banners
        this.setupBannerSubscription();

        // Subscribe to Content Cards
        this.setupContentCardsSubscription();

        // Refresh initial banners
        this.refreshBanners();

        return true;
      } else {
        this.emitLog('warn', 'braze.initialize returned false or already initialized');
        return false;
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.emitLog('warn', 'SDK init note (handling graceful fallback)', { error: errorMsg });
      this.isSdkInitialized = braze.isInitialized();
      return this.isSdkInitialized;
    }
  }

  /**
   * Subscribes to Braze dynamic banner updates
   */
  private setupBannerSubscription() {
    try {
      braze.subscribeToBannersUpdates((bannersMap: Record<string, Banner | null>) => {
        const placement = this.config.placementId;
        const banner = bannersMap[placement];
        this.emitLog('banner', 'braze.subscribeToBannersUpdates received', {
          placementId: placement,
          found: Boolean(banner),
          isControl: banner?.isControl ?? false,
          availablePlacements: Object.keys(bannersMap),
        });

        if (banner) {
          // Listen for dismissal
          try {
            banner.subscribeToDismissedEvent(() => {
              this.emitLog('banner', 'Banner dismissed event fired', { placementId: placement });
              this.emitBannerState({
                banner: null,
                placementId: placement,
                lastUpdated: new Date().toLocaleTimeString(),
                source: 'none',
              });
            });
          } catch (e) {
            // Dismissal listener registration
          }

          this.emitBannerState({
            banner,
            rawHtml: banner.html,
            isControl: banner.isControl,
            placementId: placement,
            lastUpdated: new Date().toLocaleTimeString(),
            source: 'live',
          });
        } else {
          // If no active live banner, update state
          this.emitBannerState({
            banner: null,
            placementId: placement,
            lastUpdated: new Date().toLocaleTimeString(),
            source: this.bannerState.source === 'simulator' ? 'simulator' : 'none',
          });
        }
      });
      this.emitLog('info', 'Subscribed to Braze Banner updates', { placement: this.config.placementId });
    } catch (e: unknown) {
      this.emitLog('warn', 'subscribeToBannersUpdates error', { message: String(e) });
    }
  }

  /**
   * Subscribes to Braze Content Cards
   */
  private setupContentCardsSubscription() {
    try {
      braze.subscribeToContentCardsUpdates((contentCards: braze.ContentCards) => {
        const cards = contentCards.cards || [];
        this.emitLog('info', 'braze.subscribeToContentCardsUpdates received', { count: cards.length });
        this.emitContentCards(cards);
      });
      braze.requestContentCardsRefresh();
    } catch (e: unknown) {
      this.emitLog('warn', 'Content Cards setup note', { message: String(e) });
    }
  }

  /**
   * Trigger explicit banner refresh from Braze backend
   */
  public requestBannersRefresh(placementIds: string[] = [this.config.placementId]): Promise<boolean> {
    return new Promise((resolve) => {
      this.emitLog('banner', 'braze.requestBannersRefresh() requested', { placementIds });
      try {
        braze.requestBannersRefresh(placementIds, () => {
          this.emitLog('success', 'braze.requestBannersRefresh() completed successfully', { placementIds });
          const banner = braze.getBanner(this.config.placementId);
          if (banner) {
            this.emitBannerState({
              banner,
              rawHtml: banner.html,
              isControl: banner.isControl,
              placementId: this.config.placementId,
              lastUpdated: new Date().toLocaleTimeString(),
              source: 'live',
            });
          }
          resolve(true);
        });
      } catch (err: unknown) {
        this.emitLog('warn', 'requestBannersRefresh error', { message: String(err) });
        resolve(false);
      }
    });
  }

  public refreshBanners() {
    this.requestBannersRefresh([this.config.placementId]);
  }

  /**
   * Renders the given Banner into a DOM element
   */
  public insertBanner(banner: Banner, container: HTMLElement): void {
    try {
      this.emitLog('banner', 'braze.insertBanner() called', {
        placementId: banner.placementId,
        id: banner.id,
      });
      braze.insertBanner(banner, container);
    } catch (err: unknown) {
      this.emitLog('warn', 'insertBanner error', { message: String(err) });
      // Fallback: insert HTML safely and log impression manually
      if (banner.html) {
        container.innerHTML = banner.html;
        this.logBannerImpressions([banner.placementId]);
      }
    }
  }

  /**
   * Log banner impression by placement IDs
   */
  public logBannerImpressions(placementIds: string[]): void {
    try {
      this.emitLog('banner', 'braze.logBannerImpressions()', { placementIds });
      braze.logBannerImpressions(placementIds);
    } catch (e: unknown) {
      this.emitLog('warn', 'logBannerImpressions error', { message: String(e) });
    }
  }

  /**
   * Log banner click
   */
  public logBannerClick(banner: Banner, buttonId?: string): void {
    try {
      this.emitLog('banner', 'braze.logBannerClick()', { bannerId: banner.id, buttonId });
      braze.logBannerClick(banner, buttonId);
    } catch (e: unknown) {
      this.emitLog('warn', 'logBannerClick error', { message: String(e) });
    }
  }

  /**
   * Dismiss banner
   */
  public dismissBanner(banner: Banner): void {
    try {
      this.emitLog('banner', 'braze.dismissBanner()', { bannerId: banner.id });
      braze.dismissBanner(banner);
      this.emitBannerState({
        banner: null,
        placementId: this.config.placementId,
        lastUpdated: new Date().toLocaleTimeString(),
        source: 'none',
      });
    } catch (e: unknown) {
      this.emitLog('warn', 'dismissBanner error', { message: String(e) });
    }
  }

  /**
   * Set or update current user in Braze
   */
  public changeUser(userData: Partial<CurrentUserAttributes>): void {
    const updated = { ...this.currentUser, ...userData };
    this.currentUser = updated;
    localStorage.setItem('braze_user', JSON.stringify(updated));

    try {
      this.emitLog('user', 'braze.changeUser() called', { userId: updated.userId });
      braze.changeUser(updated.userId);

      const user = braze.getUser();
      if (user) {
        if (updated.firstName) user.setFirstName(updated.firstName);
        if (updated.lastName) user.setLastName(updated.lastName);
        if (updated.email) user.setEmail(updated.email);
        if (updated.phone) user.setPhoneNumber(updated.phone);
        if (updated.country) user.setCountry(updated.country);

        Object.entries(updated.customAttributes).forEach(([key, val]) => {
          user.setCustomUserAttribute(key, val);
        });

        this.emitLog('success', 'User attributes synced to Braze', {
          email: updated.email,
          name: `${updated.firstName} ${updated.lastName}`,
          customAttributesCount: Object.keys(updated.customAttributes).length,
        });
      }

      // Re-request banners for this user segment
      this.refreshBanners();
    } catch (err: unknown) {
      this.emitLog('warn', 'changeUser error', { message: String(err) });
    }
  }

  private applyCurrentUser(): void {
    try {
      braze.changeUser(this.currentUser.userId);
      const user = braze.getUser();
      if (user) {
        if (this.currentUser.firstName) user.setFirstName(this.currentUser.firstName);
        if (this.currentUser.lastName) user.setLastName(this.currentUser.lastName);
        if (this.currentUser.email) user.setEmail(this.currentUser.email);
        if (this.currentUser.country) user.setCountry(this.currentUser.country);
        Object.entries(this.currentUser.customAttributes).forEach(([key, val]) => {
          user.setCustomUserAttribute(key, val);
        });
      }
      this.emitLog('user', 'Identified active user in Braze', {
        userId: this.currentUser.userId,
        email: this.currentUser.email,
      });
    } catch (e: unknown) {
      this.emitLog('warn', 'applyCurrentUser note', { message: String(e) });
    }
  }

  /**
   * Log a custom Braze event
   */
  public logCustomEvent(eventName: string, eventProperties?: Record<string, unknown>): void {
    try {
      this.emitLog('event', `braze.logCustomEvent("${eventName}")`, eventProperties);
      braze.logCustomEvent(eventName, eventProperties);
    } catch (err: unknown) {
      this.emitLog('warn', `Error logging custom event: ${eventName}`, { message: String(err) });
    }
  }

  /**
   * Log a purchase in Braze
   */
  public logPurchase(productId: string, price: number, currencyCode = 'USD', quantity = 1, properties?: Record<string, unknown>): void {
    try {
      this.emitLog('event', `braze.logPurchase("${productId}")`, { price, currencyCode, quantity, properties });
      braze.logPurchase(productId, price, currencyCode, quantity, properties);
    } catch (err: unknown) {
      this.emitLog('warn', `Error logging purchase: ${productId}`, { message: String(err) });
    }
  }

  /**
   * Request web push notification permission
   */
  public requestPushPermission(): void {
    try {
      this.emitLog('info', 'braze.requestPushPermission() triggered');
      braze.requestPushPermission(
        () => {
          this.emitLog('success', 'Push notification permission GRANTED');
        },
        () => {
          this.emitLog('warn', 'Push notification permission DENIED or unsupported');
        }
      );
    } catch (e: unknown) {
      this.emitLog('warn', 'requestPushPermission error', { message: String(e) });
    }
  }

  /**
   * Simulator toggle for testing banner layout before campaign is live
   */
  public toggleSimulatorBanner(enabled: boolean): void {
    if (enabled) {
      this.emitBannerState({
        banner: null,
        placementId: this.config.placementId,
        lastUpdated: new Date().toLocaleTimeString(),
        source: 'simulator',
        rawHtml: `<div class="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 border border-orange-400/30">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs uppercase tracking-wider font-semibold text-orange-200">Braze Placement: my_first_banner</span>
                <span class="text-[10px] bg-white/20 px-2 py-0.5 rounded text-white font-medium">Dynamic Banner</span>
              </div>
              <h3 class="text-lg font-bold tracking-tight">Special Launch Offer: 25% Off Annual Pro Plan</h3>
              <p class="text-sm text-orange-100/90 mt-0.5">Automate campaigns seamlessly with Braze & modern Web SDK 6.13.</p>
            </div>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <button id="banner-action-btn" class="px-5 py-2.5 bg-white text-orange-700 font-semibold text-sm rounded-lg hover:bg-orange-50 active:scale-95 transition-all shadow-md">
              Claim Discount →
            </button>
            <button id="banner-dismiss-btn" class="p-2 text-orange-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Dismiss Banner">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>`,
      });
      this.emitLog('banner', 'Simulator Banner enabled for placement: ' + this.config.placementId);
    } else {
      this.emitBannerState({
        banner: null,
        placementId: this.config.placementId,
        lastUpdated: new Date().toLocaleTimeString(),
        source: 'none',
      });
      this.emitLog('banner', 'Simulator Banner disabled');
    }
  }

  public clearLogs(): void {
    this.logs = [];
    this.logListeners.forEach(listener => listener([]));
  }
}

export const brazeService = BrazeService.getInstance();
