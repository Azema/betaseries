// ==UserScript==
// @name         betaseries
// @namespace    http://tampermonkey.net/
// @version      0.13.0
// @description  Ajoute quelques améliorations au site BetaSeries
// @author       Azema
// @homepage     https://github.com/Azema/betaseries
// @match        https://www.betaseries.com/serie/*
// @match        https://www.betaseries.com/episode/*
// @match        https://www.betaseries.com/film/*
// @match        https://www.betaseries.com/membre/*
// @match        https://www.betaseries.com/api/*
// @icon         https://www.betaseries.com/images/site/favicon-32x32.png
// @require      https://cdnjs.cloudflare.com/ajax/libs/humanize-duration/3.27.0/humanize-duration.min.js
// @require      https://cdn.jsdelivr.net/npm/renderjson@1.4.0/renderjson.min.js
// @resource     FontAwesome  https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css#sha256-eZrrJcwDc/3uDhsdt61sL2oOBY362qM3lon1gyExkL0=
// @resource     TableCSS https://betaseries.aufilelec.fr/css/table.min.css#sha384-Gi9pTl7apLpUEntAQPQ3PJWt6Es9SdtquwVZSgrheEoFdsSQA5me0PeVuZFSJszm
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

/* global jQuery A11yDialog humanizeDuration renderjson betaseries_api_user_token */
/* jslint unparam: true */


/************************************************************************************************/
/* Ajouter ici votre clé d'API BetaSeries (Demande de clé API: https://www.betaseries.com/api/) */
/************************************************************************************************/
let betaseries_api_user_key = '';

