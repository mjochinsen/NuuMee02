---
description: Quick Stripe status summary
---

# Stripe Status Check

Quick overview of Stripe account status using MCP tools.

## Your Task

Use the Stripe MCP tools to gather status information:

### 1. Recent Subscriptions
```
Use mcp__stripe__list_subscriptions with limit=10
```

### 2. Recent Customers
```
Use mcp__stripe__list_customers with limit=5
```

### 3. Account Balance
```
Use mcp__stripe__retrieve_balance
```

### 4. Recent Payment Intents (for failed payments)
```
Use mcp__stripe__list_payment_intents with limit=10
```

## Output Format

```
## Stripe Status

### Subscriptions
| Status | Count |
|--------|-------|
| Active | X |
| Canceled | X |
| Past Due | X |

**MRR estimate:** $X.XX (active × avg price)

### Recent Customers
[List last 5 customers with email]

### Account Balance
- Available: $X.XX
- Pending: $X.XX

### Payment Health
- Successful: X
- Failed: X (last 10 intents)

⚠️ **Alerts:**
- [Any past_due subscriptions]
- [Any failed payments needing attention]
```

## Tips

- Use test mode keys (sk_test_*) for development
- MRR = sum of active subscription amounts
- Flag any past_due or failed statuses prominently
