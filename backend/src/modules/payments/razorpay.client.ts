import Razorpay from 'razorpay';

import { config } from '@/config/index';

export const razorpayClient = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export { Razorpay };
