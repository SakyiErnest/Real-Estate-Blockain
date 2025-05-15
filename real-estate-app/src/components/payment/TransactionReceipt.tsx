'use client';

import { useRef } from 'react';
import { Transaction } from '../../lib/transactionService';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';

interface TransactionReceiptProps {
    transaction: Transaction;
    propertyTitle?: string;
    propertyAddress?: string;
}

export default function TransactionReceipt({
    transaction,
    propertyTitle,
    propertyAddress,
}: TransactionReceiptProps) {
    const receiptRef = useRef<HTMLDivElement>(null);

    // Format date from timestamp
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    // Format currency
    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: currency === 'BTC' || currency === 'ETH' ? 8 : 2,
        }).format(amount);
    };

    // Print receipt
    const handlePrint = () => {
        const receiptContent = receiptRef.current;

        if (!receiptContent) return;

        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            alert('Please allow popups for this website to print receipts.');
            return;
        }

        printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${transaction.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.5;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding-bottom: 20px;
              border-bottom: 1px solid #e2e8f0;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
            }
            .subtitle {
              font-size: 16px;
              color: #6b7280;
            }
            .section {
              margin-bottom: 20px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
            .label {
              font-weight: bold;
              color: #6b7280;
            }
            .value {
              text-align: right;
            }
            .mono {
              font-family: monospace;
              word-break: break-all;
            }
            .total {
              font-size: 18px;
              font-weight: bold;
              margin-top: 16px;
              padding-top: 16px;
              border-top: 1px solid #e2e8f0;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 14px;
              color: #6b7280;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${receiptContent.innerHTML}
          <div class="footer">
            <p>This is an electronic receipt generated on ${new Date().toLocaleString()}.</p>
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    // Download receipt as PDF (this is a simple approach - in a real app you'd use a proper PDF generator library)
    const handleDownload = () => {
        // For a real implementation, use a library like jsPDF to create a proper PDF
        // This is a simplified approach that just creates a text file
        const content = `
PAYMENT RECEIPT
Transaction ID: ${transaction.id}
Date: ${formatDate(transaction.timestamp)}

${propertyTitle ? `Property: ${propertyTitle}\n` : ''}
${propertyAddress ? `Address: ${propertyAddress}\n` : ''}

PAYMENT DETAILS
Amount: ${formatCurrency(transaction.amount, transaction.currency)}
Payment Method: ${transaction.paymentMethod}
Status: ${transaction.status}

TRANSACTION DETAILS
Hash: ${transaction.hash}
Sender: ${transaction.sender}
Recipient: ${transaction.recipient}

FEES
Processor Fee: ${formatCurrency(transaction.fees.processorFee, 'USD')}
Network Fee: ${formatCurrency(transaction.fees.networkFee, 'USD')}
Platform Fee: ${formatCurrency(transaction.fees.platformFee, 'USD')}
Total Fee: ${formatCurrency(transaction.fees.totalFee, 'USD')}

TOTAL AMOUNT: ${formatCurrency(transaction.amount + transaction.fees.totalFee, 'USD')}

This receipt was generated on ${new Date().toLocaleString()}.
Thank you for your business!
    `;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt-${transaction.id}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Payment Receipt
                </h3>
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PrinterIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                        Print
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                        Download
                    </button>
                </div>
            </div>

            <div className="border-t border-gray-200" ref={receiptRef}>
                <div className="header px-4 py-5 sm:px-6 text-center border-b border-gray-200">
                    <div className="title">Payment Receipt</div>
                    <div className="subtitle">Transaction ID: {transaction.id}</div>
                    <div className="subtitle">Date: {formatDate(transaction.timestamp)}</div>
                </div>

                {(propertyTitle || propertyAddress) && (
                    <div className="section px-4 py-5 sm:px-6">
                        <div className="section-title">Property Information</div>
                        {propertyTitle && (
                            <div className="row">
                                <div className="label">Property:</div>
                                <div className="value">{propertyTitle}</div>
                            </div>
                        )}
                        {propertyAddress && (
                            <div className="row">
                                <div className="label">Address:</div>
                                <div className="value">{propertyAddress}</div>
                            </div>
                        )}
                    </div>
                )}

                <div className="section px-4 py-5 sm:px-6">
                    <div className="section-title">Payment Details</div>
                    <div className="row">
                        <div className="label">Amount:</div>
                        <div className="value">{formatCurrency(transaction.amount, transaction.currency)}</div>
                    </div>
                    <div className="row">
                        <div className="label">Payment Method:</div>
                        <div className="value">{transaction.paymentMethod}</div>
                    </div>
                    <div className="row">
                        <div className="label">Status:</div>
                        <div className="value">{transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</div>
                    </div>
                    {transaction.confirmations !== undefined && transaction.confirmations > 0 && (
                        <div className="row">
                            <div className="label">Confirmations:</div>
                            <div className="value">{transaction.confirmations}</div>
                        </div>
                    )}
                </div>

                <div className="section px-4 py-5 sm:px-6">
                    <div className="section-title">Transaction Details</div>
                    <div className="row">
                        <div className="label">Hash:</div>
                        <div className="value mono">{transaction.hash}</div>
                    </div>
                    <div className="row">
                        <div className="label">Sender:</div>
                        <div className="value mono">{transaction.sender}</div>
                    </div>
                    <div className="row">
                        <div className="label">Recipient:</div>
                        <div className="value mono">{transaction.recipient}</div>
                    </div>
                </div>

                <div className="section px-4 py-5 sm:px-6">
                    <div className="section-title">Fee Breakdown</div>
                    <div className="row">
                        <div className="label">Processor Fee:</div>
                        <div className="value">{formatCurrency(transaction.fees.processorFee, 'USD')}</div>
                    </div>
                    <div className="row">
                        <div className="label">Network Fee:</div>
                        <div className="value">{formatCurrency(transaction.fees.networkFee, 'USD')}</div>
                    </div>
                    <div className="row">
                        <div className="label">Platform Fee:</div>
                        <div className="value">{formatCurrency(transaction.fees.platformFee, 'USD')}</div>
                    </div>
                    <div className="row">
                        <div className="label">Total Fee:</div>
                        <div className="value">{formatCurrency(transaction.fees.totalFee, 'USD')}</div>
                    </div>

                    <div className="total row">
                        <div className="label">TOTAL AMOUNT:</div>
                        <div className="value">{formatCurrency(transaction.amount + transaction.fees.totalFee, 'USD')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
} 