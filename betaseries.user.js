// ==UserScript==
// @name         betaseries
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Ajoute quelques améliorations au site BetaSeries
// @author       Azema
// @homepage     https://github.com/Azema/betaseries
// @match        https://www.betaseries.com/serie/*
// @match        https://www.betaseries.com/episode/*
// @match        https://www.betaseries.com/film/*
// @icon         https://www.google.com/s2/favicons?domain=betaseries.com
// @grant        none
// ==/UserScript==

/*global jQuery*/
/*jslint unparam: true */

(function($) {
    'use strict';

    /*
     * Masque les emplacements de pub
     */
    $('.parent-ad-desktop').attr('style', 'display: none !important');
    decodeTitle();
    similarsViewed();

    /*
     * Decode les HTMLEntities dans le titre
     */
    function decodeTitle() {
        let theString = $('.blockInformations__title').text(),
            matches = theString.match(/&/);
        if (matches != undefined && matches.length > 0) {
            $('.blockInformations__title').text($('<textarea />').html(theString).text());
            console.log('Title updated');
        }
    }

    /*
     * Vérifie si les séries similaires ont été vues
     */
    function similarsViewed() {
        let similars = $('#similars .slide__title');
        if (similars.length > 0) {
            similars.each(function(index, elt) {
                // On effectue une recherche par titre pour chaque serie
                callBetaSeries(function(error, data) {
                    if (error != null) return;
                    /* Si nous n'avons qu'un seul résultat */
                    if (data.shows.length == 1) {
                        // La serie a ete vue
                        if (data.shows[0].user.status > 0) {
                            // On ajoute le bandeau VU
                            addBandeau(elt);
                        }
                    }
                    // Si il y a plusieurs résultats de recherche
                    else if (data.shows.length > 1) {
                        let url = $(elt).siblings('a').attr('href');
                        for (let i = 0; i < data.shows.length; i++) {
                            // On verifie la concordance avec l'URL de la serie
                            if (data.shows[i].resource_url === url) {
                                // La serie a ete vue
                                if (data.shows[i].user.status > 0) {
                                    // On ajoute le bandeau VU
                                    addBandeau(elt);
                                }
                                break;
                            }
                        }
                    }
                }, 'GET', 'shows', 'search', {title: $(elt).text().trim()});
            })
        }
        /*
         * On ajoute le bouton de mise à jour des series vues
         */
        if ($('.updateSimilars').length < 1) {
            $('#similars .blockTitles').append('<div style="vertical-align: middle;"><img src="https://www.aufilelec.fr/static/update.png" class="updateSimilars" style="cursor:pointer;"/></div>');
            $('.updateSimilars').click(function(e) {
                e.stopPropagation();
                e.preventDefault();
                // On supprime les coins viewed
                $('.bandViewed').remove();
                // On met à jour les series similaires
                similarsViewed();
            });
        }
        function addBandeau(elt) {
            $(elt).siblings('a').prepend('<img src="//www.aufilelec.fr/static/viewed.png" class="bandViewed" style="position:absolute;top:0;left:-64px;z-index:1000; "/>');
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
        /*global betaseries_api_user_token*/
        let url = 'https://api.betaseries.com/' + methode + '/' + fonction,
            headers = {
                'X-BetaSeries-Version': '3.0',
                'x-betaseries-token': betaseries_api_user_token,
                'x-betaseries-key': '45028a0b0d3c'
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