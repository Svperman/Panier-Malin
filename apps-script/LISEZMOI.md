# Panier Malin — serveur de données (Apps Script)

L'appli est la page `index.html` à la racine de ce dépôt, publiée sur
https://svperman.github.io/Panier-Malin/ — **chaque push sur `main` la met à jour** pour tout le monde.

`Code.gs` est le seul fichier côté Google : il lit et enregistre la liste dans la Google Sheet.
Il ne change presque jamais. S'il change :

1. Dans l'éditeur Apps Script (script lié à la Sheet), remplacer `Code.gs`, puis enregistrer.
2. **Déployer › Gérer les déploiements › crayon (Modifier) › Version : Nouvelle version › Déployer.**
   Ne jamais créer de « Nouveau déploiement » : l'URL `/exec` (écrite dans `index.html`) changerait.

Le déploiement doit rester : *Exécuter en tant que : Moi* · *Qui peut accéder : Tout le monde*.
