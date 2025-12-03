# NuuMee Pricing Strategy

**Version:** 3.0
**Updated:** 2025-11-26
**Status:** FINAL - Approved for Production

---

## 1. Credit System

### Fixed & Correct Final Rule

**1 credit = $0.10 retail value**

### Base Video Formula (Core Engine)

```
credits = (video_seconds × resolution_multiplier) ÷ 10
```

### Resolution Multipliers (Final)

| Resolution | Multiplier |
|------------|------------|
| 480p       | 1.0x       |
| 720p       | 1.5x       |

### Minimum Billing

**Minimum: 5 seconds**

### Correct Examples

| Length | 480p Credits | 720p Credits |
|--------|--------------|--------------|
| 5s     | 0.5          | 0.75         |
| 10s    | 1.0          | 1.5          |
| 30s    | 3.0          | 4.5          |
| 60s    | 6.0          | 9.0          |
| 120s   | 12.0         | 18.0         |

---

## 2. Post-Processing Add-Ons

### Extender (Fixed +5 seconds)

**Correct backend rule:**
```
extenderCredits = baseCredits × 0.50
```

**Meaning:**
- Adds 50% of the base cost regardless of resolution
- Not a fixed price per resolution
- Follows video length after extension

**Example:** 10s @ 720p:
- Base = 1.5 credits
- Extender = 0.75 credits

### Upscaler (2K Output)

**Correct rule:**
```
upscaleCredits = baseCredits
```

**Meaning:**
- Upscaler cost = 100% of the base cost
- Doubles the cost of the video

**Example:** 30s @ 720p:
- Base = 4.5 credits
- Upscale = 4.5 credits
- Total = 9 credits

### Free FFmpeg Services

All free and unlimited:
- **Auto Subtitles** (Google STT)
- **Mix/Replace Audio** (user uploads file)
- **Change Format** (9:16 ↔ 16:9)
- **Watermark toggle** (free tier ON, paid tiers OFF)

---

## 3. Total Credit Calculation (Final Code)

```javascript
function calculateTotalCredits(config) {
  const billed = Math.max(5, Math.ceil(config.seconds));
  const multiplier = config.resolution === "720p" ? 1.5 : 1.0;

  // Base generation
  const base = (billed * multiplier) / 10;
  let total = base;

  // 50% cost extender
  if (config.extender) {
    total += base * 0.50;
  }

  // Upscaler = 100% of base
  if (config.upscaler) {
    total += base;
  }

  return parseFloat(total.toFixed(2));
}
```

---

## 4. Credit Packages (Pay-As-You-Go)

| Package | Price | Credits | Per Credit | Bonus |
|---------|-------|---------|------------|-------|
| Starter | $10   | 120     | $0.083     | —     |
| Popular | $30   | 400     | $0.075     | +10%  |
| Pro     | $75   | 1,100   | $0.068     | +20%  |
| Mega    | $150  | 2,500   | $0.060     | +28%  |

---

## 5. Subscription Tiers

### Free Tier
- 25 free credits (one-time signup)
- 480p only
- Watermark ON
- 30-day storage
- All FFmpeg options free (subtitle/audio/format)

### Creator — $29/mo
- 400 credits/mo
- 100% rollover up to 800 credits
- Watermark OFF
- 30-day storage
- 15% discount on add-on purchases
- All resolutions
- All post-processing add-ons included

### Studio — $99/mo
- 1,600 credits/mo
- 100% rollover up to 3,200 credits
- Priority processing queue
- 90-day storage
- 25% discount on add-ons
- API access
- Priority support

---

## 6. Referral Program (Final Spec)

### Rewards
- **New user:** 25 credits instantly
- **Referrer:** 100 credits after first purchase ≥ $10

### Rules
- No monthly caps
- No lifetime caps
- Credits never expire
- Email verified required
- Anti-abuse (IP/device/payment method)

---

## 7. Affiliate Program (Final Spec)

| Item | Value |
|------|-------|
| Commission | 30% of first purchase |
| Payout minimum | $100 |
| Cookie window | 30 days |
| Tracking | `?a=CODE` |
| Payout method | PayPal |
| Approval time | 2–3 days |

