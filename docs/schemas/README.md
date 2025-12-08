# Firestore Schema Overview

**Database:** Firestore (Native Mode)
**Project:** wanapi-prod

## TL;DR

14 collections, 8 composite indexes. Key patterns:
- Transactions for credit ops (atomic)
- Soft deletes on jobs
- Separate referral_codes collection for uniqueness
- 7-day signed URL expiry

## Collections

| Collection | Purpose | Est. Size | Schema File |
|------------|---------|-----------|-------------|
| `users` | User profiles, credits, subs | 100K | [users.md](users.md) |
| `jobs` | Video generation jobs | 1M/year | [jobs.md](jobs.md) |
| `credit_transactions` | Credit history | 5M/year | [credits.md](credits.md) |
| `subscriptions` | Active subscriptions | 10K | [credits.md](credits.md) |
| `referrals` | Referral tracking | 50K | [referrals.md](referrals.md) |
| `referral_codes` | Code lookup | 100K | [referrals.md](referrals.md) |
| `affiliates` | Affiliate accounts | 1K | [affiliates.md](affiliates.md) |
| `affiliate_clicks` | Click tracking | 100K/mo | [affiliates.md](affiliates.md) |
| `affiliate_conversions` | Conversions | 10K/mo | [affiliates.md](affiliates.md) |
| `affiliate_payouts` | Payouts | 500/mo | [affiliates.md](affiliates.md) |
| `api_keys` | API keys | 5K | [api.md](api.md) |
| `webhooks` | Webhook configs | 1K | [api.md](api.md) |
| `payment_methods` | Stripe methods | 20K | [api.md](api.md) |
| `system` | Config & counters | 10 | [api.md](api.md) |

## Related Docs

- [indexes-rules.md](indexes-rules.md) - Composite indexes + security rules
- [transactions.md](transactions.md) - Transaction patterns + data flows
