<<<<<<< HEAD
# Troubleshooting - Stripe Demo Mode

## Pwoblèm: "Stripe is in demo mode" toujou parèt

### Solisyon Rapid

Mwen te ajoute cache busting nan `checkout.html`. Kounye a fè sa:

1. **Ouvri paj checkout la nan mod incognito**
   - Chrome: Ctrl + Shift + N
   - Edge: Ctrl + Shift + P
   - Firefox: Ctrl + Shift + P

2. **Oswa fè hard refresh**
   - Peze: **Ctrl + Shift + R**
   - Oswa: **Ctrl + F5**

### Verifye Konfigirasyon

Ouvri paj checkout la, peze **F12**, epi tape nan console:

```javascript
// 1. Verifye kle Stripe
CONFIG.STRIPE_PUBLISHABLE_KEY
// Dwe retounen: "pk_live_51SjGATPfMGeEoaS2..."

// 2. Verifye Stripe library
window.Stripe
// Dwe retounen: function Stripe()

// 3. Teste Edge Function
fetch('https://uawbgdiafdxnrdnmyxpr.supabase.co/functions/v1/create-payment-intent', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhd2JnZGlhZmR4bnJkbm15eHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDE3MTAsImV4cCI6MjA4NzA3NzcxMH0._Mj3b4DQ2FQjcTaGNQ7BU_-093mKOyF48mdRluHShZY'
    },
    body: JSON.stringify({amount: 100, currency: 'usd', bookingId: 'test'})
}).then(r => r.json()).then(console.log)
```

### Rezilta Atandi

**Si tout bagay bon:**
- Kle Stripe: Montre kle live ou
- Stripe library: Montre `function Stripe()`
- Edge Function: Retounen `{clientSecret: "pi_...", paymentIntentId: "pi_..."}`

**Si gen pwoblèm:**

#### Erè: `CONFIG.STRIPE_PUBLISHABLE_KEY` retounen `""`
**Solisyon:**
- Verifye `src/js/config.js` liy 159
- Asire w ke kle a la: `STRIPE_PUBLISHABLE_KEY: 'pk_live_51SjGAT...'`
- Fè hard refresh (Ctrl + Shift + R)

#### Erè: `window.Stripe` retounen `undefined`
**Solisyon:**
- Verifye `checkout.html` liy 18
- Dwe gen: `<script src="https://js.stripe.com/v3/"></script>`
- Tcheke si ou gen koneksyon entènèt

#### Erè: Edge Function retounen "STRIPE_SECRET_KEY not configured"
**Solisyon:**
1. Ale sou: https://app.supabase.com/project/uawbgdiafdxnrdnmyxpr/settings/functions
2. Klike "Secrets" oswa "Environment Variables"
3. Ajoute:
   - **Non**: `STRIPE_SECRET_KEY`
   - **Valè**: Kle ki kòmanse ak `sk_live_...` (jwenn li sou dashboard.stripe.com/apikeys)
4. Redeplwaye fonksyon yo si nesesè

#### Erè: Edge Function retounen 404
**Solisyon:**
- Fonksyon yo pa deplwaye
- Ale sou: https://app.supabase.com/project/uawbgdiafdxnrdnmyxpr/functions
- Deplwaye `create-payment-intent` ak `stripe-webhook`

### Checklist Konplè

- [ ] Kle piblik Stripe konfigire nan `config.js`
- [ ] Edge Functions deplwaye nan Supabase
- [ ] Secret `STRIPE_SECRET_KEY` konfigire nan Supabase
- [ ] Webhook konfigire nan Stripe Dashboard
- [ ] Secret `STRIPE_WEBHOOK_SECRET` konfigire nan Supabase
- [ ] Cache navigatè efase (hard refresh oswa incognito)

### Kisa Dwe Parèt

Lè tout bagay konfigire kòrèkteman:

1. **Paj Checkout:**
   - Eleman kat Stripe dwe parèt (pa mesaj "demo mode")
   - Ou ka tape nimewo kat
   - Ou ka antre dat ak CVC

2. **Apre soumèt peman:**
   - Li dwe kreye yon payment intent
   - Li dwe konfime peman an
   - Booking status dwe chanje nan "confirmed"

### Kat Test

Pou teste:
- **Nimewo**: 4242 4242 4242 4242
- **Dat**: 12/34
- **CVC**: 123
- **Zip**: 12345

### Sipò

Si ou toujou gen pwoblèm apre tout sa:

1. Gade logs Edge Function:
   - https://app.supabase.com/project/uawbgdiafdxnrdnmyxpr/functions
   - Klike sou fonksyon → Logs

2. Gade webhook logs:
   - https://dashboard.stripe.com/webhooks
   - Klike sou webhook ou → Events

3. Verifye table database:
   - https://app.supabase.com/project/uawbgdiafdxnrdnmyxpr/editor
   - Gade table `payments` ak `bookings`
