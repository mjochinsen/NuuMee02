# MARKY Reference Guide

**MARKY** = Marketing & Analytics Expert for NuuMee

---

## Quick Status

| Tool | Status | Notes |
|------|--------|-------|
| Google Analytics | ✅ Ready | Full access via MCP |
| Google Ads Editor | ✅ Ready | MARKY creates CSV → You import (campaign creation) |
| Google Ads Scripts | ✅ Ready | Automate EXISTING campaigns only |
| Stripe Analytics | ✅ Ready | Revenue & subscription data |

---

## Google Analytics (WORKING)

### Credentials
- **Service Account:** `nuumee-analytics@wanapi-prod.iam.gserviceaccount.com`
- **Key File:** `.claude/nuumee-analytics-key.json`
- **GA4 Property ID:** `514341875`
- **Measurement ID:** `G-GN64HWEKWS`

### MCP Tools Available
```
mcp__google-analytics__get_account_summaries
mcp__google-analytics__run_report
mcp__google-analytics__run_realtime_report
mcp__google-analytics__get_property_details
mcp__google-analytics__list_google_ads_links
```

### Quick Python Query (Events)
```bash
GOOGLE_APPLICATION_CREDENTIALS=/home/user/NuuMee02/.claude/nuumee-analytics-key.json \
GOOGLE_CLOUD_PROJECT=wanapi-prod python3 -c "
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric

client = BetaAnalyticsDataClient()
request = RunReportRequest(
    property='properties/514341875',
    dimensions=[Dimension(name='eventName')],
    metrics=[Metric(name='eventCount')],
    date_ranges=[DateRange(start_date='7daysAgo', end_date='today')],
)
response = client.run_report(request)
for row in response.rows:
    print(f'{row.dimension_values[0].value}: {row.metric_values[0].value}')
"
```

### Google Ads Performance via GA4
```bash
GOOGLE_APPLICATION_CREDENTIALS=/home/user/NuuMee02/.claude/nuumee-analytics-key.json \
GOOGLE_CLOUD_PROJECT=wanapi-prod python3 -c "
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric

client = BetaAnalyticsDataClient()
request = RunReportRequest(
    property='properties/514341875',
    dimensions=[
        Dimension(name='sessionGoogleAdsCampaignName'),
        Dimension(name='sessionGoogleAdsAdGroupName'),
    ],
    metrics=[
        Metric(name='sessions'),
        Metric(name='totalUsers'),
        Metric(name='newUsers'),
        Metric(name='engagedSessions'),
        Metric(name='conversions'),
    ],
    date_ranges=[DateRange(start_date='7daysAgo', end_date='today')],
)
response = client.run_report(request)
print('Campaign | Ad Group | Sessions | Users | New | Engaged | Conv')
print('-' * 70)
for row in response.rows:
    if row.dimension_values[0].value != '(not set)':
        print(f'{row.dimension_values[0].value} | {row.dimension_values[1].value} | {row.metric_values[0].value} | {row.metric_values[1].value} | {row.metric_values[2].value} | {row.metric_values[3].value} | {row.metric_values[4].value}')
"
```

### Admin Commands (Conversions, Audiences)
```bash
/migrate ga_admin.py list_conversions
/migrate ga_admin.py create_conversion <event_name>
/migrate ga_admin.py list_audiences
/migrate ga_admin.py list_streams
```

---

## Google Ads Tools

### Tool Comparison

| Tool | Purpose | Who Does What |
|------|---------|---------------|
| **Google Ads Editor** | Create campaigns from scratch | MARKY creates CSV → You import |
| **Google Ads Scripts** | Automate EXISTING campaigns | MARKY writes JS → You paste & run |
| **Google Ads UI** | Manual creation/editing | You do everything |

---

## Campaign Creation (Google Ads Editor)

**Best for:** Creating new campaigns, ad groups, keywords, ads in bulk

