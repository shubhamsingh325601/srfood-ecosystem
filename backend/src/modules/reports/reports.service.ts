import { BadRequestError } from '@/utils/errors';

import type { ReportQueryInput, ReportType } from './reports.dto';
import { reportsRepository } from './reports.repository';

export const reportsService = {
  async generate(type: ReportType, input: ReportQueryInput) {
    switch (type) {
      case 'orders':
        return reportsRepository.ordersReport(input.from, input.to);
      case 'revenue':
        return reportsRepository.revenueReport(input.from, input.to);
      case 'users':
        return reportsRepository.usersReport(input.from, input.to);
      default:
        throw new BadRequestError('Unknown report type');
    }
  },
};
