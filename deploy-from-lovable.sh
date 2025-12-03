#!/bin/bash

echo "🚀 Synchro Lovable → Prod (rezaclass-pro)"
echo "------------------------------------------"

# Vérification du remote 'lovable'
if ! git remote | grep -q "lovable"; then
  echo "❌ Le remote 'lovable' n'existe pas."
  echo "➡️ Ajoute-le avec cette commande :"
  echo "   git remote add lovable https://github.com/laurentrub/mon-coin-de-france.git"
  exit 1
fi

# 1. Fetch du repo Lovable
echo "Fetch depuis le remote 'lovable'..."
git fetch lovable

# 2. Mise à jour/Création de la branche dev basée sur lovable/main
echo "🔄 Mise à jour de la branche dev avec lovable/main..."
if git show-ref --verify --quiet refs/heads/dev; then
  git checkout dev
else
  git checkout -b dev
fi

git reset --hard lovable/main

# 3. Retour sur main
echo "🔁 Retour sur main..."
git checkout main

# 4. Fusion dev → main
echo "🔀 Fusion dev → main..."
git merge dev

# 5. Commit interactif
echo "✍️  Ouverture de l'éditeur pour écrire le message de commit..."
git commit

# 6. Push en production
echo "📤 Push vers origin/main..."
git push origin main

echo "🎉 Déploiement terminé !"
echo "🔔 Vercel va builder la production automatiquement."