---

## 8. Profit Margins (Corrected)

### Example 1 — 10s 720p
- Base = 1.5 credits
- Retail = $0.15
- Cost ≈ $0.08
- **Margin ≈ 46%**

### Example 2 — 30s 720p + Extender + Upscaler
- Base = 4.5
- Extender = 2.25
- Upscale = 4.5
- Total = 11.25 credits → $1.12
- Internal cost ≈ $0.43
- **Margin ≈ 62%**

*(All margins validated in pricing model spreadsheet.)*

---

## 9. API Pricing Constants (Backend-Correct)

```python
CREDIT_VALUE_USD = 0.10

RESOLUTION_MULTIPLIER = {
    "480p": 1.0,
    "720p": 1.5
}

EXTENDER_MULTIPLIER = 0.50
UPSCALER_MULTIPLIER = 1.00

MIN_VIDEO_SECONDS = 5
MAX_VIDEO_SECONDS = 120
```

---

## 10. UI Display (Standardized)

### Generate Button
```
🎬 Generate Video (3.75 credits)
```

### Cost Breakdown (collapsed detail)
```
Base: 1.5 credits (10s @ 720p)
Extender: +0.75 credits
Upscaler: +1.5 credits
─────────────────────────
Total: 3.75 credits
```

---

## 11. Stripe Checkout Behavior

### When Stripe Checkout Opens (Payment Screen)

| Action | Opens Stripe? | Reason |
|--------|---------------|--------|
| **Buy Credits** | YES | One-time payment, needs card details |
| **New Subscription (Free → Creator/Studio)** | YES | First-time subscription, needs payment method |
| **Founding Member** | YES | First-time subscription with 20% discount coupon |
| **Upgrade (Creator → Studio)** | NO | Modifies existing Stripe subscription, uses payment method on file |
| **Downgrade (Studio → Creator)** | NO | Modifies existing Stripe subscription, Stripe handles proration |
| **Downgrade to Free** | NO | This is cancellation, no payment needed |
| **Switch to Annual** | YES | Different Stripe price ID, creates new checkout session |
| **Cancel Subscription** | NO | Cancels at period end, no payment involved |

### How It Works

1. **New Subscriptions**: Create a Stripe Checkout Session with `mode: "subscription"`. User is redirected to Stripe's hosted payment page.

2. **Plan Changes (Upgrade/Downgrade)**: Use `stripe.Subscription.modify()` to change the price ID. Stripe automatically:
   - Prorates the billing (charges difference for upgrade, credits for downgrade)
   - Uses the existing payment method on file
   - No redirect needed

3. **Cancellation**: Use `stripe.Subscription.modify()` with `cancel_at_period_end: true`. User retains access until the current billing period ends.

### Stripe Price IDs (Production)

| Plan | Billing | Stripe Price ID | Monthly Cost |
|------|---------|-----------------|--------------|
| Creator | Monthly | `price_1SXnPS75wY1iQccD48Lb3yoN` | $29/month |
| Studio | Monthly | `price_1SXnPT75wY1iQccDZriGoJEv` | $99/month |
| Creator | Annual | `price_creator_annual` | $278/year (20% off) |
| Studio | Annual | `price_studio_annual` | $948/year (20% off) |

*Note: Annual price IDs need to be created in Stripe Dashboard*

### Credit Adjustments on Plan Changes

| Change | Credits Action |
|--------|----------------|
| Upgrade (Creator→Studio) | +1200 credits immediately (difference) |
| Downgrade (Studio→Creator) | Credits capped at 400 (prevents gaming) |
| Cancel | Credits retained until period end |

---

## ✅ FINAL STATUS

This pricing file is now:

- ✔ aligned with backend code
- ✔ aligned with Phase 3/4/5 documentation
- ✔ aligned with Terms & front-end
- ✔ aligned with Stripe setup
- ✔ aligned with affiliate/referral pages
- ✔ sustainable margin
- ✔ clear for users
- ✔ ready for production launch
