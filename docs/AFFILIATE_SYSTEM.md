# NuuMee Affiliate System

## Status: DEFERRED (Post-Launch)

**Current State:** Application form works, full tracking deferred
**Decision Date:** December 8, 2025
**Reason:** Complexity - 35 tasks, ~17 genuinely new vs referrals

---

## What Works Now (V0)

| Feature | Status | Notes |
|---------|--------|-------|
| `/affiliate` page | ✅ | Application form visible |
| `POST /affiliate/apply` | ✅ | Creates pending application |
| `GET /affiliate/stats` | ✅ | Returns stats (approved only) |
| `POST /affiliate/payout` | ✅ | Request payout ($100 min) |
| Admin approval | Manual | Via Firebase Console |

---

## Spec (from PRICING_STRATEGY.md)

| Item | Value |
|------|-------|
| Commission | 30% of first purchase |
| Payout minimum | $100 |
| Cookie window | 30 days |
| Tracking param | `?a=CODE` |
| Payout method | PayPal |
| Approval time | 2-3 business days |

---

## Full Implementation Breakdown (35 Tasks)

### Phase A: Frontend (6 tasks)

| ID | Task | Priority | Complexity | Notes |
|----|------|----------|------------|-------|
| A1 | Store `?a=CODE` in localStorage | High | Low | Same pattern as referrals |
| A2 | 30-day expiration check | Medium | Medium | New - referrals have no expiry |
| A3 | Send affiliate_code on signup | High | Low | Same as referrals |
| A4 | Affiliate application form | ✅ Done | - | Already exists |
| A5 | Affiliate dashboard (real stats) | Medium | Medium | Wire to GET /affiliate/stats |
| A6 | Payout request UI | Low | Medium | Wire to POST /affiliate/payout |

### Phase B: Backend - Tracking (5 tasks)

| ID | Task | Priority | Complexity | Notes |
|----|------|----------|------------|-------|
| B1 | Record `affiliate_code` on user doc | High | Low | Same as `referred_by` |
| B2 | Increment `total_clicks` on visit | Low | Medium | New endpoint or frontend call |
| B3 | Increment `total_signups` on signup | High | Low | In signup flow |
| B4 | Create `affiliate_signups` collection | High | Low | Track attribution |
| B5 | Validate 30-day attribution window | Medium | Medium | Check signup vs click timestamp |

### Phase C: Backend - Commission (4 tasks)

| ID | Task | Priority | Complexity | Notes |
|----|------|----------|------------|-------|
| C1 | Calculate 30% commission in webhook | High | Medium | In checkout.session.completed |
| C2 | Add to `commission_pending` | High | Low | Update affiliate doc |
| C3 | Create `affiliate_commissions` record | High | Low | Audit trail |
| C4 | Update affiliate stats | High | Low | total_conversions, commission_earned |

### Phase D: Backend - Admin (3 tasks)

| ID | Task | Priority | Complexity | Notes |
|----|------|----------|------------|-------|
| D1 | Admin approval endpoint | Low | Medium | Or manual via Firebase Console |
| D2 | Generate AFF-XXXXX on approval | Medium | Low | Random code generation |
| D3 | Rejection with reason | Low | Low | Update status + reason field |

### Phase E: Backend - Payouts (4 tasks)

| ID | Task | Priority | Complexity | Notes |
|----|------|----------|------------|-------|
| E1 | Payout request endpoint | ✅ Done | - | Already exists |
| E2 | $100 minimum validation | ✅ Done | - | Already exists |
| E3 | Manual payout marking (V1) | High | Low | Admin updates Firestore |
| E4 | PayPal MCP integration (V2) | Low | High | Automate payouts |

### Phase F: Email Templates (7 tasks)

| ID | Task | Priority | Complexity | Notes |
|----|------|----------|------------|-------|
| F1 | `affiliate.application_submitted` | High | Low | "Thanks, reviewing in 2-3 days" |
| F2 | `affiliate.approved` | High | Low | "Welcome! Code: AFF-XXXXX" |
| F3 | `affiliate.rejected` | Medium | Low | "Sorry, reason: ..." |
| F4 | `affiliate.signup` | Medium | Low | "Someone joined via your link!" |
| F5 | `affiliate.commission` | Medium | Low | "You earned $X.XX!" |
| F6 | `affiliate.payout_sent` | Low | Low | "$X.XX on the way" |
| F7 | `affiliate.payout_failed` | Low | Low | "Payout failed: reason" |

### Phase G: Testing (6 tasks)

| ID | Task | Priority | Complexity | Notes |
|----|------|----------|------------|-------|
| G1 | Test application submission | High | Low | Verify Firestore record |
| G2 | Test click tracking | Medium | Medium | After implementation |
| G3 | Test signup attribution | High | Medium | After implementation |
| G4 | Test 30-day window | Medium | Medium | Edge cases |
| G5 | Test commission calculation | High | Medium | Various purchase amounts |
| G6 | End-to-end flow test | High | High | Full journey |

---

## Comparison: Referrals vs Affiliates

