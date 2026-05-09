import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, CheckCircle2, Smartphone, QrCode, User, Timer, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UPIMethodModal = ({ isOpen, onClose, amount, orderId, onPaymentSuccess }) => {
  const [activeTab, setActiveTab] = useState('qr');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [vpa, setVpa] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txnId, setTxnId] = useState('');

  const upiId = "your-vpa@upi"; // IMPORTANT: Change this to your actual UPI ID (e.g. name@okaxis)
  const upiLink = `upi://pay?pa=${upiId}&pn=HouseHunt&am=${amount}&cu=INR&tn=Order_${orderId}`;

  useEffect(() => {
    if (!isOpen || isSuccess) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isSuccess]);

  const handlePaymentComplete = (id) => {
    setTxnId(id);
    setIsSuccess(true);
    setTimeout(() => {
      onPaymentSuccess(id);
      setIsSuccess(false);
    }, 3000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyVPA = async () => {
    if (!vpa.includes('@')) return;
    setVerifying(true);
    // Mock API call
    await new Promise(r => setTimeout(r, 1500));
    setVerifying(false);
    setVerified(true);
  };

  // Simulate payment detection (e.g. for QR code)
  useEffect(() => {
    if (isOpen && activeTab === 'qr' && !isSuccess) {
      const timeout = setTimeout(() => {
        // In a real app, you'd poll the backend. 
        // For demo, we'll simulate a successful scan after 8 seconds
        // handlePaymentComplete(`txn_${Date.now()}`);
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, activeTab, isSuccess]);

  const apps = [
    { name: 'Google Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg', color: '#4285F4' },
    { name: 'PhonePe', icon: 'https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png', color: '#5f259f' },
    { name: 'Paytm', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg', color: '#00baf2' },
    { name: 'BHIM', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/BHIM_Logo.png', color: '#e57e2c' },
    { name: 'CRED', icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/CRED_Logo.png/220px-CRED_Logo.png', color: '#000000' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <CheckCircle2 size={48} className="animate-bounce" />
              </div>
              <h3 className="text-3xl font-serif font-black text-primary mb-2">Payment Successful</h3>
              <p className="text-primary/50 text-sm mb-8 font-medium">Transaction has been confirmed</p>
              
              <div className="w-full p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-primary/30 uppercase tracking-widest">Transaction ID</span>
                  <span className="font-mono font-bold text-primary">{txnId}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-primary/30 uppercase tracking-widest">Amount Paid</span>
                  <span className="font-bold text-accent text-lg">₹{amount}</span>
                </div>
              </div>
              
              <p className="mt-8 text-[10px] font-black text-primary/20 uppercase tracking-[0.2em] animate-pulse">Redirecting you back...</p>
            </motion.div>
          ) : (
            <div key="payment-flow">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-accent/5">
                <div>
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                    UPI Payment <span className="text-xs font-normal text-primary/50 bg-white px-2 py-1 rounded-full border border-primary/10">Order: #{orderId}</span>
                  </h3>
                  <p className="text-sm text-primary/60 mt-1 font-medium">Pay ₹{amount.toLocaleString()}</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex p-2 bg-gray-50 m-4 rounded-2xl">
                {[
                  { id: 'qr', label: 'QR Code', icon: QrCode },
                  { id: 'apps', label: 'UPI Apps', icon: Smartphone },
                  { id: 'id', label: 'UPI ID', icon: User }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      activeTab === tab.id 
                        ? 'bg-white text-accent shadow-sm' 
                        : 'text-primary/40 hover:text-primary/60'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'qr' && (
                    <motion.div 
                      key="qr"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex flex-col items-center"
                    >
                      <div className="p-6 bg-white rounded-[2rem] shadow-xl border-4 border-accent/10 mb-6">
                        <QRCodeSVG value={upiLink} size={180} level="H" includeMargin={true} />
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 w-full mb-6">
                        <div className="flex-1 font-mono text-sm text-primary font-bold px-2">{upiId}</div>
                        <button 
                          onClick={handleCopy}
                          className="p-2 bg-white rounded-xl shadow-sm text-accent hover:text-accent/70 transition-colors"
                        >
                          {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 text-primary/40 text-xs font-bold uppercase tracking-widest">
                        <Timer size={14} className="text-accent" />
                        QR expires in <span className="text-accent">{formatTime(timeLeft)}</span>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'apps' && (
                    <motion.div 
                      key="apps"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <p className="text-center text-primary/40 text-sm mb-6">Select an app to pay</p>
                      <div className="grid grid-cols-2 gap-4">
                        {apps.map((app) => (
                          <button 
                            key={app.name}
                            onClick={() => {
                              window.location.href = upiLink;
                              // In a real app, you'd wait for a return to foreground then check status
                              // For demo, we'll simulate success
                              setTimeout(() => handlePaymentComplete(`txn_${Date.now()}`), 2000);
                            }}
                            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-accent hover:shadow-lg hover:shadow-accent/5 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-50 bg-white flex items-center justify-center p-1.5">
                              <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
                            </div>
                            <span className="font-bold text-sm text-primary group-hover:text-accent transition-colors">{app.name}</span>
                          </button>
                        ))}
                      </div>
                      <div className="mt-8 p-4 bg-accent/5 rounded-2xl border border-accent/10 flex items-center gap-3">
                         <Smartphone className="text-accent" size={20} />
                         <p className="text-[10px] text-primary/60 leading-relaxed font-medium">
                           Deep linking will open the selected app on your mobile device. If you are on a desktop, please use the QR code.
                         </p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'id' && (
                    <motion.div 
                      key="id"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mb-3">Enter UPI ID (VPA)</label>
                        <div className="relative">
                          <input 
                            type="text"
                            placeholder="e.g. user@okaxis"
                            value={vpa}
                            onChange={(e) => { setVpa(e.target.value); setVerified(false); }}
                            className="w-full p-5 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-accent focus:bg-white outline-none transition-all font-bold text-primary placeholder:text-primary/20"
                          />
                          {verified && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 flex items-center gap-1 text-[10px] font-black uppercase">
                              <CheckCircle2 size={16} /> Verified
                            </div>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={verified ? () => handlePaymentComplete(`txn_${Date.now()}`) : verifyVPA}
                        disabled={verifying || !vpa.includes('@')}
                        className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
                          verified 
                          ? 'bg-green-500 text-white shadow-green-100 hover:bg-green-600' 
                          : 'bg-accent text-white shadow-accent/20 hover:bg-accent/90 disabled:opacity-50'
                        }`}
                      >
                        {verifying ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : verified ? (
                          <>Proceed to Pay <ArrowRight size={20} /></>
                        ) : (
                          'Verify UPI ID'
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-4">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-4 opacity-40 grayscale" />
                 <div className="h-4 w-[1px] bg-gray-200" />
                 <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">Secure encrypted payment</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default UPIMethodModal;