=======
# Troubleshooting - Stripe Demo Mode

## Pwoblèm: "Stripe is in demo mode" toujou parèt

### Solisyon Rapid

Mwen te ajoute cache busting nan `checkout.html`. Kounye a fè sa:

1. **Ouvri paj checkout la nan mod incognito**
   - Chrome: Ctrl + Shift + N
   - Edge: Ctrl + Shift + P
   - Firefox: Ctrl + Shift + P

2. **Oswa fè hard refresh**
   - Peze: **Ctrl + Shift + R**
   - Oswa: **Ctrl + F5**

### Verifye Konfigirasyon

Ouvri paj checkout la, peze **F12**, epi tape nan console:

```javascript
// 1. Verifye kle Stripe
CONFIG.STRIPE_PUBLISHABLE_KEY
// Dwe retounen: "pk_live_51SjGATPfMGeEoaS2..."

// 2. Verifye Stripe library
window.Stripe
// Dwe retounen: function Stripe()

// 3. Teste Edge Function
fetch('https://uawbgdiafdxnrdnmyxpr.supabase.co/functions/v1/create-payment-intent', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhd2JnZGlhZmR4bnJkbm15eHByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MDE3MTAsImV4cCI6MjA4NzA3NzcxMH0._Mj3b4DQ2FQjcTaGNQ7BU_-093mKOyF48mdRluHShZY'
    },
    body: JSON.stringify({amount: 100, currency: 'usd', bookingId: 'test'})
}).then(r => r.json()).then(console.log)
```

### Rezilta Atandi

**Si tout bagay bon:**
- Kle Stripe: Montre kle live ou
- Stripe library: Montre `function Stripe()`
- Edge Function: Retounen `{clientSecret: "pi_...", paymentIntentId: "pi_..."}`

**Si gen pwoblèm:**

#### Erè: `CONFIG.STRIPE_PUBLISHABLE_KEY` retounen `""`
**Solisyon:**
- Verifye `src/js/config.js` liy 159
- Asire w ke kle a la: `STRIPE_PUBLISHABLE_KEY: 'pk_live_51SjGAT...'`
- Fè hard refresh (Ctrl + Shift + R)

#### Erè: `window.Stripe` retounen `undefined`
**Solisyon:**
- Verifye `checkout.html` liy 18
- Dwe gen: `<script src="https://js.stripe.com/v3/"></script>`
- Tcheke si ou gen koneksyon entènèt

#### Erè: Edge Function retounen "STRIPE_SECRET_KEY not configured"
**Solisyon:**
1. Ale sou: https://app.supabase.com/project/uawbgdiafdxnrdnmyxpr/settings/functions
2. Klike "Secrets" oswa "Environment Variables"
3. Ajoute:
   - **Non**: `STRIPE_SECRET_KEY`
   - **Valè**: Kle ki kòmanse ak `sk_live_...` (jwenn li sou dashboard.stripe.com/apikeys)
4. Redeplwaye fonksyon yo si nesesè

#### Erè: Edge Function retounen 404
**Solisyon:**
- Fonksyon yo pa deplwaye
- Ale sou: https://app.supabase.com/project/uawbgdiafdxnrdnmyxpr/functions
- Deplwaye `create-payment-intent` ak `stripe-webhook`

### Checklist Konplè

- [ ] Kle piblik Stripe konfigire nan `config.js`
- [ ] Edge Functions deplwaye nan Supabase
- [ ] Secret `STRIPE_SECRET_KEY` konfigire nan Supabase
- [ ] Webhook konfigire nan Stripe Dashboard
- [ ] Secret `STRIPE_WEBHOOK_SECRET` konfigire nan Supabase
- [ ] Cache navigatè efase (hard refresh oswa incognito)

### Kisa Dwe Parèt

Lè tout bagay konfigire kòrèkteman:

1. **Paj Checkout:**
   - Eleman kat Stripe dwe parèt (pa mesaj "demo mode")
   - Ou ka tape nimewo kat
   - Ou ka antre dat ak CVC

2. **Apre soumèt peman:**
   - Li dwe kreye yon payment intent
   - Li dwe konfime peman an
   - Booking status dwe chanje nan "confirmed"

### Kat Test

Pou teste:
- **Nimewo**: 4242 4242 4242 4242
- **Dat**: 12/34
- **CVC**: 123
- **Zip**: 12345

### Sipò

Si ou toujou gen pwoblèm apre tout sa:

1. Gade logs Edge Function:
   - https://app.supabase.com/project/uawbgdiafdxnrdnmyxpr/functions
   - Klike sou fonksyon → Logs

2. Gade webhook logs:
   - https://dashboard.stripe.com/webhooks
   - Klike sou webhook ou → Events

3. Verifye table database:
   - https://app.supabase.com/project/uawbgdiafdxnrdnmyxpr/editor
   - Gade table `payments` ak `bookings`
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