| Aspect | Referrals | Affiliates |
|--------|-----------|------------|
| Who can use | Any user | Approved partners only |
| Code format | USER-XXXXX (auto) | AFF-XXXXX (manual approval) |
| Tracking param | `?ref=CODE` | `?a=CODE` |
| Attribution window | Forever | 30 days |
| Reward type | Credits (internal) | Cash (real money) |
| Reward amount | Fixed 100 credits | 30% of purchase |
| Reward timing | First purchase ≥$10 | First purchase (any) |
| Payout | Instant (credits) | Manual PayPal ($100 min) |
| Click tracking | No | Yes |
| Admin approval | No | Yes |
| Email templates | 3 | 7 |
| **Total complexity** | ~18 tasks | ~35 tasks |

---

## PayPal MCP Integration (V2)

PayPal has an official MCP server that could automate payouts:

```bash
# Add to Claude Code
claude mcp add --transport http paypal --scope project https://mcp.paypal.com/mcp
```

**Benefits:**
- Automated mass payouts
- No manual PayPal login
- Transaction tracking

**Resources:**
- [PayPal MCP Announcement](https://developer.paypal.com/community/blog/paypal-model-context-protocol/)
- [PayPal MCP Quickstart](https://www.paypal.ai/docs/tools/mcp-quickstart)

---

## Firestore Collections

### `affiliates`
```json
{
  "affiliate_id": "aff_xxxxxxxxxxxx",
  "user_id": "firebase-uid",
  "status": "pending|approved|rejected|suspended",
  "affiliate_code": "AFF-XXXXX",  // null until approved
  "name": "John Doe",
  "email": "john@example.com",
  "platform_url": "https://youtube.com/@johndoe",
  "platform_type": "youtube|tiktok|instagram|twitter|blog|other",
  "promotion_plan": "I will create tutorial videos...",
  "paypal_email": "john@paypal.com",
  "audience_size": "10k-50k",
  "total_clicks": 0,
  "total_signups": 0,
  "total_conversions": 0,
  "commission_earned": 0.00,
  "commission_pending": 0.00,
  "commission_paid": 0.00,
  "applied_at": timestamp,
  "approved_at": timestamp,
  "rejected_at": timestamp,
  "rejection_reason": null,
  "created_at": timestamp,
  "updated_at": timestamp
}
```

### `affiliate_codes` (for lookup)
```json
{
  "code": "AFF-XXXXX",
  "affiliate_id": "aff_xxxxxxxxxxxx",
  "user_id": "firebase-uid",
  "created_at": timestamp
}
```

### `affiliate_signups` (attribution)
```json
{
  "affiliate_id": "aff_xxxxxxxxxxxx",
  "affiliate_code": "AFF-XXXXX",
  "user_id": "new-user-uid",
  "user_email": "newuser@example.com",
  "clicked_at": timestamp,
  "signed_up_at": timestamp,
  "converted": false,
  "converted_at": null,
  "commission_amount": null
}
```

### `affiliate_commissions` (audit trail)
```json
{
  "commission_id": "comm_xxxxxxxxxxxx",
  "affiliate_id": "aff_xxxxxxxxxxxx",
  "user_id": "purchasing-user-uid",
  "purchase_amount_cents": 7500,
  "commission_rate": 0.30,
  "commission_amount": 22.50,
  "status": "pending|paid",
  "created_at": timestamp
}
```

### `affiliate_payouts`
```json
{
  "payout_id": "payout_xxxxxxxxxxxx",
  "affiliate_id": "aff_xxxxxxxxxxxx",
  "amount": 100.00,
  "status": "pending|processing|completed|failed",
  "paypal_email": "john@paypal.com",
  "paypal_transaction_id": null,
  "requested_at": timestamp,
  "processed_at": null,
  "completed_at": null,
  "failed_at": null,
  "failure_reason": null
}
```

---

## Admin Workflow (V1 - Manual)

### Approving an Affiliate

1. Go to Firebase Console → Firestore → `affiliates`
2. Find application with `status: "pending"`
3. Review: platform_url, promotion_plan, audience_size
4. Update document:
   ```json
   {
     "status": "approved",
     "affiliate_code": "AFF-XXXXX",  // Generate unique code
     "approved_at": <now>
   }
   ```
5. Create entry in `affiliate_codes` collection
6. Send approval email (manual or trigger)

### Processing a Payout

1. Go to Firebase Console → Firestore → `affiliate_payouts`
2. Find payout with `status: "pending"`
3. Log into PayPal, send payment to `paypal_email`
4. Update payout document:
   ```json
   {
     "status": "completed",
     "paypal_transaction_id": "PAYPAL-TXN-ID",
     "completed_at": <now>
   }
   ```
5. Update affiliate document:
   ```json
   {
     "commission_paid": <increment by payout amount>
   }
   ```

---

## Implementation Priority (When Ready)

### MVP (Minimum to launch affiliates)
1. A1: Store `?a=CODE` in localStorage
2. A3: Send affiliate_code on signup
3. B1: Record affiliate_code on user
4. B3: Increment total_signups
5. C1-C4: Commission calculation
6. F1-F2: Application + approval emails
7. G1, G3, G5: Core testing

### Nice to Have
- B2: Click tracking
- B5: 30-day window validation
- A5-A6: Dashboard improvements
- F3-F7: Additional emails

### V2 (Post-revenue)
- E4: PayPal MCP automation
- D1: Admin UI for approvals
