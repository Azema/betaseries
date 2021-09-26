# BetaSeries OAuth

Voici les fichiers nécessaires pour permettre une authentification OAuth 2.0 avec le site [BetaSeries](https://www.betaseries.com/).

## Installation
- Récuperez les sources
- Allez dans le répertoire *BetaSeries_OAuth*
- Installez les dépendances avec `Composer install`
- Installez vous un serveur Web (ex: Apache, Nginx)

## Configuration
Modifier le fichier `config.php` pour y ajouter votre ID client, votre clé secrète et l'URL de redirection.
Vous trouverez ces informations sur la page de votre compte API, si vous avez demandé une clé API. Sinon, vous pouvez faire la demande sur la page d'[accueil de l'API](https://www.betaseries.com/api/).

L'URL de redirection doit être sécurisée, sinon vous aurez des problèmes de connexions.
