import { TRAIN_SCHEDULE_CACHE_TTL_HOURS } from '@/config/constants';
import { getModel } from '@/config/database';
import type { TrainScheduleDocument } from '@/models/TrainSchedule.model';

import type { VendorTrainSchedule } from './railApi.client';

export const trainsRepository = {
  async findCachedSchedule(trainNumber: string) {
    const TrainSchedule = getModel<TrainScheduleDocument>('TrainSchedule');
    return TrainSchedule.findOne({ trainNumber, expiresAt: { $gt: new Date() } });
  },

  async upsertSchedule(schedule: VendorTrainSchedule) {
    const TrainSchedule = getModel<TrainScheduleDocument>('TrainSchedule');
    const expiresAt = new Date(Date.now() + TRAIN_SCHEDULE_CACHE_TTL_HOURS * 60 * 60 * 1000);
    return TrainSchedule.findOneAndUpdate(
      { trainNumber: schedule.trainNumber },
      { ...schedule, fetchedAt: new Date(), expiresAt },
      { upsert: true, new: true },
    );
  },
};