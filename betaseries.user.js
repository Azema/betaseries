// ==UserScript==
// @name         betaseries
// @namespace    http://tampermonkey.net/
// @version      0.8.1
// @description  Ajoute quelques améliorations au site BetaSeries
// @author       Azema
// @homepage     https://github.com/Azema/betaseries
// @match        https://www.betaseries.com/serie/*
// @match        https://www.betaseries.com/episode/*
// @match        https://www.betaseries.com/film/*
// @match        https://www.betaseries.com/membre/*/series
// @icon         https://www.betaseries.com/images/site/favicon-32x32.png
// @grant        none
// ==/UserScript==

/*global jQuery*/
/*global betaseries_api_user_token*/
/*jslint unparam: true */

// Ajouter ici votre clé d'API BetaSeries (Demande de clé API: https://www.betaseries.com/api/)
let betaseries_api_user_key = '';

(function($) {
    'use strict';

    const regexGestionSeries = new RegExp('^/membre/.*/series$'),
          regexSerieOrMovie = new RegExp('^/(serie|film|episode)/*');
    let debug = false,
        url = location.pathname,
        userIdentified = typeof betaseries_api_user_token != 'undefined',
        timer;

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
    if (regexGestionSeries.test(url)) {
        addStatusToGestionSeries();
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
        `;
        $('head').append(`<style type="text/css">${style}/<style>`);
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
     * Ajoute un bouton Vu sur la vignette d'un épisode
     */
    function addBtnWatchedToEpisode() {
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
                    addBandeau(elt, data[type][0].user.status);
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
                            addBandeau(elt, data[type][i].user.status);
                            break;
                        }
                    }
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
         * @return void
         */
        function addBandeau(elt, status) {
            // Si la série a été vue ou commencée
            if (status && status > 0) {
                // On ajoute le bandeau "Viewed"
                $(elt).siblings('a').prepend(
                    '<img src="//www.aufilelec.fr/static/viewed.png" class="bandViewed"/>'
                );
            }
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
})(jQuery);