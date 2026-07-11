import { NotFoundError } from '@/utils/errors';

import type { CreateStationInput, UpdateStationInput } from './stations.dto';
import { stationsRepository } from './stations.repository';

export const stationsService = {
  async list(includeInactive: boolean, q?: string) {
    return stationsRepository.list(includeInactive, q);
  },

  async create(input: CreateStationInput) {
    return stationsRepository.create(input);
  },

  async update(id: string, input: UpdateStationInput) {
    const station = await stationsRepository.update(id, input);
    if (!station) throw new NotFoundError('Station not found');
    return station;
  },

  async delete(id: string) {
    const station = await stationsRepository.softDelete(id);
    if (!station) throw new NotFoundError('Station not found');
    return station;
  },
};
