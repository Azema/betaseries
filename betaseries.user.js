// ==UserScript==
// @name         betaseries
// @namespace    https://github.com/Azema/betaseries
// @version      0.20.2
// @description  Ajoute quelques améliorations au site BetaSeries
// @author       Azema
// @homepage     https://github.com/Azema/betaseries
// @supportURL   https://github.com/Azema/betaseries/issues
// @licence      Apache License 2.0
// @match        https://www.betaseries.com/serie/*
// @match        https://www.betaseries.com/series/*
// @match        https://www.betaseries.com/episode/*
// @match        https://www.betaseries.com/film/*
// @match        https://www.betaseries.com/membre/*
// @match        https://www.betaseries.com/api/*
// @icon         https://www.betaseries.com/images/site/favicon-32x32.png
// @require      https://cdnjs.cloudflare.com/ajax/libs/humanize-duration/3.27.0/humanize-duration.min.js#sha512-C6XM91cD52KknT8jaQF1P2PrIRTrbMzq6hzFkc22Pionu774sZwVPJInNxfHNwPvPne3AMtnRWKunr9+/gQR5g==
// @require      https://betaseries.aufilelec.fr/js/renderjson.min.js#sha384-ISyV9OQhfEYzpNqudVhD/IgzIRu75gnAc0wA/AbxJn+vP28z4ym6R7hKZXyqcm6D
// @grant        GM_addStyle
// ==/UserScript==

/* global jQuery A11yDialog humanizeDuration renderjson betaseries_api_user_token newApiParameter viewMoreFriends generate_route
   bootstrap deleteFilterOthersCountries CONSTANTE_FILTER CONSTANTE_SORT displayCountFilter baseUrl hideButtonReset moment PopupAlert */
/* jslint unparam: true */


/************************************************************************************************/
/*                               PARAMETRES A MODIFIER                                          */
/************************************************************************************************/

/* Ajouter ici votre clé d'API BetaSeries (Demande de clé API: https://www.betaseries.com/api/) */
let betaseries_api_user_key = '';
/* Ajouter ici l'URL de base de votre serveur distribuant les CSS, IMG et JS */
const serverBaseUrl = 'https://azema.github.io/betaseries-oauth';

/************************************************************************************************/

