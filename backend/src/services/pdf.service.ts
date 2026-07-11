import PDFDocument from 'pdfkit';

export interface InvoicePdfData {
  invoiceNumber: string;
  orderId: string;
  createdAt: Date;
  passengerName: string;
  items: { name: string; quantity: number; price: number; itemTotal: number }[];
  subtotalPaise: number;
  gstAmountPaise: number;
  deliveryFeePaise: number;
  platformFeePaise: number;
  discountPaise: number;
  grandTotalPaise: number;
}

function formatRupees(paise: number): string {
  return `Rs. ${(paise / 100).toFixed(2)}`;
}

export async function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text('SR Food', { align: 'left' });
    doc.fontSize(10).text('Tax Invoice', { align: 'left' });
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Invoice Number: ${data.invoiceNumber}`);
    doc.text(`Order ID: ${data.orderId}`);
    doc.text(`Date: ${data.createdAt.toDateString()}`);
    doc.text(`Customer: ${data.passengerName}`);
    doc.moveDown();

    doc.fontSize(12).text('Items', { underline: true });
    doc.moveDown(0.5);
    for (const item of data.items) {
      doc.fontSize(10).text(`${item.name}  x${item.quantity}  —  ${formatRupees(item.itemTotal)}`);
    }
    doc.moveDown();

    doc.fontSize(12).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Subtotal: ${formatRupees(data.subtotalPaise)}`);
    doc.text(`GST: ${formatRupees(data.gstAmountPaise)}`);
    doc.text(`Delivery Fee: ${formatRupees(data.deliveryFeePaise)}`);
    doc.text(`Platform Fee: ${formatRupees(data.platformFeePaise)}`);
    if (data.discountPaise > 0) doc.text(`Discount: -${formatRupees(data.discountPaise)}`);
    doc.fontSize(12).text(`Grand Total: ${formatRupees(data.grandTotalPaise)}`, { underline: true });

    doc.end();
  });
}