### Workflow
1. Tell MARKY what campaigns you need
2. MARKY creates CSV file(s) with all data
3. Download [Google Ads Editor](https://ads.google.com/intl/en_us/home/tools/ads-editor/) (free desktop app)
4. Import CSV → Everything created in one click
5. Review and publish

### Account Info
- **H2Op:** Customer ID `7880123674`

---

## Campaign Automation (Google Ads Scripts)

**Best for:** Managing EXISTING campaigns (reports, alerts, optimization)

**⚠️ Scripts CANNOT create campaigns from scratch!**

### How to Use
1. MARKY writes JavaScript script
2. Go to: Google Ads → Tools & Settings → Bulk Actions → Scripts
3. Click "+ New Script"
4. Paste the script MARKY provides
5. Authorize (first time only)
6. Run or Schedule

### Scripts URL
https://ads.google.com/aw/bulk/scripts?ocid=7880123674

### Common Script Templates

**1. Campaign Performance Report (to Sheets)**
```javascript
function main() {
  var spreadsheet = SpreadsheetApp.create("Campaign Report " + new Date().toDateString());
  var sheet = spreadsheet.getActiveSheet();

  sheet.appendRow(["Campaign", "Clicks", "Impressions", "Cost", "Conversions"]);

  var campaigns = AdsApp.campaigns()
    .withCondition("Status = ENABLED")
    .get();

  while (campaigns.hasNext()) {
    var campaign = campaigns.next();
    var stats = campaign.getStatsFor("LAST_30_DAYS");
    sheet.appendRow([
      campaign.getName(),
      stats.getClicks(),
      stats.getImpressions(),
      stats.getCost(),
      stats.getConversions()
    ]);
  }

  Logger.log("Report: " + spreadsheet.getUrl());
}
```

**2. Pause Low-Performing Ads**
```javascript
function main() {
  var ads = AdsApp.ads()
    .withCondition("Impressions > 1000")
    .withCondition("Ctr < 0.005")  // CTR < 0.5%
    .forDateRange("LAST_30_DAYS")
    .get();

  while (ads.hasNext()) {
    var ad = ads.next();
    Logger.log("Pausing: " + ad.getHeadlinePart1());
    ad.pause();
  }
}
```

**3. Budget Alert**
```javascript
function main() {
  var campaigns = AdsApp.campaigns()
    .withCondition("Status = ENABLED")
    .get();

  while (campaigns.hasNext()) {
    var campaign = campaigns.next();
    var budget = campaign.getBudget().getAmount();
    var spent = campaign.getStatsFor("TODAY").getCost();
    var pctUsed = (spent / budget) * 100;

    if (pctUsed > 80) {
      Logger.log("WARNING: " + campaign.getName() + " at " + pctUsed.toFixed(1) + "% budget");
    }
  }
}
```

### What Scripts Can Automate
| Script Type | Purpose |
|-------------|---------|
| Performance Reports | Export to Google Sheets |
| Budget Monitors | Alert on overspend |
| Bid Adjusters | Auto-optimize bids |
| Ad Pausers | Stop underperformers |
| Keyword Managers | Add/remove keywords |
| Scheduling | Dayparting automation |

---

## Stripe Analytics (WORKING)

### MCP Tools Available
```
mcp__stripe-live__list_subscriptions
mcp__stripe-live__list_customers
mcp__stripe-live__list_payment_intents
mcp__stripe-live__list_invoices
mcp__stripe-live__retrieve_balance
```

### Quick Checks
- Active subscriptions: `mcp__stripe-live__list_subscriptions`
- Recent payments: `mcp__stripe-live__list_payment_intents`
- Customer count: `mcp__stripe-live__list_customers`

---

## Common MARKY Tasks

| Task | How |
|------|-----|
| Check today's traffic | `run_realtime_report` |
| Get conversion counts | `/migrate ga_admin.py list_conversions` |
| Revenue this month | `mcp__stripe-live__list_payment_intents` |
| Active subscribers | `mcp__stripe-live__list_subscriptions` |
| Event tracking | `run_report` with eventName dimension |

---

## Account IDs Reference

| Service | ID | Name |
|---------|-------|------|
| GA4 Property | `514341875` | wanapi-prod |
| GA4 Account | `366511275` | - |
| GA4 Stream | `13048850413` | NuuMee Frontend App |
| Google Ads | `7880123674` | H2Op (regular account) |
| GCP Project | `wanapi-prod` | - |

---

*Last Updated: 2025-12-19*
