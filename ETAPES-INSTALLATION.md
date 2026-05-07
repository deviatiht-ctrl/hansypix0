<<<<<<< HEAD
# 📋 ÉTAPES D'INSTALLATION HANSYPIX

## ✅ ÉTAPE 1: Configuration Supabase (FAIT)

Vos credentials sont déjà configurés dans `/src/supabase/config.js`

---

## 🗄️ ÉTAPE 2: Créer les Tables

### Allez sur Supabase Dashboard:
1. Ouvrez: https://app.supabase.com/project/uawbgdiafdxnrdnmyxpr
2. Cliquez sur **SQL Editor** (icône </> dans le menu gauche)
3. Cliquez sur **+ New Query**

### Exécutez les scripts SQL dans cet ordre:

#### A. Créer les tables (`schema.sql`)
```sql
-- Copiez TOUT le contenu de sql/schema.sql
-- Collez dans SQL Editor
-- Cliquez sur RUN
```

#### B. Créer les buckets storage (`storage-buckets-only.sql`)
```sql
-- Copiez TOUT le contenu de sql/storage-buckets-only.sql
-- Collez dans SQL Editor
-- Cliquez sur RUN
```

#### C. Activer la sécurité (`policies.sql`)
```sql
-- Copiez TOUT le contenu de sql/policies.sql
-- Collez dans SQL Editor
-- Cliquez sur RUN
```

#### D. (Optionnel) Données de test (`seed.sql`)
```sql
-- Copiez TOUT le contenu de sql/seed.sql
-- Collez dans SQL Editor
-- Cliquez sur RUN
```

---

## 📦 ÉTAPE 3: Configurer Storage Policies

**IMPORTANT**: Les politiques de storage ne peuvent PAS être créées via SQL. Vous devez utiliser l'interface.

### Pour CHAQUE bucket (portfolio, videos, avatars):

1. Allez dans **Storage** (menu gauche)
2. Cliquez sur le bucket (ex: `portfolio`)
3. Cliquez sur l'onglet **Policies**
4. Cliquez sur **New Policy**

### Créez 4 politiques par bucket:

#### Policy 1: SELECT (Lecture publique)
- **Policy name**: `Public can view`
- **Allowed operation**: `SELECT`
- **Target roles**: Cochez `public`
- **USING expression**: `true`
- Cliquez **Review** puis **Save policy**

#### Policy 2: INSERT (Upload)
- **Policy name**: `Authenticated can upload`
- **Allowed operation**: `INSERT`
- **Target roles**: Cochez `authenticated`
- **WITH CHECK expression**: `true`
- Cliquez **Review** puis **Save policy**

#### Policy 3: UPDATE (Modification)
- **Policy name**: `Authenticated can update`
- **Allowed operation**: `UPDATE`
- **Target roles**: Cochez `authenticated`
- **USING expression**: `true`
- Cliquez **Review** puis **Save policy**

#### Policy 4: DELETE (Suppression)
- **Policy name**: `Authenticated can delete`
- **Allowed operation**: `DELETE`
- **Target roles**: Cochez `authenticated`
- **USING expression**: `true`
- Cliquez **Review** puis **Save policy**

**Répétez pour les 3 buckets**: `portfolio`, `videos`, `avatars`

---

## 🧪 ÉTAPE 4: Tester la Configuration

### Ouvrez `test-simple.html` dans votre navigateur:

```
file:///C:/Users/HACKER/Pictures/hansypix/test-simple.html
```

### Vous devriez voir:

✅ **Client Supabase créé**  
✅ **Connexion réussie**

### Cliquez sur les boutons:
1. **Tester Connexion** → Doit être ✅ vert
2. **Tester Tables** → Toutes les tables doivent être ✅ vertes
3. **Tester Storage** → Tous les buckets doivent être ✅ verts

### Si vous voyez des erreurs rouges ❌:

**Erreur "relation does not exist"**:
- ➡️ Vous n'avez pas exécuté `schema.sql`
- ➡️ Retournez à l'ÉTAPE 2A

**Erreur "bucket does not exist"**:
- ➡️ Vous n'avez pas exécuté `storage-buckets-only.sql`
- ➡️ Retournez à l'ÉTAPE 2B

**Erreur "permission denied"**:
- ➡️ Vous n'avez pas créé les storage policies
- ➡️ Retournez à l'ÉTAPE 3

