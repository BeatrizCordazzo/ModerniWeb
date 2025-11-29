import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface InvoiceCustomerInfo {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  taxId?: string | null;
}

export interface InvoicePaymentInfo {
  method?: string | null;
  cardHolder?: string | null;
  lastDigits?: string | null;
}

export interface InvoiceItemLine {
  name: string;
  quantity: number;
  unitPrice: number;
  description?: string | null;
  color?: string | null;
}

export interface InvoiceSpaceDimensions {
  width?: number | string | null;
  height?: number | string | null;
  depth?: number | string | null;
}

export interface GenerateInvoiceOptions {
  orderId: number | string;
  orderDate: Date;
  customer?: InvoiceCustomerInfo | null;
  paymentInfo?: InvoicePaymentInfo | null;
  billingAddress?: string | null;
  items: InvoiceItemLine[];
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string | null;
  spaceDimensions?: InvoiceSpaceDimensions | null;
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  });

  generateOrderInvoice(options: GenerateInvoiceOptions): void {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginLeft = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = 60;

    const orderId = String(options.orderId).padStart(5, '0');
    const issueDate = this.formatDate(options.orderDate);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Invoice', marginLeft, currentY);
    doc.setFontSize(11);
    doc.text(`Invoice #${orderId}`, pageWidth - 200, currentY - 4);
    doc.setFont('helvetica', 'normal');
    currentY += 22;

    const companyInfo = [
      'Moderni Studio Europe SL',
      'CIF: B12345678',
      'Calle Santiago 15, 47001 Valladolid, Spain',
      'Phone: +34 983 555 123',
      'invoices@moderni.com',
    ];
    doc.setFontSize(10);
    companyInfo.forEach((line) => {
      doc.text(line, marginLeft, currentY);
      currentY += 14;
    });

    doc.text(`Issue date: ${issueDate}`, pageWidth - 200, currentY - 42);
    const paymentCondition = options.paymentInfo?.method ?? 'Credit card';
    doc.text(`Payment terms: ${paymentCondition}`, pageWidth - 200, currentY - 28);

    currentY += 10;
    doc.setDrawColor(220);
    doc.line(marginLeft, currentY, pageWidth - marginLeft, currentY);
    currentY += 20;

    // Customer block
    doc.setFont('helvetica', 'bold');
    doc.text('Bill to', marginLeft, currentY);
    doc.setFont('helvetica', 'normal');
    const customerName =
      options.customer?.name || options.paymentInfo?.cardHolder || 'Moderni Client';
    doc.text(customerName, marginLeft, currentY + 14);
    if (options.customer?.email) {
      doc.text(`Email: ${options.customer.email}`, marginLeft, currentY + 28);
    }
    if (options.customer?.phone) {
      doc.text(`Phone: ${options.customer.phone}`, marginLeft, currentY + 42);
    }
    if (options.customer?.taxId) {
      doc.text(`VAT ID: ${options.customer.taxId}`, marginLeft, currentY + 56);
    }
    doc.text(
      `Address: ${options.billingAddress ? options.billingAddress : 'Not provided'}`,
      marginLeft,
      currentY + 70
    );

    const paymentInfoStart = currentY;
    doc.setFont('helvetica', 'bold');
    doc.text('Payment summary', pageWidth - 220, paymentInfoStart);
    doc.setFont('helvetica', 'normal');
    if (options.paymentInfo?.method) {
      doc.text(`Method: ${options.paymentInfo.method}`, pageWidth - 220, paymentInfoStart + 14);
    }
    if (options.paymentInfo?.cardHolder) {
      doc.text(
        `Card holder: ${options.paymentInfo.cardHolder}`,
        pageWidth - 220,
        paymentInfoStart + 28
      );
    }
    if (options.paymentInfo?.lastDigits) {
      doc.text(
        `Ending in: **** ${options.paymentInfo.lastDigits}`,
        pageWidth - 220,
        paymentInfoStart + 42
      );
    }

    currentY += 96;
    doc.setFont('helvetica', 'bold');
    doc.text('Order summary', marginLeft, currentY);
    currentY += 12;

    currentY = this.drawTableHeader(doc, marginLeft, pageWidth, currentY + 10);
    doc.setFont('helvetica', 'normal');

    const maxBodyWidth = pageWidth - marginLeft * 2;
    const lineHeight = 14;

    options.items.forEach((item) => {
      const desc = this.composeItemDescription(item);
      const descLines = doc.splitTextToSize(desc, 250);
      const rowHeight = Math.max(lineHeight, descLines.length * lineHeight);

      if (currentY + rowHeight > pageHeight - 160) {
        doc.addPage();
        currentY = this.drawTableHeader(doc, marginLeft, pageWidth, 72);
      }

      doc.text(descLines, marginLeft, currentY);
      doc.text(String(item.quantity), marginLeft + 260, currentY);
      doc.text(this.formatCurrency(item.unitPrice), marginLeft + 340, currentY);
      const lineTotal = item.unitPrice * item.quantity;
      this.writeRightAligned(doc, this.formatCurrency(lineTotal), pageWidth - marginLeft, currentY);

      currentY += rowHeight + 6;
    });

    // Totals
    currentY += 4;
    doc.setDrawColor(220);
    doc.line(marginLeft, currentY, marginLeft + maxBodyWidth, currentY);
    currentY += 18;

    this.drawSummaryLine(doc, 'Subtotal', options.subtotal, pageWidth - marginLeft, currentY);
    currentY += 16;
    this.drawSummaryLine(doc, 'Shipping', options.shipping, pageWidth - marginLeft, currentY);
    currentY += 18;
    doc.setFont('helvetica', 'bold');
    this.drawSummaryLine(doc, 'Total', options.total, pageWidth - marginLeft, currentY);
    doc.setFont('helvetica', 'normal');
    currentY += 24;

    // Additional info
    if (options.spaceDimensions && this.hasAnyDimension(options.spaceDimensions)) {
      doc.setFont('helvetica', 'bold');
      doc.text('Provided dimensions', marginLeft, currentY);
      doc.setFont('helvetica', 'normal');
      const dims = this.describeDimensions(options.spaceDimensions);
      doc.text(dims, marginLeft, currentY + 14);
      currentY += 32;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Notes', marginLeft, currentY);
    doc.setFont('helvetica', 'normal');
    const notes =
      options.notes ||
      'Invoice generated automatically for your Moderni order. Please keep this document for your records.';
    const noteLines = doc.splitTextToSize(notes, maxBodyWidth);
    doc.text(noteLines, marginLeft, currentY + 14);

    const footerY = pageHeight - 60;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text('Thank you for your purchase. Moderni Studio Europe SL - moderni.com', marginLeft, footerY);
    doc.setTextColor(0);

    const filename = `Invoice-${orderId}.pdf`;
    doc.save(filename);
  }

  private formatCurrency(value: number): string {
    return this.currencyFormatter.format(value || 0);
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  private composeItemDescription(item: InvoiceItemLine): string {
    const extras: string[] = [];
    if (item.description) extras.push(item.description);
    if (item.color) extras.push(`Color: ${item.color}`);
    return extras.length > 0 ? `${item.name} - ${extras.join(' | ')}` : item.name;
  }

  private drawSummaryLine(doc: jsPDF, label: string, amount: number, rightX: number, y: number) {
    doc.setFontSize(10);
    doc.text(label, rightX - 200, y);
    this.writeRightAligned(doc, this.formatCurrency(amount), rightX, y);
  }

  private writeRightAligned(doc: jsPDF, text: string, rightX: number, y: number) {
    const width = doc.getTextWidth(text);
    doc.text(text, rightX - width, y);
  }

  private drawTableHeader(doc: jsPDF, marginLeft: number, pageWidth: number, headerY: number): number {
    doc.setFillColor(245, 245, 245);
    doc.rect(marginLeft - 5, headerY - 14, pageWidth - marginLeft * 2 + 10, 22, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Description', marginLeft, headerY);
    doc.text('Qty', marginLeft + 260, headerY);
    doc.text('Unit price', marginLeft + 340, headerY);
    doc.text('Amount', pageWidth - marginLeft - 60, headerY);
    doc.setFont('helvetica', 'normal');
    return headerY + 12;
  }

  private hasAnyDimension(dimensions: InvoiceSpaceDimensions): boolean {
    return Boolean(dimensions.width || dimensions.height || dimensions.depth);
  }

  private describeDimensions(dimensions: InvoiceSpaceDimensions): string {
    const segments: string[] = [];
    if (dimensions.width) segments.push(`Width: ${dimensions.width}`);
    if (dimensions.height) segments.push(`Height: ${dimensions.height}`);
    if (dimensions.depth) segments.push(`Depth: ${dimensions.depth}`);
    return segments.join(' | ') || 'Not provided';
  }
}
