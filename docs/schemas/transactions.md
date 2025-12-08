# Firestore Transaction Patterns

## 1. Job Submission & Credit Deduction

**Scenario:** User submits job, credits deducted when processing starts

```javascript
async function processJob(jobId) {
  return db.runTransaction(async (transaction) => {
    const jobRef = db.collection('jobs').doc(jobId);
    const job = await transaction.get(jobRef);

    if (job.data().status !== 'pending') {
      throw new Error('Job already processing');
    }

    const userRef = db.collection('users').doc(job.data().user_id);
    const user = await transaction.get(userRef);
    const creditCost = calculateCreditCost(job.data());

    if (user.data().credits_balance < creditCost) {
      transaction.update(jobRef, {
        status: 'failed',
        error_message: 'Insufficient credits',
        error_code: 'insufficient_credits',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      throw new Error('Insufficient credits');
    }

    // Deduct credits
    transaction.update(userRef, {
      credits_balance: admin.firestore.FieldValue.increment(-creditCost),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update job status
    transaction.update(jobRef, {
      status: 'processing',
      credits_charged: creditCost,
      started_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create credit transaction
    const txnRef = db.collection('credit_transactions').doc();
    transaction.set(txnRef, {
      transaction_id: txnRef.id,
      user_id: user.id,
      type: 'job',
      amount: -creditCost,
      balance_before: user.data().credits_balance,
      balance_after: user.data().credits_balance - creditCost,
      description: `Video generation (${jobId})`,
      related_job_id: jobId,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
  });
}
```

---

## 2. Referral Bonus Grant

**Scenario:** Referred user makes first purchase ≥$10, grant referrer 100 credits

```javascript
async function grantReferrerBonus(referredUserId, purchaseAmount) {
  if (purchaseAmount < 1000) return; // Minimum $10

  return db.runTransaction(async (transaction) => {
    const referralsQuery = await db.collection('referrals')
      .where('referred_user_id', '==', referredUserId)
      .where('referrer_bonus_granted', '==', false)
      .limit(1)
      .get();

    if (referralsQuery.empty) return;

    const referralDoc = referralsQuery.docs[0];
    const referral = referralDoc.data();

    const referrerRef = db.collection('users').doc(referral.referrer_id);
    const referrer = await transaction.get(referrerRef);

    // Grant 100 credits
    transaction.update(referrerRef, {
      credits_balance: admin.firestore.FieldValue.increment(100),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Mark bonus as granted
    transaction.update(referralDoc.ref, {
      referrer_bonus_granted: true,
      status: 'converted',
      conversion_timestamp: admin.firestore.FieldValue.serverTimestamp(),
      first_purchase_amount: purchaseAmount,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create credit transaction
    const txnRef = db.collection('credit_transactions').doc();
    transaction.set(txnRef, {
      transaction_id: txnRef.id,
      user_id: referral.referrer_id,
      type: 'referral',
      amount: 100,
      balance_before: referrer.data().credits_balance,
      balance_after: referrer.data().credits_balance + 100,
      description: `Referral bonus (${referredUserId})`,
      related_referral_code: referral.referral_code,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
  });
}
```

---

## 3. Subscription Renewal

**Scenario:** Monthly subscription renews, grant credits

```javascript
async function renewSubscription(subscriptionId) {
  return db.runTransaction(async (transaction) => {
    const subRef = db.collection('subscriptions').doc(subscriptionId);
    const sub = await transaction.get(subRef);

    const userRef = db.collection('users').doc(sub.data().user_id);
    const user = await transaction.get(userRef);

    const monthlyCredits = sub.data().monthly_credits;

    // Grant monthly credits
    transaction.update(userRef, {
      credits_balance: admin.firestore.FieldValue.increment(monthlyCredits),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update subscription
    transaction.update(subRef, {
      current_period_start: admin.firestore.FieldValue.serverTimestamp(),
      current_period_end: admin.firestore.Timestamp.fromMillis(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ),
      credits_granted_this_period: monthlyCredits,
      credits_remaining_this_period: monthlyCredits,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });

    // Create credit transaction
    const txnRef = db.collection('credit_transactions').doc();
    transaction.set(txnRef, {
      transaction_id: txnRef.id,
      user_id: user.id,
      type: 'subscription',
      amount: monthlyCredits,
      balance_before: user.data().credits_balance,
      balance_after: user.data().credits_balance + monthlyCredits,
      description: `${sub.data().tier} subscription renewal`,
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
  });
}
```

---

## Data Flow: Job Creation

```
User → Frontend → API → Firestore (job: pending)
                     → CloudTasks (enqueue)

Worker → CloudTasks (pull)
      → Firestore (transaction: check credits, update job)
      → WaveSpeed (generate)
      → GCS (upload output)
      → Firestore (job: completed)
      → SendGrid (email)
```

## Data Flow: Referral

```
Referrer → Share link (?ref=USER-ABC12)
ReferredUser → Click → API → Firestore (referral: visited)
            → Sign up → API → Firestore (user + 25 credits, referral: signed_up)
            → Purchase ≥$10 → API → Firestore (transaction: +100 to referrer, referral: converted)
```
