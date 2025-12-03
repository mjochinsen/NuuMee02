'use client';

export interface BillingLineItem {
  label: string;
  amount: string;
  color?: 'default' | 'highlight' | 'muted';
  isCredit?: boolean;
}

export interface BillingSectionProps {
  title?: string;
  items: BillingLineItem[];
  totalLabel?: string;
  totalAmount?: string;
  footerLabel?: string;
  footerAmount?: string;
}

export function BillingSection({
  title = 'Billing adjustment:',
  items,
  totalLabel,
  totalAmount,
  footerLabel,
  footerAmount,
}: BillingSectionProps) {
  const getColorClass = (color?: string) => {
    switch (color) {
      case 'highlight':
        return 'text-[#00F0D9]';
      case 'muted':
        return 'text-[#94A3B8]';
      default:
        return 'text-[#F1F5F9]';
    }
  };

  return (
    <div className="border-t border-[#334155] pt-4 mb-6">
      <h4 className="text-[#F1F5F9] mb-3">{title}</h4>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-[#94A3B8]">
            <span>{item.label}</span>
            <span className={item.isCredit ? 'text-[#00F0D9]' : getColorClass(item.color)}>{item.amount}</span>
          </div>
        ))}

        {(totalLabel || totalAmount) && (
          <>
            <div className="h-px bg-[#334155] my-2"></div>
            <div className="flex justify-between text-[#F1F5F9] text-lg">
              <span>{totalLabel}</span>
              <span>{totalAmount}</span>
            </div>
          </>
        )}

        {(footerLabel || footerAmount) && (
          <div className="flex justify-between text-[#94A3B8] text-sm">
            <span>{footerLabel}</span>
            <span className="text-[#F1F5F9]">{footerAmount}</span>
          </div>
        )}
      </div>
    </div>
  );
}
