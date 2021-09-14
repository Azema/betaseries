// ==UserScript==
// @name         betaseries
// @namespace    http://tampermonkey.net/
// @version      0.5
// @description  Ajoute quelques améliorations au site BetaSeries
// @author       Azema
// @homepage     https://github.com/Azema/betaseries
// @match        https://www.betaseries.com/serie/*
// @match        https://www.betaseries.com/episode/*
// @match        https://www.betaseries.com/film/*
// @icon         https://www.betaseries.com/images/site/favicon-32x32.png
// @grant        none
// ==/UserScript==

/*global jQuery*/
/*global betaseries_api_user_token*/
/*jslint unparam: true */

// Ajouter ici votre clé d'API BetaSeries (https://www.betaseries.com/api/)
let betaseries_api_user_key = '';

(function($) {
    'use strict';

    let debug = true;

    removeAds();
    addStylesheet();
    decodeTitle();
    similarsViewed();

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
            z-index:1000;
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

    /*
     * Vérifie si les séries/films similaires ont été vues
     * Nécessite que l'utilisateur soit connecté et que la clé d'API soit renseignée
     */
    function similarsViewed() {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (typeof betaseries_api_user_token == 'undefined') return;
        if (betaseries_api_user_key == '') return;

        let similars = $('#similars .slide__title'),
            type;
        if (debug) console.log('nb similars: %d', similars.length);
        // On recupere le type d'élément de recherche
        type = location.pathname.split('/')[1] == 'serie' ? 'shows' : 'movies';

        if (similars.length > 0) {
            // On vérifie qu'il ne s'agit pas de la vignette d'ajout
            if (similars.length == 1 && $(similars.parent().get(0)).find('button').length == 1) return;

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
            if ($('.updateSimilarsBlock').length < 1) {
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