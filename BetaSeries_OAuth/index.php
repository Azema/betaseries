<?php require './config.php'; ?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Page de connexion à BetaSeries pour le UserScript betaseries</title>
</head>
<body>
  <h1>Connexion à BetaSeries</h1>
  <a href="https://www.betaseries.com/authorize?client_id=<?= CLIENT_ID ?>&redirect_uri=<?= URL_REDIRECT ?>">Se connecter à BetaSeries</a>
</body>
</html>
