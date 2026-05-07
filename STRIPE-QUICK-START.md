<<<<<<< HEAD
# Guide Rapide - Configuration Stripe

## Résumé

Le système de paiement Stripe a été configuré avec:
- ✅ Mode démo retiré
- ✅ Intégration Stripe réelle avec API
- ✅ Supabase Edge Functions pour le backend sécurisé
- ✅ Webhooks pour les confirmations de paiement

## Configuration en 5 étapes

### 1. Obtenir les clés Stripe (2 minutes)

1. Allez sur https://dashboard.stripe.com/register
2. Créez un compte ou connectez-vous
3. Allez dans **Developers** → **API keys**
4. Copiez votre **Publishable key** (pk_test_...)
5. Copiez votre **Secret key** (sk_test_...)

### 2. Configurer le frontend (1 minute)

Ouvrez `src/js/config.js` et ajoutez votre clé publique:

```javascript
STRIPE_PUBLISHABLE_KEY: 'pk_test_VOTRE_CLE_ICI',
```

### 3. Installer Supabase CLI (3 minutes)

**Windows (PowerShell):**
```powershell
scoop install supabase
```

**Alternative - Téléchargement direct:**
https://github.com/supabase/cli/releases

### 4. Déployer les Edge Functions (5 minutes)

```bash
# Se connecter
supabase login

# Lier le projet
cd c:\Users\HACKER\Pictures\hansypix
supabase link --project-ref VOTRE_PROJECT_REF

# Configurer les secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE

# Déployer
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
```

**Trouver votre project-ref:**
Dans l'URL Supabase: `https://app.supabase.com/project/[PROJECT_REF]`

### 5. Configurer le Webhook (3 minutes)

1. Allez sur https://dashboard.stripe.com/webhooks
2. Cliquez **Add endpoint**
3. URL: `https://[PROJECT_REF].supabase.co/functions/v1/stripe-webhook`
4. Sélectionnez ces événements:
   - ✅ payment_intent.succeeded
   - ✅ payment_intent.payment_failed
   - ✅ charge.refunded
5. Copiez le **Signing secret** (whsec_...)
6. Configurez-le:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET
   ```

## Test rapide

### Cartes de test Stripe

**Paiement réussi:**
- Numéro: `4242 4242 4242 4242`
- Date: `12/34`
- CVC: `123`

**Paiement échoué:**
- Numéro: `4000 0000 0000 0002`

### Vérifier que ça marche

1. Allez sur votre site → Pricing → Book a Session
2. Remplissez le formulaire
3. Utilisez une carte de test
4. Vérifiez dans Stripe Dashboard → Payments
5. Vérifiez dans Supabase → Table `payments`

## Dépannage Express

**❌ "Stripe is in demo mode"**
→ Vérifiez que `STRIPE_PUBLISHABLE_KEY` est défini dans `config.js`

**❌ "Failed to create payment intent"**
→ Vérifiez que les Edge Functions sont déployées:
```bash
supabase functions list
```

**❌ Paiement reste en "pending"**
→ Vérifiez le webhook dans Stripe Dashboard → Webhooks
→ Logs: `supabase functions logs stripe-webhook`

**❌ "STRIPE_SECRET_KEY not configured"**
→ Redéfinissez le secret:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

## Fichiers créés

```
hansypix/
├── supabase/
│   ├── functions/
│   │   ├── create-payment-intent/
│   │   │   └── index.ts          # Crée les payment intents
│   │   └── stripe-webhook/
│   │       └── index.ts          # Gère les webhooks Stripe
│   ├── .env.example              # Template pour les variables
│   └── config.toml               # Config Edge Functions
├── src/
│   └── js/
│       ├── config.js             # ✏️ Ajoutez STRIPE_PUBLISHABLE_KEY ici
│       └── payments/
│           └── stripe.js         # ✅ Mis à jour (mode démo retiré)
└── STRIPE-SETUP.md               # Documentation complète
```

## Commandes utiles

```bash
# Voir les logs
supabase functions logs create-payment-intent
supabase functions logs stripe-webhook

# Lister les secrets
supabase secrets list

# Redéployer une fonction
supabase functions deploy create-payment-intent --no-verify-jwt

# Tester localement
supabase functions serve
```

## Production

Quand vous êtes prêt:

1. Obtenez les clés **live** (pk_live_... et sk_live_...)
2. Mettez à jour `config.js` avec pk_live_
3. Mettez à jour les secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   ```
4. Créez un nouveau webhook pour production
5. Testez avec de vraies cartes (petits montants)

## Support

- **Documentation complète:** `STRIPE-SETUP.md`
- **Stripe Docs:** https://stripe.com/docs
- **Supabase Docs:** https://supabase.com/docs/guides/functions
- **Test Cards:** https://stripe.com/docs/testing

---

**Note:** Les erreurs TypeScript dans les fichiers `.ts` sont normales - ces fichiers sont pour Deno (runtime Supabase), pas pour l'IDE local.
=======
# Guide Rapide - Configuration Stripe

