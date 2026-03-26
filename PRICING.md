# Swimily Premium Pricing

## Pricing Structure

### 💳 **Monthly Plan**
- **Price**: $4.99/month
- **Billing**: Charged monthly
- **Best for**: Trying out Premium features, short-term users
- **Cancel anytime**: No commitment

### 💎 **Annual Plan** (Recommended)
- **Price**: $49.99/year
- **Savings**: $9.89/year (17% off)
- **Billing**: Charged once per year
- **Best for**: Serious swimmers, long-term training
- **Monthly equivalent**: $4.17/month

---

## Premium Features

### ✨ **AI Trainer**
- Unlimited AI-generated workouts
- Customized by focus, duration, and intensity
- Smart progression based on your history
- Free users: 10 workouts per day

### 📊 **Advanced Analytics**
- Weekly and monthly yardage charts
- Progress trends and insights
- Performance metrics dashboard
- SWOLF and efficiency tracking
- Free users: Basic stats only

### 📷 **Photo Workout Scanning**
- Scan whiteboard workouts with AI
- Automatic practice logging from photos
- OCR text recognition
- Free users: Not available

### 🏊 **Race Split Predictions**
- AI-powered race split calculator
- Pacing strategy recommendations
- Goal time analysis
- Free users: Basic calculator only

### ☁️ **Unlimited Cloud Storage**
- Store unlimited practices
- Photo backups
- Meet results history
- Free users: 100 practices max

### 🎯 **Priority Features**
- Priority support response
- Early access to new features
- Ad-free experience
- Custom training plans

---

## Feature Comparison

| Feature | Free | Premium |
|---------|------|---------|
| Practice Logging | ✅ Unlimited | ✅ Unlimited |
| Personal Records | ✅ All Events | ✅ All Events |
| Basic Analytics | ✅ | ✅ |
| FINA Points | ✅ | ✅ |
| Daily Spin Wheel | ✅ 3 spins/day | ✅ 5 spins/day |
| XP & Gamification | ✅ | ✅ |
| **AI Workout Generation** | 🔒 10/day | ✅ Unlimited |
| **Advanced Analytics** | 🔒 | ✅ |
| **Photo Scanning** | 🔒 | ✅ |
| **Race Split Predictions** | 🔒 Basic | ✅ Advanced |
| **Cloud Storage** | 🔒 100 practices | ✅ Unlimited |
| **Dryland Workouts** | 🔒 Limited | ✅ Full Library |
| **Ad-Free** | ❌ | ✅ |
| **Priority Support** | ❌ | ✅ |

---

## Payment Implementation

### Stripe Integration

#### Product IDs (Configure in Stripe Dashboard)
```javascript
PRICING = {
  monthly: {
    price: 4.99,
    stripeProductId: 'price_monthly_4_99', // Replace with actual Stripe Price ID
  },
  annual: {
    price: 49.99,
    stripeProductId: 'price_annual_49_99', // Replace with actual Stripe Price ID
  },
}
```

#### Stripe Setup Steps
1. Create Stripe account: https://dashboard.stripe.com
2. Create two products:
   - **Swimily Premium Monthly** - $4.99/month recurring
   - **Swimily Premium Annual** - $49.99/year recurring
3. Copy the Price IDs to `.env`:
   ```bash
   STRIPE_MONTHLY_PRICE_ID=price_xxxxxxxxxxxxx
   STRIPE_ANNUAL_PRICE_ID=price_xxxxxxxxxxxxx
   ```
4. Set up webhook endpoint: `https://api.swimily.app/webhook/stripe`
5. Add webhook events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

#### Backend Webhook Handler
```typescript
// /api/webhook/stripe
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handleStripeWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await activatePremium(session.customer, session.subscription);
      break;
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await deactivatePremium(subscription.customer);
      break;
      
    case 'invoice.payment_failed':
      const invoice = event.data.object;
      await handlePaymentFailure(invoice.customer);
      break;
  }
  
  res.json({ received: true });
}
```

---

## Trial Period (Optional)

### 7-Day Free Trial
- Users can try Premium for 7 days free
- Full access to all Premium features
- No credit card required (or required but not charged)
- Auto-converts to paid after 7 days (if card provided)

**Implementation:**
```typescript
PRICING = {
  monthly: {
    price: 4.99,
    trialDays: 7,
    stripeProductId: 'price_monthly_4_99',
  },
  annual: {
    price: 49.99,
    trialDays: 7,
    stripeProductId: 'price_annual_49_99',
  },
}
```