(function($) {
    'use strict';

    const debug = false,
          url = location.pathname,
          regexUser = new RegExp('^/membre/[A-Za-z0-9]*$'),
          tableCSS = serverBaseUrl + '/css/table.min.css',
          integrityStyle = 'sha384-Pa7Ap5STuXNRqzHdArnBJqsxuwGEXO7ERfQkZSL/GQSdpA1IAj1Hh1pXYyorLmBX',
          integrityPopover = 'sha384-4ypvRw5lbeuC9BjCt95Vm2vhzXpnUWqFxUBf1SYr2AzF6s6e+BMCcaw8mZbXBLgf',
          integrityTable = 'sha384-83x9kix7Q4F8l4FQwGfdbntFyjmZu3F1fB8IAfWdH4cNFiXYqAVrVArnil0rkc1p',
          // URI des images et description des classifications TV et films
          ratings = {
              'D-10': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Moins10.svg/30px-Moins10.svg.png',
                  title: "Déconseillé au moins de 10 ans"
              },
              'D-12': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Moins12.svg/30px-Moins12.svg.png',
                  title: 'Déconseillé au moins de 12 ans'
              },
              'D-16': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Moins16.svg/30px-Moins16.svg.png',
                  title: 'Déconseillé au moins de 16 ans'
              },
              'D-18': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Moins18.svg/30px-Moins18.svg.png',
                  title: 'Ce programme est uniquement réservé aux adultes'
              },
              'TV-Y': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/TV-Y_icon.svg/50px-TV-Y_icon.svg.png',
                  title: 'Ce programme est évalué comme étant approprié aux enfants'
              },
              'TV-Y7': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/TV-Y7_icon.svg/50px-TV-Y7_icon.svg.png',
                  title: 'Ce programme est désigné pour les enfants âgés de 7 ans et plus'
              },
              'TV-G': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/TV-G_icon.svg/50px-TV-G_icon.svg.png',
                  title: 'La plupart des parents peuvent considérer ce programme comme approprié pour les enfants'
              },
              'TV-PG': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/TV-PG_icon.svg/50px-TV-PG_icon.svg.png',
                  title: 'Ce programme contient des éléments que les parents peuvent considérer inappropriés pour les enfants'
              },
              'TV-14': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/TV-14_icon.svg/50px-TV-14_icon.svg.png',
                  title: 'Ce programme est déconseillé aux enfants de moins de 14 ans'
              },
              'TV-MA': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/TV-MA_icon.svg/50px-TV-MA_icon.svg.png',
                  title: 'Ce programme est uniquement réservé aux adultes'
              },
              'G': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/RATED_G.svg/30px-RATED_G.svg.png',
                  title: 'Tous publics'
              },
              'PG': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/RATED_PG.svg/54px-RATED_PG.svg.png',
                  title: 'Accord parental souhaitable'
              },
              'PG-13': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/RATED_PG-13.svg/95px-RATED_PG-13.svg.png',
                  title: 'Accord parental recommandé, film déconseillé aux moins de 13 ans'
              },
              'R': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/RATED_R.svg/40px-RATED_R.svg.png',
                  title: 'Les enfants de moins de 17 ans doivent être accompagnés d\'un adulte'
              },
              'NC-17': {
                  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Nc-17.svg/85px-Nc-17.svg.png',
                  title: 'Interdit aux enfants de 17 ans et moins'
              }
          },
          api = {
            base: 'https://api.betaseries.com',
            version: '3.0'
          };
    // Ajout des feuilles de styles pour le userscript
    $('head').append(`
        <link rel="stylesheet"
              href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
              integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw=="
              crossorigin="anonymous" referrerpolicy="no-referrer" />
        <link rel="stylesheet"
              href="${serverBaseUrl}/css/style.min.css"
              integrity="${integrityStyle}"
              crossorigin="anonymous" referrerpolicy="no-referrer" />
    `);
    let userIdentified = typeof betaseries_api_user_token != 'undefined',
        timer, timerUA, currentUser, cache = new Cache(),
        counter = 0, dialog;

    // Fonctions appeler pour les pages des series, des films et des episodes
    if (/^\/(serie|film|episode)\/.*/.test(url)) {
        // On récupère d'abord la ressource courante pour la mettre en cache
        getResource(true).then(function() {
            if (debug) addBtnDev(); // On ajoute le bouton de Dev
            removeAds(); // On retire les pubs
            similarsViewed(); // On s'occupe des ressources similaires
            decodeTitle(); // On décode le titre de la ressource
            addRating(); // On ajoute la classification TV de la ressource courante
            addNumberVoters(); // On ajoute le nombre de votes à la note
            // On ajoute un timer interval en attendant que les saisons et les épisodes soient chargés
            timer = setInterval(function() {
                addBtnWatchedToEpisode();
            }, 500);
        });
    }
    // Fonctions appeler pour la page de gestion des series
    else if (/^\/membre\/.*\/series$/.test(url)) {
        addStatusToGestionSeries();
    }
    // Fonctions appeler sur la page des membres
    else if ((regexUser.test(url) || /^\/membre\/[A-Za-z0-9]*\/amis$/.test(url)) && userIdentified) {
        if (regexUser.test(url)) {
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
        } else {
            searchFriends();
        }
    }
    // Fonctions appeler sur les pages des méthodes de l'API
    else if (/^\/api/.test(url)) {
        if (/\/methodes/.test(url)) {
            sommaireDevApi();
        } else if (/\/console/.test(url)) {
            updateApiConsole();
        }
    }
    // Fonctions appeler sur les pages des séries
    else if (/^\/series\//.test(url)) {
        if (debug) console.log('Page des séries');
        waitPagination();
        seriesFilterPays();
        if (/agenda/.test(url)) {
            timerUA = setInterval(function() {
                updateAgenda();
            }, 1000);
        }
    }

    /**
     * Permet d'afficher les messages d'erreur liés au script
     *
     * @param {String} title Le titre du message
     * @param {String} text  Le texte du message
     * @return {void}
     */
    function notification(title, text) {
        let notifContainer = $('.userscript-notifications');
        // On ajoute notre zone de notifications
        if ($('.userscript-notifications').length <= 0) {
            $('#fb-root').after(
                '<div class="userscript-notifications"><h3><span class="title"></span><i class="fa fa-times" aria-hidden="true"></i></h3><p class="text"></p></div>'
            );
            notifContainer = $('.userscript-notifications');
            $('.userscript-notifications .fa-times').click(() => {
                $('.userscript-notifications').slideUp();
            });
        }
        notifContainer.hide();
        $('.userscript-notifications .title').html(title);
        $('.userscript-notifications .text').html(text);
        notifContainer.slideDown().delay(5000).slideUp();
    }

    /**
     * Fonction modifiant le fonctionnement du filtre pays
     * pour permettre d'ajouter plusieurs pays sur la page des séries
     * @return {void}
     */
    function seriesFilterPays() {
        if (url.split('/').pop() == 'agenda') return;
        let $input = $('.filter-container-others-countries input');
        // Supprimer l'attribut onclick de l'input other-countries
        $input.removeAttr('onchange');
        $input.on('change', function() {
            let hasSelect = $('option[value="' + $input.val() + '"]'),
                btnTemp = '<button type="button" class="btn-reset btn-btn filter-btn active" id="' +
                           hasSelect.attr("id") + '" onclick="searchOption(this);">' +
                           hasSelect.attr("value") + '</button>';
            $('#pays > button').last().after(btnTemp);
            deleteFilterOthersCountries();
            countFilter("pays");
        });
        const baseUrl = generate_route("shows");
        let hash = url.substr(baseUrl.length);
        if (hash.length === 0) {
            return;
        }
        const data = hash.split('/');
        if (!data.find((el)=>el.match(/^tri-|sort-/g))) {
            data.push(CONSTANTE_FILTER.tri + "-" + CONSTANTE_SORT.popularite);
        }
        for (let i in data) {
            const splitData = data[i].split('-'),
                  filter = splitData.shift(),
                  dataFilter = decodeURIComponent(splitData.join('-'));
            if (filter && dataFilter &&
                (filter === CONSTANTE_FILTER.paspays || filter === CONSTANTE_FILTER.pays))
            {
                const hasActive = filter === CONSTANTE_FILTER.pays,
                      hasButton = $("#left #pays > button#" + dataFilter.toUpperCase()),
                      optionExist = $('datalist[id="other-countries"] option[id="' + dataFilter.toUpperCase() + '"]');
                if (hasButton.length <= 0 && optionExist) {
                    let btnTemp = '<button type="button" class="btn-reset btn-btn filter-btn' + (hasActive ? ' active' : ' hactive') +
                                   '" id="' + dataFilter.toUpperCase() + '" onclick="searchOption(this);">' +
                                   optionExist.attr('value') + '</button>';
                    $('#pays > button').last().after(btnTemp);
                    optionExist.remove();
                    deleteFilterOthersCountries();
                    countFilter("pays");
                }
            }
        }
        function countFilter(target) {
            const current = $('#count_' + target);
            if (current.length > 0) {
                let len = $('#pays > button').length,
                    display = 'none';
                current.text(len);

                if (len >= 1) {
                    display = 'block';
                }
                current.css('display', display);
                hideButtonReset();
            }
        }
    }

    /**
     * Fonction d'ajout d'un paginateur en haut de liste des séries
     * @return {void}
     */
    function waitPagination() {
        let loaded = false;
        // On attend la présence du paginateur
        let timerSeries = setInterval(() => {
            if ($('#pagination-shows').length < 1) return;
            clearInterval(timerSeries);
            // On copie colle le paginateur en haut de la liste des séries
            $('#results-shows').prepend($('#pagination-shows').clone(true, true));
            // On observe les modifications dans le noeud du paginateur
            $('#results-shows').on('DOMSubtreeModified', '#pagination-shows', function(){
                if (!loaded) {
                    waitPagination();
                    loaded = true;
                }
            });
        }, 500);
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
        $('#method').on('change', () => {
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
            let elts = $('.api-params:not(.remove):not(.lock):not(:first)');
            elts
                .append('<i class="remove-input fa fa-minus-circle fa-2x" style="margin-left: 10px;vertical-align:middle;cursor:pointer;" aria-hidden="true"></i>')
                .append('<i class="lock-param fa fa-unlock fa-2x" style="margin-left: 10px;vertical-align:middle;cursor:pointer;" aria-hidden="true"></i>')
                .addClass('remove');
            $('.remove-input').click((e) => {
                $(e.currentTarget).parent('.api-params').remove();
            });
            $('.lock-param', elts).click((e) => {
                e.stopPropagation();
                e.preventDefault();
                let self = $(e.currentTarget);
                if (debug) console.log('lock-param', self, self.hasClass('fa-unlock'));
                if (self.hasClass('fa-unlock')) {
                    self.removeClass('fa-unlock').addClass('fa-lock');
                    self.parent('.api-params').removeClass('remove').addClass('lock');
                } else {
                    self.removeClass('fa-lock').addClass('fa-unlock');
                    self.parent('.api-params').addClass('remove').removeClass('lock');
                }
            });
        }
        function addToggleShowResult() {
            let result = $('#result');
            // On ajoute un titre pour la section de résultat de la requête
            result.before('<h2>Résultat de la requête <span class="toggle" style="margin-left:10px;"><i class="fa fa-chevron-circle-down" aria-hidden="true"></i></span></h2>');
            $('.toggle').click(() => {
                // On réalise un toggle sur la section de résultat et on modifie l'icône du chevron
                result.toggle('400', () => {
                    if (result.is(':hidden')) {
                        $('.toggle i').removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down');
                    } else {
                        $('.toggle i').removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
                    }
                });
            });
            // On modifie le sens du chevron lors du lancement d'une requête
            $('button.is-full').click(() => {
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
            methods = {};
        // Ajout du style CSS pour les tables
        $('head').append(`
            <link rel="stylesheet"
                  href="${tableCSS}"
                  integrity="${integrityTable}"
                  crossorigin="anonymous"
                  referrerpolicy="no-referrer" />
        `);
        /**
         * Construit une cellule de table HTML pour une methode
         *
         * @param  {String} verb Le verbe HTTP utilisé par la fonction
         * @param  {String} key  L'identifiant de la fonction
         * @return {String}
         */
        function buildCell(verb, key) {
            let cell = '<td>';
            if (verb in methods[key]) {
                cell += '<i data-id="' + methods[key][verb].id + '" class="linkSommaire fa fa-check fa-2x" title="' +
                        methods[key][verb].title + '"></i>';
            }
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
            let $table = $('<div id="sommaire" class="table-responsive" style="display:none;">' +
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

        for (let t = 0; t < titles.length; t++) {
            // ajouter les ID aux titres des methodes, ainsi qu'un chevron pour renvoyer au sommaire
            let $title = $(titles.get(t)),
                id = $title.text().trim().toLowerCase().replace(/ /, '_').replace(/\//, '-'),
                txt = $title.text().trim().split(' ')[1],
                desc = $title.next('p').text(),
                key = txt.toLowerCase().replace(/\//, ''),
                verb = $title.text().trim().split(' ')[0].toUpperCase();
            $title.attr('id', id);
            $title.append('<i class="fa fa-chevron-circle-up" aria-hidden="true" title="Retour au sommaire"></i>');
            if (! (key in methods)) methods[key] = {title: txt};
            methods[key][verb] = {id: id, title: desc};

        }
        // Construire un sommaire des fonctions
        //if (debug) console.log('methods', methods);
        $('.maincontent h1').after(buildTable());
        if (debug) console.log('build sommaire', $('#sommaire'));
        $('#sommaire').show('fast');

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

    /**
     * Ajoute un bouton pour le dev pour afficher les données de la ressource
     * dans une modal
     */
    function addBtnDev() {
        const btnHTML = '<div class="blockInformations__action"><button class="btn-reset btn-transparent" type="button" style="height:44px;width:64px;"><i class="fa fa-wrench" aria-hidden="true" style="font-size:1.5em;"></i></button><div class="label">Dev</div></div>',
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
        dialog = new A11yDialog(document.querySelector('#dialog-resource'));
        const html = document.documentElement;

        $('.blockInformations__actions .fa-wrench').parent().click((e) => {
            e.stopPropagation();
            e.preventDefault();
            let type = getApiResource(location.pathname.split('/')[1]), // Indique de quel type de ressource il s'agit
                eltId = getResourceId(), // Identifiant de la ressource
                $dataRes = $('#dialog-resource .data-resource'), // DOMElement contenant le rendu JSON de la ressource
                fonction = type.singular == 'show' || type.singular == 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource

            callBetaSeries('GET', type.plural, fonction, {'id': eltId})
            .then(function(data) {
                if (debug) console.log('addBtnDev promise return', data);
                if (! $dataRes.is(':empty')) $dataRes.empty();
                $dataRes.append(renderjson.set_show_to_level(2)(data[type.singular]));
                $('#dialog-resource-title span').empty().text('(' + counter + ' appels API)');
                dialog.show();
            }, (err) => {
                notification('Erreur de récupération de ' + type.singular, 'addBtnDev: ' + err);
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
    function getResource(nocache = false, id = null) {
        const type = getApiResource(location.pathname.split('/')[1]), // Indique de quel type de ressource il s'agit
              fonction = type.singular == 'show' || type.singular == 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource
        id = (id === null) ? getResourceId() : id;
        if (debug) console.log('getResource{id: %d, nocache: %s, type: %s}', id, ((nocache) ? 'true' : 'false'), type.singular);

        return callBetaSeries('GET', type.plural, fonction, {'id': id}, nocache);
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
     * Retourne l'identifiant de la ressource de la page
     * @return {Number} L'identifiant de la ressource
     */
    function getResourceId() {
        const type = getApiResource(url.split('/')[1]), // Le type de ressource
              eltActions = $(`#reactjs-${type.singular}-actions`); // Le noeud contenant l'ID
        return (eltActions.length == 1) ? eltActions.data(`${type.singular}-id`) : null;
    }

    /**
     * Ajoute la classification dans les détails de la ressource
     */
    function addRating() {
        if (debug) console.log('addRating');
        let type = getApiResource(url.split('/')[1]), // Indique de quel type de ressource il s'agit
            eltId = getResourceId(), // Identifiant de la ressource
            fonction = type.singular == 'show' || type.singular == 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource

        callBetaSeries('GET', type.plural, fonction, {'id': eltId})
        .then(function(data) {
            if (data[type.singular].hasOwnProperty('rating')) {
                let rating = ratings.hasOwnProperty(data[type.singular].rating) ? ratings[data[type.singular].rating] : '';
                if (rating !== '') {
                    // On ajoute la classification
                    $('.blockInformations__details')
                    .append(
                        '<li id="rating"><strong>Classification</strong><img src="' +
                        rating.img + '" title="' + rating.title + '"/></li>'
                    );
                }
            }
        }, (err) => {
            notification('Erreur de récupération de ' + type.singular, 'addRating: ' + err);
        });
    }

    /**
     * Retourne les infos d'un membre
     *
     * @param {Number}   id    Identifiant du membre (par défaut: le membre connecté)
     * @return {Promise} Le membre
     */
    function getMember(id = null) {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (! userIdentified || betaseries_api_user_key === '') return;

        let args = {};
        if (id) args.id = id;
        return new Promise((resolve) => {
            callBetaSeries('GET', 'members', 'infos', args)
            .then(function(data) {
                // On retourne les infos du membre
                resolve(data.member);
            }, (err) => {
                notification('Erreur de récupération d\'un membre', 'getMember: ' + err);
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
            $('head').append(`
                <link rel="stylesheet"
                      href="${tableCSS}"
                      integrity="${integrityTable}"
                      crossorigin="anonymous" referrerpolicy="no-referrer" />
            `);
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
     * Ajoute un champ de recherche sur la page des amis d'un membre
     * @return {void}
     */
    function searchFriends() {
        // Ajouter un champ de recherche
        $('.maincontent h1').append(
            '<input id="searchFriends" placeholder="Recherche d\'amis" list="friendsdata" autocomplete="off"/>' +
            '<i class="fa fa-times clearSearch" aria-hidden="true" style="display:none;" title="Effacer la recherche"></i>'
        );
        // Recuperer les identifiants et liens des membres
        let links = $('.timeline-item .infos a'),
            objFriends = {},
            idFriends = [],
            datalist = '<datalist id="friendsdata">';
        // On recupere les infos des amis
        for (let i = 0; i < links.length; i++) {
            let elt = $(links.get(i)),
                text = elt.text().trim();
            objFriends[text.toLowerCase()] = {link: elt.attr('href'), name: text};
        }
        // On stocke les identifiants dans un tableau que l'on tri
        idFriends = Object.keys(objFriends);
        idFriends.sort();
        // On build la liste des amis pour alimenter le champ de recherche
        for (let i = 0; i < idFriends.length; i++) {
            datalist += '<option value="' + objFriends[idFriends[i]].name + '"/>';
        }
        $('.maincontent').append(datalist + '</datalist>');
        // On affiche toute la liste des amis
        viewMoreFriends();
        $('#searchFriends').on('keypress', () => {
            if ($('#searchFriends').val().trim().length > 0) {
                $('.clearSearch').show();
            }
        });
        $('#searchFriends').on('input', () => {
            let val = $('#searchFriends').val().trim().toLowerCase();
            if (debug) console.log('Search Friends: ' + val, idFriends.indexOf(val), objFriends[val]);
            if (val === '' || idFriends.indexOf(val) === -1) {
                $('.timeline-item').show();
                if (val === '') {
                    $('.clearSearch').hide();
                }
                return;
            }
            $('.clearSearch').show();
            $('.timeline-item').hide();
            if (debug) console.log('Item: ', $('.timeline-item .infos a[href="' + objFriends[val].link + '"]'));
            $('.timeline-item .infos a[href="' + objFriends[val].link + '"]').parents('.timeline-item').show();
        });
        $('.clearSearch').click(() => {
            $('#searchFriends').val('');
            $('.timeline-item').show();
            $('.clearSearch').hide();
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
     * Ajoute le nombre de votes à la note de la ressource
     */
    function addNumberVoters() {
        // On sort si la clé d'API n'est pas renseignée
        if (betaseries_api_user_key === '') return;

        let votes = $('.stars.js-render-stars'), // ElementHTML ayant pour attribut le titre avec la note de la série
            type = getApiResource(location.pathname.split('/')[1]), // Indique de quel type de ressource il s'agit
            eltId = getResourceId(), // Identifiant de la ressource
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
            if (note.user > 0) {
                votes.attr('title', votes.attr('title') + `, votre note: ${note.user} / 5`);
            }
        }, (err) => {
            notification('Erreur de récupération de ' + type.singular, 'addNumberVoters: ' + err);
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

        let title = $elt.attr('title'),
            votes = ' vote' + (parseInt(total, 10) > 1 ? 's' : '');
        // On met en forme le nombre de votes
        total = new Intl.NumberFormat('fr-FR', {style: 'decimal', useGrouping: true}).format(total);
        // On limite le nombre de chiffre après la virgule
        note = parseFloat(note).toFixed(1);
        // On vérifie que l'attribut title possède déjà la note, sinon on l'ajoute
        if (! /\/ 5/.test(title)) {
            title = note + ' / 5';
        }
        // On modifie l'attribut title pour y ajouter le nombre de votes
        $elt.attr('title', total + votes + ': ' + title);
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
        if (! /^\/serie\//.test(url)) return;

        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (! userIdentified || betaseries_api_user_key === '') return;

        const seasons = $('#seasons div[role="button"]'),
              type = getApiResource(url.split('/')[1]); // Le type de ressource
        let len = parseInt($('#seasons .slide--current .slide__infos').text(), 10),
            vignettes = getVignettes();

        // On vérifie que les saisons et les episodes soient chargés sur la page
        if (vignettes.length > 0 && vignettes.length >= len) {
            // On supprime le timer Interval
            clearInterval(timer);
            // On ajoute les cases à cocher sur les vignettes courantes
            addCheckbox();
        } else {
            if (debug) console.log('addBtnWatchedToEpisode: En attente du chargement des vignettes');
            return;
        }

        if (debug) console.log('Nb seasons: %d, nb vignettes: %d', seasons.length, vignettes.length);

        // Ajoute les cases à cocher sur les vignettes des épisodes
        function addCheckbox() {
            vignettes = getVignettes();
            len = $('#episodes .slide__image').length;

            for (let v = 0; v < len; v++) {
                let $vignette = $(vignettes.get(v)),
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
            }
            // On ajoute un event click sur la case 'checkSeen'
            $('#episodes .checkSeen').click(function(e) {
                e.stopPropagation();
                e.preventDefault();
                const $elt = $(e.currentTarget),
                      episodeId = getEpisodeId($elt);
                toggleSpinner($elt, true);
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

            // Ajouter un bouton de mise à jour des épisodes de la saison courante
            if ($('#updateEpisodeList').length < 1) {
                $('#episodes .blockTitles').prepend(`
                    <div id="updateEpisodeList" class="updateElements">
                      <img src="${serverBaseUrl}/img/update.png"
                           class="updateEpisodes updateElement finish"
                           title="Mise à jour les épisodes de la saison"
                           style="margin-right:10px;"/>
                    </div>`);
                // On ajoute la gestion de l'event click sur le bouton
                $('.updateEpisodes').click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (debug) console.group('updateEpisodes');
                    const self = $(e.currentTarget);
                    self.removeClass('finish');
                    // Le numéro de la saison courante
                    const seasonNum = $('#seasons div[role="button"].slide--current .slide__title').text().match(/\d+/).shift(),
                          showId = getResourceId(), // Identifiant de la ressource principale
                          key = `show-${showId}-${seasonNum}`;
                    let promise;
                    if (cache.has('episodes', key)) {
                        promise = new Promise((resolve) => {
                            resolve(cache.get('episodes', key));
                        });
                    } else {
                        const res = cache.get('shows', showId).show,
                              params = {thetvdb_id: res.thetvdb_id, season: parseInt(seasonNum, 10)};
                        promise = callBetaSeries('GET', 'shows', 'episodes', params, true);
                        // On stocke le résultat en cache
                        promise.then((data) => {
                            cache.set('episodes', key, data);
                        });
                    }

                    promise.then((data) => {
                        if (debug) console.log('callBetaSeries GET shows/episodes', data);
                        vignettes = getVignettes();
                        len = getNbVignettes();
                        let $vignette, episode, id, checkSeen, changed = false;

                        for (let v = 0; v < len; v++) {
                            $vignette = $(vignettes.get(v)); // DOMElement jQuery de l'image de l'épisode
                            episode = data.episodes[v]; // Données de l'épisode
                            id = getEpisodeId($vignette); // Identifiant de l'épisode
                            checkSeen = $vignette.find('.checkSeen'); // DOMElement jQuery de la checkbox vu de l'épisode
                            if (debug) console.log('Episode ID', id);
                            // On vérifie que l'attribut ID est bien définit
                            if (checkSeen.length > 0 && checkSeen.attr('id') === undefined) {
                                if (debug) console.log('ajout de l\'attribut ID à l\'élément "checkSeen"');
                                // On ajoute l'attribut ID
                                checkSeen.attr('id', 'episode-' + id);
                            }
                            // Si le membre a vu l'épisode et qu'il n'est pas indiqué, on change le statut
                            if (episode.user.seen && checkSeen.length > 0 && !checkSeen.hasClass('seen')) {
                                if (debug) console.log('Changement du statut (seen) de l\'épisode');
                                changeStatus(checkSeen, 'seen', false);
                                changed = true;
                            }
                            // Si le membre n'a pas vu l'épisode et qu'il n'est pas indiqué, on change le statut
                            else if (!episode.user.seen && checkSeen.length > 0 && checkSeen.hasClass('seen')) {
                                if (debug) console.log('Changement du statut (notSeen) de l\'épisode');
                                changeStatus(checkSeen, 'notSeen', false);
                                changed = true;
                            }
                        }
                        // On met à jour les éléments, seulement si il y a eu des modifications
                        if (changed) {
                            // On récupère la ressource principale sur l'API
                            getResource(true).then(() => {
                                updateProgressBar();
                                updateNextEpisode();
                            });
                        }
                        self.addClass('finish'); // On arrete l'animation de mise à jour
                        if (debug) console.groupEnd('updateEpisodes'); // On clos le groupe de console
                    }, (err) => {
                        self.addClass('finish');
                        if (debug) console.groupEnd('updateEpisodes');
                        notification('Erreur de mise à jour des épisodes', 'updateEpisodeList: ' + err);
                    });
                });
            }

            /**
             * Retourne la position de la popup par rapport à l'image du similar
             * @param  {Object} tip Unknown
             * @param  {Object} elt Le DOM Element du lien du similar
             * @return {String}     La position de la popup
             */
            let funcPlacement = (tip, elt) => {
                //if (debug) console.log('funcPlacement', tip, $(tip).width());
                let rect = elt.getBoundingClientRect(),
                    width = $(window).width(),
                    sizePopover = 320;
                return ((rect.left + rect.width + sizePopover) > width) ? 'left' : 'right';
            };
            function tempTitle(objRes) {
                return `<span style="color: var(--link_color);">Synopsis épisode ${objRes.code}</span>`;
            }
            const seasonNum = $('#seasons div[role="button"].slide--current .slide__title').text().match(/\d+/).shift(),
                  showId = getResourceId(), // Identifiant de la ressource principale
                  key = `show-${showId}-${seasonNum}`,
                  res = cache.get('shows', showId).show;
            let promise;
            function addShowClick() {
                const res = cache.get('shows', showId).show;
                // Vérifier si le membre a ajouter la série à son compte
                if (res.in_account === false) {
                    // On ajoute un event click pour masquer les vignettes
                    $('#reactjs-show-actions > div > button').click(() => {
                        for (let v = 0; v < len; v++) {
                            $(vignettes.get(v))
                                .find('img')
                                .attr('style', 'transform: rotate(0deg) scale(1.2);filter: blur(30px);');
                        }
                        let react_id = $('script[id^="/reactjs/"]').get(0).id.split('.')[1],
                            urlShow = res.resource_url.substring(location.origin.length),
                            title = res.title.replace(/"/g, '\\"').replace(/'/g, "\\'"),
                            template = `
                          <a class="header-navigation-item" href="${urlShow}/actions">Vos actions sur la série</a>
                          <button type="button" class="btn-reset header-navigation-item" onclick="new PopupAlert({
                            showClose: true,
                            type: "popin-subtitles",
                            reactModuleId: "reactjs-subtitles",
                            params: {
                              mediaId: "${showId}",
                              type: "show",
                              titlePopin: "${title}";
                            },
                            callback: function() {
                              addScript("/reactjs/subtitles.${react_id}.js", "module-reactjs-subtitles");
                            },
                          });">Sous-titres</button>
                          <a class="header-navigation-item" href="javascript:;" onclick="reportItem(${showId}, 'show');">Signaler un problème</a>
                          <a class="header-navigation-item" href="javascript:;" onclick="showUpdate('${title}', ${showId}, '0')">Demander une mise à jour</a>
                          <a class="header-navigation-item" href="webcal://www.betaseries.com/cal/i${urlShow}">Planning iCal de la série</a>

                          <form class="autocomplete js-autocomplete-form header-navigation-item">
                            <button type="reset" class="btn-reset fontWeight700 js-autocomplete-show" style="color: inherit">Recommander la série</button>
                            <div class="autocomplete__toShow" hidden="">
                              <input placeholder="Nom d'un ami" type="text" class="autocomplete__input js-search-friends">
                              <div class="autocomplete__response js-display-response"></div>
                            </div>
                          </form>
                          <a class="header-navigation-item" href="javascript:;">Supprimer de mes séries</a>
                            `;
                        $('div.blockInformations__actions .dropdown-menu').append(template);
                        deleteShowClick();
                    });
                }
            }

            function deleteShowClick() {
                const res = cache.get('shows', showId).show;
                // Gestion de la suppression de la série du compte utilisateur
                $('.blockInformations__actions .dropdown-menu a:last-child').removeAttr('onclick').click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    // Supprimer la série du compte utilisateur
                    new PopupAlert({
                        title: trans("popup.delete_show.title", { "%title%": res.title }),
                        text: trans("popup.delete_show.text", { "%title%": res.title }),
                        callback_yes: function() {
                            callBetaSeries('DELETE', 'shows', 'show', {id: res.id})
                                .then((data) => {
                                new PopupAlert({
                                    title: trans("popup.delete_show_success.title"),
                                    text: trans("popup.delete_show_success.text", { "%title%": res.title }),
                                    yes: trans("popup.delete_show_success.yes"),
                                });
                                cache.set('shows', showId, data);
                                $('#reactjs-show-actions').empty().append(`
                                <div class="blockInformations__action">
                                  <button class="btn-reset btn-transparent" type="button">
                                    <span class="svgContainer">
                                      <svg fill="#0D151C" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M14 8H8v6H6V8H0V6h6V0h2v6h6z" fill-rule="nonzero"></path>
                                      </svg>
                                    </span>
                                  </button>
                                  <div class="label">Ajouter</div>
                                </div>`);
                                $('.blockInformations__actions .dropdown-menu a:first-child').siblings().each((i, e) => { $(e).remove(); });
                                addShowClick();
                            }, (err) => {
                                notification('Erreur de suppression de la série', err);
                            });
                        },
                        callback_no: function() {}
                    });
                });
            }
            deleteShowClick();

            if (cache.has('episodes', key)) {
                promise = new Promise((resolve) => {
                    resolve(cache.get('episodes', key));
                });
            } else {
                promise = callBetaSeries('GET', 'shows', 'episodes', {thetvdb_id: res.thetvdb_id, season: parseInt(seasonNum, 10)}, true);
                // On stocke le résultat en cache
                promise.then(
                    (data) => { cache.set('episodes', key, data); },
                    (err) => { notification('Erreur de récupération des épisodes', 'addCheckbox: ' + err); }
                );
            }
            // On ajoute le CSS et le Javascript pour les popup
            if ($('#csspopover').length === 0 && $('#jsbootstrap').length === 0) {
                $('head').append(`
                    <link rel="stylesheet"
                          id="csspopover"
                          href="${serverBaseUrl}/css/popover.min.css"
                          integrity="${integrityPopover}"
                          crossorigin="anonymous" \>
                    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"
                            id="jsbootstrap"
                            integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
                            crossorigin="anonymous"></script>
                `);
            }
            promise.then((data) => {
                let intTime = setInterval(function() {
                    if (typeof bootstrap === 'undefined' || typeof bootstrap.Popover !== 'function') { return; }
                    else clearInterval(intTime);

                    if (debug) console.log('Add synopsis episode');
                    for (let v = 0; v < len; v++) {
                        const $vignette = $(vignettes.get(v)),
                              objRes = data.episodes[v];
                        let description = (type.singular == 'show') ? objRes.description : objRes.synopsis;
                        if (description.length > 350) {
                            description = description.substring(0, 350) + '...';
                        }
                        // Ajoute la synopsis de l'épisode au survol de la vignette
                        $vignette.popover({
                            container: $vignette,
                            delay: { "show": 500, "hide": 100 },
                            html: true,
                            content: `<p>${description}</p>`,
                            placement: funcPlacement,
                            title: tempTitle(objRes),
                            trigger: 'hover',
                            fallbackPlacement: ['left', 'right']
                        });
                    }
                    $('#episodes .slide__image').on('shown.bs.popover', function () {
                        let popover = $('#episodes .popover'),
                            img = popover.parent().find('img.js-lazy-image'),
                            placement = popover.attr('x-placement'),
                            space = 0;

                        if (placement === 'left') {
                            space = popover.width() + 5;
                            popover.css('left', `-${space}px`);
                        }
                        else if (placement === 'right') {
                            space = img.width();
                            popover.css('left', `${space}px`);
                        }
                    });
                }, 500);
            });
            /**
             * Affiche/masque le spinner de modification des épisodes
             *
             * @param {Object} $elt     L'objet jQuery correspondant à l'épisode
             * @param {bool}   display  Le flag indiquant si afficher ou masquer
             * @return {void}
             */
            function toggleSpinner($elt, display) {
                let container = $elt.parent(),
                    html = '<div class="spinner">' +
                             '<div class="spinner-item"></div>' +
                             '<div class="spinner-item"></div>' +
                             '<div class="spinner-item"></div>' +
                           '</div>';
                if (! display) {
                    $('.spinner').remove();
                    if (debug) console.log('toggleSpinner');
                    if (debug) console.groupEnd('episode checkSeen');
                } else {
                    if (debug) console.group('episode checkSeen');
                    if (debug) console.log('toggleSpinner');
                    container.prepend(html);
                }
            }

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
                if (method == 'POST') {
                    args.bulk = false; // Flag pour ne pas mettre les épisodes précédents comme vus automatiquement
                }

                callBetaSeries(method, 'episodes', 'watched', args)
                .then(function(data) {
                    if (debug) console.log('callBetaSeries %s episodes/watched', method, data);
                    changeStatus($elt, status);
                },
                function(err) {
                    if (debug) console.log('changeStatusVignette error %s', err);
                    if (err && err == 'changeStatus') {
                        if (debug) console.log('changeStatusVignette error %s changeStatus', method);
                        changeStatus($elt, status);
                    } else {
                        toggleSpinner($elt, false);
                        notification('Erreur de modification d\'un épisode', 'changeStatusVignette: ' + err);
                    }
                });
            }
            /**
             * Change le statut visuel de la vignette sur le site
             * @param  {Object} $elt          L'objet jQuery de l'épisode
             * @param  {String} newStatus     Le nouveau statut de l'épisode
             * @param  {bool}   [update=true] Mise à jour de la ressource en cache et des éléments d'affichage
             * @return {void}
             */
            function changeStatus($elt, newStatus, update = true) {
                if (newStatus == 'seen') {
                    const background = 'rgba(13,21,28,.2) center no-repeat url(\'data:image/svg+xml;utf8,<svg fill="%23fff" width="12" height="10" viewBox="2 3 12 10" xmlns="http://www.w3.org/2000/svg"><path fill="inherit" d="M6 10.78l-2.78-2.78-.947.94 3.727 3.727 8-8-.94-.94z"/></svg>\')';
                    $elt.css('background', background); // On ajoute le check dans la case à cocher
                    $elt.addClass('seen'); // On ajoute la classe 'seen'
                    // On supprime le voile masquant sur la vignette pour voir l'image de l'épisode
                    $elt.parent('div.slide__image').find('img').removeAttr('style');
                    $elt.parent('div.slide_flex').removeClass('slide--notSeen');

                    // Si tous les épisodes de la saison ont été vus
                    if ($('#episodes .seen').length == len) {
                        const slideCurrent = $('#seasons div.slide--current');
                        // On check la saison
                        $('#seasons div.slide--current .slide__image').prepend('<div class="checkSeen"></div>');
                        slideCurrent
                            .removeClass('slide--notSeen')
                            .addClass('slide--seen');
                        if (debug) console.log('Tous les épisodes de la saison ont été vus', slideCurrent);
                        // Si il y a une saison suivante, on la sélectionne
                        if (slideCurrent.next().length > 0) {
                            if (debug) console.log('Il y a une autre saison');
                            slideCurrent.next().trigger('click');
                            slideCurrent
                                .removeClass('slide--current')
                                .removeClass('slide--notSeen')
                                .addClass('slide--seen');
                        }
                    }
                } else {
                    $elt.css('background', 'none'); // On enlève le check dans la case à cocher
                    $elt.removeClass('seen'); // On supprime la classe 'seen'
                    // On remet le voile masquant sur la vignette de l'épisode
                    $elt.parent('div.slide__image')
                        .find('img')
                            .attr('style', 'transform: rotate(0deg) scale(1.2);filter: blur(30px);');

                    const contVignette = $elt.parent('div.slide_flex');
                    if (!contVignette.hasClass('slide--notSeen')) {
                        contVignette.addClass('slide--notSeen');
                    }

                    if ($('#episodes .seen').length < len) {
                        $('#seasons div.slide--current .checkSeen').remove();
                        //$('div.slide--current').addClass('slide--seen');
                        $('#seasons div.slide--current').addClass('slide--notSeen');
                    }
                }
                if (update) {
                    getResource(true).then((data) => {
                        updateProgressBar();
                        updateNextEpisode();
                        if (debug) console.log('Next ID et status', {next: data.show.user.next.id, status: data.show.status, archived: data.show.user.archived});
                        if (data.show.user.next.id === null && data.show.status === 'Ended' && data.show.user.archived === false) {
                            if (debug) console.log('Série terminée, popup confirmation');
                            new PopupAlert({
                                title: 'Archivage de la série',
                                text: 'Voulez-vous archiver cette série terminée ?',
                                callback_yes: function() {
                                    $('#reactjs-show-actions > div:nth-child(1) > button').trigger('click');
                                    //cache.remove('shows', data.show.id);
                                },
                                callback_no: function() {
                                    return true;
                                }
                            });
                        }
                        toggleSpinner($elt, false);
                    }, (err) => {
                        toggleSpinner($elt, false);
                        notification('Erreur de récupération de la ressource principale', 'changeStatus: ' + err);
                    });
                }
            }
            /**
             * Met à jour la barre de progression de visionnage de la série
             * @return {void}
             */
            function updateProgressBar() {
                if (debug) console.log('updateProgressBar');
                let showId = getResourceId(),
                    progBar = $('.progressBarShow'),
                    show = cache.get('shows', showId).show;
                // On met à jour la barre de progression
                progBar.css('width', show.user.status.toFixed(1) + '%');
            }
            /**
             * Met à jour le bloc du prochain épisode à voir
             * @return {void}
             */
            function updateNextEpisode() {
                if (debug) console.log('updateNextEpisode');
                let showId = getResourceId(),
                    nextEpisode = $('a.blockNextEpisode'),
                    show = cache.get('shows', showId).show;

                if (nextEpisode.length > 0 && 'next' in show.user && show.user.next.id !== null) {
                    if (debug) console.log('nextEpisode et show.user.next OK', show.user);
                    // Modifier l'image
                    let img = nextEpisode.find('img'),
                        parent = img.parent('div'),
                        height = img.attr('height'),
                        width = img.attr('width'),
                        src = `https://api.betaseries.com/pictures/episodes?key=${betaseries_api_user_key}&id=${show.user.next.id}&width=${width}&height=${height}`;
                    img.remove();
                    parent.append(`<img src="${src}" height="${height}" width="${width}" />`);
                    // Modifier le titre
                    nextEpisode.find('.titleEpisode').text(show.user.next.code.toUpperCase() + ' - ' + show.user.next.title);
                    // Modifier le lien
                    nextEpisode.attr('href', nextEpisode.attr('href').replace(/s\d{2}e\d{2}/, show.user.next.code.toLowerCase()));
                    // Modifier le nombre d'épisodes restants
                    let remaining = nextEpisode.find('.remaining div'),
                        txt = remaining.text().trim();
                    remaining.text(txt.replace(/^\d+/, show.user.remaining));
                }
                else if (nextEpisode.length <= 0 && 'next' in show.user && show.user.next.id !== null) {
                    if (debug) console.log('No nextEpisode et show.user.next OK', show.user);
                    buildNextEpisode(show);
                }
                else if (!('next' in show.user) || show.user.next.id === null) {
                    nextEpisode.remove();
                }
                /**
                 * Construit une vignette pour le prochain épisode à voir
                 * @param  {Object} res Objet ressource de la page
                 * @return {void}
                 */
                function buildNextEpisode(res) {
                    let height = 70,
                        width = 124,
                        src = `https://api.betaseries.com/pictures/episodes?key=${betaseries_api_user_key}&id=${res.user.next.id}&width=${width}&height=${height}`,
                        serieTitle = res.resource_url.split('/').pop(),
                        template = `
                        <a href="/episode/${serieTitle}/${res.user.next.code.toLowerCase()}" class="blockNextEpisode media">
                          <div class="media-left">
                            <div class="u-insideBorderOpacity u-insideBorderOpacity--01">
                              <img src="${src}" width="${width}" height="${height}">
                            </div>
                          </div>
                          <div class="media-body">
                            <div class="title">
                              <strong>Prochain épisode à regarder</strong>
                            </div>
                            <div class="titleEpisode">
                              ${res.user.next.code.toUpperCase()} - ${res.user.next.title}
                            </div>
                            <div class="remaining">
                              <div class="u-colorWhiteOpacity05">${res.user.remaining} épisode${(show.user.remaining > 1) ? 's' : ''} à regarder</div>
                            </div>
                          </div>
                        </a>`;
                    $('.blockInformations__actions').after(template);
                }
            }
        }

        // On ajoute un event sur le changement de saison
        seasons.click(function() {
            //e.stopPropagation();
            //e.preventDefault();
            if (debug) console.log('season click');
            // On attend que les vignettes de la saison choisie soient chargées
            timer = setInterval(function() {
                const len = getNbVignettes(),
                      vigns = getVignettes();
                // On vérifie qu'il y a des vignettes et que leur nombre soit égale
                // ou supérieur au nombre d'épisodes indiqués dans la saison
                if (vigns.length > 0 && vigns.length >= len) {
                    if (debug) console.log('Season click clear timer, nbVignettes (%d, %d)', vigns.length, len);
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
        // Retourne le nombre de vignettes
        function getNbVignettes() {
            return parseInt($('#seasons .slide--current .slide__infos').text().match(/\d+/).shift(), 10);
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

    /**
     * Vérifie si les séries/films similaires ont été vues
     * Nécessite que l'utilisateur soit connecté et que la clé d'API soit renseignée
     */
    function similarsViewed() {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (! userIdentified || betaseries_api_user_key === '' || ! /(serie|film)/.test(url)) return;

        console.group('similarsViewed');
        let similars = $('#similars .slide__title'), // Les titres des ressources similaires
            len = similars.length, // Le nombre de similaires
            type = getApiResource(url.split('/')[1]), // Le type de ressource
            resId = getResourceId(), // Identifiant de la ressource
            res = cache.get(type.plural, resId)[type.singular];

        if (debug) console.log('nb similars: %d', len, parseInt(res.similars, 10));

        // On sort si il n'y a aucun similars ou si il s'agit de la vignette d'ajout
        if (len <= 0 || (len == 1 && $(similars.parent().get(0)).find('button').length == 1)) {
            $('.updateSimilars').addClass('finish');
            console.groupEnd('similarsViewed');
            return;
        }

        /*
         * On ajoute un bouton de mise à jour des similars
         * et on vérifie qu'il n'existe pas déjà
         */
        if ($('#updateSimilarsBlock').length < 1) {
            if ($('#csspopover').length <= 0 && $('#jsbootstrap').length <= 0) {
                $('head').append(`
                    <link rel="stylesheet"
                          id="csspopover"
                          href="${serverBaseUrl}/css/popover.min.css"
                          integrity="${integrityPopover}"
                          crossorigin="anonymous" \>
                    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"
                            id="jsbootstrap"
                            integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
                            crossorigin="anonymous"></script>
                `);
            }
            // On ajoute le bouton de mise à jour des similaires
            $('#similars .blockTitles').append(`
                <div id="updateSimilarsBlock" class="updateElements">
                  <img src="${serverBaseUrl}/img/update.png"
                       class="updateSimilars updateElement"
                       title="Mise à jour des similaires vus"/>
                </div>
            `);
            // Si le bouton d'ajout de similaire n'est pas présent et que la ressource est dans le compte de l'utilisateur, on ajoute le bouton
            if ($('#similars button.blockTitle-subtitle').length === 0 && res.in_account === true) {
                $('#similars .blockTitle')
                    .after(`<button type="button" class="btn-reset blockTitle-subtitle u-colorWhiteOpacity05">Suggérer une série</button>`);
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
                // On supprime les popovers
                $('#similars a.slide__image').each((i, elt) => {
                    $(elt).popover('dispose');
                });
                // On met à jour les series similaires
                similarsViewed();
            });
        }

        let params = {'details': true},
            objSimilars = [],
            setcache = true; // Indique si il faut enregistrer / pas la réponse dans le cache
        if (type.singular == 'show') {
            params.thetvdb_id = res.thetvdb_id;
        } else if (type.singular == 'movie') {
            params.id = res.id;
            delete params.details;
            setcache = false;
        }
        callBetaSeries('GET', type.plural, 'similars', params, true, setcache)
        .then(function(data) {
            let intTime = setInterval(function() {
                if (typeof bootstrap === 'undefined' || typeof bootstrap.Popover !== 'function') { return; }
                else clearInterval(intTime);
                /**
                 * Retourne la position de la popup par rapport à l'image du similar
                 * @param  {Object} tip Unknown
                 * @param  {Object} elt Le DOM Element du lien du similar
                 * @return {String}     La position de la popup
                 */
                let funcPlacement = (tip, elt) => {
                    //if (debug) console.log('funcPlacement', tip, $(tip).width());
                    let rect = elt.getBoundingClientRect(),
                        width = $(window).width(),
                        sizePopover = 320;
                    return ((rect.left + rect.width + sizePopover) > width) ? 'left' : 'right';
                };
                /**
                 * Retourne le contenu de la Popup de présentation du similar
                 * @param {Object} objRes L'objet de la série
                 * @return {String}       La présentation du similar
                 */
                function tempContentPopup(objRes) {
                    const genres = Object.values(objRes.genres).join(', '),
                          status = objRes.status == 'Ended' ? 'Terminée' : 'En cours',
                          seen = (objRes.user.status > 0) ? 'Vu à <strong>' + objRes.user.status + '%</strong>' : 'Pas vu',
                          description = (type.singular == 'show') ? objRes.description : objRes.synopsis;
                    let template = '<div>';
                    if (type.singular == 'show') {
                        template += `<p><strong>${objRes.seasons}</strong> saison${(objRes.seasons > 1 ? 's':'')}, <strong>${objRes.episodes}</strong> épisodes, `;
                    } else if (type.singular == 'movie') {
                        template += '<p>';
                    }
                    if (objRes.notes.total > 0) {
                        template += `<strong>${objRes.notes.total}</strong> votes</p>`;
                    } else {
                        template += 'Aucun vote</p>';
                    }
                    template += '<p><u>Genres:</u> ' + genres + '</p>';
                    if (objRes.hasOwnProperty('creation') || objRes.hasOwnProperty('country') || objRes.hasOwnProperty('production_year')) {
                        template += '<p>';
                        if (objRes.hasOwnProperty('creation') && objRes.creation !== null) {
                            template += `<u>Création:</u> <strong>${objRes.creation}</strong>`;
                        }
                        if (objRes.hasOwnProperty('production_year') && objRes.production_year !== null) {
                            template += `<u>Production:</u> <strong>${objRes.production_year}</strong>`;
                        }
                        if (objRes.hasOwnProperty('country') && objRes.country !== null) {
                            template += `, <u>Pays:</u> <strong>${objRes.country}</strong>`;
                        }
                        template += '</p>';
                    }
                    if (type.singular == 'show') {
                        let archived = '';
                        if (objRes.user.status > 0 && objRes.user.archived === true) {
                            archived = ', Archivée: <i class="fa fa-check-circle-o" aria-hidden="true"></i>';
                        } else if (objRes.user.status > 0) {
                            archived = ', Archivée: <i class="fa fa-circle-o" aria-hidden="true"></i>';
                        }
                        if (objRes.hasOwnProperty('showrunner') && objRes.showrunner !== null) {
                            template += `<p><u>Show Runner:</u> <strong>${objRes.showrunner.name}</strong></p>`;
                        }
                        template += `<p><u>Statut:</u> <strong>${status}</strong>, ${seen}${archived}</p>`;
                    } else if (type.singular == 'movie') {
                        template += `<p><u>Réalisateur:</u> <strong>${objRes.director}</strong></p>`;
                    }
                    template += `<p>${description.substring(0, 200)}...</p></div>`;
                    return template;
                }
                /**
                 * Retourne le titre de la Popup de présentation du similar
                 * @param  {Object} objRes L'objet de la série
                 * @return {String}        Le titre du similar
                 */
                function titlePopup(objRes) {
                    let title = objRes.title;
                    if (objRes.notes.total > 0) {
                        title += ' <span style="font-size: 0.8em;color:#000;">' +
                                parseFloat(objRes.notes.mean).toFixed(2) + ' / 5</span>';
                    }
                    return title;
                }

                // TODO: En attente de la résolution du bug (https://www.betaseries.com/bugs/api/459)
                if (type.singular === 'show') {
                    let obj = {};
                    for (let s = 0; s < data.similars.length; s++) {
                        obj = {};
                        obj[type.singular] = data.similars[s][type.singular];
                        cache.set(type.plural, data.similars[s][type.singular].id, obj);
                        objSimilars.push(data.similars[s][type.singular].id);

                        let $elt = $(similars.get(s)),
                            $link = $elt.siblings('a'),
                            resource = data.similars[s][type.singular];

                        decodeTitle($elt);
                        $elt.html($elt.html() +
                                  `<i class="fa fa-wrench popover-wrench"
                                  aria-hidden="true"
                                  style="margin-left:5px;cursor:pointer;"
                                  data-id="${resource.id}">
                               </i>`
                                 );
                        addBandeau($elt, resource.user.status, resource.notes);
                        $link.popover({
                            container: $link,
                            delay: { "show": 250, "hide": 100 },
                            html: true,
                            content: tempContentPopup(resource),
                            placement: funcPlacement,
                            title: titlePopup(resource),
                            trigger: 'hover',
                            fallbackPlacement: ['left', 'right']
                        });
                    }
                }
                $('.popover-wrench').click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const self = $(e.currentTarget),
                          type = getApiResource(location.pathname.split('/')[1]), // Indique de quel type de ressource il s'agit
                          eltId = self.data('id'), // Identifiant de la ressource
                          $dataRes = $('#dialog-resource .data-resource'), // DOMElement contenant le rendu JSON de la ressource
                          fonction = type.singular == 'show' || type.singular == 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource

                    if (debug) console.log('Popover Wrench', eltId, self);
                    callBetaSeries('GET', type.plural, fonction, {'id': eltId})
                    .then(function(data) {
                        if (! $dataRes.is(':empty')) $dataRes.empty();
                        $dataRes.append(renderjson.set_show_to_level(2)(data[type.singular]));
                        $('#dialog-resource-title span').empty().text('(' + counter + ' appels API)');
                        dialog.show();
                    }, (err) => {
                        notification('Erreur de récupération de ' + type.singular, 'popover wrench: ' + err);
                    });
                });
                $('#similars a.slide__image').on('shown.bs.popover', function () {
                    let popover = $('.popover'),
                        img = popover.siblings('img.js-lazy-image'),
                        placement = $('.popover').attr('x-placement'),
                        space = 0;
                    if (placement == 'left') {
                        space = popover.width() + (img.width()/2) + 5;
                        popover.css('left', `-${space}px`);
                    }
                });
                $('.updateSimilars').addClass('finish');
                console.groupEnd('similarsViewed');
            }, 500);
        }, (err) => {
            notification('Erreur de récupération des similars', 'similarsViewed: ' + err);
        });

        // Gestion d'ajout d'un similar
        $('#similars button.blockTitle-subtitle').removeAttr('onclick')
        .click(() => {
            new PopupAlert({
                showClose: true,
                type: 'popin-suggestshow',
                params: {
                    id: res.id
                },
                callback: function() {
                    $("#similaire_id_search").focus().on("keyup", (e) => {
                        let search = $(e.currentTarget).val();
                        if (search.length > 0 && e.keyCode != 40 && e.keyCode != 38) {
                            callBetaSeries('GET', 'search', 'shows', {autres: 'mine', text: search})
                            .then((data) => {
                                $("#search_results .title").remove();
                                $("#search_results .item").remove();
                                let show;
                                for (let s = 0; s < data.shows.length; s++) {
                                    show = data.shows[s];
                                    if (objSimilars.indexOf(show.id) !== -1) { continue; }
                                    $('#search_results').append(`
                                        <div class="item">
                                          <p><span data-id="${show.id}" style="cursor:pointer;">${show.title}</span></p>
                                        </div>`
                                    );
                                }
                                $('#search_results .item span').click((e) => {
                                    autocompleteSimilar(e.currentTarget);
                                });
                                $("#similaire_id_search").off('keydown').on('keydown', (e) => {
                                    const current_item = $("#search_results .item.hl");
                                    /* Flèche du bas */
                                    if (e.keyCode == 40) {
                                        if (current_item.length === 0) {
                                            $("#search_results .item:first").addClass("hl");
                                        } else {
                                            let next_item = $("#search_results .item.hl").next("div");
                                            if (next_item.attr("class") == "title") {
                                                next_item = next_item.next("div");
                                            }
                                            current_item.removeClass("hl");
                                            next_item.addClass("hl");
                                        }

                                        return false;
                                    }
                                    /* Flèche du haut */

                                    if (e.keyCode == 38) {
                                        if (current_item.length !== 0) {
                                            let prev_item = $("#search_results .item.hl").prev("div");
                                            if (prev_item.attr("class") == "title") {
                                                prev_item = prev_item.prev("div");
                                            }
                                            current_item.removeClass("hl");
                                            prev_item.addClass("hl");
                                        }

                                        return false;
                                    }

                                    /* Entrée */

                                    if (e.keyCode == 13) {
                                        if (debug) console.log('current_item', current_item);
                                        if (current_item.length !== 0) {
                                            autocompleteSimilar(current_item.find("span"));
                                        }

                                        return false;
                                    }

                                    /* Echap */

                                    if (e.keyCode == 27) {
                                        $("#search_results").empty();
                                        $("input[name=similaire_id_search]").val("").trigger("blur");

                                        return false;
                                    }
                                });
                            }, (err) => {
                                notification('Ajout d\'un similar', 'Erreur requête Search: ' + err);
                            });
                        } else if (e.keyCode != 40 && e.keyCode != 38) {
                            $("#search_results").empty();
                            $("#similaire_id_search").off("keydown");
                        }
                    });
                },
            });

            function autocompleteSimilar(el) {
                let titre = $(el).html(),
                    id = $(el).data("id");

                titre = titre.replace(/&amp;/g, "&");
                $("#search_results .item").remove();
                $("#search_results .title").remove();
                $("#similaire_id_search").val(titre).trigger("blur");
                $("input[name=similaire_id]").val(id);
                $('#popin-dialog .popin-content-html > form > div.button-set > button').focus();
                //$("input[name=notes_url]").trigger("focus");
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
                    `<img src="${serverBaseUrl}/img/viewed.png" class="bandViewed"/>`
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
     * Permet de mettre à jour la liste des épisodes à voir
     * sur la page de l'agenda
     * @return {void}
     */
    function updateAgenda() {
        // Identifier les informations des épisodes à voir
        // Les containers
        let containersEpisode = $('#reactjs-episodes-to-watch > div.mainBlock > div > div'),
            linksTitle = $('div.m_s > div:nth-child(1) > div.media-body > a:nth-child(1)'),
            linksEpisode = $('div > div.m_s > div:nth-child(1) > div.media-body > a.mainLink');

        // En attente du chargement des épisodes
        if (linksTitle.length > 0) {
            if (debug) console.log('updateAgenda - nb titles: %d', linksTitle.length);
            clearInterval(timerUA);
        } else {
            if (debug) console.log('updateAgenda en attente');
            return;
        }

        for (let t = 0; t < linksTitle.length; t++) {
            const title = $(linksTitle.get(t)).text().trim(),
                  episode = $(linksEpisode.get(t)).attr('href').split('/').pop().toLowerCase(),
                  container = $(containersEpisode.get(t));
            container
                .data('title', title)
                .data('code', episode);
            //if (debug) console.log('title: %s - code: %s', title, episode);
        }
        if ($('.updateElements').length === 0) {
            // On ajoute le bouton de mise à jour des similaires
            $('.maintitle > div:nth-child(1)').after(`
                <div class="updateElements">
                  <img src="${serverBaseUrl}/img/update.png" width="20" class="updateEpisodes updateElement finish" title="Mise à jour des similaires vus"/>
                </div>
            `);
            $('head').append(`
                <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"
                        integrity="sha512-qTXRIMyZIFb8iQcfjXWCO8+M5Tbc38Qi5WzdPOYZHIlZpzBHG3L3by84BBBOiRGiEb7KKtAOAs5qYdUiZiQNNQ=="
                        crossorigin="anonymous" referrerpolicy="no-referrer">
                </script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/locale/fr.min.js"
                        integrity="sha512-RAt2+PIRwJiyjWpzvvhKAG2LEdPpQhTgWfbEkFDCo8wC4rFYh5GQzJBVIFDswwaEDEYX16GEE/4fpeDNr7OIZw=="
                        crossorigin="anonymous" referrerpolicy="no-referrer" async="true" defer="true">
                </script>
            `);

            $('.updateEpisodes').click((e) => {
                e.stopPropagation();
                e.preventDefault();
                if (debug) console.group('Agenda updateEpisodes');
                const self = $(e.currentTarget);
                self.removeClass('finish');
                const len = $('#reactjs-episodes-to-watch > div.mainBlock > div > div').length;
                callBetaSeries('GET', 'episodes', 'list', {limit: 1, order: 'smart', showsLimit: len})
                .then((data) => {
                    let intTime = setInterval(function() {
                        if (typeof moment != 'function') { return; }
                        else clearInterval(intTime);
                        moment.locale('fr');
                        if (debug) console.log('updateAgenda callBetaSeries.then', data);
                        let titles = []; // Liste des titres de series à voir
                        for (let t = 0; t < data.shows.length; t++) {
                            titles.push(data.shows[t].title);
                        }
                        for (let e = 0; e < len; e++) {
                            let container = $(containersEpisode.get(e)),
                                unseen = data.shows[e].unseen[0],
                                indexTitle = titles.indexOf(container.data('title'));
                            // Si la serie n'est plus dans la liste, on la supprime
                            if (indexTitle == -1) {
                                container.remove();
                                continue;
                            }
                            if (container.data('title') == data.shows[e].title && container.data('code') != unseen.code.toLowerCase()) {
                                if (debug) console.log('Episode à mettre à jour', data.shows[e]);
                                // Mettre à jour l'épisode
                                let mainLink = $('a.mainLink', container),
                                    text = unseen.code + ' - ' + unseen.title;
                                // On met à jour le titre et le lien de l'épisode
                                mainLink.attr('href', mainLink.attr('href').replace(/s\d{2}e\d{2}/, unseen.code.toLowerCase()));
                                mainLink.attr('title', `Accéder à la fiche de l'épisode ${text}`);
                                mainLink.text(text);
                                // On met à jour la date de sortie
                                $('.date .mainTime', container).text(moment(unseen.date).format('D MMMM YYYY'));
                                // On met à jour la synopsis
                                $('.m_s p.m_ay', container).html(unseen.description);
                                // On met à jour la barre de progression
                                $('.media-left > .m_ab > .m_ag', container).css('width', String(unseen.show.progress) + '%');
                                // On met à jour la note
                                renderNote(unseen.note.mean, container);
                            }
                        }
                        self.addClass('finish');
                        if (debug) console.groupEnd('Agenda updateEpisodes');
                    }, 500);
                }, (err) => {
                    notification('Erreur de mise à jour des épisodes', 'updateAgenda: ' + err);
                    if (debug) console.groupEnd('Agenda updateEpisodes');
                });
            });
        }
        /**
         * Permet d'afficher une note avec des étoiles
         * @param  {Number} note      La note à afficher
         * @param  {Object} container DOMElement contenant la note à afficher
         * @return {void}
         */
        function renderNote(note, container) {
            const renderStars = $('.date .stars', container);
            if (renderStars.length <= 0) {
                return;
            }
            renderStars.empty();
            renderStars.attr('title', `${parseFloat(note).toFixed(1)} / 5`);
            let typeSvg;
            Array.from({
                length: 5
            }, (index, number) => {
                typeSvg = note <= number ? "empty" : (note < number+1) ? 'half' : "full";
                renderStars.append(`
                    <svg viewBox="0 0 100 100" class="star-svg">
                      <use xmlns:xlink="http://www.w3.org/1999/xlink"
                           xlink:href="#icon-star-${typeSvg}">
                      </use>
                    </svg>
                `);
            });
        }
    }

    /**
     * Ajoute le statut de la série sur la page de gestion des séries de l'utilisateur
     */
    function addStatusToGestionSeries() {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (! userIdentified || betaseries_api_user_key === '') return;

        let series = $('#member_shows div.showItem.cf');
        if (series.length < 1) return;

        series.each(function(index, serie) {
            let id = $(serie).data('id'),
                infos = $($(serie).find('.infos'));
            callBetaSeries('GET', 'shows', 'display', {'id': id})
            .then(function(data) {
                let statut = (data.show.status == 'Continuing') ? 'En cours' : 'Terminée';
                infos.append(`<br>Statut: ${statut}`);
            }, (err) => {
                notification('Erreur de modification d\'une série', 'addStatusToGestionSeries: ' + err);
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
                      src="${serverBaseUrl}/index.html"
                      style="background:white;margin:auto;">
              </iframe>
            </div>'
        `);
        return new Promise((resolve, reject) => {
            window.addEventListener("message", receiveMessage, false);
            function receiveMessage(event) {
                const origin = new URL(serverBaseUrl).origin;
                if (debug) console.log('receiveMessage', event);
                if (event.origin !== origin) {
                    if (debug) console.error('receiveMessage {origin: %s}', event.origin, event);
                    reject('event.origin is not %s', origin);
                    return;
                }
                let msg = event.data.message;
                if (msg == 'access_token') {
                    betaseries_api_user_token = event.data.value;
                    $('#containerIframe').remove();
                    resolve(msg);
                } else {
                    if (debug) console.error('Erreur de récuperation du token', event);
                    reject(event.data);
                    notification('Erreur de récupération du token', 'Pas de message');
                }
            }
        });
    }

    /**
     * Fonction servant à appeler l'API de BetaSeries
     *
     * @param  {String}   type             Type de methode d'appel Ajax (GET, POST, PUT, DELETE)
     * @param  {String}   methode          La ressource de l'API (ex: shows, seasons, episodes...)
     * @param  {String}   fonction         La fonction à appliquer sur la ressource (ex: search, list...)
     * @param  {Object}   args             Un objet (clef, valeur) à transmettre dans la requête
     * @param  {bool}     [nocache=false]  Indique si on doit utiliser le cache ou non (Par défaut: false)
     * @param  {bool}     [setcache=true]  Indique si on doit ou pas enregistrer la réponse dans le cache (Par défaut: true)
     * @return {Promise}
     */
    function callBetaSeries(type, methode, fonction, args, nocache = false, setcache = true) {
        let uri = `api.base/${methode}/${fonction}`,
            // Les en-têtes pour l'API
            myHeaders = new Headers({
                'Accept'                : 'application/json',
                'X-BetaSeries-Version'  : api.version,
                'X-BetaSeries-Token'    : betaseries_api_user_token,
                'X-BetaSeries-Key'      : betaseries_api_user_key
            }),
            // objet qui contient les paramètres de la requête
            initFetch = {
                method: type,
                headers: myHeaders,
                mode: 'cors',
                cache: 'no-cache'
            },
            keys = Object.keys(args);

        if (debug) console.log('callBetaSeries', {
            type: type,
            methode: methode,
            fonction: fonction,
            args: args,
            nocache: nocache,
            setcache: setcache
        });

        // On crée l'URL de la requête de type GET avec les paramètres
        if (type === 'GET' && keys.length > 0) {
            let params = [];
            for (let key of keys) {
                params.push(key + '=' + args[key]);
            }
            uri += '?' + params.join('&');
        } else if (keys.length > 0) {
            initFetch.body = new URLSearchParams(args);
        }
        // On retourne la ressource en cache si elle y est présente
        if (! nocache && type === 'GET' && args && 'id' in args && cache.has(methode, args.id)) {
            return new Promise((resolve) => {
                resolve(cache.get(methode, args.id));
            });
        }
        return new Promise((resolve, reject) => {
            counter++; // Incrément du compteur de requêtes à l'API
            fetch(uri, initFetch).then(response => {
                if (debug) console.log('fetch response', response);
                // On récupère les données et les transforme en objet
                response.json().then((data) => {
                    if (debug) console.log('fetch status (%d) & data', response.status, data);
                    // On gère le retour d'erreurs de l'API
                    if (data.hasOwnProperty('errors') && data.errors.length > 0) {
                        const code = data.errors[0].code,
                              text = data.errors[0].text;
                        if (code === 2005 ||
                            (response.status === 400 && code === 0 &&
                                text === "L'utilisateur a déjà marqué cet épisode comme vu."))
                        {
                            reject('changeStatus');
                        } else if (code == 2001) {
                            // Appel de l'authentification pour obtenir un token valide
                            authenticate().then(() => {
                                callBetaSeries(type, methode, fonction, args, nocache, setcache)
                                .then((data) => {
                                    resolve(data);
                                }, (err) => {
                                    reject(err);
                                });
                            }, (err) => {
                                reject(err);
                            });
                        } else {
                            reject(JSON.stringify(data.errors[0]));
                        }
                        return;
                    }
                    // On gère les erreurs réseau
                    if (!response.ok) {
                        console.error('Fetch erreur network', response);
                        reject(response);
                        return;
                    }
                    // Retour sans erreur, on met la ressource en cache
                    if (setcache && type == 'GET' && args && 'id' in args) {
                        cache.set(methode, args.id, data);
                    }
                    resolve(data);
                });
            }).catch(error => {
                if (debug) console.log('Il y a eu un problème avec l\'opération fetch: ' + error.message);
                console.error(error);
                reject(error.message);
            });
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
            if (type && data.hasOwnProperty(type)) {
                for (let key in data[type]) {
                    delete data[type][key];
                }
            }
            // On nettoie l'ensemble du cache
            else {
                data = {shows: {}, episodes: {}, movies: {}, members: {}};
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
                if (debug) console.log('Retourne la ressource (%s) du cache', type, {key: key});
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
            if (debug) console.log('Retourne la ressource (%s) du cache ou valeur par défaut', type, {key: key, default: def});
            return self.has(type, key) ? self.get(type, key) : def;
        };

        /**
         * Sets a cache entry with the provided key and value.
         * @param {String} type  Le type de ressource
         * @param {String} key   the key to set
         * @param {*}      value the value to set
         */
        this.set = function(type, key, value) {
            if (debug) console.log('Ajout de la ressource (%s) en cache', type, {key: key, val: value});
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
            if (debug) console.log('Suppression de la ressource (%s) du cache', type, {key: key});
            if (self.has(type, key)) {
                delete data[type][key];
            }
        };
    }

})(jQuery);