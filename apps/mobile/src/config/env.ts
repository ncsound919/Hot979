/**
 * Environment configuration for the mobile app.
 *
 * Stream URL resolution priority:
 *   1. EXPO_PUBLIC_STREAM_URL environment variable (at build time)
 *   2. STATION.streamUrl from the shared package
 *
 * Usage: import { STREAM_URL } from '../config/env'
 */

import { STATION } from './station';

export const STREAM_URL: string =
  (process.env as any).EXPO_PUBLIC_STREAM_URL || STATION.streamUrl;

export const APP_NAME: string = STATION.name;

export const STATION_CALLSIGN: string = STATION.callsign;

export const STATION_FREQUENCY: string = STATION.frequency;
