import { DELIVERY_WINDOW_MINUTES } from '@/config/constants';
import { AppError, NotFoundError } from '@/utils/errors';
import { logger } from '@/utils/logger';

import { railApiClient } from './railApi.client';
import { trainsRepository } from './trains.repository';

function vendorUnavailableError(): AppError {
  return new AppError(
    503,
    'RAIL_VENDOR_UNAVAILABLE',
    'Live train data is temporarily unavailable — please enter your PNR/coach/seat/station details manually',
  );
}

export const trainsService = {
  async searchTrains(query: string) {
    try {
      return await railApiClient.searchTrains(query);
    } catch (error) {
      logger.warn('Train search vendor call failed, no fallback data available', { query, error });
      throw vendorUnavailableError();
    }
  },

  async getPnrStatus(pnr: string) {
    try {
      return await railApiClient.getPnrStatus(pnr);
    } catch (error) {
      logger.warn('PNR lookup vendor call failed, checkout should fall back to manual entry', { pnr, error });
      throw vendorUnavailableError();
    }
  },

  async getTrainStops(trainNumber: string) {
    const cached = await trainsRepository.findCachedSchedule(trainNumber);
    if (cached) return cached;

    try {
      const schedule = await railApiClient.getTrainSchedule(trainNumber);
      return await trainsRepository.upsertSchedule(schedule);
    } catch (error) {
      logger.warn('Train schedule vendor call failed, no cached fallback available', { trainNumber, error });
      throw vendorUnavailableError();
    }
  },

  /** Used by the Orders module at checkout to enforce the PRD's 45-minute delivery window (§13.8). */
  async isWithinDeliveryWindow(trainNumber: string, stationCode: string, boardingDate: Date, now = new Date()): Promise<boolean> {
    const schedule = await this.getTrainStops(trainNumber);
    const stop = schedule.stops.find((s) => s.stationCode === stationCode);
    if (!stop || !stop.arrivalTime) throw new NotFoundError(`Station ${stationCode} not found on this train's route`);

    const [hours, minutes] = stop.arrivalTime.split(':').map(Number);
    const arrivalDateTime = new Date(boardingDate);
    arrivalDateTime.setDate(arrivalDateTime.getDate() + stop.dayOffset);
    arrivalDateTime.setHours(hours, minutes, 0, 0);

    const diffMinutes = Math.abs((arrivalDateTime.getTime() - now.getTime()) / 60_000);
    return diffMinutes <= DELIVERY_WINDOW_MINUTES;
  },
};