(function($) {
    'use strict';

    $('head').append('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw==" crossorigin="anonymous" referrerpolicy="no-referrer" />');

    const regexGestionSeries = new RegExp('^/membre/.*/series$'),
          regexUser = new RegExp('^/membre/[A-Za-z0-9]*$'),
          regexSerieOrMovie = new RegExp('^/(serie|film|episode)/*'),
          tableCSS = 'https://betaseries.aufilelec.fr/css/table.min.css';
    let debug = false,
        url = location.pathname,
        userIdentified = typeof betaseries_api_user_token != 'undefined',
        timer, currentUser, cache = new Cache(),
        counter = 0,
        // Equivalences des classifications TV
        ratings = {
            'TV-Y': '',
            'TV-Y7': 'D-10',
            'TV-G': '',
            'TV-PG': 'D-12',
            'TV-14': 'D-16',
            'TV-MA': 'D-18'
        },
        // URI des images de classifications TV
        ratingImgs = {
            'D-10': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Moins10.svg/30px-Moins10.svg.png',
            'D-12': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Moins12.svg/30px-Moins12.svg.png',
            'D-16': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Moins16.svg/30px-Moins16.svg.png',
            'D-18': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Moins18.svg/30px-Moins18.svg.png'
        };

    // Fonctions appeler pour les pages des series, des films et des episodes
    if (regexSerieOrMovie.test(url)) {
        // On récupère d'abord la ressource courante pour la mettre en cache
        getCurrentResource().then(function() {
            removeAds();  // On retire les pubs
            addStylesheet();  // On ajoute le CSS
            similarsViewed();  // On s'occupe des ressources similaires
            decodeTitle();  // On décode le titre de la ressource
            addRating();  // On ajoute la classification TV de la ressource courante
            if (debug) addBtnDev();  // On ajoute le bouton de Dev
            addNumberVoters();  // On ajoute le nombre de votes à la note
            // On ajoute un timer interval en attendant que les saisons et les épisodes soient chargés
            timer = setInterval(function() {
                addBtnWatchedToEpisode();
            }, 500);
        });
    }
    // Fonctions appeler pour la page de gestion des series
    else if (regexGestionSeries.test(url)) {
        addStatusToGestionSeries();
    }
    // Fonctions appeler sur la page des membres
    else if (regexUser.test(url) && userIdentified) {
        removeAds();
        addStylesheet();
        // On récupère les infos du membre connecté
        getMember()
        .then(function(member) {
            currentUser = member;
            let login = url.split('/')[2];
            // On ajoute la fonction de comparaison des membres
            if (currentUser && login != currentUser.login) {
                compareMembers();
            }
        });
    }
    // Fonctions appeler sur les pages des méthodes de l'API
    else if (/^\/api/.test(url)) {
        if (/\/methodes/.test(url))
            sommaireDevApi();
        else if (/\/console/.test(url)) {
            updateApiConsole();
        }
    }

    /**
     * Ajoute des améliorations sur la page de la console de l'API
     */
    function updateApiConsole() {
        // Listener sur le btn nouveau paramètre
        $('.form-group .btn-btn').prop('onclick', null).off('click').click((e, key) => {
            e.stopPropagation();
            e.preventDefault();
            if (debug) console.log('nouveau parametre handler', key);
            // On ajoute une nouvelle ligne de paramètre
            newApiParameter();
            // On insère la clé du paramètre, si elle est présente
            if (key) {
                $('input.name:last').val(key);
                $('input.form-control:last').focus();
            }
            addRemoveParamToConsole();
        });
        // Listener sur la liste des méthodes
        $('#method').on('change', (e) => {
            // On supprime tous les paramètres existants
            $('#api-params .remove').remove();
            // En attente de la documentation de l'API
            timer = setInterval(() => {
                if ($('#doc code') <= 0) return;

                clearInterval(timer); // On supprime le timer
                let paramsDoc = $('#doc > ul > li > code');
                if (debug) console.log('paramsDoc', paramsDoc);
                paramsDoc.css('cursor', 'pointer');
                // On ajoute la clé du paramètre dans une nouvelle ligne de paramètre
                paramsDoc.click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    $('.form-group .btn-btn').trigger('click', [$(e.currentTarget).text().trim()]);
                });
            }, 500);
        });
        // Ajoute un cadenas vérouillé au paramètre 'Version' non-modifiable
        $('.api-params:first').append('<i class="fa fa-lock fa-2x" style="margin-left: 10px;vertical-align:middle;cursor:not-allowed;" aria-hidden="true"></i>');
        addRemoveParamToConsole();
        addToggleShowResult();
        /**
         * On ajoute un bouton pour supprimer la ligne d'un paramètre
         */
        function addRemoveParamToConsole() {
            $('.api-params:not(.remove):not(:first)')
                .append('<i class="remove-input fa fa-minus-circle fa-2x" style="margin-left: 10px;vertical-align:middle;cursor:pointer;" aria-hidden="true"></i>')
                .append('<i class="lock-param fa fa-unlock fa-2x" style="margin-left: 10px;vertical-align:middle;cursor:pointer;" aria-hidden="true"></i>')
                .addClass('remove');
            $('.remove-input').click((e) => {
                $(e.currentTarget).parent('.api-params').remove();
            });
            $('.lock-param').click((e) => {
                let self = $(e.currentTarget);
                if (self.hasClass('fa-unlock')) {
                    self.removeClass('fa-unlock').addClass('fa-lock');
                    self.parent('.api-params').removeClass('remove');
                } else {
                    self.removeClass('fa-lock').addClass('fa-unlock')
                    self.parent('.api-params').addClass('remove');
                }
            });
        }
        function addToggleShowResult() {
            let result = $('#result');
            // On ajoute un titre pour la section de résultat de la requête
            result.before('<h2>Résultat de la requête <span class="toggle" style="margin-left:10px;"><i class="fa fa-chevron-circle-down" aria-hidden="true"></i></span></h2>');
            $('.toggle').click((e) => {
                // On réalise un toggle sur la section de résultat et on modifie l'icône du chevron
                result.toggle('400', () => {
                    if (result.is(':hidden'))
                        $('.toggle i').removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down');
                    else
                        $('.toggle i').removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
                });
            });
            // On modifie le sens du chevron lors du lancement d'une requête
            $('button.is-full').click((e) => {
                $('.toggle i').removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
            });
        }
    }

    /*
     * Ajoute un sommaire sur les pages de documentation des méthodes de l'API
     * Le sommaire est constitué des liens vers les fonctions des méthodes.
     */
    function sommaireDevApi() {
        let titles = $('.maincontent h2'),
            len = titles.length,
            methods = {},
            style = `
                .fa-chevron-circle-up {
                  cursor: pointer;
                  margin-left: 10px;
                }
                #sommaire {
                  text-align: center;
                  display: none;
                }
                #sommaire .table {
                  display: inline-table;
                }
                @media screen and (min-width: 700px) {
                    #sommaire .table {
                      width: 50%;
                      display: inline-table;
                    }
                }
                .liTitle {
                  margin-bottom: 15px;
                  color: var(--top_color);
                  list-style: none;
                  font-size: 1.3em;
                }
                .linkSommaire {
                  color: var(--link_color);
                  text-decoration: none;
                  cursor: pointer;
                }
                table.table thead tr th {
                  text-align: center;
                }
                table.table tbody tr td {
                  text-align: center;
                }
                table.table tbody tr th.fonction {
                  font-weight: bold;
                  font-size: 1.1em;
                  text-align: left;
                  vertical-align: middle;
                }
                `;
        $('head').append(`<link rel="stylesheet" href="${tableCSS}" integrity="sha384-Gi9pTl7apLpUEntAQPQ3PJWt6Es9SdtquwVZSgrheEoFdsSQA5me0PeVuZFSJszm" crossorigin="anonymous" referrerpolicy="no-referrer" />`);
        GM_addStyle(style);
        /**
         * Construit une cellule de table HTML pour une methode
         *
         * @param  {String} verb Le verbe HTTP utilisé par la fonction
         * @param  {String} key  L'identifiant de la fonction
         * @return {String}
         */
        function buildCell(verb, key) {
            let cell = '<td>';
            if (verb in methods[key])
                cell += '<i data-id="' + methods[key][verb].id + '" class="linkSommaire fa fa-check fa-2x" title="' +
                        methods[key][verb].title + '"></i>';
            return cell + '</td>';
        }
        /**
         * Construit une ligne de table HTML pour une fonction
         *
         * @param  {String} key L'identifiant de la fonction
         * @return {String}     La ligne HTML
         */
        function buildRow(key) {
            let row = '<tr><th scope="row" class="fonction">' + methods[key].title + '</th>';
            row += buildCell('GET', key);
            row += buildCell('POST', key);
            row += buildCell('PUT', key);
            row += buildCell('DELETE', key);
            return row + '</tr>';
        }
        /**
         * Fabrique la table HTML du sommaire
         * @return {Object} L'objet jQuery de la table HTML
         */
        function buildTable() {
            let $table = $('<div id="sommaire" class="table-responsive">' +
                            '<table class="table table-dark table-striped table-bordered">' +
                                '<thead class="thead-dark">' +
                                    '<tr>' +
                                        '<th colspan="5" scope="col" class="col-lg-12 liTitle">Sommaire</th>' +
                                    '</tr><tr>' +
                                        '<th scope="col" class="col-lg-3">Fonction</th>' +
                                        '<th scope="col" class="col-lg-2">GET</th>' +
                                        '<th scope="col" class="col-lg-2">POST</th>' +
                                        '<th scope="col" class="col-lg-2">PUT</th>' +
                                        '<th scope="col" class="col-lg-2">DELETE</th>' +
                                    '</tr>' +
                                '</thead>' +
                                '<tbody></tbody>' +
                            '</table></div>'),
                $tbody = $table.find('tbody');

            for (let key in methods) {
                $tbody.append(buildRow(key));
            }
            return $table;
        }

        titles.each((i, title) => {
            // ajouter les ID aux titres des methodes, ainsi qu'un chevron pour renvoyer au sommaire
            let $title = $(title),
                id = $title.text().trim().toLowerCase().replace(/ /, '_').replace(/\//, '-'),
                txt = $title.text().trim().split(' ')[1],
                desc = $title.next('p').text(),
                key = txt.toLowerCase().replace(/\//, ''),
                verb = $title.text().trim().split(' ')[0].toUpperCase();
            $title.attr('id', id);
            $title.append('<i class="fa fa-chevron-circle-up" aria-hidden="true" title="Retour au sommaire"></i>');
            if (! (key in methods)) methods[key] = {title: txt};
            methods[key][verb] = {id: id, title: desc};

            // Construire un sommaire des fonctions
            if (i == len-1) {
                //if (debug) console.log('methods', methods);
                $('.maincontent h1').after(buildTable());
                $('#sommaire').slideDown();

                $('.linkSommaire').click(function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $('#' + $(e.currentTarget).data('id')).get(0).scrollIntoView(true);
                });
                $('.fa-chevron-circle-up').click(function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    document.getElementById('sommaire').scrollIntoView(true);
                });
            }
        });
    }

    /**
     * Ajoute un bouton pour le dev pour afficher les données de la ressource
     * dans une modal
     */
    function addBtnDev() {
        const btnHTML = '<div class="blockInformations__action"><button class="btn-reset btn-transparent" type="button"><i class="fa fa-2x fa-wrench" aria-hidden="true"></i></button><div class="label">Favoris</div></div>',
              dialogHTML = `
                <div
                  class="dialog dialog-container table-dark"
                  id="dialog-resource"
                  aria-hidden="true"
                  aria-labelledby="dialog-resource-title"
                >
                  <div class="dialog-overlay" data-a11y-dialog-hide></div>
                  <div class="dialog-content" role="document" style="width: 80%;">
                    <button
                      data-a11y-dialog-hide
                      class="dialog-close"
                      title="Fermer cette boîte de dialogue"
                      aria-label="Fermer cette boîte de dialogue"
                    >
                      <i class="fa fa-times" aria-hidden="true"></i>
                    </button>

                    <h1 id="dialog-resource-title">Données de la ressource <span style="font-size:0.8em;"></span></h1>

                    <div class="data-resource content"></div>
                  </div>
                </div>`;
        $('.blockInformations__actions').append(btnHTML);
        $('body').append(dialogHTML);
        const dialog = new A11yDialog(document.querySelector('#dialog-resource')),
              html = document.documentElement;

        $('.fa-wrench').parent().click((e) => {
            e.stopPropagation();
            e.preventDefault();
            let type = getApiResource(location.pathname.split('/')[1]), // Indique de quel type de ressource il s'agit
                eltId = $('#reactjs-' + type.singular + '-actions').data(type.singular + '-id'), // Identifiant de la ressource
                $dataRes = $('#dialog-resource .data-resource'), // DOMElement contenant le rendu JSON de la ressource
                fonction = type.singular == 'show' || type.singular == 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource

            callBetaSeries('GET', type.plural, fonction, {'id': eltId})
            .then(function(data) {
                if (! $dataRes.is(':empty')) $dataRes.empty();
                $dataRes.append(renderjson.set_show_to_level(2)(data[type.singular]));
                $('#dialog-resource-title span').empty().text('(' + counter + ' appels API)');
                dialog.show();
            });
        });
        $('.dialog-close').click(function(e) {
            e.stopPropagation();
            e.preventDefault();
            dialog.hide();
        });
        dialog
            .on('show', function() { html.style.overflowY = 'hidden'; $('#dialog-resource').css('z-index', '1005').css('overflow', 'scroll');})
            .on('hide', function() { html.style.overflowY = ''; $('#dialog-resource').css('z-index', '0').css('overflow', 'none');});
    }

    /**
     * Cette fonction permet de stocker la ressource courante
     * dans le cache, pour être utilisé par les autres fonctions
     * @return {Promise}
     */
    function getCurrentResource() {
        if (debug) console.log('getCurrentResource');
        let type = getApiResource(location.pathname.split('/')[1]), // Indique de quel type de ressource il s'agit
            eltId = $('#reactjs-' + type.singular + '-actions').data(type.singular + '-id'), // Identifiant de la ressource
            fonction = type.singular == 'show' || type.singular == 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource

        return callBetaSeries('GET', type.plural, fonction, {'id': eltId});
    }

    /**
     * Ajoute la classification dans les détails de la ressource
     */
    function addRating() {
        if (debug) console.log('addRating');
        let type = getApiResource(url.split('/')[1]), // Indique de quel type de ressource il s'agit
            eltId = $('#reactjs-' + type.singular + '-actions').data(type.singular + '-id'), // Identifiant de la ressource
            fonction = type.singular == 'show' || type.singular == 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource

        callBetaSeries('GET', type.plural, fonction, {'id': eltId})
        .then(function(data) {
            if (data[type].hasOwnProperty('rating')) {
                let imgRating = ratingImg(equivRating(data[type.singular].rating));
                if (imgRating != '') {
                    // On ajoute la classification
                    $('.blockInformations__details')
                    .append(
                        '<li id="rating"><strong>Classification</strong><img src="' +
                        imgRating + '"/></li>'
                    );
                }
            }
        });

        /**
         * Retourne l'equivalent de classification US en FR
         *
         * @param {String} ratingUS Le code de classification US
         * @return {String|null}
         */
        function equivRating(ratingUS) {
            return ratings.hasOwnProperty(ratingUS) ? ratings[ratingUS] : null;
        }
        /**
         * Retourne l'URI de l'image de classification TV
         *
         * @param {String} rating Le code de classification FR
         * @return {String}
         */
        function ratingImg(rating) {
            return (ratingImgs.hasOwnProperty(rating)) ? ratingImgs[rating] : '';
        }
    }

    /**
     * Retourne les infos d'un membre
     *
     * @param {Number}   id    Identifiant du membre (par défaut: le membre connecté)
     * @return {Promise} Le membre
     */
    function getMember(id = null) {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (! userIdentified || betaseries_api_user_key == '') return;

        let args = {};
        if (id) args.id = id;
        return new Promise((resolve) => {
            callBetaSeries('GET', 'members', 'infos', args)
            .then(function(data) {
                // On retourne les infos du membre
                resolve(data.member);
            });
        });
    }

    /**
     * Compare le membre courant avec un autre membre
     */
    function compareMembers() {
        let id = $('#temps').data('loginid');
        getMember(id).
        then(function(member) {
            let otherMember = member;
            const dialogHTML = `
                <div
                  class="dialog dialog-container table-dark"
                  id="dialog-compare"
                  aria-hidden="true"
                  aria-labelledby="dialog-compare-title"
                >
                  <div class="dialog-overlay" data-a11y-dialog-hide></div>
                  <div class="dialog-content" role="document">
                    <button
                      data-a11y-dialog-hide
                      class="dialog-close"
                      aria-label="Fermer cette boîte de dialogue"
                    >
                      <i class="fa fa-times" aria-hidden="true"></i>
                    </button>

                    <h1 id="dialog-compare-title">Comparaison des membres</h1>

                    <div id="compare" class="table-responsive-lg">
                      <table class="table table-dark table-striped">
                        <thead>
                          <tr>
                            <th scope="col" class="col-lg-5">Infos</th>
                            <th scope="col" class="col-lg-3">Vous</th>
                            <th scope="col" class="other-user col-lg-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>`,
                trads = {
                    "id": 'ID',
                    "login": "Login",
                    "xp": 'Pts d\'expérience',
                    "subscription": 'Année d\'inscription',
                    stats: {
                        "friends": 'Amis',
                        "shows": 'Séries',
                        "seasons": 'Saisons',
                        "episodes": 'Episodes',
                        "comments": 'Commentaires',
                        "progress": 'Progression de visionnage',
                        "episodes_to_watch": 'Nb d\'épisodes à regarder',
                        "time_on_tv": 'Temps devant la TV',
                        "time_to_spend": 'Temps restant devant des séries à regarder',
                        "movies": 'Nb de films',
                        "badges": 'Nb de badges',
                        "member_since_days": 'Membre depuis (jours)',
                        "friends_of_friends": 'Les amis du réseau étendu',
                        "episodes_per_month": 'Nb d\'épisodes par mois',
                        "favorite_day": 'Jour favori',
                        "five_stars_percent": '% de votes 5 étoiles',
                        "four-five_stars_total": 'Nb de votes 4 ou 5 étoiles',
                        "streak_days": 'Nb de jours consécutifs à regarder des épisodes',
                        "favorite_genre": 'Genre favori',
                        "written_words": 'Nb de mots écrits sur BetaSeries',
                        "without_days": 'Nb jours d\'abstinence',
                        "shows_finished": 'Nb de séries terminées',
                        "shows_current": 'Nb de séries en cours',
                        "shows_to_watch": 'Nb de séries à voir',
                        "shows_abandoned": 'Nb de séries abandonnées',
                        "movies_to_watch": 'Nb de films à voir',
                        "time_on_movies": 'Temps devant les films',
                        "time_to_spend_movies": 'Temps restant devant les films à regarder'
                    }
                };
            $('head').append(`<link rel="stylesheet" href="${tableCSS}" integrity="sha384-Gi9pTl7apLpUEntAQPQ3PJWt6Es9SdtquwVZSgrheEoFdsSQA5me0PeVuZFSJszm" crossorigin="anonymous" referrerpolicy="no-referrer" />`);
            $('body').append(dialogHTML);
            //if (debug) console.log(currentUser, otherMember, trads);
            for (const [key, value] of Object.entries(trads)) {
                if (typeof value == 'object') {
                    for (const [subkey, subvalue] of Object.entries(trads[key])) {
                        if (/time/.test(subkey)) {
                            currentUser[key][subkey] = humanizeDuration((currentUser[key][subkey] * 60 * 1000), { language: currentUser.locale });
                            otherMember[key][subkey] = humanizeDuration((otherMember[key][subkey] * 60 * 1000), { language: currentUser.locale });
                        }
                        $('#dialog-compare table tbody').append(
                            '<tr><td>' + subvalue + '</td><td>' + currentUser[key][subkey] + '</td><td>' + otherMember[key][subkey] + '</td></tr>'
                        );
                    }
                } else {
                    $('#dialog-compare table tbody').append(
                        '<tr><td>' + value + '</td><td>' + currentUser[key] + '</td><td>' + otherMember[key] + '</td></tr>'
                    );
                }
            }
            $('.other-user').append(otherMember.login);
            const dialog = new A11yDialog(document.querySelector('#dialog-compare')),
                  html = document.documentElement;
            $('#stats_container h1')
                .css('display', 'inline-block')
                .after('<button type="button" class="button blue" data-a11y-dialog-show="dialog-compare">Se comparer à ce membre</button>');
            $('button.button.blue').click(function(e) {
                e.stopPropagation();
                e.preventDefault();
                dialog.show();
            });
            $('.dialog-close').click(function(e) {
                e.stopPropagation();
                e.preventDefault();
                dialog.hide();
            });
            dialog
                .on('show', function() { html.style.overflowY = 'hidden'; $('#dialog-compare').css('z-index', '1005').css('overflow', 'scroll');})
                .on('hide', function() { html.style.overflowY = ''; $('#dialog-compare').css('z-index', '0').css('overflow', 'none');});
        });
    }

    /**
     * Masque les pubs
     */
    function removeAds() {
        setTimeout(function() {
            $('script[src*="securepubads"]').remove();
            $('script[src*="static-od.com"]').remove();
            $('script[src*="ad.doubleclick.net"]').remove();
            $('script[src*="sddan.com"]').remove();
        }, 500);
        $('.parent-ad-desktop').attr('style', 'display: none !important');
        setInterval(function() {$('iframe[name!="userscript"]').remove();}, 1000);
        $('.blockPartner').attr('style', 'display: none !important');
    }

    /**
     * Ajout d'une feuille de style
     */
    function addStylesheet() {
        /* jshint ignore:start */
        GM_addStyle((<><![CDATA[
            #updateSimilarsBlock {vertical-align: middle;}
            .updateSimilars {
                cursor:pointer;
                -webkit-transform: rotate(-45deg) scale(1);
                transform: rotate(-45deg) scale(1);
                -webkit-transition: .3s ease-in-out;
                transition: .3s ease-in-out;
            }
            .updateSimilars:hover {
                -webkit-transform: rotate(0) scale(1.2);
                transform: rotate(0) scale(1.2);
            }
            .bandViewed {
                position:absolute;
                top:0;
                left:-64px;
                z-index:1;
            }
            button.button.blue {
                padding: 5px 10px;
                background-color: #556fa3;
                color: white;
                border-radius: 4px;
                font-family: Muli,"Lucida Grande","Trebuchet MS",sans-serif;
                letter-spacing: .5px;
                font-size: 12px;
                line-height: 1.2;
            }
            .stars-outer {
              display: inline-block;
              position: relative;
              font-family: FontAwesome;
            }

            .stars-outer::before {
              content: "\f006 \f006 \f006 \f006 \f006";
            }

            .stars-inner {
              position: absolute;
              top: 0;
              left: 0;
              white-space: nowrap;
              overflow: hidden;
              width: 0;
            }

            .stars-inner::before {
              content: "\f005 \f005 \f005 \f005 \f005";
              color: #f8ce0b;
            }

            .checkSeen:hover {
                opacity: 0.5;
            }

            /* -------------------------------------------------------------------------- *\
             * Styling to make the dialog look like a dialog
             * -------------------------------------------------------------------------- */

            [data-a11y-dialog-native] .dialog-overlay {
              display: none;
            }

            /**
             * When <dialog> is not supported, its default display is inline which can
             * cause layout issues.
             */
            dialog[open] {
              display: block;
            }

            .dialog[aria-hidden='true'] {
              display: none;
            }

            .dialog:not([data-a11y-dialog-native]),
            .dialog-overlay {
              position: fixed;
              top: 0;
              left: 0;
              bottom: 0;
              right: 0;
            }

            .dialog {
              display: flex;
            }

            .dialog-overlay {
              background-color: rgba(43, 46, 56, 0.9);
            }

            dialog::backdrop {
              background-color: rgba(43, 46, 56, 0.9);
            }

            .dialog-content {
              margin: auto;
              z-index: 20;
              position: relative;
            }

            dialog.dialog-content {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              margin: 0;
              color: white;
            }

            /* -------------------------------------------------------------------------- *\
             * Extra dialog styling to make it shiny
             * -------------------------------------------------------------------------- */

            @keyframes fade-in {
              from {
                opacity: 0;
              }
            }

            @keyframes slide-up {
              from {
                transform: translateY(10%);
              }
            }

            .dialog-overlay {
              animation: fade-in 200ms both;
            }

            .dialog-content {
              animation: fade-in 400ms 200ms both, slide-up 400ms 200ms both;
            }

            dialog.dialog-content {
              animation: fade-in 400ms 200ms both;
            }

            .dialog-content {
              padding: 1em;
              max-width: 90%;
              width: 600px;
              border-radius: 2px;
            }

            @media screen and (min-width: 700px) {
              .dialog-content {
                padding: 2em;
                font-size: 1.2em;
              }
            }

            .dialog h1 {
              margin: 0;
              font-size: 1.25em;
              padding-left: 20px;
            }

            .dialog-close {
              position: absolute;
              top: 0.5em;
              right: 0.5em;
              border: 0;
              padding: 0;
              background-color: transparent;
              font-weight: bold;
              font-size: 1.25em;
              width: 1.2em;
              height: 1.2em;
              text-align: center;
              cursor: pointer;
              transition: 0.15s;
              color: white;
            }

            @media screen and (min-width: 700px) {
              .dialog-close {
                top: 2em;
                right: 3em;
              }
            }
            .renderjson a              { text-decoration: none; }
            .renderjson .disclosure    { color: crimson;
                                         font-size: 150%; }
            .renderjson .syntax        { color: grey; }
            .renderjson .string        { color: red; }
            .renderjson .number        { color: cyan; }
            .renderjson .boolean       { color: plum; }
            .renderjson .key           { color: lightblue; }
            .renderjson .keyword       { color: lightgoldenrodyellow; }
            .renderjson .object.syntax { color: lightseagreen; }
            .renderjson .array.syntax  { color: lightsalmon; }

            #containerIframe {
              position: fixed;
              top: 80px;
              left: 0;
              width: 100%;
              height: 400px;
              margin: auto;
              text-align: center;
              z-index: 1000;
            }

            .updateSimilars:not(.finish) {
              -webkit-animation: spinner 1500ms infinite linear;
              -moz-animation: spinner 1500ms infinite linear;
              -ms-animation: spinner 1500ms infinite linear;
              -o-animation: spinner 1500ms infinite linear;
              animation: spinner 1500ms infinite linear;
            }
            /* Animation */
            @-webkit-keyframes spinner {
              0% {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
              }
              100% {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
              }
            }
            @-moz-keyframes spinner {
              0% {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
              }
              100% {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
              }
            }
            @-o-keyframes spinner {
              0% {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
              }
              100% {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
              }
            }
            @keyframes spinner {
              0% {
                -webkit-transform: rotate(0deg);
                -moz-transform: rotate(0deg);
                -ms-transform: rotate(0deg);
                -o-transform: rotate(0deg);
                transform: rotate(0deg);
              }
              100% {
                -webkit-transform: rotate(360deg);
                -moz-transform: rotate(360deg);
                -ms-transform: rotate(360deg);
                -o-transform: rotate(360deg);
                transform: rotate(360deg);
              }
            }
        ]]></>).toString());
        /* jshint ignore:end */
        // Fin
    }

    /**
     * Decode les HTMLEntities dans le titre
     *
     * @param  {Object} [$eltTitle] L'objet jQuery du titre à décoder
     * @return {void}
     */
    function decodeTitle($eltTitle = null) {
        let $elt = ($eltTitle && $eltTitle.length > 0) ? $eltTitle : $('.blockInformations__title'),
            title = $elt.text();

        if (/&#/.test(title)) {
            $elt.text($('<textarea />').html(title).text());
        }
    }

    /**
     * Retourne la ressource associée au type de page
     *
     * @param  {String} pageType    Le type de page consultée
     * @return {Object} Retourne le nom de la ressource API au singulier et au pluriel
     */
    function getApiResource(pageType) {
        let methods = {
            'serie': 'show',
            'film': 'movie',
            'episode': 'episode'
        };
        if (pageType in methods) {
            return {singular: methods[pageType], plural: methods[pageType] + 's'};
        }
        return null;
    }

    /**
     * Ajoute le nombre de votes à la note de la ressource
     */
    function addNumberVoters() {
        // On sort si la clé d'API n'est pas renseignée
        if (betaseries_api_user_key == '') return;

        let votes = $('.stars.js-render-stars'), // ElementHTML ayant pour attribut le titre avec la note de la série
            type = getApiResource(location.pathname.split('/')[1]), // Indique de quel type de ressource il s'agit
            eltId = $('#reactjs-' + type.singular + '-actions').data(type.singular + '-id'), // Identifiant de la ressource
            fonction = type.singular == 'show' || type.singular == 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource

        if (debug) console.log('votes %d, eltId: %d, type: %s', votes.length, eltId, type.singular);

        // On recupère les détails de la ressource
        callBetaSeries('GET', type.plural, fonction, {'id': eltId})
        .then((data) => {
            //if (debug) console.log('addNumberVoters callBetaSeries', data);
            let note;
            if (type.singular == 'show' || type.singular == 'movie') note = data[type.singular].notes;
            else note = data[type.singular].note;
            // On ajoute le nombre de votants à côté de la note dans l'attribut 'title' de l'élément HTML
            changeTitleNote(votes, note.mean, note.total);
        });
    }

    /**
     * Ajoute le nombre de votes à la note dans l'attribut title de la balise
     * contenant la représentation de la note de la ressource
     *
     * @param {Object} $elt    Le DOMElement jQuery à modifier
     * @param {Number} note    La note de la ressource
     * @param {Number} total   Le nombre de votants
     * @return void
     */
    function changeTitleNote($elt, note, total) {
        if (note <= 0 || total <= 0) {
            $elt.attr('title', 'Aucun vote');
            return;
        }

        let title = $elt.attr('title');
        // On met en forme le nombre de votes
        total = new Intl.NumberFormat('fr-FR', {style: 'decimal', useGrouping: true}).format(total);
        // On limite le nombre de chiffre après la virgule
        note = parseFloat(note).toFixed(1);
        // On vérifie que l'attribut title possède déjà la note, sinon on l'ajoute
        if (! /\/ 5/.test(title)) {
            title = note + ' / 5';
        }
        // On modifie l'attribut title pour y ajouter le nombre de votes
        $elt.attr('title', total + ' vote' + (total > 1 ? 's' : '') + ': ' + title);
    }

    /**
     * Crée les étoiles pour le rendu de la note
     *
     * @param {Object} $elt     Objet JQuery
     * @param {Number} note     La note de la ressource
     * @param {Number} total    Le nombre de votes
     * @return void
     */
    function usRenderStars($elt, note, total) {
        changeTitleNote($elt.parent('.stars-outer'), note, total);
        let starPercentageRounded = `${(Math.round(((note / 5) * 100) / 10) * 10)}%`;
        $elt.css('width', starPercentageRounded);
    }

    /**
     * Ajoute un bouton Vu sur la vignette d'un épisode
     */
    function addBtnWatchedToEpisode() {
        if (! /serie/.test(url)) return;

        if (debug) console.log('addBtnWatchedToEpisode');

        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (! userIdentified || betaseries_api_user_key == '') return;

        let seasons = $('#seasons div[role="button"]'),
            len = parseInt($('#seasons .slide--current .slide__infos').text(), 10),
            vignettes = $('#episodes .slide__image');

        // On vérifie que les saisons et les episodes soient chargés sur la page
        if (vignettes.length > 0 && vignettes.length >= len) {
            // On supprime le timer Interval
            clearInterval(timer);
            // On ajoute les cases à cocher sur les vignettes courantes
            addCheckbox();
        } else {
            if (debug) console.log('En attente du chargement des vignettes');
            return;
        }
        if (debug) console.log('Nb seasons: %d, nb vignettes: %d', seasons.length, vignettes.length);

        // Ajoute les cases à cocher sur les vignettes des épisodes
        function addCheckbox() {
            vignettes = getVignettes();
            let len = parseInt($('div.slide--current .slide__infos').text(), 10);
            vignettes.each(function(index, elt) {
                let $vignette = $(elt),
                    id = getEpisodeId($vignette);
                if (checkSeenPresent($vignette)) {
                    // On ajoute l'attribut ID et la classe 'seen' à la case 'checkSeen' de l'épisode déjà vu
                    let checkbox = $vignette.find('.checkSeen');
                    checkbox.attr('id', 'episode-' + id);
                    checkbox.addClass('seen');
                } else {
                    // On ajoute la case à cocher pour permettre d'indiquer l'épisode comme vu
                    $vignette.append('<div id="episode-' + id + '" class="checkSeen" style="background: none;"></div>');
                }

                // On ajoute un event click sur la case 'checkSeen'
                $('#episode-' + id).click(function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    let $elt = $(e.currentTarget),
                        episodeId = getEpisodeId($elt);
                    // On vérifie si l'épisode a déjà été vu
                    if ($elt.hasClass('seen')) {
                        // On demande à l'enlever des épisodes vus
                        changeStatusVignette($elt, 'notSeen', 'DELETE', episodeId);
                    }
                    // Sinon, on l'ajoute aux épisodes vus
                    else {
                        changeStatusVignette($elt, 'seen', 'POST', episodeId);
                    }
                });
            });
            /**
             * Modifie le statut d'un épisode sur l'API
             * @param  {Object} $elt      L'objet jQuery correspondant à l'épisode
             * @param  {String} status    Le nouveau statut de l'épisode
             * @param  {String} method    Verbe HTTP utilisé pour la requête à l'API
             * @param  {Number} episodeId L'ID de l'épisode
             * @return {void}
             */
            function changeStatusVignette($elt, status, method, episodeId) {
                let args = {'id': episodeId};
                if (method == 'POST')
                    args.bulk = false; // Flag pour ne pas mettre les épisodes précédents comme vus automatiquement

                callBetaSeries(method, 'episodes', 'watched', args)
                .then(function(data) {
                    if (debug) console.log('callBetaSeries %s episodes/watched', method, data);
                    changeStatus($elt, status);
                },
                function(err) {
                    if (err && err == 'changeStatus') {
                        changeStatus($elt, status);
                    } else if (err && err == 'accessToken') {
                        if (debug) console.log('similars error %s accessToken', method);
                        authenticate().then(function() {
                            callBetaSeries(method, 'episodes', 'watched', {'id': episodeId})
                            .then(function(data) {
                                if (debug) console.log('callBetaSeries %s episodes/watched', method, data);
                                changeStatus($elt, status);
                            },
                            function(err) {
                                if (err && err == 'changeStatus') {
                                    changeStatus($elt, status);
                                }
                            });
                        });
                    }
                });
            }
            /**
             * Change le statut visuel de la vignette sur le site
             * @param  {Object} $elt      L'objet jQuery de l'épisode
             * @param  {String} newStatus Le nouveau statut de l'épisode
             * @return {void}
             */
            function changeStatus($elt, newStatus) {
                if (newStatus == 'seen') {
                    let background = 'rgba(13,21,28,.2) center no-repeat url(\'data:image/svg+xml;utf8,<svg fill="%23fff" width="12" height="10" viewBox="2 3 12 10" xmlns="http://www.w3.org/2000/svg"><path fill="inherit" d="M6 10.78l-2.78-2.78-.947.94 3.727 3.727 8-8-.94-.94z"/></svg>\')';
                    $elt.css('background', background); // On ajoute le check dans la case à cocher
                    $elt.addClass('seen'); // On ajoute la classe 'seen'
                    // On supprime le voile masquant sur la vignette pour voir l'image de l'épisode
                    $elt.parent('div.slide__image').find('img').removeAttr('style');
                    $elt.parent('div.slide_flex').removeClass('slide--notSeen');
                    updateProgressBar(-1);

                    if ($('#episodes .seen').length == len) {
                        $('div.slide--current .slide__image').prepend('<div class="checkSeen"></div>');
                        $('div.slide--current').removeClass('slide--notSeen');
                        $('div.slide--current').addClass('slide--seen');
                    }
                } else {
                    $elt.css('background', 'none'); // On enlève le check dans la case à cocher
                    $elt.removeClass('seen'); // On supprime la classe 'seen'
                    // On remet le voile masquant sur la vignette de l'épisode
                    $elt.parent('div.slide__image').find('img').attr('style', 'transform: rotate(0deg) scale(1.2);filter: blur(30px);');

                    let contVignette = $elt.parent('div.slide_flex');
                    if (!contVignette.hasClass('slide--notSeen')) {
                        contVignette.addClass('slide--notSeen');
                    }
                    updateProgressBar(1);

                    if ($('#episodes .seen').length < len) {
                        $('div.slide--current .checkSeen').remove();
                        $('div.slide--current').addClass('slide--seen');
                        $('div.slide--current').addClass('slide--notSeen');
                    }
                }
            }
            /**
             * Met à jour la barre de progression de visionnage de la série
             * @param  {Number} i Entier positif ou négatif (1 ou -1)
             * @return {void}
             */
            function updateProgressBar(i) {
                let showId = $('#reactjs-show-actions').data('show-id'),
                    progBar = $('.progressBarShow'),
                    show = cache.get('shows', showId).show,
                    nbEpisodes = parseInt(show.episodes, 10),
                    remaining = i + show.user.remaining,
                    nbSeen = nbEpisodes - remaining,
                    status = (nbSeen * 100) / nbEpisodes;
                // On met à jour les infos dans l'objet ressource
                show.user.remaining = remaining;
                show.user.status = parseFloat(status.toFixed(1));
                cache.set('shows', showId, {'show': show});
                // On met à jour la barre de progression
                progBar.css('width', status.toFixed(1) + '%');
            }
        }

        // On ajoute un event sur le changement de saison
        seasons.click(function() {
            //e.stopPropagation();
            //e.preventDefault();
            if (debug) console.log('season click');
            // On attend que les vignettes de la saison choisie soient chargées
            timer = setInterval(function() {
                let len = parseInt($('#seasons .slide--current .slide__infos').text(), 10),
                    vigns = getVignettes();
                // On vérifie qu'il y a des vignettes et que leur nombre soit égale
                // ou supérieur au nombre d'épisodes indiqués dans la saison
                if (vigns.length > 0 && vigns.length >= len) {
                    if (debug) console.log('Season click clear timer', vigns.length, len);
                    // On supprime le timer Interval
                    clearInterval(timer);
                    addCheckbox();
                }
            }, 500);
        });
        // Retourne la saison courante
        /*function getCurrentSeason() {
            return $('#seasons div[role="button"].slide--current');
        }*/
        // On récupère les vignettes des épisodes
        function getVignettes() {
            return $('#episodes .slide__image');
        }
        // On vérifie si le flag 'checkSeen' est présent
        function checkSeenPresent(elt) {
            return elt.find('.checkSeen').length > 0;
        }
        // Retourne l'identifiant de l'épisode
        function getEpisodeId(episode) {
            return episode.parents('div.slide_flex').find('button').first().attr('id').split('-')[1];
        }
    }

    /**
     * Vérifie si les séries/films similaires ont été vues
     * Nécessite que l'utilisateur soit connecté et que la clé d'API soit renseignée
     */
    function similarsViewed() {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (! userIdentified || betaseries_api_user_key == '' || ! /(serie|film)/.test(url)) return;

        /*
         * On ajoute un bouton de mise à jour des series vues
         * et on vérifie qu'il n'existe pas déjà
         */
        if ($('#updateSimilarsBlock').length < 1) {
            // On ajoute le bouton de mise à jour des similaires
            $('#similars .blockTitles').append(`
            <div id="updateSimilarsBlock">
              <img src="https://betaseries.aufilelec.fr/img/update.png" class="updateSimilars" title="Mise à jour des similaires vus"/>
            </div>`);
            // Si le bouton d'ajout de similaire est présent, on ajoute une marge
            if ($('#similars button.blockTitle-subtitle').length == 1) {
                $('#updateSimilarsBlock').css('margin-left', '10px');
            }
            // On ajoute la gestion de l'event click sur le bouton
            $('.updateSimilars').click(function(e) {
                e.stopPropagation();
                e.preventDefault();
                $(this).removeClass('finish');
                // On supprime les bandeaux Viewed
                $('.bandViewed').remove();
                // On supprime les notes
                $('.stars-outer').remove();
                // On met à jour les series similaires
                similarsViewed();
            });
        }

        let similars = $('#similars .slide__title'), // Les titres des ressources similaires
            len = similars.length, // Le nombre de similaires
            type = getApiResource(url.split('/')[1]), // Le type de ressource
            resId = $('#reactjs-' + type.singular + '-actions').data(type.singular + '-id'), // Identifiant de la ressource
            show = cache.get(type.plural, resId).show;

        if (debug) console.log('nb similars: %d', parseInt(show.similars, 10));

        // On sort si il n'y a aucun similars ou si il s'agit de la vignette d'ajout
        if (len <= 0 || (len == 1 && $(similars.parent().get(0)).find('button').length == 1)) return;

        callBetaSeries('GET', type.plural, 'similars', {'thetvdb_id': show.thetvdb_id, 'details': true})
        .then(function(data) {
            for (let s = 0; s < data.similars.length; s++) {
                let $elt = $($('#similars .slide__title').get(s)),
                    resource = data.similars[s][type.singular];
                decodeTitle($elt);
                addBandeau($elt, resource.user.status, resource.notes);
                cache.set(type.plural, resource.id, {'show': resource});
                $('.updateSimilars').addClass('finish');
            }
        });

        /**
         * Fonction d'ajout du bandeau "Viewed" sur les images des similaires
         * si la série a été vue totalement/partiellement
         *
         * @param {Object} elt      Objet jQuery du Noeud HTML contenant le titre du similaire
         * @param {Number} status   Le statut de vu de la serie pour l'utilisateur courant
         * @param {Object} objNote  Objet note contenant la note moyenne et le nombre total de votes
         * @return void
         */
        function addBandeau(elt, status, objNote) {
            // Si la série a été vue ou commencée
            if (status && status > 0) {
                // On ajoute le bandeau "Viewed"
                elt.siblings('a').prepend(
                    '<img src="https://betaseries.aufilelec.fr/img/viewed.png" class="bandViewed"/>'
                );
            }
            // On ajoute le code HTML pour le rendu de la note
            elt.after(
                `<div class="stars-outer"><div class="stars-inner"></div></div>`
            );
            usRenderStars(
                $('.stars-inner', elt.parent()),
                parseFloat(objNote.mean).toFixed(2),
                objNote.total
            );
        }
    }

    /**
     * Ajoute le statut de la série sur la page de gestion des séries de l'utilisateur
     */
    function addStatusToGestionSeries() {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (! userIdentified || betaseries_api_user_key == '') return;

        let series = $('#member_shows div.showItem.cf');
        if (series.length < 1) return;

        series.each(function(index, serie) {
            let id = $(serie).data('id'),
                infos = $($(serie).find('.infos'));
            callBetaSeries('GET', 'shows', 'display', {'id': id})
            .then(function(data) {
                let statut = (data.show.status == 'Continuing') ? 'En cours' : 'Terminée';
                infos.append(`<br>Statut: ${statut}`);
            });
        });
    }

    /**
     * Fonction d'authentification sur l'API BetaSeries
     *
     * @return {Promise}
     */
    function authenticate() {
        if (debug) console.log('authenticate');
        $('body').append(`
            <div id="containerIframe">
              <iframe id="userscript"
                      name="userscript"
                      title="Connexion à BetaSeries"
                      width="50%"
                      height="400"
                      src="https://betaseries.aufilelec.fr/"
                      style="background:white;margin:auto;">
              </iframe>
            </div>'
        `);
        return new Promise((resolve, reject) => {
            window.addEventListener("message", receiveMessage, false);
            function receiveMessage(event) {
                if (debug) console.log('receiveMessage', event);
                if (event.origin !== "https://betaseries.aufilelec.fr") {
                    if (debug) console.error('receiveMessage {origin: %s}', event.origin, event);
                    reject('event.origin is not betaseries.aufilelec.fr');
                    return;
                }
                let msg = event.data.message;
                if (msg == 'access_token') {
                    betaseries_api_user_token = event.data.value;
                    $('#containerIframe').remove();
                    //cb(msg);
                    resolve(msg);
                } else {
                    if (debug) console.error('Erreur de récuperation du token', event);
                    reject(event.data);
                }
            }
        });
    }

    /**
     * Fonction servant à appeler l'API de BetaSeries
     *
     * @param {String}   type             Type de methode d'appel Ajax (GET, POST, PUT, DELETE)
     * @param {String}   methode          La ressource de l'API (ex: shows, seasons, episodes...)
     * @param {String}   fonction         La fonction à appliquer sur la ressource (ex: search, list...)
     * @param {Object}   args             Un objet (clef, valeur) à transmettre dans la requête
     * @param {bool}     [nocache=false]  Indique si on doit utiliser le cache ou non (Par défaut: false)
     * @return   {Promise}
     */
    function callBetaSeries(type, methode, fonction, args, nocache = false) {
        let urlAPI = 'https://api.betaseries.com/' + methode + '/' + fonction,
            headers = {
                'Accept': 'application/json',
                'X-BetaSeries-Version': '3.0',
                'x-betaseries-token': betaseries_api_user_token,
                'x-betaseries-key': betaseries_api_user_key
            };

        // On retourne la ressource en cache si elle y est présente
        if (! nocache && type == 'GET' && args && 'id' in args && cache.has(methode, args.id)) {
            return new Promise((resolve) => {
                resolve(cache.get(methode, args.id));
            });
        }
        return new Promise((resolve, reject) => {
            $.ajax(urlAPI, {
                method: type,
                data: args,
                dataType: 'json',
                headers: headers,
                crossDomain: true
            }).done(function(data) {
                // Mise en cache de la ressource
                if (!nocache && args && 'id' in args && type == 'GET') {
                    cache.set(methode, args.id, data);
                }
                resolve(data);
            })
            .fail(function(jqXHR, textStatus) {
                console.error('callBetaSeries error: ', textStatus, type, urlAPI);
                if (! jqXHR.responseJSON) {
                    reject(textStatus);
                }

                let code = jqXHR.responseJSON.errors[0].code,
                    text = jqXHR.responseJSON.errors[0].text;
                if (code == 2005 || (jqXHR.status == 400 && code == 0 && text == "L'utilisateur a déjà marqué cet épisode comme vu.")) {
                    reject('changeStatus');
                } else if (code == 2001) {
                    reject('accessToken');
                } else {
                    reject(textStatus);
                }
            })
            .always(function() {counter++;});
        });
    }

    /**
     * Create a new Cache
     * @class
     */
    function Cache() {

        /**
         * Objet contenant les données
         * @type {Object}
         */
        let data = {shows: {}, episodes: {}, movies: {}, members: {}};
        let self = this;

        /**
         * Returns an Array of all currently set keys.
         * @returns {Array} cache keys
         */
        this.keys = function(type = null) {
            if (! type) return Object.keys(data);
            return Object.keys(data[type]);
        };

        /**
         * Checks if a key is currently set in the cache.
         * @param {String} type Le type de ressource
         * @param {String} key  the key to look for
         * @returns {boolean} true if set, false otherwise
         */
        this.has = function(type, key) {
            return (data.hasOwnProperty(type) && data[type].hasOwnProperty(key));
        };

        /**
         * Clears all cache entries.
         * @param {String} [type=null] Le type de ressource à nettoyer
         */
        this.clear = function(type = null) {
            if (debug) console.log('Nettoyage du cache', type);
            // On nettoie juste un type de ressource
            if (type) {
                for (let key in data[type])
                    delete data[type][key];
            }
            // On nettoie l'ensemble du cache
            else {
                for (type in data)
                    self.clear(type);
            }
        };

        /**
         * Gets the cache entry for the given key.
         * @param {String} type Le type de ressource
         * @param {String} key  the cache key
         * @returns {*} the cache entry if set, or undefined otherwise
         */
        this.get = function(type, key) {
            if (self.has(type, key)) {
                if (debug) console.log('Retourne la ressource (%s: %d) du cache', type, key);
                return data[type][key];
            }
            return null;
        };

        /**
         * Returns the cache entry if set, or a default value otherwise.
         * @param {String} type Le type de ressource
         * @param {String} key  the key to retrieve
         * @param {*}      def  the default value to return if unset
         * @returns {*} the cache entry if set, or the default value provided.
         */
        this.getOrDefault = function(type, key, def) {
            if (debug) console.log('Retourne la ressource (%s: %d) du cache ou valeur par défaut', type, key, def);
            return self.has(type, key) ? self.get(type, key) : def;
        };

        /**
         * Sets a cache entry with the provided key and value.
         * @param {String} type  Le type de ressource
         * @param {String} key   the key to set
         * @param {*}      value the value to set
         */
        this.set = function(type, key, value) {
            if (debug) console.log('Ajout de la ressource (%s: %d) en cache', type, key, value);
            if (data.hasOwnProperty(type)) {
                data[type][key] = value;
            }
        };

        /**
         * Removes the cache entry for the given key.
         * @param {String} type  Le type de ressource
         * @param {String} key the key to remove
         */
        this.remove = function(type, key) {
            if (debug) console.log('Suppression de la ressource[%s]: %d du cache', type, key);
            if (self.has(type, key)) {
                delete data[type][key];
            }
        };
    }

})(jQuery);