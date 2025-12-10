# Extender Pricing Fix - Task Summary for Kody

**Date:** 2025-12-10
**Priority:** CRITICAL
**Status:** DOCS UPDATED - Backend implementation pending

---

## TL;DR

Extender pricing was **losing money** (-567% margin). Changed from percentage-based to fixed credits per resolution.

---

## The Bug

**Old formula (WRONG):**
```python
extender_credits = base_credits * 0.50
```

**Problem:** WaveSpeed charges per OUTPUT second at target resolution, not per base video length.

| Video | Old Charge | WaveSpeed Cost | Loss |
|-------|-----------|----------------|------|
| 10s 720p + extend | $0.075 | $0.50 | -$0.425 |
| 30s 720p + extend | $0.225 | $0.50 | -$0.275 |

---

## The Fix

**New formula (CORRECT):**
```python
EXTENDER_FIXED_CREDITS = {
    "480p": 5,   # $0.50 retail, $0.25 cost = 50% margin
    "720p": 10,  # $1.00 retail, $0.50 cost = 50% margin
}
extender_credits = EXTENDER_FIXED_CREDITS[resolution]
```

---

## Files to Update

### 1. Docs (DONE)
- [x] `docs/PRICING_STRATEGY.md` - Updated to v3.1

### 2. Backend (TODO)
- [ ] `backend/app/services/pricing.py` - Update `calculate_credits()` function
- [ ] `backend/app/jobs/router.py` - Verify extender credit deduction uses new formula

### 3. Frontend (TODO)
- [ ] `frontend/components/PostProcessingOptions.tsx` - Update credit display
- [ ] Any cost preview/calculator components

### 4. Tests (TODO)
- [ ] Add test cases for new extender pricing
- [ ] Verify margin calculations

---

## Implementation Notes

1. **Extender is resolution-dependent, NOT video-length-dependent**
   - A 5-second extend at 720p costs the same whether the base video is 10s or 60s
   - This is because WaveSpeed charges per OUTPUT second

2. **User impact:**
   - Extender will cost MORE than before
   - 720p extend: was ~0.75 credits → now 10 credits
   - This is necessary to avoid losing money

3. **UI messaging:**
   - Consider explaining the value ("+5 seconds of video")
   - Show the fixed cost clearly in the breakdown

---

## Verification Checklist

After implementation:
- [ ] Generate video without extender - verify base cost unchanged
- [ ] Generate video with 480p extender - verify 5 credit charge
- [ ] Generate video with 720p extender - verify 10 credit charge
- [ ] Check credit deduction in Firestore matches expected amount
- [ ] Verify UI shows correct credit breakdown
