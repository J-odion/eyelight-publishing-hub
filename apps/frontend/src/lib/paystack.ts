export interface PaystackCheckoutOptions {
  email: string;
  amount: number; // in NGN (naira)
  reference?: string;
  purpose?: string;
  customerName?: string;
  customerPhone?: string;
  metadata?: Record<string, any>;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
}

const PAYSTACK_PUBLIC_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
  'pk_live_a0c90c52474e3e800a338ed39a96327596661393';

// Load Paystack inline script if not already on window
function ensurePaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof (window as any).PaystackPop !== 'undefined') {
      return resolve();
    }

    const existingScript = document.querySelector('script[src*="paystack.co"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Paystack')));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack inline script'));
    document.head.appendChild(script);
  });
}

/**
 * Opens Paystack official inline checkout modal instantly in the browser.
 * Zero cold starts, no backend delays, supports Cards, Transfers, USSD & Apple Pay.
 */
export async function payWithPaystack(options: PaystackCheckoutOptions) {
  const {
    email,
    amount,
    reference,
    purpose = 'Payment to Eyelight Publishing',
    customerName,
    customerPhone,
    metadata = {},
    onSuccess,
    onClose,
  } = options;

  await ensurePaystackScript();

  const generatedRef =
    reference || `EYELIGHT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const handler = (window as any).PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email.trim(),
    amount: Math.round(amount * 100), // in kobo
    ref: generatedRef,
    metadata: {
      custom_fields: [
        { display_name: 'Customer Name', variable_name: 'customer_name', value: customerName || email },
        { display_name: 'Purpose', variable_name: 'purpose', value: purpose },
      ],
      customerName,
      customerPhone,
      purpose,
      ...metadata,
    },
    callback: function (response: { reference: string }) {
      onSuccess(response.reference || generatedRef);
    },
    onClose: function () {
      if (onClose) onClose();
    },
  });

  handler.openIframe();
}