---

## 👤 ÉTAPE 5: Créer Votre Compte Admin

1. Ouvrez: `src/pages/register.html`
2. Créez un compte avec votre email
3. Vérifiez votre email et confirmez
4. Éditez `/src/js/config.js` et changez:
   ```javascript
   ADMIN_EMAIL: 'votre-email@example.com'
   ```
5. Reconnectez-vous → Vous verrez le bouton "Admin" dans le menu

---

## 🚀 ÉTAPE 6: Lancer le Site

### Démarrez un serveur local:

**Option 1 - Python:**
```bash
cd C:\Users\HACKER\Pictures\hansypix
python -m http.server 8000
```

**Option 2 - Node.js:**
```bash
cd C:\Users\HACKER\Pictures\hansypix
npx http-server -p 8000
```

**Option 3 - VS Code:**
- Installez l'extension "Live Server"
- Clic droit sur `index.html` → "Open with Live Server"

### Ouvrez dans votre navigateur:
```
http://localhost:8000/src/pages/index.html
```

---

## ✅ Checklist Finale

- [ ] Tables créées (ÉTAPE 2A)
- [ ] Buckets créés (ÉTAPE 2B)
- [ ] Politiques RLS activées (ÉTAPE 2C)
- [ ] Storage policies configurées (ÉTAPE 3)
- [ ] Test simple réussi (ÉTAPE 4)
- [ ] Compte admin créé (ÉTAPE 5)
- [ ] Site accessible localement (ÉTAPE 6)

---

## 🆘 Problèmes Courants

### Le test-simple.html montre des erreurs

**Si TOUT est rouge:**
- Vérifiez que vous avez bien copié les credentials dans `config.js`
- Vérifiez votre connexion internet

**Si "Table X does not exist":**
- Exécutez `schema.sql` dans SQL Editor

**Si "Bucket X does not exist":**
- Exécutez `storage-buckets-only.sql` dans SQL Editor

**Si "Permission denied for storage":**
- Créez les storage policies via l'interface UI (ÉTAPE 3)

---

**Votre site HANSYPIX sera prêt après ces étapes! 🎉**
=======
# 📋 ÉTAPES D'INSTALLATION HANSYPIX

## ✅ ÉTAPE 1: Configuration Supabase (FAIT)

Vos credentials sont déjà configurés dans `/src/supabase/config.js`

---

## 🗄️ ÉTAPE 2: Créer les Tables

### Allez sur Supabase Dashboard:
1. Ouvrez: https://app.supabase.com/project/uawbgdiafdxnrdnmyxpr
2. Cliquez sur **SQL Editor** (icône </> dans le menu gauche)
3. Cliquez sur **+ New Query**

### Exécutez les scripts SQL dans cet ordre:

#### A. Créer les tables (`schema.sql`)
```sql
-- Copiez TOUT le contenu de sql/schema.sql
-- Collez dans SQL Editor
-- Cliquez sur RUN
```

#### B. Créer les buckets storage (`storage-buckets-only.sql`)
```sql
-- Copiez TOUT le contenu de sql/storage-buckets-only.sql
-- Collez dans SQL Editor
-- Cliquez sur RUN
```

#### C. Activer la sécurité (`policies.sql`)
```sql
-- Copiez TOUT le contenu de sql/policies.sql
-- Collez dans SQL Editor
-- Cliquez sur RUN
```

#### D. (Optionnel) Données de test (`seed.sql`)
```sql
-- Copiez TOUT le contenu de sql/seed.sql
-- Collez dans SQL Editor
-- Cliquez sur RUN
```

---

## 📦 ÉTAPE 3: Configurer Storage Policies

**IMPORTANT**: Les politiques de storage ne peuvent PAS être créées via SQL. Vous devez utiliser l'interface.

### Pour CHAQUE bucket (portfolio, videos, avatars):

1. Allez dans **Storage** (menu gauche)
2. Cliquez sur le bucket (ex: `portfolio`)
3. Cliquez sur l'onglet **Policies**
4. Cliquez sur **New Policy**

### Créez 4 politiques par bucket:

#### Policy 1: SELECT (Lecture publique)
- **Policy name**: `Public can view`
- **Allowed operation**: `SELECT`
- **Target roles**: Cochez `public`
- **USING expression**: `true`
- Cliquez **Review** puis **Save policy**

