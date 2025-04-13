'use client';

import { useState, useEffect } from 'react';
import { Upload, Check, AlertCircle, Clock, Ban, FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type PaymentStatus = 'not_applicable' | 'pending' | 'paid' | 'not_updated';
type PaymentType = 'application_fee' | 'admission_fee' | 'visa_fee' | 'other';

interface Payment {
  id: string;
  payment_type: PaymentType;
  status: PaymentStatus;
  amount: string | number;
  currency: string;
  account_details?: string;
  notes?: string;
}

interface Receipt {
  id: string;
  payment_id: string;
  blob_url: string;
  name: string;
  mime_type: string;
  created_at: string;
}

const paymentTypeLabels: Record<PaymentType, string> = {
  application_fee: 'Application Fee',
  admission_fee: 'Admission/School Fee',
  visa_fee: 'Visa Fee',
  other: 'Other Fees',
};

const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
  switch (status) {
    case 'paid':
      return (
        <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
          <Check className="w-3 h-3" />
          Paid
        </span>
      );
    case 'pending':
      return (
        <span className="flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full text-xs font-medium">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
    case 'not_applicable':
      return (
        <span className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
          <Ban className="w-3 h-3" />
          Not Applicable
        </span>
      );
    default:
      return (
        <span className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          Not Updated
        </span>
      );
  }
};

export default function PaymentStatus({ applicationId }: { applicationId: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (applicationId) {
      fetchPayments();
    }
  }, [applicationId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payments?applicationId=${applicationId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please sign in to view payment information');
          return;
        }
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();

      if (data.success && data.payments) {
        setPayments(data.payments.map((p: Payment) => ({
          ...p,
          amount: typeof p.amount === 'number' ? p.amount.toString() : p.amount
        })));
      } else {
        // Handle case where payments array might be empty
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const fetchReceipts = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payments/receipts?paymentId=${paymentId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please sign in to view receipts');
          return;
        }
        throw new Error('Failed to fetch receipts');
      }

      const data = await response.json();

      if (data.success && data.receipts) {
        setReceipts(data.receipts);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      toast.error('Failed to load receipts');
      setReceipts([]);
    }
  };

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment);
    fetchReceipts(payment.id);
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadReceipt = async () => {
    if (!selectedPayment || !selectedFile) return;

    try {
      setUploadingReceipt(true);

      const formData = new FormData();
      formData.append('paymentId', selectedPayment.id);
      formData.append('file', selectedFile);

      const response = await fetch('/api/payments/receipts', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData
          // It will be set automatically with the correct boundary
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Please sign in to upload receipts');
          return;
        }
        throw new Error('Failed to upload receipt');
      }

      const data = await response.json();

      if (data.success) {
        toast.success('Receipt uploaded successfully');
        setSelectedFile(null);

        // Refresh receipts list
        await fetchReceipts(selectedPayment.id);

        // Refresh payments to get updated status
        await fetchPayments();
      } else {
        toast.error(data.error || 'Failed to upload receipt');
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      toast.error('Failed to upload receipt');
    } finally {
      setUploadingReceipt(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">Payment Status</h2>
        <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
          <p>{error}</p>
          <p className="mt-2 text-sm">Please try again later or contact support.</p>
          <Button
            onClick={fetchPayments}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-semibold mb-4">Payment Status</h2>

      {payments.length === 0 ? (
        <p className="text-gray-500">No payment information available.</p>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
              onClick={() => handlePaymentClick(payment)}
            >
              <div>
                <h3 className="font-medium">{paymentTypeLabels[payment.payment_type]}</h3>
                {payment.amount && payment.currency && payment.status !== 'not_applicable' && (
                  <p className="text-sm text-gray-600">
                    {payment.currency} {payment.amount}
                  </p>
                )}
              </div>
              <PaymentStatusBadge status={payment.status} />
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPayment && paymentTypeLabels[selectedPayment.payment_type]}
            </DialogTitle>
            <DialogDescription>
              View payment details and upload receipts
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <PaymentStatusBadge status={selectedPayment.status} />
              </div>

              {selectedPayment.amount && selectedPayment.currency && selectedPayment.status !== 'not_applicable' && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Amount:</span>
                  <span>{selectedPayment.currency} {selectedPayment.amount}</span>
                </div>
              )}

              {selectedPayment.account_details && selectedPayment.status !== 'not_applicable' && (
                <div className="border rounded-md p-3 bg-gray-50">
                  <h4 className="font-medium mb-2">Payment Account Details:</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedPayment.account_details}</p>
                </div>
              )}

              {selectedPayment.notes && (
                <div className="border rounded-md p-3 bg-gray-50">
                  <h4 className="font-medium mb-2">Notes:</h4>
                  <p className="text-sm whitespace-pre-wrap">{selectedPayment.notes}</p>
                </div>
              )}

              {selectedPayment.status !== 'not_applicable' && selectedPayment.status !== 'paid' && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Upload Payment Receipt</h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      id="receipt-upload"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="px-3 py-1 border rounded-md hover:bg-gray-50 cursor-pointer flex items-center gap-1 text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      {selectedFile ? selectedFile.name : 'Select File'}
                    </label>
                    <Button
                      size="sm"
                      onClick={handleUploadReceipt}
                      disabled={!selectedFile || uploadingReceipt}
                    >
                      {uploadingReceipt ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                </div>
              )}

              {receipts.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium mb-2">Uploaded Receipts</h4>
                  <div className="space-y-2">
                    {receipts.map((receipt) => (
                      <div key={receipt.id} className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm truncate">{receipt.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={receipt.blob_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="View Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <a
                            href={receipt.blob_url}
                            download={receipt.name}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Download Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
