# Tester l'algorithme en JS

## Préalablement : 
- Ajouter les fichiers `challenges.js` et `skills.js` dans le dossier, ainsi que `usersData.json` si besoin
- Avoir installer `node` et `npm`
- Lancer `npm install`
- Lancer `npm run test-ok` pour voir si tout se passe bien


## Pouvoir tester: 
Pour lancer : 
- Utiliser `node test-algo.js`

Paramètres : 
- `MODE=` : FULLOK (l'utilisateur répond toujours juste), FULLKO (l'utilisateur répond toujours faux), KOFULLOK (l'utilisateur répond faux puis toujours juste), OKFULLKO (l'utilisateur répond juste puis toujours faux), RANDOM (l'utilisateur répond aléatoirement juste ou faux), USER (utilise les données d'un utilisateur choisit aléatoirement. S'il n'a pas répondu à cet acquis, c'est une réponse aléatoire)
- `COMPETENCE=` indique l'ID de la compétence que l'on souhaite tester
- `OUTPUT=` indique le nom du fichier de sortie 
