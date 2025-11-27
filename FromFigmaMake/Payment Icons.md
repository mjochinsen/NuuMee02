Payment Icons Successfully Added
Directory Structure
packages/ui/src/icons/
├── wallets/
│   ├── apple-pay.svg
│   ├── google-pay.svg
│   └── google-pay-alt.svg
├── cards/
│   ├── visa.svg
│   ├── mastercard.svg
│   ├── american-express.svg
│   └── discover.svg
├── apm/
│   └── paypal.svg
└── index.ts
What's Included
Wallet Icons:
apple-pay.svg - Apple Pay logo with white background
google-pay.svg - Google Pay logo (light theme)
google-pay-alt.svg - Google Pay logo (dark theme)
Card Icons:
visa.svg - Visa card logo
mastercard.svg - Mastercard logo with overlapping circles
american-express.svg - American Express logo
discover.svg - Discover card logo with orange gradient
Alternative Payment Methods:
paypal.svg - PayPal logo
Usage
I've created an index.ts file with:
Type definitions for all icons
A PaymentIcons constant with all icon paths
Usage examples in the comments
You can import and use these icons in your React components like:
import { PaymentIcons } from '@nuumee/ui/icons';

// Use in an img tag
<img src={PaymentIcons.APPLE_PAY} alt="Apple Pay" />

// Or import the SVG directly
import ApplePayIcon from '@nuumee/ui/icons/wallets/apple-pay.svg';
All SVG files are complete with proper viewBox, dimensions, and color styling as sourced from the official datatrans/payment-logos repository!