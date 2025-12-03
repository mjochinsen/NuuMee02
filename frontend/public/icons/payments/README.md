# Payment Icons

Payment method logos for NuuMee billing UI.

## Source

https://github.com/datatrans/payment-logos

**License:** CC-BY-SA-4.0 (attribution required)

## Download Instructions

```bash
# Clone the repository
git clone https://github.com/datatrans/payment-logos.git

# Copy needed icons to this folder
cp payment-logos/assets/cards/visa.svg .
cp payment-logos/assets/cards/mastercard.svg .
cp payment-logos/assets/cards/amex.svg .
cp payment-logos/assets/wallets/applepay.svg .
cp payment-logos/assets/wallets/googlepay.svg .
cp payment-logos/assets/apm/paypal.svg .

# Cleanup
rm -rf payment-logos
```

## Required Icons for NuuMee

### Credit/Debit Cards
| Icon | File | Source Path |
|------|------|-------------|
| Visa | `visa.svg` | `assets/cards/visa.svg` |
| Mastercard | `mastercard.svg` | `assets/cards/mastercard.svg` |
| American Express | `amex.svg` | `assets/cards/amex.svg` |
| Discover | `discover.svg` | `assets/cards/discover.svg` |

### Digital Wallets
| Icon | File | Source Path |
|------|------|-------------|
| Apple Pay | `applepay.svg` | `assets/wallets/applepay.svg` |
| Google Pay | `googlepay.svg` | `assets/wallets/googlepay.svg` |

### Alternative Payment Methods
| Icon | File | Source Path |
|------|------|-------------|
| PayPal | `paypal.svg` | `assets/apm/paypal.svg` |

## Usage in Components

```tsx
import Image from 'next/image';

// In component
<Image
  src="/icons/payments/visa.svg"
  alt="Visa"
  width={40}
  height={24}
/>
```

## Attribution

Icons from [datatrans/payment-logos](https://github.com/datatrans/payment-logos) under CC-BY-SA-4.0.
