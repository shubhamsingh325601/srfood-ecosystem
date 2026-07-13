interface BuildUpiLinkInput {
  vpa: string;
  payeeName: string;
  amountPaise: number;
  transactionRef: string;
  note: string;
}

/** Builds a UPI deep link (`upi://pay?...`) that opens the customer's own UPI app. No gateway involved. */
export function buildUpiLink({ vpa, payeeName, amountPaise, transactionRef, note }: BuildUpiLinkInput): string {
  const params: [string, string][] = [
    ['pa', vpa],
    ['pn', payeeName],
    ['am', (amountPaise / 100).toFixed(2)],
    ['cu', 'INR'],
    ['tr', transactionRef],
    ['tn', note],
  ];
  const query = params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  return `upi://pay?${query}`;
}
