import axios from 'axios';

import { config } from '@/config/index';
import { logger } from '@/utils/logger';

export interface VendorTrainStop {
  stationCode: string;
  stationName: string;
  arrivalTime?: string;
  departureTime?: string;
  dayOffset?: number;
  distanceKm?: number;
}

export interface VendorTrainSchedule {
  trainNumber: string;
  trainName: string;
  sourceStationCode: string;
  destinationStationCode: string;
  runsOnDays: string[];
  stops: VendorTrainStop[];
}

export interface VendorPnrStatus {
  pnr: string;
  trainNumber: string;
  trainName: string;
  boardingDate: string;
  boardingStationCode: string;
  reservationUpToStationCode: string;
  coach: string;
  seat: string;
  chartPrepared: boolean;
}

export interface VendorTrainSearchResult {
  trainNumber: string;
  trainName: string;
  sourceStationCode: string;
  destinationStationCode: string;
}

function client() {
  return axios.create({
    baseURL: config.railApi.baseUrl,
    timeout: 10_000,
    headers: { Authorization: `Bearer ${config.railApi.apiKey}` },
  });
}

/**
 * Thin adapter over the IRCTC/RailAPI vendor contract. The vendor relationship itself is an
 * unresolved procurement dependency (PRD Risk R-01 — see CLAUDE.md §14 and docs/adr/0002).
 * This client makes a real HTTP call against `RAIL_API_BASE_URL`; until that env var points at
 * a real, contracted vendor, calls correctly fail rather than returning fabricated data —
 * callers (trains.service) are responsible for the documented manual-entry fallback.
 */
export const railApiClient = {
  async searchTrains(query: string): Promise<VendorTrainSearchResult[]> {
    if (!config.railApi.baseUrl) throw new Error('RAIL_API_BASE_URL is not configured');
    try {
      const { data } = await client().get<{ trains: VendorTrainSearchResult[] }>('/trains/search', { params: { query } });
      return data.trains;
    } catch (error) {
      logger.error('Rail vendor searchTrains failed', { query, error: error instanceof Error ? error.message : error });
      throw error;
    }
  },

  async getPnrStatus(pnr: string): Promise<VendorPnrStatus> {
    if (!config.railApi.baseUrl) throw new Error('RAIL_API_BASE_URL is not configured');
    try {
      const { data } = await client().get<VendorPnrStatus>(`/pnr/${pnr}`);
      return data;
    } catch (error) {
      logger.error('Rail vendor getPnrStatus failed', { pnr, error: error instanceof Error ? error.message : error });
      throw error;
    }
  },

  async getTrainSchedule(trainNumber: string): Promise<VendorTrainSchedule> {
    if (!config.railApi.baseUrl) throw new Error('RAIL_API_BASE_URL is not configured');
    try {
      const { data } = await client().get<VendorTrainSchedule>(`/trains/${trainNumber}`);
      return data;
    } catch (error) {
      logger.error('Rail vendor getTrainSchedule failed', { trainNumber, error: error instanceof Error ? error.message : error });
      throw error;
    }
  },
};
