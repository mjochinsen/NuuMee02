# Google Ads Import Instructions

## Files Created

| File | Contains |
|------|----------|
| `google-ads-import.csv` | Campaign, Ad Groups, Keywords |
| `google-ads-ads.csv` | Responsive Search Ads |
| `google-ads-negative-keywords.csv` | Negative Keywords |

---

## Step-by-Step Import

### Step 1: Download Google Ads Editor

1. Go to: https://ads.google.com/home/tools/ads-editor/
2. Download and install (free)
3. Sign in with your Google Ads account

---

### Step 2: Import Keywords & Campaign Structure

1. Open Google Ads Editor
2. Click **Account** → **Import** → **From file**
3. Select `google-ads-import.csv`
4. Map columns if prompted (should auto-detect)
5. Click **Import**

---

### Step 3: Import Ads

1. In Google Ads Editor, click **Account** → **Import** → **From file**
2. Select `google-ads-ads.csv`
3. Click **Import**

---

### Step 4: Import Negative Keywords

1. In Google Ads Editor, click **Account** → **Import** → **From file**
2. Select `google-ads-negative-keywords.csv`
3. Click **Import**

---

### Step 5: Review & Post

1. Review all imported items in Google Ads Editor
2. Check for any errors (red highlights)
3. Click **Post** → **Post changes**
4. Confirm

---

## Campaign Summary

| Setting | Value |
|---------|-------|
| Campaign Name | NuuMee - Search - Testing |
| Budget | $15/day |
| Bidding | Maximize Conversions |
| Ad Groups | 6 (Creative, Fun, Shorts, Wow, Fast, Personal) |
| Keywords | 32 total (phrase match) |
| Ads | 6 Responsive Search Ads |
| Negative Keywords | 23 |

---

## After Import: Manual Steps

These must be done in Google Ads web interface (not Editor):

### 1. Set Conversion Goal
- Go to: **Goals** → **Conversions**
- Ensure `sign_up` is imported from GA4
- Set as primary conversion

### 2. Add Extensions
In Google Ads web interface:

**Sitelinks:**
| Text | URL |
|------|-----|
| See Examples | /go#examples |
| How It Works | /go#how-it-works |
| Pricing | /pricing |
| Start Free | /go |

**Callouts:**
- No Filming Required
- Ready in Minutes
- Free First Video
- Stylized Creative Video
- Your Image, Your Rights

### 3. Set Location Targeting
- Go to campaign settings
- Set to: **United States** (or your target market)

### 4. Disable Display Network
- Go to campaign settings → Networks
- UNCHECK "Include Google Display Network"

---

## Landing Pages by Ad Group

| Ad Group | Landing URL |
|----------|-------------|
| Creative | https://nuumee.ai/go |
| Fun | https://nuumee.ai/go?angle=fun |
| Shorts | https://nuumee.ai/go?angle=shorts |
| Wow | https://nuumee.ai/go?angle=wow |
| Fast | https://nuumee.ai/go?angle=fast |
| Personal | https://nuumee.ai/go?angle=personal |

---

## Troubleshooting

**"Column not recognized"**
- Make sure CSV is not modified
- Try importing one file at a time

**"Campaign already exists"**
- Delete existing campaign first, or
- Rename the campaign in the CSV

**Ads not showing**
- Check if campaign is Enabled
- Check if budget is set
- Check if payment method is active

---

## Questions?

Contact MARKY for campaign optimization scripts and automation.
