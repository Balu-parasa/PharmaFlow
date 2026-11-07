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
  User as UserIcon,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import { Medicine, Batch, CartItem, Sale } from '../types';

export const POS: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'UPI'>('CASH');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(5); // 5% GST default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSale, setSuccessSale] = useState<Sale | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch available medicines with active batches
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

  // Filter medicines by name, generic, SKU, barcode
  const filteredMedicines = medicines.filter((med) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      med.name.toLowerCase().includes(q) ||
      (med.genericName && med.genericName.toLowerCase().includes(q)) ||
      med.sku.toLowerCase().includes(q) ||
      (med.barcode && med.barcode.includes(q))
    );
  });

  // Add medicine to cart using FIFO batch selection (first expiring batch)
  const addToCart = (med: Medicine) => {
    setErrorMessage('');
    const availableBatches = (med.batches || []).filter(
      (b) => b.quantityInStock > 0 && !b.isRecalled && new Date(b.expiryDate) > new Date()
    );

    if (availableBatches.length === 0) {
      setErrorMessage(`No sellable non-expired stock available for ${med.name}`);
      return;
    }

    // Earliest expiring batch (FIFO)
    const targetBatch = availableBatches[0];

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

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);

  // Complete checkout & create sale
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
        fetchMedicines(); // Refresh stock counts
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to process transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-7rem)]">
      {/* Left Column: Product Catalog & Search (7 Cols) */}
      <div className="lg:col-span-7 flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Medicine Name, Generic, SKU, or Barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Catalog List */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5 content-start">
          {filteredMedicines.map((med) => {
            const hasStock = med.totalStock > 0;
            return (
              <div
                key={med.id}
                onClick={() => hasStock && addToCart(med)}
                className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  hasStock
                    ? 'border-slate-200 hover:border-brand-500 hover:shadow-md cursor-pointer bg-white'
                    : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm text-slate-800 leading-tight">
                      {med.name}
                    </h4>
                    <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {med.dosageForm}
                    </span>
                  </div>
                  {med.genericName && (
                    <p className="text-xs text-slate-500 italic mt-0.5 line-clamp-1">
                      {med.genericName}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Stock: </span>
                    <span
                      className={`text-xs font-bold ${
                        med.totalStock <= med.minStockThreshold ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    >
                      {med.totalStock} units
                    </span>
                  </div>
                  <div className="text-sm font-bold text-brand-700">
                    ₹{med.nextExpiringBatch?.sellingPrice?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Cart & Billing Terminal (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-brand-600" />
            <h3 className="font-bold text-slate-800 text-sm">Cart Items ({cart.length})</h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Pill className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs text-slate-400 mt-1">Click any available medicine to add</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.batchId}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 flex items-center justify-between"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <div className="font-semibold text-sm text-slate-800 truncate">
                    {item.medicineName}
                  </div>
                  <div className="text-xs text-slate-500">
                    Batch: <span className="font-mono">{item.batchNumber}</span> • ₹{item.unitPrice.toFixed(2)}/ea
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center border border-slate-300 rounded bg-white">
                    <button
                      onClick={() => updateQuantity(item.batchId, -1)}
                      className="p-1 text-slate-500 hover:bg-slate-100"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.batchId, 1)}
                      className="p-1 text-slate-500 hover:bg-slate-100"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="w-16 text-right font-bold text-sm text-slate-800">
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

        {/* Checkout Summary & Customer Details */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
          {/* Walk-in Customer Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Customer Name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Phone (for SMS invoice)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Payment Method Selector */}
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
                  className={`py-1.5 px-2 rounded border text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                    paymentMethod === pm.id
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{pm.label}</span>
                </button>
              );
            })}
          </div>

          {/* Subtotal Breakdown */}
          <div className="space-y-1 text-xs text-slate-600 pt-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                className="w-16 px-1.5 py-0.5 text-right bg-white border border-slate-300 rounded text-xs"
              />
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable:</span>
              <span className="text-brand-700">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting}
            className={`w-full py-3 rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
              cart.length === 0 || isSubmitting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/30'
            }`}
          >
            {isSubmitting ? (
              <span>Processing Transaction...</span>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Complete & Print Bill (₹{grandTotal.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sale Success Modal */}
      {successSale && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sale Completed Successfully!</h3>
            <p className="text-xs text-slate-500 mt-1">Invoice #{successSale.invoiceNumber}</p>

            <div className="my-4 p-3 bg-slate-50 rounded-lg text-left text-xs space-y-1 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-bold text-slate-800">₹{successSale.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment:</span>
                <span className="font-semibold text-slate-700">{successSale.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span>{successSale.customer?.name || 'Walk-in Customer'}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setSuccessSale(null)}
                className="flex-1 py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
              >
                New Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

