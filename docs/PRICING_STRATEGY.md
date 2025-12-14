# NuuMee Pricing Strategy

**Version:** 3.3
**Updated:** 2025-12-14
**Status:** FINAL - UI display decisions + insufficient credits policy

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
extenderCredits = EXTENDER_FIXED_CREDITS[resolution]
```

| Resolution | Extender Cost | WaveSpeed Cost | Margin |
|------------|---------------|----------------|--------|
| 480p       | 5 credits     | $0.25          | 50%    |
| 720p       | 10 credits    | $0.50          | 50%    |

**Why fixed cost (not % of base):**
- WaveSpeed charges per OUTPUT second at target resolution
- 5s extension @ 720p = 5 × $0.10 = $0.50 cost to us
- Must charge $1.00 (10 credits) for 50% margin
- Previous 50% formula was LOSING money (-567% margin!)

**Example:** 10s @ 720p + Extender:
- Base = 1.5 credits ($0.15)
- Extender = 10 credits ($1.00) ← fixed, not % of base
- Total = 11.5 credits

### Upscaler (1080p Output)

**WaveSpeed Capabilities:**
The WaveSpeed Video Upscaler Pro API supports multiple output resolutions:
- 720p, 1080p, 2K (1440p), 4K (2160p)

**NuuMee Offering:**
Currently only offering **1080p** output to users. Higher resolutions (2K, 4K) may be added later with tiered pricing.

**Correct rule:**
```
upscaleCredits = baseCredits
```

**Meaning:**
- Upscaler cost = 100% of the base cost
- Doubles the cost of the video
- Output: 1080p Full HD (current offering)

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
const EXTENDER_FIXED_CREDITS = { "480p": 5, "720p": 10 };

function calculateTotalCredits(config) {
  const billed = Math.max(5, Math.ceil(config.seconds));
  const multiplier = config.resolution === "720p" ? 1.5 : 1.0;

  // Base generation
  const base = (billed * multiplier) / 10;
  let total = base;

  // Extender = FIXED cost per resolution (WaveSpeed charges per output second)
  if (config.extender) {
    total += EXTENDER_FIXED_CREDITS[config.resolution];
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

## 8. Profit Margins (Corrected v3.1)

### Example 1 — 10s 720p (base only)
- Base = 1.5 credits = $0.15 retail
- WaveSpeed cost ≈ $0.08
- **Margin ≈ 46%** ✅

### Example 2 — 10s 720p + Extender
- Base = 1.5 credits = $0.15
- Extender = 10 credits = $1.00 (fixed)
- Total = 11.5 credits = $1.15 retail
- WaveSpeed cost = $0.08 (base) + $0.50 (extend) = $0.58
- **Margin ≈ 50%** ✅

### Example 3 — 30s 720p + Extender + Upscaler
- Base = 4.5 credits = $0.45
- Extender = 10 credits = $1.00 (fixed)
- Upscale = 4.5 credits = $0.45
- Total = 19 credits = $1.90 retail
- WaveSpeed cost ≈ $0.24 (base) + $0.50 (extend) + $0.35 (upscale) = $1.09
- **Margin ≈ 43%** ✅

### v3.0 Bug (FIXED)
Previous extender formula `baseCredits × 0.50` was **losing money**:
- 10s 720p extend charged 0.75 credits ($0.075)
- WaveSpeed cost was $0.50
- **Loss of $0.425 per extend (-567% margin)** ❌

---

## 9. API Pricing Constants (Backend-Correct)

```python
CREDIT_VALUE_USD = 0.10

RESOLUTION_MULTIPLIER = {
    "480p": 1.0,
    "720p": 1.5
}

# EXTENDER: Fixed credits per resolution (NOT a multiplier!)
# WaveSpeed charges per output second, so extend cost is independent of base video length
EXTENDER_FIXED_CREDITS = {
    "480p": 5,   # $0.50 retail, $0.25 cost = 50% margin
    "720p": 10,  # $1.00 retail, $0.50 cost = 50% margin
}

UPSCALER_MULTIPLIER = 1.00  # 100% of base (doubles the cost)

MIN_VIDEO_SECONDS = 5
MAX_VIDEO_SECONDS = 120
```

---

## 10. UI Display (Standardized)

### Generate Button
```
🎬 Generate Video (13 credits)
```

### Cost Breakdown (collapsed detail)
```
Base: 1.5 credits (10s @ 720p)
Extender: +10 credits (+5s @ 720p)
Upscaler: +1.5 credits
─────────────────────────
Total: 13 credits
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

## 12. Insufficient Credits Policy

### Backend Rule: STRICT (No Leeway)

```python
if current_balance < credits_to_charge:
    raise HTTPException(status_code=402, detail="insufficient_credits")
```

| Scenario | Behavior |
|----------|----------|
| Balance < Required | Block with HTTP 402 |
| Leeway | None (strict enforcement) |
| Negative balance | Not allowed |

### Frontend UX Requirements

1. **Pre-check & Disable**
   - Calculate total cost before user clicks Generate
   - Disable add-on toggles user can't afford (grayed out)
   - Disable Generate button if total > balance

2. **Clear Messaging**
   ```
   ⚠️ Need 6 more credits
   [Buy Credits] button
   ```
   - Show exact shortfall: `required - balance`
   - Link directly to credit purchase

3. **Auto-Refill Option**
   - Users can enable auto-refill in billing settings
   - When balance drops below threshold → auto-purchase
   - Uses saved payment method
   - Configurable: threshold + package size

### Error Response Format (API)

```json
{
  "error": "insufficient_credits",
  "message": "Insufficient credits. Required: 11.5, Available: 4",
  "required_credits": 11.5,
  "available_credits": 4,
  "shortfall": 7.5
}
```

---

## 13. UI Display Decisions

### Credit Balance: Show Credits Only, Not Dollar Value

**Decision (Dec 2025):** Remove "Worth: $X.XX" from billing page balance display.

**Before:**
```
Current Balance
435 Credits
Worth: $43.50
```

**After:**
```
Current Balance
435 Credits
```

**Rationale:**
1. **Psychological framing** - Credits should feel like "generation power" not "stored dollars"
2. **Refund expectations** - Dollar amounts make users think credits are withdrawable
3. **Pricing flexibility** - Removes friction when adjusting credit values later
4. **Simplicity** - Cleaner UI, less cognitive load

**Implementation:** Removed `creditValue` prop from `BalanceCard` component.

---

## ✅ FINAL STATUS (v3.3)

This pricing file is now:

- ✔ aligned with backend code
- ✔ aligned with Phase 3/4/5 documentation
- ✔ aligned with Terms & front-end
- ✔ aligned with Stripe setup
- ✔ aligned with affiliate/referral pages
- ✔ sustainable margin (all add-ons now 43-50%)
- ✔ clear for users
- ✔ ready for production launch

### v3.3 Change Log (2025-12-14)
- Added Section 13: UI Display Decisions
- Removed "Worth: $X.XX" from billing page balance display
- Credits displayed as units, not dollar equivalents

### v3.2 Change Log (2025-12-10)
- Added Section 12: Insufficient Credits Policy
- Documented strict enforcement (no leeway)
- Specified frontend UX requirements (disable, messaging, auto-refill)
- Defined API error response format

### v3.1 Change Log (2025-12-10)
- **CRITICAL FIX:** Extender pricing changed from % of base to fixed credits
- 480p extend: 5 credits (was ~0.5 credits)
- 720p extend: 10 credits (was ~0.75 credits)
- Reason: WaveSpeed charges per output second, not per base video length
- Previous formula was losing $0.425 per 720p extend (-567% margin)
