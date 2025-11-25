
export interface QROptions {
  margin: number;
  width: number;
  color: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  logo?: string | null;
  logoSize?: number;
}

export interface AIResponse {
  payload: string;
  type: 'URL' | 'WIFI' | 'EMAIL' | 'SMS' | 'TEL' | 'VCARD' | 'TEXT' | 'GEO' | 'EVENT' | 'CRYPTO';
  summary: string;
}

export interface HistoryItem {
  id: string;
  content: string;
  timestamp: number;
  type: string;
}

export type GenerationMode = 'ai' | 'wifi' | 'vcard' | 'event' | 'crypto';
