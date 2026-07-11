import { TRAIN_SCHEDULE_CACHE_TTL_HOURS } from '@/config/constants';
import { TrainSchedule } from '@/models/TrainSchedule.model';

import type { VendorTrainSchedule } from './railApi.client';

export const trainsRepository = {
  async findCachedSchedule(trainNumber: string) {
    return TrainSchedule.findOne({ trainNumber, expiresAt: { $gt: new Date() } });
  },

  async upsertSchedule(schedule: VendorTrainSchedule) {
    const expiresAt = new Date(Date.now() + TRAIN_SCHEDULE_CACHE_TTL_HOURS * 60 * 60 * 1000);
    return TrainSchedule.findOneAndUpdate(
      { trainNumber: schedule.trainNumber },
      { ...schedule, fetchedAt: new Date(), expiresAt },
      { upsert: true, new: true },
    );
  },
};
