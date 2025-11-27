import { CreditCard } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface PaymentMethod {
  id: string;
  type: 'card' | 'googlepay' | 'applepay' | 'paypal';
  last4?: string;
  brand?: string;
  email?: string;
  isDefault?: boolean;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (methodId: string) => void;
  onAddNew?: () => void;
  showAddNew?: boolean;
}

const defaultPaymentMethods: PaymentMethod[] = [
  { id: 'card-1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true },
  { id: 'card-2', type: 'card', last4: '5555', brand: 'Mastercard', isDefault: false },
  { id: 'googlepay-1', type: 'googlepay', isDefault: false },
  { id: 'applepay-1', type: 'applepay', isDefault: false },
  { id: 'paypal-1', type: 'paypal', email: 'user@email.com', isDefault: false },
];

export function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
  onAddNew,
  showAddNew = true,
}: PaymentMethodSelectorProps) {
  const getMethodIcon = (method: PaymentMethod) => {
    switch (method.type) {
      case 'googlepay':
        return '🟢';
      case 'applepay':
        return '🍎';
      case 'paypal':
        return '💙';
      case 'card':
      default:
        return '💳';
    }
  };

  const getMethodLabel = (method: PaymentMethod) => {
    switch (method.type) {
      case 'googlepay':
        return 'Google Pay';
      case 'applepay':
        return 'Apple Pay';
      case 'paypal':
        return `PayPal (${method.email})`;
      case 'card':
      default:
        return `•••• ${method.last4} (${method.brand})`;
    }
  };

  return (
    <div>
      <h4 className="text-[#F1F5F9] mb-3">Payment method:</h4>
      <RadioGroup value={selectedMethod} onValueChange={onMethodChange}>
        <div className="space-y-2">
          {defaultPaymentMethods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                selectedMethod === method.id
                  ? 'border-[#00F0D9] bg-[#00F0D9]/5'
                  : 'border-[#334155] bg-[#1E293B]'
              }`}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value={method.id} id={method.id} />
                <Label htmlFor={method.id} className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xl">{getMethodIcon(method)}</span>
                  <span className="text-[#F1F5F9]">{getMethodLabel(method)}</span>
                  {method.isDefault && (
                    <Badge className="bg-[#334155] text-[#94A3B8] border-0 text-xs ml-1">
                      Default
                    </Badge>
                  )}
                </Label>
              </div>
              {method.type === 'card' && (
                <button className="text-[#00F0D9] text-sm hover:underline">Change</button>
              )}
            </div>
          ))}
        </div>
      </RadioGroup>

      {showAddNew && onAddNew && (
        <Button
          variant="link"
          onClick={onAddNew}
          className="text-[#00F0D9] hover:text-[#00F0D9]/80 p-0 h-auto mt-3"
        >
          + Add New Card
        </Button>
      )}
    </div>
  );
}

export function PaymentMethodSelectorCompact({
  selectedMethod = 'card-1',
}: {
  selectedMethod?: string;
}) {
  const getMethodDisplay = (methodId: string) => {
    const methods: Record<string, string> = {
      'card-1': '💳 •••• 4242 (Visa)',
      'card-2': '💳 •••• 5555 (Mastercard)',
      'googlepay-1': '🟢 Google Pay',
      'applepay-1': '🍎 Apple Pay',
      'paypal-1': '💙 PayPal (user@email.com)',
    };
    return methods[methodId] || '💳 •••• 4242 (Visa)';
  };

  return (
    <div className="mb-6">
      <h4 className="text-[#F1F5F9] mb-3">Payment method:</h4>
      <div className="flex items-center justify-between p-3 rounded-lg border border-[#334155] bg-[#1E293B]">
        <span className="text-[#F1F5F9]">{getMethodDisplay(selectedMethod)}</span>
        <button className="text-[#00F0D9] text-sm hover:underline">Change</button>
      </div>
    </div>
  );
}
