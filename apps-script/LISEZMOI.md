# Panier Malin — code Apps Script

Ces deux fichiers sont le code de l'appli, hébergée par Google Apps Script
(script lié à la Google Sheet « Panier Malin »). La racine de ce dépôt n'est que
la coquille installable (PWA) qui affiche cette appli.

GitHub ne met **pas** l'appli à jour tout seul. Pour publier une modification :

1. Dans l'éditeur Apps Script, remplacer le contenu de `Code.gs` et `Index.html`
   par ceux de ce dossier, puis enregistrer.
2. **Déployer › Gérer les déploiements › crayon (Modifier) › Version : Nouvelle version › Déployer.**
   Ne pas créer de « Nouveau déploiement » : l'URL `/exec` changerait et la coquille ne la verrait plus.
