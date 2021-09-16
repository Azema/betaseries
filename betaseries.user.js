// ==UserScript==
// @name         betaseries
// @namespace    http://tampermonkey.net/
// @version      0.10.0
// @description  Ajoute quelques améliorations au site BetaSeries
// @author       Azema
// @homepage     https://github.com/Azema/betaseries
// @match        https://www.betaseries.com/serie/*
// @match        https://www.betaseries.com/episode/*
// @match        https://www.betaseries.com/film/*
// @match        https://www.betaseries.com/membre/*
// @icon         https://www.betaseries.com/images/site/favicon-32x32.png
// @require      https://cdnjs.cloudflare.com/ajax/libs/humanize-duration/3.27.0/humanize-duration.min.js
// @grant        none
// ==/UserScript==

/*global jQuery A11yDialog humanizeDuration*/
/*global betaseries_api_user_token*/
/*jslint unparam: true */

// Ajouter ici votre clé d'API BetaSeries (Demande de clé API: https://www.betaseries.com/api/)
let betaseries_api_user_key = '';

(function($) {
    'use strict';

    const regexGestionSeries = new RegExp('^/membre/.*/series$'),
          regexUser = new RegExp('^/membre/[A-Za-z0-9]*$'),
          regexSerieOrMovie = new RegExp('^/(serie|film|episode)/*');
    let debug = false,
        url = location.pathname,
        userIdentified = typeof betaseries_api_user_token != 'undefined',
        timer, currentUser;

    // Fonctions appeler pour les pages des series, des films et des episodes
    if (regexSerieOrMovie.test(url)) {
        removeAds();
        addStylesheet();
        decodeTitle();
        similarsViewed();
        addNumberVoters();
        // On ajoute un timer interval en attendant que les saisons et les épisodes soient chargés
        timer = setInterval(function() {
            addBtnWatchedToEpisode();
        }, 500);
    }
    // Fonctions appeler pour la page de gestion des series
    if (regexGestionSeries.test(url)) {
        addStatusToGestionSeries();
    }
    // Fonctions appeler sur la page des membres
    if (regexUser.test(url) && userIdentified) {
        removeAds();
        addStylesheet();
        getMember(function(member) {
            currentUser = member;
            let login = url.split('/')[2];
            // On ajoute la fonction de comparaison des membres
            if (currentUser && login != currentUser.login) {
                compareMembers();
            }
        }, null);
    }

    /**
     * @function cb    Fonction de callback retournant le membre demandé
     * @number   id    Identifiant du membre (par défaut: le membre connecté)
     * @return void
     */
    function getMember(cb, id = null) {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (! userIdentified || betaseries_api_user_key == '') return;

        let args = {};
        if (id) args.id = id;
        callBetaSeries(function(err, data) {
            if (err != null) { cb(null); return }
            // On retourne les infos du membre
            cb(data.member);
        }, 'GET', 'members', 'infos', args);
    }

    /*
     * Compare le membre courant avec un autre membre
     */
    function compareMembers() {
        let id = $('#temps').data('loginid');
        getMember(function(member) {
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
          &times;
        </button>

        <h1 id="dialog-compare-title">Comparaison des membres</h1>

        <div id="compare table-responsive-lg">
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
    </div>
                `,
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
            $('head').append(`<style type="text/css">${tableCSS}/<style>`);
            $('body').append(dialogHTML);
            if (debug) console.log(currentUser, otherMember, trads);
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
        }, id);
    }

    /*
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
        setInterval(function() {$('iframe').remove();}, 1000);
        $('.blockPartner').attr('style', 'display: none !important');
    }

    /*
     * Ajout d'une feuille de style
     */
    function addStylesheet() {
        let style = `
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
        .stars .us-star-svg {
            width: 18px;
            height: 18px;
        }
        .similars-stars {
            text-align: center;
        }
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

/* -------------------------------------------------------------------------- *\
 * Styling to make the dialog look like a dialog
 * -------------------------------------------------------------------------- */

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
  }
}

.dialog h1 {
  margin: 0;
  font-size: 1.25em;
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
}

@media screen and (min-width: 700px) {
  .dialog-close {
    top: 1em;
    right: 1em;
  }
}
`;
        $('head')
            .append(`<style type="text/css">${style}/<style>`)
            //.append('<link rel="stylesheet" href="https://unpkg.com/bootstrap-table@1.18.3/dist/bootstrap-table.min.css"></link>');
    }

    /*
     * Decode les HTMLEntities dans le titre
     */
    function decodeTitle() {
        let theString = $('.blockInformations__title').text(),
            matches = theString.match(/&#/);
        if (matches != undefined && matches.length > 0) {
            $('.blockInformations__title').text($('<textarea />').html(theString).text());
            //console.log('Title updated');
        }
    }

    /**
     * Retourne la ressource associée au type de page
     *
     * @string pageType  Le type de page consultée
     * @bool   singulier Retourne la methode au singulier (par défaut: false)
     * @return string Retourne le nom de la ressource API
     */
    function getApiResource(pageType, singulier = false) {
        let methods = {
            'serie': 'show',
            'film': 'movie',
            'episode': 'episode'
        };
        for (const [key, value] of Object.entries(methods)) {
            if (pageType == key) {
                if (singulier == false) return value + 's';
                else return value;
            }
        }
        return null;
    }

    /*
     * Ajoute le nombre de votants à la note de la série
     */
    function addNumberVoters() {
        // On sort si la clé d'API n'est pas renseignée
        if (betaseries_api_user_key == '') return;

        let votes = $('.stars.js-render-stars'), // ElementHTML ayant pour attribut le titre avec la note de la série
            note = parseInt(votes.attr('title').split('/')[0], 10),
            type = getApiResource(location.pathname.split('/')[1], true), // Indique de quel type de ressource il s'agit
            eltId = $('#reactjs-'+type+'-actions').data(type+'-id'), // Identifiant de la ressource
            fonction = type == 'show' || type == 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource
        // On sort si il n'y a aucun vote
        if (note <= 0) return;
        if (debug) console.log('votes %d, showId: %d, type: %s', votes.length, eltId, type);
        // On recupère les détails de la ressource
        callBetaSeries(function(error, data) {
            if (error != null) return;
            let notes;
            if (type == 'show' || type == 'movie') notes = data[type].notes;
            else notes = data[type].note;
            // On ajoute le nombre de votants à côté de la note dans l'attribut 'title' de l'élément HTML
            votes.attr('title', votes.attr('title') + ' (' + notes.total + ' votant' + (notes.total > 1 ? 's' : '') + ')');
        }, 'GET', type + 's', fonction, {'id': eltId});
    }

    /*
     * Crée les étoiles de la note
     */
    function usRenderStars() {
        const renderStars = $('.js-render-stars.us-render-stars');
        if (renderStars.length <= 0) {
            return;
        }
        renderStars.empty();
        let svg,
            use,
            typeSvg;
        const nsSvg = "http://www.w3.org/2000/svg",
              nsLink = "http://www.w3.org/1999/xlink";

        renderStars.each(function(index, elt) {
            let $elt = $(elt),
                note = $elt.data('note'),
                votants = $elt.data('votants');
            $elt.attr('title', `${note} / 5 (${votants} votants)`);

            for (let i = 0; i < 5; i++) {
                typeSvg = (note <= i) ? 'empty' : (note <= i+1) ? 'half' : 'full';
                svg = document.createElementNS(nsSvg, 'svg');
                svg.classList.add('star-svg');
                svg.classList.add('us-star-svg');
                svg.setAttribute('viewBox', '0 0 100 100');
                use = document.createElementNS(nsSvg, 'use');
                use.setAttributeNS(nsLink, 'href', `#icon-star-${typeSvg}`);
                svg.appendChild(use);
                $elt.append(svg);
            }
        });
    }

    /*
     * Ajoute un bouton Vu sur la vignette d'un épisode
     */
    function addBtnWatchedToEpisode() {
        if (! /serie/.test(url)) return;
        if (debug) console.log('addBtnWatchedToEpisode');
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (! userIdentified || betaseries_api_user_key == '') return;
        // On sort si il ne s'agit pas d'une série
        if (location.pathname.split('/')[1] != 'serie') return;

        let seasons = $('#seasons div[role="button"]'),
            vignettes = $('#episodes .slide__image');

        if (debug) console.log('Nb seasons: %d, nb vignettes: %d', seasons.length, vignettes.length);
        // On vérifie que les saisons et les episodes soient chargés sur la page
        if (vignettes.length > 0) {
            // On supprime le timer Interval
            clearInterval(timer);
        } else {
            return;
        }
        // Ajoute les cases à cocher sur les vignettes des épisodes
        function addCheckbox() {
            vignettes = getVignettes();
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
                    let $elt = $(this),
                        episodeId = getEpisodeId($elt);
                    // On vérifie si l'épisode a déjà été vu
                    if ($elt.hasClass('seen')) {
                        // On demande à l'enlever des épisodes vus
                        callBetaSeries(function(err, data) {
                            if (debug) console.log('callBetaSeries DELETE episodes/watched', err, data);
                            if (err) return;
                            $elt.css('background', 'none'); // On enlève le check dans la case à cocher
                            $elt.removeClass('seen'); // On supprime la classe 'seen'
                            // On remet le voile masquant sur la vignette de l'épisode
                            $elt.parent('div.slide__image').find('img').attr('style', 'transform: rotate(0deg) scale(1.2);filter: blur(30px);');
                        }, 'DELETE', 'episodes', 'watched', {'id': episodeId});
                    }
                    // Sinon, on l'ajoute aux épisodes vus
                    else {
                        callBetaSeries(function(err, data) {
                            if (debug) console.log('callBetaSeries POST episodes/watched', err, data);
                            if (err) return;

                            let background = 'rgba(13,21,28,.2) center no-repeat url(\'data:image/svg+xml;utf8,<svg fill="%23fff" width="12" height="10" viewBox="2 3 12 10" xmlns="http://www.w3.org/2000/svg"><path fill="inherit" d="M6 10.78l-2.78-2.78-.947.94 3.727 3.727 8-8-.94-.94z"/></svg>\')';
                            $elt.css('background', background); // On ajoute le check dans la case à cocher
                            $elt.addClass('seen'); // On ajoute la classe 'seen'
                            // On supprime le voile masquant sur la vignette pour voir l'image de l'épisode
                            $elt.parent('div.slide__image').find('img').removeAttr('style');
                        }, 'POST', 'episodes', 'watched', {'id': episodeId});
                    }
                });
            });
        }
        // On ajoute les cases à cocher sur les vignettes courantes
        addCheckbox();
        // On ajoute un event sur le changement de saison
        seasons.click(function(e) {
            if (debug) console.log('season click');
            // On attend que les vignettes de la saison choisie soient chargées
            timer = setInterval(function() {
                if (getVignettes().length > 0) {
                    addCheckbox();
                    // On supprime le timer Interval
                    clearInterval(timer);
                }
            }, 500);
        });
        // Retourne la saison courante
        function getCurrentSeason() {
            return $('#seasons div[role="button"].slide--current');
        }
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

    /*
     * Vérifie si les séries/films similaires ont été vues
     * Nécessite que l'utilisateur soit connecté et que la clé d'API soit renseignée
     */
    function similarsViewed() {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (! userIdentified || betaseries_api_user_key == '') return;

        let similars = $('#similars .slide__title'),
            len = similars.length,
            type;
        if (debug) console.log('nb similars: %d', similars.length);
        // On recupere le type d'élément de recherche
        type = location.pathname.split('/')[1] == 'serie' ? 'shows' : 'movies';

        // On sort si il n'y a aucun similars ou si il s'agit de la vignette d'ajout
        if (similars.length <= 0 || (similars.length == 1 && $(similars.parent().get(0)).find('button').length == 1)) return;

        similars.each(function(index, elt) {
            let title = $(elt).text().trim(),
                matches = title.match(/&#/);
            if (debug) console.log('Tilte similar: %s', title, matches);
            // On decode les HTMLEntities dans les titres des similaires
            if (matches && matches.length > 0) {
                title = $('<textarea />').html(title).text();
                // On en profite pour mettre à jour le titre du similaire
                $(elt).text(title);
            }
            // On effectue une recherche par titre pour chaque serie sur l'API BetaSeries
            callBetaSeries(function(error, data) {
                if (error != null) return;
                /* Si nous n'avons qu'un seul résultat */
                if (data[type].length == 1) {
                    addBandeau(elt, data[type][0].user.status, data[type][0].notes);
                }
                // Si il y a plusieurs résultats de recherche
                else if (data[type].length > 1) {
                    let url = $(elt).siblings('a').attr('href');
                    if (debug) console.log('URL de la serie: %s', url);
                    for (let i = 0; i < data[type].length; i++) {
                        if (debug) console.log('URL similar: %s', data[type][i].resource_url);
                        // On verifie la concordance avec l'URL de la serie
                        if (data[type][i].resource_url === url) {
                            if (debug) console.log('Concordance trouvée');
                            addBandeau(elt, data[type][i].user.status, data[type][i].notes);
                            break;
                        }
                    }
                }
                if (index == len - 1) {
                    if (debug) console.log('call usRenderStars');
                    usRenderStars();
                }
            }, 'GET', type, 'search', {title: title});
        });

        /*
         * On ajoute un bouton de mise à jour des series vues
         * et on vérifie qu'il n'existe pas déjà
         */
        if ($('#updateSimilarsBlock').length < 1) {
            let img = '<div id="updateSimilarsBlock"><img src="https://www.aufilelec.fr/static/update.png" class="updateSimilars" title="Mise à jour des similaires vus"/></div>';
            if ($('#similars button.blockTitle-subtitle').length == 1) {
                img = '<div id="updateSimilarsBlock" style="margin-left:10px;"><img src="https://www.aufilelec.fr/static/update.png" class="updateSimilars" title="Mise à jour des similaires vus"/></div>';
            }
            $('#similars .blockTitles').append(img);
            // On ajoute la gestion de l'event click sur le bouton
            $('.updateSimilars').click(function(e) {
                e.stopPropagation();
                e.preventDefault();
                // On supprime les coins viewed
                $('.bandViewed').remove();
                // On met à jour les series similaires
                similarsViewed();
            });
        }

        /**
         * Fonction d'ajout du bandeau "Viewed" sur les images des similaire
         * si la série a été vue totalement/partiellement
         *
         * @object elt      Noeud HTML contenant le titre du similaire
         * @number status   Le statut de vu de la serie pour l'utilisateur courant
         * @object objNote  Objet note contenant la note moyenne et le nombre total de votes
         * @return void
         */
        function addBandeau(elt, status, objNote) {
            // Si la série a été vue ou commencée
            if (status && status > 0) {
                // On ajoute le bandeau "Viewed"
                $(elt).siblings('a').prepend(
                    '<img src="//www.aufilelec.fr/static/viewed.png" class="bandViewed"/>'
                );
            }
            let note = parseFloat(objNote.mean).toPrecision(2),
                votants = objNote.total;
            $(elt).after(
                `<div class="similars-stars"><span class="stars js-render-stars us-render-stars" data-note="${note}" data-votants="${votants}"></span></div>`
            );
        }
    }

    /*
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
            callBetaSeries(function(error, data) {
                if (error != null) return;
                let statut = (data.show.status == 'Continuing') ? 'En cours' : 'Terminée';
                infos.append(`<br>Statut: ${statut}`);
            }, 'GET', 'shows', 'display', {'id': id});
        });
    }

    /**
     * Fonction servant à appeler l'API de BetaSeries
     *
     * @function cb       Fonction de callback(error, data)
     * @string   type     Type de methode d'appel Ajax (GET, POST, PUT, DELETE)
     * @string   methode  La ressource de l'API (ex: shows, seasons, episodes...)
     * @string   fonction La fonction à appliquer sur la ressource (ex: search, list...)
     * @object   args     Un objet (clef, valeur) à transmettre dans la requête
     * @return   void
     */
    function callBetaSeries(cb, type, methode, fonction, args) {
        let url = 'https://api.betaseries.com/' + methode + '/' + fonction,
            headers = {
                'X-BetaSeries-Version': '3.0',
                'x-betaseries-token': betaseries_api_user_token,
                'x-betaseries-key': betaseries_api_user_key
            };
        if (type == 'GET' & args != null && args.length > 0) {
            url = '?';
            for (const [key, value] of Object.entries(args)) {
                url += '&' + key + '=' + value;
            }
        }
        $.ajax(url, {
            method: type,
            data: args,
            dataType: 'json',
            headers: headers,
            success: function(data) {
                cb(null, data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error('callBetaSeries error: ', errorThrown, url);
                cb(textStatus);
            }
        });
    }

    const tableCSS = `
.table {
  width: 100%;
  margin-bottom: 1rem;
  color: #212529;
}

.table th,
.table td {
  padding: 0.75rem;
  vertical-align: top;
  border-top: 1px solid #dee2e6;
}

.table thead th {
  vertical-align: bottom;
  border-bottom: 2px solid #dee2e6;
}

.table tbody + tbody {
  border-top: 2px solid #dee2e6;
}

.table-sm th,
.table-sm td {
  padding: 0.3rem;
}

.table-bordered {
  border: 1px solid #dee2e6;
}

.table-bordered th,
.table-bordered td {
  border: 1px solid #dee2e6;
}

.table-bordered thead th,
.table-bordered thead td {
  border-bottom-width: 2px;
}

.table-borderless th,
.table-borderless td,
.table-borderless thead th,
.table-borderless tbody + tbody {
  border: 0;
}

.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(0, 0, 0, 0.05);
}

.table-hover tbody tr:hover {
  color: #212529;
  background-color: rgba(0, 0, 0, 0.075);
}

.table-primary,
.table-primary > th,
.table-primary > td {
  background-color: #b8daff;
}

.table-primary th,
.table-primary td,
.table-primary thead th,
.table-primary tbody + tbody {
  border-color: #7abaff;
}

.table-hover .table-primary:hover {
  background-color: #9fcdff;
}

.table-hover .table-primary:hover > td,
.table-hover .table-primary:hover > th {
  background-color: #9fcdff;
}

.table-secondary,
.table-secondary > th,
.table-secondary > td {
  background-color: #d6d8db;
}

.table-secondary th,
.table-secondary td,
.table-secondary thead th,
.table-secondary tbody + tbody {
  border-color: #b3b7bb;
}

.table-hover .table-secondary:hover {
  background-color: #c8cbcf;
}

.table-hover .table-secondary:hover > td,
.table-hover .table-secondary:hover > th {
  background-color: #c8cbcf;
}

.table-success,
.table-success > th,
.table-success > td {
  background-color: #c3e6cb;
}

.table-success th,
.table-success td,
.table-success thead th,
.table-success tbody + tbody {
  border-color: #8fd19e;
}

.table-hover .table-success:hover {
  background-color: #b1dfbb;
}

.table-hover .table-success:hover > td,
.table-hover .table-success:hover > th {
  background-color: #b1dfbb;
}

.table-info,
.table-info > th,
.table-info > td {
  background-color: #bee5eb;
}

.table-info th,
.table-info td,
.table-info thead th,
.table-info tbody + tbody {
  border-color: #86cfda;
}

.table-hover .table-info:hover {
  background-color: #abdde5;
}

.table-hover .table-info:hover > td,
.table-hover .table-info:hover > th {
  background-color: #abdde5;
}

.table-warning,
.table-warning > th,
.table-warning > td {
  background-color: #ffeeba;
}

.table-warning th,
.table-warning td,
.table-warning thead th,
.table-warning tbody + tbody {
  border-color: #ffdf7e;
}

.table-hover .table-warning:hover {
  background-color: #ffe8a1;
}

.table-hover .table-warning:hover > td,
.table-hover .table-warning:hover > th {
  background-color: #ffe8a1;
}

.table-danger,
.table-danger > th,
.table-danger > td {
  background-color: #f5c6cb;
}

.table-danger th,
.table-danger td,
.table-danger thead th,
.table-danger tbody + tbody {
  border-color: #ed969e;
}

.table-hover .table-danger:hover {
  background-color: #f1b0b7;
}

.table-hover .table-danger:hover > td,
.table-hover .table-danger:hover > th {
  background-color: #f1b0b7;
}

.table-light,
.table-light > th,
.table-light > td {
  background-color: #fdfdfe;
}

.table-light th,
.table-light td,
.table-light thead th,
.table-light tbody + tbody {
  border-color: #fbfcfc;
}

.table-hover .table-light:hover {
  background-color: #ececf6;
}

.table-hover .table-light:hover > td,
.table-hover .table-light:hover > th {
  background-color: #ececf6;
}

.table-dark,
.table-dark > th,
.table-dark > td {
  background-color: #c6c8ca;
}

.table-dark th,
.table-dark td,
.table-dark thead th,
.table-dark tbody + tbody {
  border-color: #95999c;
}

.table-hover .table-dark:hover {
  background-color: #b9bbbe;
}

.table-hover .table-dark:hover > td,
.table-hover .table-dark:hover > th {
  background-color: #b9bbbe;
}

.table-active,
.table-active > th,
.table-active > td {
  background-color: rgba(0, 0, 0, 0.075);
}

.table-hover .table-active:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.table-hover .table-active:hover > td,
.table-hover .table-active:hover > th {
  background-color: rgba(0, 0, 0, 0.075);
}

.table .thead-dark th {
  color: #fff;
  background-color: #343a40;
  border-color: #454d55;
}

.table .thead-light th {
  color: #495057;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.table-dark {
  color: #fff;
  background-color: #343a40;
}

.table-dark th,
.table-dark td,
.table-dark thead th {
  border-color: #454d55;
}

.table-dark.table-bordered {
  border: 0;
}

.table-dark.table-striped tbody tr:nth-of-type(odd) {
  background-color: rgba(255, 255, 255, 0.05);
}

.table-dark.table-hover tbody tr:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.075);
}

@media (max-width: 575.98px) {
  .table-responsive-sm {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .table-responsive-sm > .table-bordered {
    border: 0;
  }
}

@media (max-width: 767.98px) {
  .table-responsive-md {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .table-responsive-md > .table-bordered {
    border: 0;
  }
}

@media (max-width: 991.98px) {
  .table-responsive-lg {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .table-responsive-lg > .table-bordered {
    border: 0;
  }
}

@media (max-width: 1199.98px) {
  .table-responsive-xl {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .table-responsive-xl > .table-bordered {
    border: 0;
  }
}

.table-responsive {
  display: block;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-responsive > .table-bordered {
  border: 0;
}
`;
})(jQuery);