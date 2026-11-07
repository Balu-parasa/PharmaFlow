import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle, 
  Receipt, 
  CreditCard, 
  Banknote, 
  Smartphone,
  Pill,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import api from '../services/api';
import { Medicine, CartItem, Sale } from '../types';

export const POS: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxPercent] = useState<number>(5); // 5% GST
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSale, setSuccessSale] = useState<Sale | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      if (res.data.success) {
        setMedicines(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const categories = ['ALL', 'Antibiotics', 'Analgesics & Antipyretics', 'Antihistamines', 'Gastrointestinal', 'Cardiovascular', 'Respiratory'];

  const filteredMedicines = medicines.filter((med) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      med.name.toLowerCase().includes(q) ||
      (med.genericName && med.genericName.toLowerCase().includes(q)) ||
      med.sku.toLowerCase().includes(q) ||
      (med.barcode && med.barcode.includes(q));
    const matchesCat = selectedCategory === 'ALL' || med.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Add medicine to cart under strict FEFO (earliest expiring active batch)
  const addToCart = (med: Medicine) => {
    setErrorMessage('');
    const availableBatches = (med.batches || []).filter(
      (b) => b.quantityInStock > 0 && !b.isRecalled && new Date(b.expiryDate) > new Date()
    );

    if (availableBatches.length === 0) {
      setErrorMessage(`No sellable non-expired stock available for ${med.name}`);
      return;
    }

    const targetBatch = availableBatches[0]; // FEFO batch

    const existingIndex = cart.findIndex((item) => item.batchId === targetBatch.id);
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty + 1 > targetBatch.quantityInStock) {
        setErrorMessage(`Only ${targetBatch.quantityInStock} units available in Batch ${targetBatch.batchNumber}`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          batchId: targetBatch.id,
          medicineId: med.id,
          medicineName: med.name,
          genericName: med.genericName,
          dosageForm: med.dosageForm,
          strength: med.strength,
          batchNumber: targetBatch.batchNumber,
          expiryDate: targetBatch.expiryDate,
          unitPrice: targetBatch.sellingPrice,
          quantity: 1,
          maxAvailable: targetBatch.quantityInStock,
          discount: 0
        }
      ]);
    }
  };

  const updateQuantity = (batchId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.batchId === batchId) {
            const newQty = item.quantity + delta;
            if (newQty > item.maxAvailable) {
              setErrorMessage(`Max available for batch ${item.batchNumber} is ${item.maxAvailable}`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (batchId: string) => {
    setCart(cart.filter((item) => item.batchId !== batchId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMessage('Cart is empty.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        items: cart.map((item) => ({
          batchId: item.batchId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount
        })),
        paymentMethod,
        discountAmount: Number(discountAmount),
        taxAmount
      };

      const res = await api.post('/sales', payload);
      if (res.data.success) {
        setSuccessSale(res.data.data);
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setDiscountAmount(0);
        fetchMedicines();
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to process transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6.5rem)]">
      
      {/* ========================================================= */}
      {/* LEFT COLUMN: MEDICINE CATALOGUE & QUICK-SEARCH (7 COLS) */}
      {/* ========================================================= */}
      <div className="lg:col-span-7 flex flex-col bg-white rounded-3xl border border-slate-200/70 shadow-card overflow-hidden">
        
        {/* Search & Category Pills */}
        <div className="p-5 border-b border-slate-100 bg-white space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Scan Barcode or Search by Medicine, Generic, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slatebg border border-slate-200/80 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === c
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slatebg text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Medicines Grid View */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          {filteredMedicines.map((med) => {
            const hasStock = med.totalStock > 0;
            return (
              <div
                key={med.id}
                onClick={() => hasStock && addToCart(med)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                  hasStock
                    ? 'border-slate-200/80 hover:border-primary hover:shadow-card-hover cursor-pointer bg-white'
                    : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="font-extrabold text-sm text-slate-900 group-hover:text-primary transition-colors">
                      {med.name}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                      {med.dosageForm}
                    </span>
                  </div>
                  {med.genericName && (
                    <p className="text-xs text-slate-400 italic mt-0.5 truncate">
                      {med.genericName}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Shelf: </span>
                    <span
                      className={`text-xs font-black ${
                        med.totalStock <= med.minStockThreshold ? 'text-amber-600' : 'text-slate-800'
                      }`}
                    >
                      {med.totalStock} units
                    </span>
                  </div>
                  <div className="text-base font-black text-primary">
                    ₹{med.nextExpiringBatch?.sellingPrice?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT COLUMN: ACTIVE BILLING CART & TERMINAL (5 COLS) */}
      {/* ========================================================= */}
      <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl border border-slate-200/70 shadow-card overflow-hidden">
        
        {/* Cart Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Current Cart</h3>
              <p className="text-[11px] text-slate-400 font-medium">{cart.length} items added</p>
            </div>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-2">
              <Pill className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No items in cart</p>
              <p className="text-xs max-w-xs text-slate-400">
                Click any medicine from the left catalogue. Earliest-expiring batches are automatically prioritized via FEFO.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.batchId}
                className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-center justify-between shadow-sm"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="font-extrabold text-sm text-slate-900 truncate">
                    {item.medicineName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Batch: <span className="font-mono font-bold text-slate-700">{item.batchNumber}</span> • ₹{item.unitPrice.toFixed(2)}/ea
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm">
                    <button
                      onClick={() => updateQuantity(item.batchId, -1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-l-xl"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-black text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.batchId, 1)}
                      className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-r-xl"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-20 text-right font-black text-sm text-slate-900">
                    ₹{(item.quantity * item.unitPrice).toFixed(2)}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.batchId)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Customer Info & Checkout Tray */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/60 space-y-3.5">
          {/* Customer Inputs */}
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="Customer Name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
            />
            <input
              type="text"
              placeholder="Phone Number (SMS Invoice)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-primary font-medium"
            />
          </div>

          {/* Payment Method Switcher */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'CASH', label: 'Cash', icon: Banknote },
              { id: 'CARD', label: 'Card', icon: CreditCard },
              { id: 'UPI', label: 'UPI / QR', icon: Smartphone }
            ].map((pm) => {
              const Icon = pm.icon;
              return (
                <button
                  key={pm.id}
                  onClick={() => setPaymentMethod(pm.id as any)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    paymentMethod === pm.id
                      ? 'border-primary bg-primary text-white shadow-md shadow-primary/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{pm.label}</span>
                </button>
              );
            })}
          </div>

          {/* Financial Breakdown */}
          <div className="space-y-1.5 text-xs text-slate-500 font-semibold pt-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-slate-800 font-bold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5% Tax):</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Special Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-20 px-2 py-0.5 text-right bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
              />
            </div>
            <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable:</span>
              <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting}
            className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
              cart.length === 0 || isSubmitting
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-primary hover:bg-primary-hover text-white shadow-[0_10px_25px_rgba(59,104,233,0.35)]'
            }`}
          >
            {isSubmitting ? (
              <span>Executing FEFO Sale...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Confirm & Print Bill (₹{grandTotal.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sale Invoice Modal on Success */}
      {successSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-modal max-w-md w-full p-6 text-center animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Sale Successfully Completed!</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">Invoice #{successSale.invoiceNumber}</p>

            <div className="my-5 p-4 bg-slate-50 rounded-2xl text-left text-xs space-y-1.5 border border-slate-200/80">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Total Amount:</span>
                <span className="font-black text-slate-900">₹{successSale.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Payment Method:</span>
                <span className="font-bold text-slate-700">{successSale.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Customer:</span>
                <span className="font-bold text-slate-700">{successSale.customer?.name || 'Walk-in'}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setSuccessSale(null)}
                className="flex-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20"
              >
                Next Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
