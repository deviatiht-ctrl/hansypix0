<<<<<<< HEAD
# 🚀 GUIDE D'INSTALLATION HANSYPIX

## Étape 1: Configuration Supabase ✅ (FAIT)

Vous avez déjà configuré vos credentials dans `/src/supabase/config.js`

## Étape 2: Créer les Tables de Base de Données

### Dans Supabase Dashboard → SQL Editor:

**Exécutez dans cet ordre:**

1. **`schema.sql`** - Crée toutes les tables
2. **`storage-buckets-only.sql`** - Crée les buckets de stockage
3. **`policies.sql`** - Configure la sécurité RLS
4. **`seed.sql`** (optionnel) - Données de test

---

## Étape 3: Configurer Storage Policies (IMPORTANT)

Les politiques de stockage doivent être créées via l'interface Supabase:

### 📦 Pour chaque bucket (portfolio, videos, avatars):

1. Allez dans **Storage** → Sélectionnez le bucket
2. Cliquez sur **Policies** → **New Policy**

#### Policy 1: Public Read
```
Operation: SELECT
Policy name: Public can view
Target roles: public
USING expression: true
```

#### Policy 2: Authenticated Upload
```
Operation: INSERT
Policy name: Authenticated can upload
Target roles: authenticated
WITH CHECK expression: true
```

#### Policy 3: Authenticated Update
```
Operation: UPDATE
Policy name: Authenticated can update
Target roles: authenticated
USING expression: true
```

#### Policy 4: Authenticated Delete
```
Operation: DELETE
Policy name: Authenticated can delete
Target roles: authenticated
USING expression: true
```

---

## Étape 4: Configurer l'Email Admin

Éditez `/src/js/config.js`:

```javascript
ADMIN_EMAIL: 'votre-email@example.com'  // Changez ceci
```

---

## Étape 5: Tester la Connexion

1. Ouvrez `testsupabase.html` dans votre navigateur
2. Vérifiez que tous les tests passent ✅

---

## Étape 6: Créer un Compte Admin

1. Allez sur `/src/pages/register.html`
2. Créez un compte avec l'email que vous avez configuré comme ADMIN_EMAIL
3. Vérifiez votre email pour confirmer
4. Connectez-vous - vous aurez accès au panneau admin

---

## Étape 7: Ajouter du Contenu

### Via Admin Panel (`/src/pages/admin/dashboard.html`):

- **Portfolio Manager**: Uploadez photos/vidéos
- **Site Settings**: Modifiez textes, prix, contact
- **Messages**: Répondez aux clients

### Fichiers Media:

- Placez `hero-video.mp4` dans `/public/videos/`
- Ajoutez images dans `/public/images/`

---

## 🔧 Résolution du Problème Storage

**Le problème**: L'erreur "must be owner of relation objects" vient du fait que vous ne pouvez pas créer de politiques sur `storage.objects` via SQL dans Supabase.

**La solution**: 
1. ✅ Créez les buckets avec `storage-buckets-only.sql`
2. ✅ Créez les politiques via l'interface UI (voir Étape 3)

---

## 📱 Tester le Site

```bash
# Démarrez un serveur local
python -m http.server 8000
# ou
npx http-server -p 8000
```

Puis ouvrez: `http://localhost:8000/src/pages/index.html`

---

## ✅ Checklist Finale

- [ ] Tables créées (`schema.sql`)
- [ ] Buckets créés (`storage-buckets-only.sql`)
- [ ] Politiques RLS activées (`policies.sql`)
- [ ] Politiques Storage configurées (via UI)
- [ ] Admin email configuré
- [ ] Compte admin créé
- [ ] Test Supabase réussi
- [ ] Contenu uploadé
- [ ] Site testé localement

---

## 🆘 Support

Si vous rencontrez des problèmes:

1. Vérifiez `testsupabase.html` pour diagnostiquer
2. Consultez les logs dans la console du navigateur (F12)
3. Vérifiez les politiques RLS dans Supabase Dashboard

---

