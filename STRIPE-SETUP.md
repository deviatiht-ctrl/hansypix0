<<<<<<< HEAD
# Configuration Stripe pour HANSYPIX

Ce guide explique comment configurer les paiements Stripe réels avec Supabase Edge Functions.

## Prérequis

1. Un compte Stripe (https://dashboard.stripe.com)
2. Supabase CLI installé (https://supabase.com/docs/guides/cli)
3. Un projet Supabase configuré

## Étape 1: Obtenir les clés API Stripe

1. Connectez-vous à votre tableau de bord Stripe: https://dashboard.stripe.com
2. Allez dans **Developers** > **API keys**
3. Copiez votre **Publishable key** (commence par `pk_test_` ou `pk_live_`)
4. Copiez votre **Secret key** (commence par `sk_test_` ou `sk_live_`)

⚠️ **Important**: Utilisez les clés de test (`pk_test_` et `sk_test_`) pour le développement.

## Étape 2: Configurer la clé publique Stripe dans le frontend

Ouvrez `src/js/config.js` et ajoutez:

```javascript
const CONFIG = {
    // ... autres configurations
    STRIPE_PUBLISHABLE_KEY: 'pk_test_votre_cle_publique_ici',
    // ...
};
```

## Étape 3: Déployer les Edge Functions

### 3.1 Installer Supabase CLI

```bash
# Windows (PowerShell)
scoop install supabase

# macOS
brew install supabase/tap/supabase

# Linux
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
```

### 3.2 Se connecter à Supabase

```bash
supabase login
```

### 3.3 Lier votre projet

```bash
cd c:\Users\HACKER\Pictures\hansypix
supabase link --project-ref votre-project-ref
```

Trouvez votre `project-ref` dans l'URL de votre projet Supabase:
`https://app.supabase.com/project/[VOTRE-PROJECT-REF]`

### 3.4 Configurer les secrets

```bash
# Définir la clé secrète Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_votre_cle_secrete

# Définir le secret webhook (voir Étape 4)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
```

### 3.5 Déployer les fonctions

```bash
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
```

## Étape 4: Configurer le Webhook Stripe

1. Allez dans **Developers** > **Webhooks** dans votre tableau de bord Stripe
2. Cliquez sur **Add endpoint**
3. Entrez l'URL du webhook:
   ```
   https://[VOTRE-PROJECT-REF].supabase.co/functions/v1/stripe-webhook
   ```
4. Sélectionnez les événements à écouter:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Cliquez sur **Add endpoint**
6. Copiez le **Signing secret** (commence par `whsec_`)
7. Configurez-le avec:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_votre_signing_secret
   ```

## Étape 5: Tester les paiements

### Cartes de test Stripe

Utilisez ces numéros de carte pour tester:

- **Succès**: `4242 4242 4242 4242`
- **Échec**: `4000 0000 0000 0002`
- **Authentification requise**: `4000 0025 0000 3155`

**Date d'expiration**: N'importe quelle date future (ex: 12/25)
**CVC**: N'importe quel 3 chiffres (ex: 123)
**Code postal**: N'importe quel code (ex: 12345)

### Vérifier les paiements

1. Dans votre tableau de bord Stripe: **Payments** > **All payments**
2. Dans Supabase: Table `payments` pour voir les enregistrements
3. Dans Supabase: Table `bookings` pour voir les statuts mis à jour

## Étape 6: Passer en production

Quand vous êtes prêt pour la production:

1. Obtenez vos clés live de Stripe (`pk_live_` et `sk_live_`)
2. Mettez à jour `CONFIG.STRIPE_PUBLISHABLE_KEY` avec la clé live
3. Mettez à jour les secrets Supabase:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_votre_cle_live
   ```
4. Créez un nouveau webhook avec l'URL de production
5. Mettez à jour le secret webhook:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_votre_nouveau_secret
   ```

## Dépannage

### Erreur: "STRIPE_SECRET_KEY not configured"
- Vérifiez que vous avez défini le secret avec `supabase secrets set`
- Redéployez la fonction après avoir défini les secrets

### Erreur: "Webhook signature verification failed"
- Vérifiez que `STRIPE_WEBHOOK_SECRET` correspond au signing secret du webhook
- Assurez-vous que l'URL du webhook est correcte

### Les paiements restent en "pending"
- Vérifiez que le webhook est configuré et actif
- Consultez les logs du webhook dans Stripe Dashboard
- Vérifiez les logs Edge Function: `supabase functions logs stripe-webhook`

### Mode démo toujours actif
- Vérifiez que `STRIPE_PUBLISHABLE_KEY` est défini dans `config.js`
- Vérifiez que la clé commence par `pk_test_` ou `pk_live_`
- Rechargez complètement la page (Ctrl+Shift+R)

## Logs et monitoring

### Voir les logs des Edge Functions

```bash
# Logs de création de payment intent
supabase functions logs create-payment-intent

# Logs du webhook
supabase functions logs stripe-webhook
```

### Tester localement

```bash
# Démarrer les fonctions localement
supabase functions serve

# Tester create-payment-intent
curl -i --location --request POST 'http://localhost:54321/functions/v1/create-payment-intent' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"amount":100,"currency":"usd","bookingId":"test-123"}'
```

## Support

- Documentation Stripe: https://stripe.com/docs
- Documentation Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Dashboard Stripe: https://dashboard.stripe.com
- Dashboard Supabase: https://app.supabase.com

## Sécurité

⚠️ **Ne jamais commiter les clés secrètes dans Git**
- Les clés secrètes doivent rester dans les secrets Supabase
- Les clés publiques peuvent être dans le code frontend
- Utilisez `.env.example` comme template, pas `.env` avec de vraies clés
=======
# Configuration Stripe pour HANSYPIX

Ce guide explique comment configurer les paiements Stripe réels avec Supabase Edge Functions.

## Prérequis

1. Un compte Stripe (https://dashboard.stripe.com)
2. Supabase CLI installé (https://supabase.com/docs/guides/cli)
3. Un projet Supabase configuré

## Étape 1: Obtenir les clés API Stripe

1. Connectez-vous à votre tableau de bord Stripe: https://dashboard.stripe.com
2. Allez dans **Developers** > **API keys**
3. Copiez votre **Publishable key** (commence par `pk_test_` ou `pk_live_`)
4. Copiez votre **Secret key** (commence par `sk_test_` ou `sk_live_`)

⚠️ **Important**: Utilisez les clés de test (`pk_test_` et `sk_test_`) pour le développement.

## Étape 2: Configurer la clé publique Stripe dans le frontend

Ouvrez `src/js/config.js` et ajoutez:

```javascript
const CONFIG = {
    // ... autres configurations
    STRIPE_PUBLISHABLE_KEY: 'pk_test_votre_cle_publique_ici',
    // ...
};
```

## Étape 3: Déployer les Edge Functions

### 3.1 Installer Supabase CLI

```bash
# Windows (PowerShell)
scoop install supabase

# macOS
brew install supabase/tap/supabase

# Linux
curl -fsSL https://raw.githubusercontent.com/supabase/cli/main/install.sh | sh
```

### 3.2 Se connecter à Supabase

```bash
supabase login
```

### 3.3 Lier votre projet

```bash
cd c:\Users\HACKER\Pictures\hansypix
supabase link --project-ref votre-project-ref
```

Trouvez votre `project-ref` dans l'URL de votre projet Supabase:
`https://app.supabase.com/project/[VOTRE-PROJECT-REF]`

### 3.4 Configurer les secrets

```bash
# Définir la clé secrète Stripe
supabase secrets set STRIPE_SECRET_KEY=sk_test_votre_cle_secrete

# Définir le secret webhook (voir Étape 4)
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_secret
```

### 3.5 Déployer les fonctions

```bash
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
```

## Étape 4: Configurer le Webhook Stripe

1. Allez dans **Developers** > **Webhooks** dans votre tableau de bord Stripe
2. Cliquez sur **Add endpoint**
3. Entrez l'URL du webhook:
   ```
   https://[VOTRE-PROJECT-REF].supabase.co/functions/v1/stripe-webhook
   ```
4. Sélectionnez les événements à écouter:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Cliquez sur **Add endpoint**
6. Copiez le **Signing secret** (commence par `whsec_`)
7. Configurez-le avec:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_votre_signing_secret
   ```

## Étape 5: Tester les paiements

### Cartes de test Stripe

Utilisez ces numéros de carte pour tester:

- **Succès**: `4242 4242 4242 4242`
- **Échec**: `4000 0000 0000 0002`
- **Authentification requise**: `4000 0025 0000 3155`

**Date d'expiration**: N'importe quelle date future (ex: 12/25)
**CVC**: N'importe quel 3 chiffres (ex: 123)
**Code postal**: N'importe quel code (ex: 12345)

### Vérifier les paiements

1. Dans votre tableau de bord Stripe: **Payments** > **All payments**
2. Dans Supabase: Table `payments` pour voir les enregistrements
3. Dans Supabase: Table `bookings` pour voir les statuts mis à jour

## Étape 6: Passer en production

Quand vous êtes prêt pour la production:

1. Obtenez vos clés live de Stripe (`pk_live_` et `sk_live_`)
2. Mettez à jour `CONFIG.STRIPE_PUBLISHABLE_KEY` avec la clé live
3. Mettez à jour les secrets Supabase:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_votre_cle_live
   ```
4. Créez un nouveau webhook avec l'URL de production
5. Mettez à jour le secret webhook:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_votre_nouveau_secret
   ```

## Dépannage

### Erreur: "STRIPE_SECRET_KEY not configured"
- Vérifiez que vous avez défini le secret avec `supabase secrets set`
- Redéployez la fonction après avoir défini les secrets

### Erreur: "Webhook signature verification failed"
- Vérifiez que `STRIPE_WEBHOOK_SECRET` correspond au signing secret du webhook
- Assurez-vous que l'URL du webhook est correcte

### Les paiements restent en "pending"
- Vérifiez que le webhook est configuré et actif
- Consultez les logs du webhook dans Stripe Dashboard
- Vérifiez les logs Edge Function: `supabase functions logs stripe-webhook`

### Mode démo toujours actif
- Vérifiez que `STRIPE_PUBLISHABLE_KEY` est défini dans `config.js`
- Vérifiez que la clé commence par `pk_test_` ou `pk_live_`
- Rechargez complètement la page (Ctrl+Shift+R)

## Logs et monitoring

### Voir les logs des Edge Functions

```bash
# Logs de création de payment intent
supabase functions logs create-payment-intent

# Logs du webhook
supabase functions logs stripe-webhook
```

### Tester localement

```bash
# Démarrer les fonctions localement
supabase functions serve

# Tester create-payment-intent
curl -i --location --request POST 'http://localhost:54321/functions/v1/create-payment-intent' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"amount":100,"currency":"usd","bookingId":"test-123"}'
```

## Support

- Documentation Stripe: https://stripe.com/docs
- Documentation Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Dashboard Stripe: https://dashboard.stripe.com
- Dashboard Supabase: https://app.supabase.com

## Sécurité

⚠️ **Ne jamais commiter les clés secrètes dans Git**
- Les clés secrètes doivent rester dans les secrets Supabase
- Les clés publiques peuvent être dans le code frontend
- Utilisez `.env.example` comme template, pas `.env` avec de vraies clés
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
