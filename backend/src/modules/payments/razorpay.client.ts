import Razorpay from 'razorpay';

import { config } from '@/config/index';

let _client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (!_client) {
    _client = new Razorpay({
      key_id: config.razorpay.keyId || 'dummy_key_id',
      key_secret: config.razorpay.keySecret || 'dummy_key_secret',
    });
  }
  return _client;
}

export { Razorpay };
