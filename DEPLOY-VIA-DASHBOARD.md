<<<<<<< HEAD
# Deplwaye Edge Functions via Supabase Dashboard

## Metòd Pi Fasil - San CLI! 🎉

### Etap 1: Ale nan Supabase Dashboard

1. Konekte sou: **https://app.supabase.com**
2. Chwazi pwojè ou: **hansypix** (uawbgdiafdxnrdnmyxpr)
3. Nan menu gòch, klike sou **Edge Functions**

### Etap 2: Kreye Fonksyon "create-payment-intent"

1. Klike **Create a new function**
2. Non fonksyon: `create-payment-intent`
3. Nan editè kòd la, efase tout epi kopye-kole kòd sa a:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { amount, currency, bookingId, metadata } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: bookingId || '',
        ...metadata,
      },
    })

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
```

4. Klike **Deploy** oswa **Save**

### Etap 3: Kreye Fonksyon "stripe-webhook"

1. Klike **Create a new function** ankò
2. Non fonksyon: `stripe-webhook`
3. Nan editè kòd la, kopye-kole kòd sa a:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          await supabase
            .from('payments')
            .update({
              payment_status: 'completed',
              transaction_id: paymentIntent.id,
              payment_details: {
                amount_received: paymentIntent.amount_received,
                status: paymentIntent.status,
              },
            })
            .eq('booking_id', bookingId)
            .eq('payment_method', 'stripe')

          await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          await supabase
            .from('payments')
            .update({
              payment_status: 'failed',
              payment_details: {
                error: paymentIntent.last_payment_error?.message || 'Payment failed',
              },
            })
            .eq('booking_id', bookingId)
            .eq('payment_method', 'stripe')
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent

        if (paymentIntentId) {
          await supabase
            .from('payments')
            .update({
              payment_status: 'refunded',
              payment_details: {
                refunded: true,
                refund_amount: charge.amount_refunded,
              },
            })
            .eq('transaction_id', paymentIntentId)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

4. Klike **Deploy** oswa **Save**

### Etap 4: Konfigire Secrets (Variables Anviwònman)

1. Nan menu Edge Functions, klike sou **Settings** oswa **Secrets**
2. Ajoute secrets sa yo:

**STRIPE_SECRET_KEY:**
- Ale sou https://dashboard.stripe.com/apikeys
- Kopye kle ki kòmanse ak `sk_live_...`
- Kole li nan Supabase

**STRIPE_WEBHOOK_SECRET:**
- Nou pral jwenn sa nan etap 5

### Etap 5: Konfigire Webhook Stripe

1. Ale sou: **https://dashboard.stripe.com/webhooks**
2. Klike **Add endpoint**
3. Antre URL sa a:
   ```
   https://uawbgdiafdxnrdnmyxpr.supabase.co/functions/v1/stripe-webhook
   ```
4. Chwazi events yo:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
5. Klike **Add endpoint**
6. Kopye **Signing secret** (kòmanse ak `whsec_...`)
7. Retounen nan Supabase → Edge Functions → Secrets
8. Ajoute `STRIPE_WEBHOOK_SECRET` ak valè `whsec_...`

### Etap 6: Verifye Deployman

1. Nan Supabase Dashboard → Edge Functions
2. Ou dwe wè:
   - ✅ create-payment-intent (Active)
   - ✅ stripe-webhook (Active)

3. Klike sou chak fonksyon pou wè URL yo:
   - `https://uawbgdiafdxnrdnmyxpr.supabase.co/functions/v1/create-payment-intent`
   - `https://uawbgdiafdxnrdnmyxpr.supabase.co/functions/v1/stripe-webhook`

### Etap 7: Teste

1. Ale sou sit ou → **Pricing** → **Book a Session**
2. Ranpli fòmilè a
3. Itilize kat test Stripe:
   - **Nimewo**: 4242 4242 4242 4242
   - **Dat**: 12/34
   - **CVC**: 123