---

## Upgrade Flow

### Frontend Flow
1. User clicks "Upgrade to Premium" button
2. Show pricing modal with Monthly/Annual options
3. Redirect to Stripe Checkout with selected price ID
4. Stripe handles payment securely
5. Webhook activates Premium status in database
6. User redirected back to app with success message

### Backend Database Update
```sql
-- After successful payment
UPDATE users
SET 
  is_premium = true,
  premium_expires_at = NOW() + INTERVAL '1 month', -- or '1 year' for annual
  stripe_customer_id = 'cus_xxxxxxxxxxxxx',
  stripe_subscription_id = 'sub_xxxxxxxxxxxxx'
WHERE id = 'user_id';
```

---

## Cancellation Policy

### User-Friendly Cancellation
- Cancel anytime from Profile → Manage Subscription
- Access continues until end of billing period
- No refunds for partial months/years
- Can re-subscribe anytime

### Cancellation Flow
1. User clicks "Cancel Subscription"
2. Show cancellation survey (optional feedback)
3. Confirm cancellation
4. API call to Stripe to cancel subscription
5. Update database: `premium_expires_at = end_of_billing_period`
6. Premium features remain active until expiry date
7. Send confirmation email

---

## Refund Policy

### Standard Policy
- **7-day money-back guarantee** on first purchase
- No questions asked refund within 7 days
- Refunds issued to original payment method
- After 7 days: No refunds, but can cancel anytime

### Refund Implementation
```typescript
// Backend refund handler
async function processRefund(userId: string) {
  const user = await db.users.findUnique({ where: { id: userId } });
  
  // Check if within 7-day window
  const purchaseDate = user.premium_started_at;
  const daysSincePurchase = (Date.now() - purchaseDate) / (1000 * 60 * 60 * 24);
  
  if (daysSincePurchase > 7) {
    throw new Error('Refund window expired');
  }
  
  // Process refund via Stripe
  await stripe.refunds.create({
    subscription: user.stripe_subscription_id,
  });
  
  // Deactivate premium
  await db.users.update({
    where: { id: userId },
    data: { is_premium: false, premium_expires_at: null },
  });
}
```

---

## Promotional Pricing (Future)

### Limited-Time Offers
- **Launch Special**: 50% off first year ($24.99/year)
- **Seasonal Sales**: Back-to-school, New Year discounts
- **Referral Bonuses**: 1 month free for referrer + referee
- **Team Discounts**: 20% off for 5+ swimmers

### Promo Code Implementation
```typescript
// Stripe Checkout with coupon
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price: PRICING.annual.stripeProductId,
    quantity: 1,
  }],
  mode: 'subscription',
  coupon: 'LAUNCH2026', // 50% off coupon
  success_url: 'https://swimily.app/success',
  cancel_url: 'https://swimily.app/upgrade',
});
```

---

## Revenue Projections

### Conservative Estimates (1,000 users)
- **Free users**: 900 (90%)
- **Premium users**: 100 (10% conversion)
- **Monthly revenue**: 100 × $4.99 = $499/month
- **Annual revenue**: ~$6,000/year

### Growth Target (10,000 users)
- **Free users**: 8,500 (85%)
- **Premium users**: 1,500 (15% conversion)
- **Monthly revenue**: 1,500 × $4.99 = $7,485/month
- **Annual revenue**: ~$90,000/year

---

## Tax & Legal

### Sales Tax
- Stripe Tax handles sales tax automatically (recommended)
- Enable in Stripe Dashboard → Tax Settings
- Automatically calculates tax based on customer location

### Terms of Service
- Premium subscription is auto-renewing
- Cancel anytime via Profile settings
- No refunds after 7-day window
- Premium features subject to change
- Fair use policy for AI generation (prevent abuse)

---

## Support

### Premium Support Benefits
- Priority email support (24-hour response)
- In-app chat support
- Direct access to development team
- Feature request priority

### Contact
- **Email**: support@swimily.app
- **Premium Support**: premium@swimily.app
- **Billing**: billing@swimily.app

---

## Pricing Changes

### Future Pricing Updates
- Current pricing locked for existing subscribers
- New subscribers pay updated price
- 30-day advance notice for price changes
- Existing users can keep old price if auto-renew active

**Last Updated**: March 22, 2026  
**Pricing Effective**: Launch Date
