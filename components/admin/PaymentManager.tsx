'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle, Clock, Ban, FileText, Edit, Save, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

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

export default function PaymentManager({ applicationId }: { applicationId: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [status, setStatus] = useState<PaymentStatus>('not_updated');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [accountDetails, setAccountDetails] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (applicationId) {
      fetchPayments();
    }
  }, [applicationId]);

  useEffect(() => {
    if (selectedPayment) {
      setStatus(selectedPayment.status);
      setAmount(selectedPayment.amount.toString());
      setCurrency(selectedPayment.currency || 'USD');
      setAccountDetails(selectedPayment.account_details || '');
      setNotes(selectedPayment.notes || '');
    }
  }, [selectedPayment]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payments?applicationId=${applicationId}`, {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const data = await response.json();

      if (data.success && data.payments) {
        setPayments(data.payments.map((p: any) => ({
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
        credentials: 'include'
      });

      if (!response.ok) {
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
    setIsEditing(false);
    setDialogOpen(true);
  };

  const handleUpdatePayment = async () => {
    if (!selectedPayment) return;

    try {
      setUpdatingPayment(true);

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          status,
          amount,
          currency,
          accountDetails,
          notes
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Payment updated successfully');

        // Update the selected payment
        const updatedPayment = {
          ...selectedPayment,
          status,
          amount,
          currency,
          account_details: accountDetails,
          notes,
        };

        setSelectedPayment(updatedPayment);
        setIsEditing(false);

        // Refresh payments list
        await fetchPayments();
      } else {
        toast.error(data.error || 'Failed to update payment');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment');
    } finally {
      setUpdatingPayment(false);
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
        <h2 className="text-lg font-semibold mb-4">Payment Management</h2>
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
      <h2 className="text-lg font-semibold mb-4">Payment Management</h2>

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
              <div className="flex items-center gap-2">
                <PaymentStatusBadge status={payment.status} />
                <Edit className="w-4 h-4 text-gray-500" />
              </div>
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
            <DialogTitle className="flex justify-between items-center">
              <span>{selectedPayment && paymentTypeLabels[selectedPayment.payment_type]}</span>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update payment details' : 'View payment details and receipts'}
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && !isEditing && (
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

          {selectedPayment && isEditing && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select value={status} onValueChange={(value) => setStatus(value as PaymentStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_updated">Not Updated</SelectItem>
                    <SelectItem value="not_applicable">Not Applicable</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status !== 'not_applicable' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Amount</label>
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Currency</label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                          <SelectItem value="AUD">AUD</SelectItem>
                          <SelectItem value="NGN">NGN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Account Details</label>
                    <Textarea
                      value={accountDetails}
                      onChange={(e) => setAccountDetails(e.target.value)}
                      placeholder="Enter payment account details (bank account, payment link, etc.)"
                      rows={4}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes for the student"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={updatingPayment}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePayment}
                  disabled={updatingPayment}
                  className="flex items-center gap-1"
                >
                  {updatingPayment ? 'Saving...' : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
