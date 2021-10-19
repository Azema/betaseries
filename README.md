# betaseries
UserScript pour le site [BetaSeries](https://www.betaseries.com/) testé avec Tampermonkey sur Chrome

## Sommaire
1. [Description](#description)
2. [Améliorations](#améliorations)
   - [Générales](#générales)
   - [Séries, Films et épisodes](#séries-films-et-épisodes)
   - [Membres](#membres)
   - [API](#api)
3. [Corrections](#corrections)
4. [Futures améliorations possibles](#futures-améliorations-possibles)
5. [Développement](#développement)



## Description
Ce UserScript permet d'ajouter plusieurs améliorations et corrections au site BetaSeries.

Différentes améliorations seront ajoutées au fur et à mesure, mais vos idées (réalistes) sont les bienvenues.

## Améliorations
### Générales
* Masque les emplacements de pub
* Ajout d'une fonction d'authentification sur le site API BetaSeries, en cas de perte du token sur le site

### Séries, Films et épisodes
* Ajoute un bandeau d'angle "Viewed" sur les séries similaires déjà vues (Nécessite d'être connecté à votre compte utilisateur)
* Ajout d'une popup avec les détails d'une série similaire lors du survol de l'image

![Séries similaires avec le bandeau vues](/img/similarsViewed.jpg "Séries similaires avec le bandeau vues")
* Ajout du statut des séries sur la page de gestion des séries de l'utilisateur connecté
* Ajout du nombre de votants à la note d'une série ou d'un film ou d'un épisode

![Nombre de votants](/img/nbVotants.jpg "Nombre de votants")
* Ajout d'une case à cocher "Vu" sur les vignettes des épisodes pour ajouter ou enlever l'épisode aux épisodes vus et met à jour la barre de progression de la série
* Ajout d'un bouton de mise à jour des épisodes de la saison courante

![Case à cocher VU d'un épisode](/img/checkSeen.jpg "Case à cocher VU d'un épisode")
* Ajout des notes sous les titres des similaires
* Ajout du logo de classification TV dans les infos de la ressource (série et film)
* En mode DEV, ajout d'un bouton pour visualiser les infos de la ressource
* Ajout d'un paginateur en haut de la liste des séries
* Modification du fonctionnement du filtre **pays**, sur la page des séries, pour permettre d'ajouter plusieurs pays.

### Membres
* Ajout de la fonction de comparaison entre 2 membres. Visible sur la page des autres membres, accessible via le bouton "Se comparer à ce membre" en haut du profil.
* Ajout d'un champ de recherche sur la page des amis d'un membre

### API
* Ajout d'un sommaire, sur les pages des méthodes de l'[API](https://www.betaseries.com/api/), avec les liens des différentes fonctions. Ce qui permet de voir toutes les fonctions liées aux méthodes, en début de page.

![Sommaire des méthodes de l'API](/img/sommaireMethodes.png "Sommaire des méthodes de l'API")
* Ajout d'améliorations sur la page de la console de l'API
  - Un bouton pour supprimer la ligne de paramètre (le paramètre _version_ ne peut être supprimé)
  - Un bouton pour vérouiller la ligne de paramètre (le paramètre _version_ est vérouillé)
  - La suppression des paramètres, hors ceux vérouillés, lors du changement de méthode
  - Un bouton pour afficher/masquer le résultat de la requête
  - Un clic sur un paramètre, dans la section __documentation__, permet d'ajouter ce paramètre directement

![Console de l'API](/img/console.png "Console de l'API")

## Corrections
* Décode les HTMLEntities dans le titre de la série

![HTMLEntities](/img/HTMLEntities-title.png "HTMLEntities dans le titre")

## Futures améliorations possibles
* ~~Afficher les infos de la ressource dans une popup, lors du survol d'un similar~~

## Développement
* Utilisation des [Promise](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Global_Objects/Promise)
* Mise en cache des ressources, pour limiter les appels à l'API