4. Verifye:
   - Stripe Dashboard → Payments (dwe wè peman an)
   - Supabase → Table Editor → `payments` (dwe wè record la)
   - Supabase → Table Editor → `bookings` (status dwe "confirmed")

## Depanaj

### Fonksyon pa deplwaye
- Verifye ke ou te klike "Deploy" apre kopye kòd la
- Gade logs nan Edge Functions → [Fonksyon] → Logs

### Erè "STRIPE_SECRET_KEY not configured"
- Verifye ke ou te ajoute secret la nan Settings → Secrets
- Asire w ke non an egzakteman: `STRIPE_SECRET_KEY`

### Peman rete nan "pending"
- Verifye webhook la nan Stripe Dashboard → Webhooks
- Gade si li aktif (enabled)
- Verifye URL webhook la kòrèk
- Gade logs webhook la nan Stripe

### Webhook pa travay
- Verifye `STRIPE_WEBHOOK_SECRET` konfigire kòrèkteman
- Asire w ke events yo chwazi: payment_intent.succeeded, etc.

## Avantaj Metòd Dashboard

✅ Pa bezwen enstale CLI  
✅ Editè kòd dirèkteman nan navigatè  
✅ Deplwaye ak yon klik  
✅ Wè logs an tan reyèl  
✅ Jere secrets fasilman  

## Enfòmasyon Ou Gen Deja

**Kle Piblik Stripe (deja konfigire):**
```javascript
STRIPE_PUBLISHABLE_KEY: 'pk_live_51SjGATPfMGeEoaS24lW7T63RhGkfY7INpyqwE3KIGyZJUPcnVNvlgGjrrAFki454u2QXjP51fHlidxt2m2TrtfrT008KRkgBvn'
```

**Project Ref:**
```
uawbgdiafdxnrdnmyxpr
```

**URL Webhook:**
```
https://uawbgdiafdxnrdnmyxpr.supabase.co/functions/v1/stripe-webhook
```

Bon chans! 🚀
=======
# Deplwaye Edge Functions via Supabase Dashboard

## Metòd Pi Fasil - San CLI! 🎉

### Etap 1: Ale nan Supabase Dashboard

1. Konekte sou: **https://app.supabase.com**
2. Chwazi pwojè ou: **hansypix** (uawbgdiafdxnrdnmyxpr)
3. Nan menu gòch, klike sou **Edge Functions**

### Etap 2: Kreye Fonksyon "create-payment-intent"