**Votre site HANSYPIX est prêt! 🎉📸**
=======
# 🚀 GUIDE D'INSTALLATION HANSYPIX

## Étape 1: Configuration Supabase ✅ (FAIT)

Vous avez déjà configuré vos credentials dans `/src/supabase/config.js`

## Étape 2: Créer les Tables de Base de Données

### Dans Supabase Dashboard → SQL Editor:

**Exécutez dans cet ordre:**

1. **`schema.sql`** - Crée toutes les tables
2. **`storage-buckets-only.sql`** - Crée les buckets de stockage
3. **`policies.sql`** - Configure la sécurité RLS
4. **`seed.sql`** (optionnel) - Données de test

---

## Étape 3: Configurer Storage Policies (IMPORTANT)

Les politiques de stockage doivent être créées via l'interface Supabase:

### 📦 Pour chaque bucket (portfolio, videos, avatars):

1. Allez dans **Storage** → Sélectionnez le bucket
2. Cliquez sur **Policies** → **New Policy**

#### Policy 1: Public Read
```
Operation: SELECT
Policy name: Public can view
Target roles: public
USING expression: true
```

#### Policy 2: Authenticated Upload
```
Operation: INSERT
Policy name: Authenticated can upload
Target roles: authenticated
WITH CHECK expression: true
```

#### Policy 3: Authenticated Update
```
Operation: UPDATE
Policy name: Authenticated can update
Target roles: authenticated
USING expression: true
```

#### Policy 4: Authenticated Delete
```
Operation: DELETE
Policy name: Authenticated can delete
Target roles: authenticated
USING expression: true
```

---

## Étape 4: Configurer l'Email Admin

Éditez `/src/js/config.js`:

```javascript
ADMIN_EMAIL: 'votre-email@example.com'  // Changez ceci
```

---

## Étape 5: Tester la Connexion

1. Ouvrez `testsupabase.html` dans votre navigateur
2. Vérifiez que tous les tests passent ✅

---

## Étape 6: Créer un Compte Admin

1. Allez sur `/src/pages/register.html`
2. Créez un compte avec l'email que vous avez configuré comme ADMIN_EMAIL
3. Vérifiez votre email pour confirmer
4. Connectez-vous - vous aurez accès au panneau admin

---

## Étape 7: Ajouter du Contenu

### Via Admin Panel (`/src/pages/admin/dashboard.html`):

- **Portfolio Manager**: Uploadez photos/vidéos
- **Site Settings**: Modifiez textes, prix, contact
- **Messages**: Répondez aux clients

### Fichiers Media:

- Placez `hero-video.mp4` dans `/public/videos/`
- Ajoutez images dans `/public/images/`

---

## 🔧 Résolution du Problème Storage

**Le problème**: L'erreur "must be owner of relation objects" vient du fait que vous ne pouvez pas créer de politiques sur `storage.objects` via SQL dans Supabase.

**La solution**: 
1. ✅ Créez les buckets avec `storage-buckets-only.sql`
2. ✅ Créez les politiques via l'interface UI (voir Étape 3)

---

## 📱 Tester le Site

```bash
# Démarrez un serveur local
python -m http.server 8000
# ou
npx http-server -p 8000
```

Puis ouvrez: `http://localhost:8000/src/pages/index.html`

---

## ✅ Checklist Finale

- [ ] Tables créées (`schema.sql`)
- [ ] Buckets créés (`storage-buckets-only.sql`)
- [ ] Politiques RLS activées (`policies.sql`)
- [ ] Politiques Storage configurées (via UI)
- [ ] Admin email configuré
- [ ] Compte admin créé
- [ ] Test Supabase réussi
- [ ] Contenu uploadé
- [ ] Site testé localement

---

## 🆘 Support

Si vous rencontrez des problèmes:

1. Vérifiez `testsupabase.html` pour diagnostiquer
2. Consultez les logs dans la console du navigateur (F12)
3. Vérifiez les politiques RLS dans Supabase Dashboard

---

**Votre site HANSYPIX est prêt! 🎉📸**
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
