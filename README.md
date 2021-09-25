# betaseries
UserScript pour le site BetaSeries testé avec Tampermonkey sur Chrome

## Description
Ce UserScript permet d'ajouter plusieurs améliorations et corrections au site BetaSeries.

Différentes améliorations seront ajoutées au fur et à mesure, mais vos idées (réalistes) sont les bienvenues.

### Améliorations
* Masque les emplacements de pub
* Ajoute un bandeau d'angle "Viewed" sur les séries similaires déjà vues (Nécessite d'être connecté à votre compte utilisateur)

![Séries similaires avec le bandeau vues](/img/similarsViewed.jpg "Séries similaires avec le bandeau vues")
* Ajout du statut des séries sur la page de gestion des séries de l'utilisateur connecté
* Ajout du nombre de votants à la note d'une série ou d'un film ou d'un épisode

![Nombre de votants](/img/nbVotants.jpg "Nombre de votants")
* Ajout d'une case à cocher "Vu" sur les vignettes des épisodes pour ajouter ou enlever l'épisode aux épisodes vus et met à jour la barre de progression de la série

![Case à cocher VU d'un épisode](/img/checkSeen.jpg "Case à cocher VU d'un épisode")
* Ajout de la fonction de comparaison entre 2 membres. Visible sur la page des autres membres, accessible via le bouton "Se comparer à ce membre" en haut du profil.
* Ajout des notes sous les titres des similaires
* Ajout du logo de classification TV dans les infos de la ressource (série et film)
* En mode DEV, ajout d'un bouton pour visualiser les infos de la ressource
* Ajout d'une fonction d'authentification sur le site API BetaSeries, en cas de perte du token sur le site
* Ajout d'un sommaire, sur les pages des méthodes de l'[API](https://www.betaseries.com/api/), avec les liens des différentes fonctions. Ce qui permet de voir toutes les fonctions liées aux méthodes, en début de page.
![Sommaire des méthodes de l'API](/img/sommaireMethodes.png "Sommaire des méthodes de l'API")

### Corrections
* Décode les HTMLEntities dans le titre de la série

![HTMLEntities](/img/HTMLEntities-title.png "HTMLEntities dans le titre")

## Futures améliorations possibles
* Afficher les infos de la ressource dans une popup, lors du survol d'un similar

## Dévelopement
* Utilisation des [Promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* Mise en cache des ressources, pour limiter les appels à l'API
