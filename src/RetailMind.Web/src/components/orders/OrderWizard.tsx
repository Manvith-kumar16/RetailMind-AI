import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, ShoppingCart, XCircle, Plus } from 'lucide-react';
import type { Order } from '../../pages/Orders';
import { cn } from '../../utils/cn';

// -- Zod Schemas for each Step --

const customerSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerEmail: z.string().email('Valid email is required'),
  shippingAddress: z.string().min(5, 'Full shipping address is required')
});

const itemsSchema = z.object({
  items: z.array(z.object({
    name: z.string().min(1, 'Product name required'),
    quantity: z.coerce.number().min(1, 'Qty must be at least 1'),
    price: z.coerce.number().min(0.01, 'Price must be greater than 0')
  })).min(1, 'Add at least one item')
});

type CustomerFormValues = z.infer<typeof customerSchema>;
type ItemsFormValues = z.infer<typeof itemsSchema>;

interface OrderWizardProps {
  onComplete: (data: Omit<Order, 'id' | 'date' | 'status'>) => void;
  onCancel: () => void;
}

export function OrderWizard({ onComplete, onCancel }: OrderWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orderState, setOrderState] = useState<Partial<Omit<Order, 'id' | 'date' | 'status'>>>({});

  // Form Handlers
  const customerForm = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as any,
    defaultValues: { customerName: '', customerEmail: '', shippingAddress: '' }
  });

  const itemsForm = useForm<ItemsFormValues>({
    resolver: zodResolver(itemsSchema) as any,
    defaultValues: { items: [{ name: '', quantity: 1, price: 0 }] }
  });

  const { fields, append, remove } = useFieldArray({
    control: itemsForm.control,
    name: "items"
  });

  // Step Navigators
  const onCustomerSubmit = (data: CustomerFormValues) => {
    setOrderState(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const onItemsSubmit = (data: ItemsFormValues) => {
    // Generate IDs for items and calculate total
    const parsedItems = data.items.map(item => ({ ...item, id: crypto.randomUUID() }));
    const total = parsedItems.reduce((acc, current) => acc + (current.price * current.quantity), 0);
    
    setOrderState(prev => ({ ...prev, items: parsedItems, totalAmount: total }));
    setStep(3);
  };

  const submitFinalOrder = () => {
    if (orderState.customerName && orderState.items) {
      onComplete(orderState as Omit<Order, 'id' | 'date' | 'status'>);
    }
  };

  return (
    <div className="mx-auto max-w-4xl animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Interactive Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-slate-200"></div>
          
          <div className="relative flex w-full justify-between">
            {/* Step 1 Node */}
            <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 py-1">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-colors",
                step >= 1 ? "border-primary-600 bg-primary-600 text-white" : "border-slate-300 bg-white text-slate-400"
              )}>1</div>
              <span className={cn("text-xs font-semibold", step >= 1 ? "text-primary-700" : "text-slate-500")}>Customer Details</span>
            </div>
            
            {/* Step 2 Node */}
            <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 py-1">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-colors",
                step >= 2 ? "border-primary-600 bg-primary-600 text-white" : "border-slate-300 bg-white text-slate-400"
              )}>2</div>
              <span className={cn("text-xs font-semibold", step >= 2 ? "text-primary-700" : "text-slate-500")}>Line Items</span>
            </div>
            
            {/* Step 3 Node */}
            <div className="flex flex-col items-center gap-2 bg-slate-50 px-2 py-1">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold transition-colors",
                step >= 3 ? "border-primary-600 bg-primary-600 text-white" : "border-slate-300 bg-white text-slate-400"
              )}>3</div>
              <span className={cn("text-xs font-semibold", step >= 3 ? "text-primary-700" : "text-slate-500")}>Review & Submit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forms Container */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 p-6 sm:p-10">
        
        {/* --- STEP 1 --- */}
        {step === 1 && (
          <form onSubmit={customerForm.handleSubmit(onCustomerSubmit as any)} className="animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Customer & Shipping Information</h2>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Company / Customer Name</label>
                <input
                  type="text"
                  className={cn(
                    "block w-full rounded-xl border bg-surface-50 p-3 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                    customerForm.formState.errors.customerName ? "border-red-300 focus:border-red-500" : "border-slate-200"
                  )}
                  placeholder="Acme Corp"
                  {...customerForm.register('customerName')}
                />
                {customerForm.formState.errors.customerName && <p className="text-xs font-medium text-red-500 ml-1 mt-1">{customerForm.formState.errors.customerName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Billing Email</label>
                <input
                  type="email"
                  className={cn(
                    "block w-full rounded-xl border bg-surface-50 p-3 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                    customerForm.formState.errors.customerEmail ? "border-red-300 focus:border-red-500" : "border-slate-200"
                  )}
                  placeholder="billing@acmecorp.com"
                  {...customerForm.register('customerEmail')}
                />
                {customerForm.formState.errors.customerEmail && <p className="text-xs font-medium text-red-500 ml-1 mt-1">{customerForm.formState.errors.customerEmail.message}</p>}
              </div>

              <div className="col-span-full space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Full Shipping Address</label>
                <input
                  type="text"
                  className={cn(
                    "block w-full rounded-xl border bg-surface-50 p-3 text-sm transition-all focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                    customerForm.formState.errors.shippingAddress ? "border-red-300 focus:border-red-500" : "border-slate-200"
                  )}
                  placeholder="123 Warehousing Blvd, Dock 4, Austin TX 78701"
                  {...customerForm.register('shippingAddress')}
                />
                {customerForm.formState.errors.shippingAddress && <p className="text-xs font-medium text-red-500 ml-1 mt-1">{customerForm.formState.errors.shippingAddress.message}</p>}
              </div>
            </div>

            <div className="mt-10 flex items-center justify-between">
              <button type="button" onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">Cancel Order</button>
              <button type="submit" className="group flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-600/20 active:bg-primary-800 shadow-md shadow-primary-600/20">
                Next Step
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        )}

        {/* --- STEP 2 --- */}
        {step === 2 && (
          <form onSubmit={itemsForm.handleSubmit(onItemsSubmit as any)} className="animate-in fade-in zoom-in-95 duration-300">
             <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Line Items Selection</h2>
             
             {itemsForm.formState.errors.items?.root && (
               <div className="mb-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                 <AlertCircle className="h-4 w-4" />
                 {itemsForm.formState.errors.items.root.message}
               </div>
             )}

             <div className="space-y-4">
               {fields.map((field, index) => (
                 <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 relative group hover:border-primary-300 transition-colors">
                   
                   <div className="w-full sm:flex-1 space-y-1">
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</label>
                     <input
                       type="text"
                       placeholder="Enter product..."
                       className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                       {...itemsForm.register(`items.${index}.name`)}
                     />
                     {itemsForm.formState.errors.items?.[index]?.name && (
                       <p className="text-xs text-red-500 mt-1">{itemsForm.formState.errors.items[index]?.name?.message}</p>
                     )}
                   </div>

                   <div className="w-full sm:w-28 space-y-1">
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</label>
                     <input
                       type="number"
                       className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                       {...itemsForm.register(`items.${index}.quantity`)}
                     />
                   </div>

                   <div className="w-full sm:w-32 space-y-1">
                     <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Price</label>
                     <input
                       type="number"
                       step="0.01"
                       className="block w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/10"
                       {...itemsForm.register(`items.${index}.price`)}
                     />
                   </div>

                   <div className="pt-5 flex items-center h-full">
                     <button
                        type="button"
                        onClick={() => remove(index)}
                        className="rounded-lg p-2.5 text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors focus:ring-2 focus:ring-red-200"
                        title="Remove Item"
                     >
                       <XCircle className="h-5 w-5" />
                     </button>
                   </div>
                 </div>
               ))}
               
               <button
                 type="button"
                 onClick={() => append({ name: '', quantity: 1, price: 0 })}
                 className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-4 text-sm font-semibold text-slate-500 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50/50 transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/10"
               >
                 <Plus className="h-4 w-4" />
                 Add Another Item
               </button>
             </div>

             <div className="mt-10 flex items-center justify-between">
              <button type="button" onClick={() => setStep(1)} className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Customer
              </button>
              <button type="submit" className="group flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-600/20 active:bg-primary-800 shadow-md shadow-primary-600/20">
                Review Order
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        )}

        {/* --- STEP 3 --- */}
        {step === 3 && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
             <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Final Review</h2>
                <p className="text-sm text-slate-500">Please verify the order details below before authorization.</p>
              </div>
             </div>

             <div className="grid gap-8 md:grid-cols-2">
               {/* Customer Details Summary */}
               <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                 <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-200 pb-2">Shipping Information</h3>
                 <dl className="space-y-3">
                   <div>
                     <dt className="text-xs font-medium text-slate-500">Customer Name</dt>
                     <dd className="text-sm font-semibold text-slate-900">{orderState.customerName}</dd>
                   </div>
                   <div>
                     <dt className="text-xs font-medium text-slate-500">Contact Email</dt>
                     <dd className="text-sm font-medium text-slate-900">{orderState.customerEmail}</dd>
                   </div>
                   <div>
                     <dt className="text-xs font-medium text-slate-500">Destination</dt>
                     <dd className="text-sm font-medium text-slate-900">{orderState.shippingAddress}</dd>
                   </div>
                 </dl>
               </div>

               {/* Line Items Summary */}
               <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                 <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-100 pb-2">Order Manifest</h3>
                 <ul className="divide-y divide-slate-100 mb-4 max-h-48 overflow-y-auto pr-2">
                   {orderState.items?.map((item, id) => (
                     <li key={id} className="flex py-2 text-sm justify-between">
                       <span className="font-medium text-slate-700">{item.name} <span className="text-slate-400 font-normal">x{item.quantity}</span></span>
                       <span className="font-semibold text-slate-900">${(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                     </li>
                   ))}
                 </ul>
                 
                 <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                   <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Subtotal</span>
                   <span className="text-xl font-bold text-primary-600">${Number(orderState.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                 </div>
               </div>
             </div>

             <div className="mt-10 flex items-center justify-between">
              <button type="button" onClick={() => setStep(2)} className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Edit Items
              </button>
              <button onClick={submitFinalOrder} className="group flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold tracking-wide text-white transition-all hover:bg-emerald-700 focus:outline-none border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 shadow-md shadow-emerald-600/30">
                <CheckCircle2 className="h-5 w-5" />
                Authorize & Place Order
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
