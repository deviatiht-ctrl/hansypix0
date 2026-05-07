<<<<<<< HEAD
# Instructions pou Deplwaye Edge Functions

## Etap 1: Enstale Supabase CLI

### Metòd 1: Telechaje Direkteman (Rekòmande)

1. Ale sou: https://github.com/supabase/cli/releases/latest
2. Telechaje: `supabase_windows_amd64.zip`
3. Ekstrè fichye zip la
4. Deplase `supabase.exe` nan yon dosye (pa egzanp: `C:\Program Files\Supabase\`)
5. Ajoute dosye a nan PATH:
   - Klike dwat sou "This PC" → Properties
   - Advanced system settings → Environment Variables
   - Nan "System variables", chwazi "Path" → Edit
   - Klike "New" epi ajoute: `C:\Program Files\Supabase\`
   - Klike OK pou tout fenèt yo
6. Ouvri yon nouvo PowerShell epi teste:
   ```powershell
   supabase --version
   ```

### Metòd 2: Ak Scoop (Si ou gen Scoop)

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Metòd 3: Ak Chocolatey (Si ou gen Chocolatey)

```powershell
choco install supabase
```

## Etap 2: Konekte ak Supabase

```powershell
# Navige nan dosye pwojè a
cd c:\Users\HACKER\Pictures\hansypix

# Konekte ak Supabase
supabase login
```

Sa ap ouvri navigatè ou pou ou konekte. Apre sa, kopye access token an epi kole l nan terminal la.

## Etap 3: Lye Pwojè a

Ou bezwen jwenn `project-ref` ou. Li nan URL Supabase ou:
```
https://app.supabase.com/project/[PROJECT_REF]
```

Oswa nan Settings → General → Reference ID

Lè ou gen li:

```powershell
supabase link --project-ref VOTRE_PROJECT_REF
```

Ranplase `VOTRE_PROJECT_REF` ak referans pwojè ou (pa egzanp: `uawbgdiafdxnrdnmyxpr`)

## Etap 4: Konfigire Secrets Stripe

Ou bezwen kle sekrèt Stripe ou (pa kle piblik la). Ale sou:
https://dashboard.stripe.com/apikeys

Kopye **Secret key** (kòmanse ak `sk_live_...`)

Epi konfigire li:

```powershell
supabase secrets set STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE_ICI
```

⚠️ **ENPÒTAN**: Pa mete kle piblik la (pk_live_...), mete kle sekrèt la (sk_live_...)

## Etap 5: Deplwaye Edge Functions

```powershell
# Deplwaye fonksyon pou kreye payment intents
supabase functions deploy create-payment-intent

# Deplwaye fonksyon webhook
supabase functions deploy stripe-webhook
```

## Etap 6: Konfigire Webhook Stripe

1. Ale sou: https://dashboard.stripe.com/webhooks
2. Klike "Add endpoint"
3. Antre URL webhook la:
   ```
   https://[VOTRE_PROJECT_REF].supabase.co/functions/v1/stripe-webhook
   ```
   Ranplase `[VOTRE_PROJECT_REF]` ak referans pwojè ou

4. Chwazi events yo:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`

5. Klike "Add endpoint"

6. Kopye **Signing secret** (kòmanse ak `whsec_...`)

7. Konfigire li:
   ```powershell
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SIGNING_SECRET
   ```

## Etap 7: Verifye Deployman

```powershell
# Gade lis fonksyon yo
supabase functions list

# Gade logs pou create-payment-intent
supabase functions logs create-payment-intent

# Gade logs pou stripe-webhook
supabase functions logs stripe-webhook
```

## Teste Peman

1. Ale sou sit ou → Pricing → Book a Session
2. Ranpli fòmilè a
3. Itilize kat test Stripe:
   - **Nimewo**: 4242 4242 4242 4242
   - **Dat**: 12/34
   - **CVC**: 123

4. Verifye nan:
   - Stripe Dashboard → Payments
   - Supabase → Table `payments`
   - Supabase → Table `bookings`

## Depanaj

### Erè: "supabase: command not found"
→ Asire w ke ou te ajoute Supabase nan PATH epi ouvri yon nouvo terminal

### Erè: "Failed to link project"
→ Verifye ke project-ref la kòrèk epi ke ou konekte ak bon kont Supabase

### Erè: "STRIPE_SECRET_KEY not configured"
→ Konfigire secret la ankò:
```powershell
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
```

### Peman rete nan "pending"
→ Verifye webhook la nan Stripe Dashboard
→ Gade logs: `supabase functions logs stripe-webhook`

## Kòmand Itil

```powershell
# Gade tout secrets
supabase secrets list

# Efase yon secret
supabase secrets unset SECRET_NAME

# Redeplwaye yon fonksyon
supabase functions deploy create-payment-intent --no-verify-jwt

# Gade status pwojè
supabase status

# Dekonekte
supabase logout
```

## Enfòmasyon Enpòtan

**Kle ou te ajoute nan config.js:**
```javascript
STRIPE_PUBLISHABLE_KEY: 'pk_live_51SjGATPfMGeEoaS24lW7T63RhGkfY7INpyqwE3KIGyZJUPcnVNvlgGjrrAFki454u2QXjP51fHlidxt2m2TrtfrT008KRkgBvn'
```

**Kle sekrèt ou bezwen (pa pataje li):**
- Ale sou https://dashboard.stripe.com/apikeys
- Kopye kle ki kòmanse ak `sk_live_...`
- Itilize li nan `supabase secrets set`

**Project Ref ou:**
- Jwenn li nan: https://app.supabase.com/project/[PROJECT_REF]
- Oswa Settings → General → Reference ID
- Li sanble ak: `uawbgdiafdxnrdnmyxpr`

## Sipò

Si ou gen pwoblèm, gade:
- STRIPE-SETUP.md - Gid konplè
- STRIPE-QUICK-START.md - Gid rapid
- https://supabase.com/docs/guides/functions
- https://stripe.com/docs
=======
# Instructions pou Deplwaye Edge Functions

## Etap 1: Enstale Supabase CLI

### Metòd 1: Telechaje Direkteman (Rekòmande)

1. Ale sou: https://github.com/supabase/cli/releases/latest
2. Telechaje: `supabase_windows_amd64.zip`
3. Ekstrè fichye zip la
4. Deplase `supabase.exe` nan yon dosye (pa egzanp: `C:\Program Files\Supabase\`)
5. Ajoute dosye a nan PATH:
   - Klike dwat sou "This PC" → Properties
   - Advanced system settings → Environment Variables
   - Nan "System variables", chwazi "Path" → Edit
   - Klike "New" epi ajoute: `C:\Program Files\Supabase\`
   - Klike OK pou tout fenèt yo
6. Ouvri yon nouvo PowerShell epi teste:
   ```powershell
   supabase --version
   ```

### Metòd 2: Ak Scoop (Si ou gen Scoop)

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Metòd 3: Ak Chocolatey (Si ou gen Chocolatey)

```powershell
choco install supabase
```

## Etap 2: Konekte ak Supabase

```powershell
# Navige nan dosye pwojè a
cd c:\Users\HACKER\Pictures\hansypix

# Konekte ak Supabase
supabase login
```

Sa ap ouvri navigatè ou pou ou konekte. Apre sa, kopye access token an epi kole l nan terminal la.

## Etap 3: Lye Pwojè a

Ou bezwen jwenn `project-ref` ou. Li nan URL Supabase ou:
```
https://app.supabase.com/project/[PROJECT_REF]
```

Oswa nan Settings → General → Reference ID

Lè ou gen li:

```powershell
supabase link --project-ref VOTRE_PROJECT_REF
```

Ranplase `VOTRE_PROJECT_REF` ak referans pwojè ou (pa egzanp: `uawbgdiafdxnrdnmyxpr`)

## Etap 4: Konfigire Secrets Stripe

Ou bezwen kle sekrèt Stripe ou (pa kle piblik la). Ale sou:
https://dashboard.stripe.com/apikeys

Kopye **Secret key** (kòmanse ak `sk_live_...`)

Epi konfigire li:

```powershell
supabase secrets set STRIPE_SECRET_KEY=sk_live_VOTRE_CLE_SECRETE_ICI
```

⚠️ **ENPÒTAN**: Pa mete kle piblik la (pk_live_...), mete kle sekrèt la (sk_live_...)

## Etap 5: Deplwaye Edge Functions

```powershell
# Deplwaye fonksyon pou kreye payment intents
supabase functions deploy create-payment-intent

# Deplwaye fonksyon webhook
supabase functions deploy stripe-webhook
```

## Etap 6: Konfigire Webhook Stripe

1. Ale sou: https://dashboard.stripe.com/webhooks
2. Klike "Add endpoint"
3. Antre URL webhook la:
   ```
   https://[VOTRE_PROJECT_REF].supabase.co/functions/v1/stripe-webhook
   ```
   Ranplase `[VOTRE_PROJECT_REF]` ak referans pwojè ou

4. Chwazi events yo:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`

5. Klike "Add endpoint"

6. Kopye **Signing secret** (kòmanse ak `whsec_...`)

7. Konfigire li:
   ```powershell
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SIGNING_SECRET
   ```

## Etap 7: Verifye Deployman

```powershell
# Gade lis fonksyon yo
supabase functions list

# Gade logs pou create-payment-intent
supabase functions logs create-payment-intent

# Gade logs pou stripe-webhook
supabase functions logs stripe-webhook
```

## Teste Peman

1. Ale sou sit ou → Pricing → Book a Session
2. Ranpli fòmilè a
3. Itilize kat test Stripe:
   - **Nimewo**: 4242 4242 4242 4242
   - **Dat**: 12/34
   - **CVC**: 123

4. Verifye nan:
   - Stripe Dashboard → Payments
   - Supabase → Table `payments`
   - Supabase → Table `bookings`

## Depanaj

### Erè: "supabase: command not found"
→ Asire w ke ou te ajoute Supabase nan PATH epi ouvri yon nouvo terminal

### Erè: "Failed to link project"
→ Verifye ke project-ref la kòrèk epi ke ou konekte ak bon kont Supabase

### Erè: "STRIPE_SECRET_KEY not configured"
→ Konfigire secret la ankò:
```powershell
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
```

### Peman rete nan "pending"
→ Verifye webhook la nan Stripe Dashboard
→ Gade logs: `supabase functions logs stripe-webhook`

## Kòmand Itil

```powershell
# Gade tout secrets
supabase secrets list

# Efase yon secret
supabase secrets unset SECRET_NAME

# Redeplwaye yon fonksyon
supabase functions deploy create-payment-intent --no-verify-jwt

# Gade status pwojè
supabase status

# Dekonekte
supabase logout
```

## Enfòmasyon Enpòtan

**Kle ou te ajoute nan config.js:**
```javascript
STRIPE_PUBLISHABLE_KEY: 'pk_live_51SjGATPfMGeEoaS24lW7T63RhGkfY7INpyqwE3KIGyZJUPcnVNvlgGjrrAFki454u2QXjP51fHlidxt2m2TrtfrT008KRkgBvn'
```

**Kle sekrèt ou bezwen (pa pataje li):**
- Ale sou https://dashboard.stripe.com/apikeys
- Kopye kle ki kòmanse ak `sk_live_...`
- Itilize li nan `supabase secrets set`

**Project Ref ou:**
- Jwenn li nan: https://app.supabase.com/project/[PROJECT_REF]
- Oswa Settings → General → Reference ID
- Li sanble ak: `uawbgdiafdxnrdnmyxpr`

## Sipò

Si ou gen pwoblèm, gade:
- STRIPE-SETUP.md - Gid konplè
- STRIPE-QUICK-START.md - Gid rapid
- https://supabase.com/docs/guides/functions
- https://stripe.com/docs
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