#### Policy 2: INSERT (Upload)
- **Policy name**: `Authenticated can upload`
- **Allowed operation**: `INSERT`
- **Target roles**: Cochez `authenticated`
- **WITH CHECK expression**: `true`
- Cliquez **Review** puis **Save policy**

#### Policy 3: UPDATE (Modification)
- **Policy name**: `Authenticated can update`
- **Allowed operation**: `UPDATE`
- **Target roles**: Cochez `authenticated`
- **USING expression**: `true`
- Cliquez **Review** puis **Save policy**

#### Policy 4: DELETE (Suppression)
- **Policy name**: `Authenticated can delete`
- **Allowed operation**: `DELETE`
- **Target roles**: Cochez `authenticated`
- **USING expression**: `true`
- Cliquez **Review** puis **Save policy**

**Répétez pour les 3 buckets**: `portfolio`, `videos`, `avatars`

---

## 🧪 ÉTAPE 4: Tester la Configuration

### Ouvrez `test-simple.html` dans votre navigateur:

```
file:///C:/Users/HACKER/Pictures/hansypix/test-simple.html
```

### Vous devriez voir:

✅ **Client Supabase créé**  
✅ **Connexion réussie**

### Cliquez sur les boutons:
1. **Tester Connexion** → Doit être ✅ vert
2. **Tester Tables** → Toutes les tables doivent être ✅ vertes
3. **Tester Storage** → Tous les buckets doivent être ✅ verts

### Si vous voyez des erreurs rouges ❌:

**Erreur "relation does not exist"**:
- ➡️ Vous n'avez pas exécuté `schema.sql`
- ➡️ Retournez à l'ÉTAPE 2A

**Erreur "bucket does not exist"**:
- ➡️ Vous n'avez pas exécuté `storage-buckets-only.sql`
- ➡️ Retournez à l'ÉTAPE 2B

**Erreur "permission denied"**:
- ➡️ Vous n'avez pas créé les storage policies
- ➡️ Retournez à l'ÉTAPE 3

---

## 👤 ÉTAPE 5: Créer Votre Compte Admin

1. Ouvrez: `src/pages/register.html`
2. Créez un compte avec votre email
3. Vérifiez votre email et confirmez
4. Éditez `/src/js/config.js` et changez:
   ```javascript
   ADMIN_EMAIL: 'votre-email@example.com'
   ```
5. Reconnectez-vous → Vous verrez le bouton "Admin" dans le menu

---

## 🚀 ÉTAPE 6: Lancer le Site

### Démarrez un serveur local:

**Option 1 - Python:**
```bash
cd C:\Users\HACKER\Pictures\hansypix
python -m http.server 8000
```

**Option 2 - Node.js:**
```bash
cd C:\Users\HACKER\Pictures\hansypix
npx http-server -p 8000
```

**Option 3 - VS Code:**
- Installez l'extension "Live Server"
- Clic droit sur `index.html` → "Open with Live Server"

### Ouvrez dans votre navigateur:
```
http://localhost:8000/src/pages/index.html
```

---

## ✅ Checklist Finale

- [ ] Tables créées (ÉTAPE 2A)
- [ ] Buckets créés (ÉTAPE 2B)
- [ ] Politiques RLS activées (ÉTAPE 2C)
- [ ] Storage policies configurées (ÉTAPE 3)
- [ ] Test simple réussi (ÉTAPE 4)
- [ ] Compte admin créé (ÉTAPE 5)
- [ ] Site accessible localement (ÉTAPE 6)

---

## 🆘 Problèmes Courants

### Le test-simple.html montre des erreurs

**Si TOUT est rouge:**
- Vérifiez que vous avez bien copié les credentials dans `config.js`
- Vérifiez votre connexion internet

**Si "Table X does not exist":**
- Exécutez `schema.sql` dans SQL Editor

**Si "Bucket X does not exist":**
- Exécutez `storage-buckets-only.sql` dans SQL Editor

**Si "Permission denied for storage":**
- Créez les storage policies via l'interface UI (ÉTAPE 3)

---

**Votre site HANSYPIX sera prêt après ces étapes! 🎉**
>>>>>>> a0f94cd2f455cd5b65045c161fc96ba4dddb1da9
