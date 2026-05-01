import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  IndianRupee, CreditCard, Building2, Wallet, CheckCircle,
  AlertCircle, ChevronRight, Download, ArrowLeft, Loader2,
  ShieldCheck, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Step 1: Select Violation
// Step 2: Select Payment Method & Enter Details
// Step 3: Processing (mock delay)
// Step 4: Success + Download Receipt

export default function Payment() {
  const [violations, setViolations] = useState([]);
  const [loadingViolations, setLoadingViolations] = useState(true);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [step, setStep] = useState(1); // 1=select, 2=details, 3=processing, 4=success
  const [paymentRecord, setPaymentRecord] = useState(null);

  // Form fields for mock payment details
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [bankName, setBankName] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchPendingViolations();
  }, []);

  const fetchPendingViolations = async () => {
    try {
      const { data } = await api.get('/violations');
      setViolations(data.filter((v) => v.status === 'Pending'));
    } catch (err) {
      console.error('Failed to fetch violations', err);
    } finally {
      setLoadingViolations(false);
    }
  };

  const paymentMethods = [
    { id: 'UPI', name: 'UPI', icon: Wallet, desc: 'Pay instantly via UPI ID' },
    { id: 'Card', name: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, Rupay' },
    { id: 'NetBanking', name: 'Net Banking', icon: Building2, desc: 'All major Indian banks' },
  ];

  const validateForm = () => {
    if (paymentMethod === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) return 'Enter a valid UPI ID (e.g. name@bank)';
    }
    if (paymentMethod === 'Card') {
      if (cardNumber.replace(/\s/g, '').length < 16) return 'Enter a valid 16-digit card number';
      if (!cardExpiry.match(/^\d{2}\/\d{2}$/)) return 'Enter expiry as MM/YY';
      if (cardCvv.length < 3) return 'Enter a valid 3-digit CVV';
    }
    if (paymentMethod === 'NetBanking') {
      if (!bankName) return 'Please select your bank';
    }
    return null;
  };

  const handleProceedToDetails = () => {
    if (!selectedViolation) return;
    setStep(2);
    setFormError('');
  };

  const handlePayment = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }

    setFormError('');
    setStep(3); // Show processing animation

    // Simulate processing delay (1.5s)
    await new Promise((res) => setTimeout(res, 1500));

    try {
      const { data } = await api.post('/payments', {
        violationId: selectedViolation._id,
        amount: selectedViolation.fineAmount,
        paymentMethod,
      });

      setPaymentRecord(data.payment);
      setStep(4);
      // Remove the paid violation from list
      setViolations((prev) => prev.filter((v) => v._id !== selectedViolation._id));
    } catch (error) {
      setFormError(error.response?.data?.message || 'Payment failed. Please try again.');
      setStep(2);
    }
  };

  const generateReceipt = () => {
    const doc = new jsPDF();

    // Blue header bar
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('TRAFFIC AUTHORITY', 105, 15, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Payment Receipt', 105, 25, { align: 'center' });

    // Receipt metadata
    const receiptId = `REC-${Date.now()}`;
    const payDate = new Date().toLocaleString('en-IN');

    doc.setTextColor(100);
    doc.setFontSize(9);
    doc.text(`Receipt ID: ${receiptId}`, 20, 48);
    doc.text(`Payment Date: ${payDate}`, 20, 55);

    // GREEN PAID STAMP
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('✔ PAID', 170, 52, { align: 'center' });

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 62, 190, 62);

    // Violation Details Table
    doc.setTextColor(50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Violation Details', 20, 72);

    doc.autoTable({
      startY: 76,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      body: [
        ['Vehicle Number', selectedViolation.vehicleNumber],
        ['Owner Name', selectedViolation.ownerName],
        ['Violation Type', selectedViolation.violationType],
        ['Location', selectedViolation.location],
        ['Violation Date', new Date(selectedViolation.createdAt).toLocaleDateString('en-IN')],
      ],
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
    });

    const y1 = doc.lastAutoTable.finalY + 10;

    // Payment Details Table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(50);
    doc.text('Payment Details', 20, y1);

    doc.autoTable({
      startY: y1 + 4,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      body: [
        ['Payment Method', paymentMethod],
        ['Amount Paid', `Rs. ${selectedViolation.fineAmount}`],
        ['Status', 'SUCCESS'],
      ],
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'italic');
    doc.text(
      'This is a computer-generated receipt. No physical signature required.',
      105, 285, { align: 'center' }
    );

    doc.save(`receipt_${selectedViolation.vehicleNumber}_${receiptId}.pdf`);
  };

  const resetPayment = () => {
    setSelectedViolation(null);
    setPaymentMethod('UPI');
    setStep(1);
    setUpiId('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setBankName('');
    setFormError('');
    setPaymentRecord(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pay Fines</h1>
        <p className="text-slate-500 dark:text-gray-400 mt-1">Settle your pending traffic violation fines</p>
      </div>

      {/* Step Indicator */}
      {step < 4 && (
        <div className="flex items-center gap-2 text-sm">
          {['Select Violation', 'Payment Details', 'Processing'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step > i + 1 ? 'bg-green-500 text-white' :
                step === i + 1 ? 'bg-blue-600 text-white' :
                'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>{step > i + 1 ? '✓' : i + 1}</div>
              <span className={`font-medium ${step === i + 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>{label}</span>
              {i < 2 && <ChevronRight className="w-4 h-4 text-gray-300" />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Select Violation ── */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-500" /> Select Pending Violation
            </h2>

            {loadingViolations ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : violations.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-10 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-60" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-300">All Clear!</h3>
                <p className="text-slate-400 dark:text-gray-500 mt-1">You have no pending fines.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {violations.map((v) => (
                  <div
                    key={v._id}
                    onClick={() => setSelectedViolation(v)}
                    className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 cursor-pointer transition-all ${
                      selectedViolation?._id === v._id
                        ? 'border-blue-500 shadow-lg shadow-blue-500/15 ring-2 ring-blue-500/20'
                        : 'border-slate-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-200 dark:border-gray-700">
                          {v.violationType}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white mt-2 text-xl">{v.vehicleNumber}</h3>
                        <p className="text-sm text-slate-500 dark:text-gray-400">{v.ownerName}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-end">
                          <IndianRupee className="w-5 h-5 text-gray-400 mr-0.5" />{v.fineAmount}
                        </span>
                        <span className="text-xs text-orange-500 font-medium">PENDING</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 dark:text-gray-500 pt-3 border-t border-slate-100 dark:border-gray-800">
                      <span>📍 {v.location}</span>
                      <span>{new Date(v.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedViolation && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleProceedToDetails}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-colors"
                >
                  Proceed to Payment <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: Payment Details ── */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-3 space-y-5">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                        paymentMethod === m.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'border-slate-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <m.icon className="w-6 h-6 mb-2" />
                      <span className="text-xs font-semibold text-center">{m.name}</span>
                    </button>
                  ))}
                </div>

                {/* UPI Form */}
                {paymentMethod === 'UPI' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-gray-300">UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    />
                    <p className="text-xs text-slate-400">e.g. vivanshetty@okicici</p>
                  </div>
                )}

                {/* Card Form */}
                {paymentMethod === 'Card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                          setCardNumber(raw.replace(/(.{4})/g, '$1 ').trim());
                        }}
                        className="w-full mt-1 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono tracking-widest"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          maxLength={5}
                          placeholder="08/27"
                          value={cardExpiry}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setCardExpiry(val.length > 2 ? val.slice(0, 2) + '/' + val.slice(2) : val);
                          }}
                          className="w-full mt-1 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-gray-300">CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          className="w-full mt-1 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Net Banking */}
                {paymentMethod === 'NetBanking' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 dark:text-gray-300">Select Bank</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <option value="">-- Select your bank --</option>
                      {['SBI', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank', 'Bank of Baroda'].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formError && (
                  <p className="mt-3 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {formError}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 sticky top-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between text-slate-600 dark:text-gray-400">
                    <span>Vehicle</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedViolation.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-gray-400">
                    <span>Type</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{selectedViolation.violationType}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-gray-400">
                    <span>Fine</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{selectedViolation.fineAmount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-gray-400">
                    <span>Convenience Fee</span>
                    <span className="text-green-600 dark:text-green-400 font-semibold">₹0</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white">
                    <span>Total</span>
                    <span>₹{selectedViolation.fineAmount}</span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Pay ₹{selectedViolation.fineAmount} Securely
                </button>

                <p className="text-center text-xs text-slate-400 dark:text-gray-500 mt-3 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 256-bit Encrypted Mock Gateway
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Processing ── */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 space-y-6"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 animate-spin"></div>
              <Lock className="w-7 h-7 text-blue-500 absolute inset-0 m-auto" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Processing Payment...</h3>
              <p className="text-slate-500 dark:text-gray-400 mt-1">Please wait. Do not close this window.</p>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Success ── */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center"
            >
              <CheckCircle className="w-14 h-14 text-green-500" />
            </motion.div>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Payment Successful!</h2>
              <p className="text-slate-500 dark:text-gray-400 mt-2">
                Your fine for <span className="font-semibold text-slate-800 dark:text-gray-200">{selectedViolation?.vehicleNumber}</span> has been cleared.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl p-6 w-full max-w-sm text-sm space-y-3">
              <div className="flex justify-between text-slate-500 dark:text-gray-400">
                <span>Amount Paid</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{selectedViolation?.fineAmount}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-gray-400">
                <span>Method</span>
                <span className="font-bold text-slate-900 dark:text-white">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-gray-400">
                <span>Status</span>
                <span className="font-bold text-green-500">PAID ✓</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-gray-400">
                <span>Date</span>
                <span className="font-bold text-slate-900 dark:text-white">{new Date().toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-4 flex-wrap justify-center">
              <button
                onClick={generateReceipt}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-colors"
              >
                <Download className="w-5 h-5" /> Download Receipt (PDF)
              </button>
              <button
                onClick={resetPayment}
                className="flex items-center gap-2 border border-slate-200 dark:border-gray-700 text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Pay Another Fine
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