## Résumé

Le système de paiement Stripe a été configuré avec:
- ✅ Mode démo retiré
- ✅ Intégration Stripe réelle avec API
- ✅ Supabase Edge Functions pour le backend sécurisé
- ✅ Webhooks pour les confirmations de paiement

## Configuration en 5 étapes

### 1. Obtenir les clés Stripe (2 minutes)

1. Allez sur https://dashboard.stripe.com/register
2. Créez un compte ou connectez-vous
3. Allez dans **Developers** → **API keys**
4. Copiez votre **Publishable key** (pk_test_...)
5. Copiez votre **Secret key** (sk_test_...)

### 2. Configurer le frontend (1 minute)

Ouvrez `src/js/config.js` et ajoutez votre clé publique:

```javascript
STRIPE_PUBLISHABLE_KEY: 'pk_test_VOTRE_CLE_ICI',
```

### 3. Installer Supabase CLI (3 minutes)

**Windows (PowerShell):**
```powershell
scoop install supabase
```

**Alternative - Téléchargement direct:**
https://github.com/supabase/cli/releases

### 4. Déployer les Edge Functions (5 minutes)

```bash
# Se connecter
supabase login

# Lier le projet
cd c:\Users\HACKER\Pictures\hansypix
supabase link --project-ref VOTRE_PROJECT_REF

# Configurer les secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_SECRETE

# Déployer
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
```

**Trouver votre project-ref:**
Dans l'URL Supabase: `https://app.supabase.com/project/[PROJECT_REF]`

### 5. Configurer le Webhook (3 minutes)

1. Allez sur https://dashboard.stripe.com/webhooks
2. Cliquez **Add endpoint**
3. URL: `https://[PROJECT_REF].supabase.co/functions/v1/stripe-webhook`
4. Sélectionnez ces événements:
   - ✅ payment_intent.succeeded
   - ✅ payment_intent.payment_failed
   - ✅ charge.refunded
5. Copiez le **Signing secret** (whsec_...)
6. Configurez-le:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET
   ```

## Test rapide

### Cartes de test Stripe

**Paiement réussi:**
- Numéro: `4242 4242 4242 4242`
- Date: `12/34`
- CVC: `123`

**Paiement échoué:**
- Numéro: `4000 0000 0000 0002`

### Vérifier que ça marche

1. Allez sur votre site → Pricing → Book a Session
2. Remplissez le formulaire
3. Utilisez une carte de test
4. Vérifiez dans Stripe Dashboard → Payments
5. Vérifiez dans Supabase → Table `payments`

## Dépannage Express

**❌ "Stripe is in demo mode"**
→ Vérifiez que `STRIPE_PUBLISHABLE_KEY` est défini dans `config.js`

**❌ "Failed to create payment intent"**
→ Vérifiez que les Edge Functions sont déployées:
```bash
supabase functions list
```

**❌ Paiement reste en "pending"**
→ Vérifiez le webhook dans Stripe Dashboard → Webhooks
→ Logs: `supabase functions logs stripe-webhook`

**❌ "STRIPE_SECRET_KEY not configured"**
→ Redéfinissez le secret:
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
```

## Fichiers créés

```
hansypix/
├── supabase/
│   ├── functions/
│   │   ├── create-payment-intent/
│   │   │   └── index.ts          # Crée les payment intents
│   │   └── stripe-webhook/
│   │       └── index.ts          # Gère les webhooks Stripe
│   ├── .env.example              # Template pour les variables
│   └── config.toml               # Config Edge Functions
├── src/
│   └── js/
│       ├── config.js             # ✏️ Ajoutez STRIPE_PUBLISHABLE_KEY ici
│       └── payments/
│           └── stripe.js         # ✅ Mis à jour (mode démo retiré)
└── STRIPE-SETUP.md               # Documentation complète
```

## Commandes utiles

```bash
# Voir les logs
supabase functions logs create-payment-intent
supabase functions logs stripe-webhook

# Lister les secrets
supabase secrets list

# Redéployer une fonction
supabase functions deploy create-payment-intent --no-verify-jwt

# Tester localement
supabase functions serve
```

## Production

Quand vous êtes prêt:

1. Obtenez les clés **live** (pk_live_... et sk_live_...)
2. Mettez à jour `config.js` avec pk_live_
3. Mettez à jour les secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   ```
4. Créez un nouveau webhook pour production
5. Testez avec de vraies cartes (petits montants)

## Support

- **Documentation complète:** `STRIPE-SETUP.md`
- **Stripe Docs:** https://stripe.com/docs
- **Supabase Docs:** https://supabase.com/docs/guides/functions
- **Test Cards:** https://stripe.com/docs/testing

---

**Note:** Les erreurs TypeScript dans les fichiers `.ts` sont normales - ces fichiers sont pour Deno (runtime Supabase), pas pour l'IDE local.
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
