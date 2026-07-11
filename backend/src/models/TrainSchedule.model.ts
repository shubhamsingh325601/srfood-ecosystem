import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface TrainStop {
  stationCode: string;
  stationName: string;
  arrivalTime?: string;
  departureTime?: string;
  dayOffset: number;
  distanceKm?: number;
}

export interface TrainScheduleDocument {
  _id: Types.ObjectId;
  trainNumber: string;
  trainName: string;
  sourceStationCode: string;
  destinationStationCode: string;
  runsOnDays: string[];
  stops: TrainStop[];
  fetchedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const trainStopSchema = new Schema<TrainStop>(
  {
    stationCode: { type: String, required: true },
    stationName: { type: String, required: true },
    arrivalTime: { type: String },
    departureTime: { type: String },
    dayOffset: { type: Number, default: 0 },
    distanceKm: { type: Number },
  },
  { _id: false },
);

const trainScheduleSchema = new Schema<TrainScheduleDocument>(
  {
    trainNumber: { type: String, required: true, unique: true, trim: true },
    trainName: { type: String, required: true },
    sourceStationCode: { type: String, required: true },
    destinationStationCode: { type: String, required: true },
    runsOnDays: { type: [String], default: [] },
    stops: { type: [trainStopSchema], default: [] },
    fetchedAt: { type: Date, required: true, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, collection: 'trainSchedules' },
);

trainScheduleSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TrainSchedule = model<TrainScheduleDocument>('TrainSchedule', trainScheduleSchema);
