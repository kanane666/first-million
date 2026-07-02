# 🔥 Projet Phoenix — Tracker

Application de suivi personnel pour atteindre l'objectif de **1 000 000 FCFA** en 15 mois via la plomberie.

## Fonctionnalités

- **Accueil** — Progression épargne cumulée vs objectif, **objectifs jour/semaine en temps réel**, phase actuelle, graphe de projection
- **Saisie** — Enregistrer revenus (plomberie, réparations, missions info) et dépenses
- **Stats** — Filtre **Jour / Semaine / Mois** avec suivi des jalons (2 500 FCFA/jour, 12 500 FCFA/semaine), taux d'épargne, répartition par source
- **Skills** — Tracker de compétences plomberie (10 skills, 3 niveaux) + log des heures chantier

Toutes les données sont sauvegardées localement dans le navigateur (localStorage).

## 📱 Installer sur iPhone (en tant qu'app)

Une fois l'app déployée sur Vercel (lien `https://....vercel.app`) :

1. Ouvre le lien dans **Safari** (pas Chrome — important sur iPhone)
2. Appuie sur le bouton **Partager** (carré avec flèche vers le haut, en bas de l'écran)
3. Fais défiler et appuie sur **"Sur l'écran d'accueil"**
4. Appuie sur **"Ajouter"**

L'icône Phoenix 🔥 apparaît sur ton écran d'accueil et s'ouvre en plein écran comme une vraie app, sans la barre Safari.

## Déploiement sur Vercel (5 minutes)

### Option 1 — Via GitHub (recommandé)

```bash
git init
git add .
git commit -m "init phoenix tracker"
git remote add origin https://github.com/TON_USER/phoenix-tracker.git
git push -u origin main
```

Ensuite : [vercel.com](https://vercel.com) → New Project → importe le repo → Deploy ✅

### Option 2 — Via Vercel CLI

```bash
npm install -g vercel
vercel
```

## Développement local

```bash
npm install
npm run dev
```
