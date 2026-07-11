import type { DateRangeInput } from './analytics.dto';
import { analyticsRepository } from './analytics.repository';

export const analyticsService = {
  revenueTrend: (input: DateRangeInput) => analyticsRepository.revenueTrend(input.from, input.to),
  stationHeatmap: (input: DateRangeInput) => analyticsRepository.stationHeatmap(input.from, input.to),
  paymentBreakdown: (input: DateRangeInput) => analyticsRepository.paymentBreakdown(input.from, input.to),
  funnel: (input: DateRangeInput) => analyticsRepository.orderFunnel(input.from, input.to),
};