1. Klike **Create a new function**
2. Non fonksyon: `create-payment-intent`
3. Nan editè kòd la, efase tout epi kopye-kole kòd sa a:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { amount, currency, bookingId, metadata } = await req.json()

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency || 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: bookingId || '',
        ...metadata,
      },
    })

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
```

4. Klike **Deploy** oswa **Save**

### Etap 3: Kreye Fonksyon "stripe-webhook"

1. Klike **Create a new function** ankò
2. Non fonksyon: `stripe-webhook`
3. Nan editè kòd la, kopye-kole kòd sa a:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or webhook secret', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          await supabase
            .from('payments')
            .update({
              payment_status: 'completed',
              transaction_id: paymentIntent.id,
              payment_details: {
                amount_received: paymentIntent.amount_received,
                status: paymentIntent.status,
              },
            })
            .eq('booking_id', bookingId)
            .eq('payment_method', 'stripe')

          await supabase
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', bookingId)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const bookingId = paymentIntent.metadata.bookingId

        if (bookingId) {
          await supabase
            .from('payments')
            .update({
              payment_status: 'failed',
              payment_details: {
                error: paymentIntent.last_payment_error?.message || 'Payment failed',
              },
            })
            .eq('booking_id', bookingId)
            .eq('payment_method', 'stripe')
        }
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        const paymentIntentId = charge.payment_intent

        if (paymentIntentId) {
          await supabase
            .from('payments')
            .update({
              payment_status: 'refunded',
              payment_details: {
                refunded: true,
                refund_amount: charge.amount_refunded,
              },
            })
            .eq('transaction_id', paymentIntentId)
        }
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

4. Klike **Deploy** oswa **Save**

### Etap 4: Konfigire Secrets (Variables Anviwònman)

1. Nan menu Edge Functions, klike sou **Settings** oswa **Secrets**
2. Ajoute secrets sa yo:

**STRIPE_SECRET_KEY:**
- Ale sou https://dashboard.stripe.com/apikeys
- Kopye kle ki kòmanse ak `sk_live_...`
- Kole li nan Supabase

**STRIPE_WEBHOOK_SECRET:**
- Nou pral jwenn sa nan etap 5

### Etap 5: Konfigire Webhook Stripe

1. Ale sou: **https://dashboard.stripe.com/webhooks**
2. Klike **Add endpoint**
3. Antre URL sa a:
   ```
   https://uawbgdiafdxnrdnmyxpr.supabase.co/functions/v1/stripe-webhook
   ```
4. Chwazi events yo:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
5. Klike **Add endpoint**
6. Kopye **Signing secret** (kòmanse ak `whsec_...`)
7. Retounen nan Supabase → Edge Functions → Secrets
8. Ajoute `STRIPE_WEBHOOK_SECRET` ak valè `whsec_...`

### Etap 6: Verifye Deployman

1. Nan Supabase Dashboard → Edge Functions
2. Ou dwe wè:
   - ✅ create-payment-intent (Active)
   - ✅ stripe-webhook (Active)

3. Klike sou chak fonksyon pou wè URL yo:
   - `https://uawbgdiafdxnrdnmyxpr.supabase.co/functions/v1/create-payment-intent`
   - `https://uawbgdiafdxnrdnmyxpr.supabase.co/functions/v1/stripe-webhook`

### Etap 7: Teste

1. Ale sou sit ou → **Pricing** → **Book a Session**
2. Ranpli fòmilè a
3. Itilize kat test Stripe:
   - **Nimewo**: 4242 4242 4242 4242
   - **Dat**: 12/34
   - **CVC**: 123

4. Verifye:
   - Stripe Dashboard → Payments (dwe wè peman an)
   - Supabase → Table Editor → `payments` (dwe wè record la)
   - Supabase → Table Editor → `bookings` (status dwe "confirmed")

## Depanaj

### Fonksyon pa deplwaye
- Verifye ke ou te klike "Deploy" apre kopye kòd la
- Gade logs nan Edge Functions → [Fonksyon] → Logs

### Erè "STRIPE_SECRET_KEY not configured"
- Verifye ke ou te ajoute secret la nan Settings → Secrets
- Asire w ke non an egzakteman: `STRIPE_SECRET_KEY`

### Peman rete nan "pending"
- Verifye webhook la nan Stripe Dashboard → Webhooks
- Gade si li aktif (enabled)
- Verifye URL webhook la kòrèk
- Gade logs webhook la nan Stripe

### Webhook pa travay
- Verifye `STRIPE_WEBHOOK_SECRET` konfigire kòrèkteman
- Asire w ke events yo chwazi: payment_intent.succeeded, etc.

## Avantaj Metòd Dashboard

✅ Pa bezwen enstale CLI  
✅ Editè kòd dirèkteman nan navigatè  
✅ Deplwaye ak yon klik  
✅ Wè logs an tan reyèl  
✅ Jere secrets fasilman  

## Enfòmasyon Ou Gen Deja

**Kle Piblik Stripe (deja konfigire):**
```javascript
STRIPE_PUBLISHABLE_KEY: 'pk_live_51SjGATPfMGeEoaS24lW7T63RhGkfY7INpyqwE3KIGyZJUPcnVNvlgGjrrAFki454u2QXjP51fHlidxt2m2TrtfrT008KRkgBvn'
```

**Project Ref:**
```
uawbgdiafdxnrdnmyxpr
```

**URL Webhook:**
```
https://uawbgdiafdxnrdnmyxpr.supabase.co/functions/v1/stripe-webhook
```

Bon chans! 🚀
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
