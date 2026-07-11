import { Station } from '@/models/Station.model';

export const stationsRepository = {
  async list(includeInactive: boolean, q?: string) {
    const query: Record<string, unknown> = { isDeleted: false };
    if (!includeInactive) query.isActive = true;
    if (q) query.name = { $regex: q, $options: 'i' };
    return Station.find(query).sort({ name: 1 });
  },

  async create(data: Record<string, unknown>) {
    return Station.create(data);
  },

  async update(id: string, data: Record<string, unknown>) {
    return Station.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
  },

  async softDelete(id: string) {
    return Station.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, isActive: false }, { new: true });
  },
};
