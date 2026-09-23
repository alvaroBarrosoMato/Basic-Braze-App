import type { Banner, Card } from '@braze/web-sdk';

export interface BrazeConfig {
  apiKey: string;
  baseUrl: string;
  appName: string;
  placementId: string;
  allowUserSuppliedJavascript: boolean;
  enableLogging: boolean;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'event' | 'banner' | 'user';
  action: string;
  details?: Record<string, unknown> | string | number | null;
}

export interface CurrentUserAttributes {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  customAttributes: Record<string, string | number | boolean>;
}

export interface BannerState {
  banner: Banner | null;
  rawHtml?: string;
  isControl?: boolean;
  placementId: string;
  lastUpdated: string | null;
  source: 'live' | 'simulator' | 'none';
}
