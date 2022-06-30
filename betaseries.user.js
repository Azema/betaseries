// ==UserScript==
// @name         us_betaseries
// @namespace    https://github.com/Azema/betaseries
// @version      1.4.2
// @description  Ajoute quelques améliorations au site BetaSeries
// @author       Azema
// @homepage     https://github.com/Azema/betaseries
// @supportURL   https://github.com/Azema/betaseries/issues
// @match        https://www.betaseries.com/serie/*
// @match        https://www.betaseries.com/series/*
// @match        https://www.betaseries.com/episode/*
// @match        https://www.betaseries.com/film/*
// @match        https://www.betaseries.com/films/*
// @match        https://www.betaseries.com/membre/*
// @exclude      https://www.betaseries.com/membre/*/badges
// @match        https://www.betaseries.com/api/*
// @match        https://www.betaseries.com/article/*
// @icon         https://www.betaseries.com/images/site/favicon-32x32.png
// @require      https://cdnjs.cloudflare.com/ajax/libs/humanize-duration/3.27.0/humanize-duration.min.js#sha512-C6XM91cD52KknT8jaQF1P2PrIRTrbMzq6hzFkc22Pionu774sZwVPJInNxfHNwPvPne3AMtnRWKunr9+/gQR5g==
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// ==/UserScript==

'use strict';

/* eslint-disable */
if (!navigator) {
    const { Base, EventTypes, HTTP_VERBS, NetworkState } = require("./types/Base");
    const { CacheUS, DataTypesCache } = require("./types/Cache");
    const { CommentBS } = require("./types/Comment");
    const { Episode } = require("./types/Episode");
    const { Media, MediaType } = require("./types/Media");
    const { Show, PlatformList } = require("./types/Show");
    const { Movie, MovieStatus } = require("./types/Movie");
    const { Member } = require("./types/Member");
    const { UpdateAuto } = require('./types/UpdateAuto');
}
/* eslint-enable */

/* eslint-disable no-undef */
/* globals

   betaseries_api_user_token:  true, betaseries_user_id: false, trans: false,
   deleteFilterOthersCountries: false, generate_route: false,
   CONSTANTE_SORT: false, CONSTANTE_FILTER: false, hideButtonReset: false, newApiParameter: false, renderjson: false, humanizeDuration: false, A11yDialog: false, markAllNotificationsAsSeen: false,
   viewMoreFriends: false, PopupAlert: false, faceboxDisplay: false
 */
/************************************************************************************************/
/*                               PARAMETRES A MODIFIER                                          */
/************************************************************************************************/
/* Ajouter ici votre clé d'API BetaSeries (Demande de clé API: https://www.betaseries.com/api/) */
const betaseries_api_user_key = '';
/* Ajouter ici votre clé d'API V3 à themoviedb */
const themoviedb_api_user_key = '';
/* Ajouter ici l'URL de base de votre serveur distribuant les CSS, IMG et JS */
const serverOauthUrl = 'https://azema.github.io/betaseries-oauth';
const serverBaseUrl = 'https://azema.github.io/betaseries-oauth';
/* SRI du fichier app-bundle.js */
const sriBundle = 'sha384-o/KNBY1r2K/5deJVty50wlOPPBNpm+1efIQ2fjG3bzHvZIOogvftFqOHqNfWVu5c';
/************************************************************************************************/
// @ts-check
let resources = {};
/**
 * Fonction de chargement dynamique de feuilles de style CSS
 * @param   {string}            href        Le source de la feuille de style
 * @param   {HTMLLinkElement}   before      Link de référence pour le placement
 * @param   {Attr}              media       Le type de média à utiliser pour la feuille de style
 * @param   {Object}            attributes  Les attributs à appliquer à l'élément Link
 * @param   {Function}          callback    Fonction de callback après chargement de la feuille de style
 * @param   {Function}          onerror     Fonction de callback en cas d'erreur
 * @returns {HTMLLinkElement}
 */
const loadCSS = function( href, before, media, attributes = {}, callback, onerror ) {
    // Arguments explained:
    // `href` [REQUIRED] is the URL for your CSS file.
    // `before` [OPTIONAL] is the element the script should use as a reference for injecting our stylesheet <link> before
    // By default, loadCSS attempts to inject the link after the last stylesheet or script in the DOM. However, you might desire a more specific location in your document.
    // `media` [OPTIONAL] is the media type or query of the stylesheet. By default it will be 'all'
    // `attributes` [OPTIONAL] is the Object of attribute name/attribute value pairs to set on the stylesheet's DOM Element.
    const doc = window.document;
    const ss = doc.createElement( "link" );
    let ref;
    if( before ){
        ref = before;
    } else {
        const refs = ( doc.body || doc.getElementsByTagName( "head" )[ 0 ] ).childNodes;
        ref = refs[refs.length - 1];
    }

    const sheets = doc.styleSheets;
    // Set any of the provided attributes to the stylesheet DOM Element.
    // temporarily set media to something inapplicable to ensure it'll fetch without blocking render
    attributes = Object.assign({rel: 'stylesheet', href, media: 'only x'}, attributes);
    for( let attributeName in attributes ){
        if ( attributes[attributeName] !== undefined ){
            ss.setAttribute( attributeName, attributes[attributeName] );
        }
    }

    // wait until body is defined before injecting link. This ensures a non-blocking load in IE11.
    function ready( cb ){
        if( doc.body ){
            return cb();
        }
        setTimeout(function(){
            ready( cb );
        });
    }
    // Inject link
    // Note: the ternary preserves the existing behavior of "before" argument, but we could choose to change the argument to "after" in a later release and standardize on ref.nextSibling for all refs
    // Note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
    ready( function() {
        ref.parentNode.insertBefore( ss, ( before ? ref : ref.nextSibling ) );
    });
    // A method (exposed on return object for external use) that mimics onload by polling document.styleSheets until it includes the new sheet.
    var onloadcssdefined = function( cb ){
        const resolvedHref = ss.href;
        let i = sheets.length;
        while( i-- ){
            if( sheets[ i ].href === resolvedHref ){
                return cb();
            }
        }
        setTimeout(function() {
            onloadcssdefined( cb );
        });
    };

    let called = false;
	function newcb() {
        if ( ss.addEventListener ) {
            ss.removeEventListener( "load", newcb );
        }
        if ( !called && callback ) {
            called = true;
            callback.call( ss );
        }
        ss.media = media || "all";
	}

    // once loaded, set link's media back to `all` so that the stylesheet applies once it loads
    if ( ss.addEventListener ) {
        ss.addEventListener( "load", newcb);
        if (onerror) { ss.addEventListener('error', onerror); }
    }
    ss.onloadcssdefined = onloadcssdefined;
    onloadcssdefined( newcb );
    return ss;
};
/**
 * Fonction de chargement dynamique de scripts JS
 * @param   {string}    src         La source du script
 * @param   {Object}    attributes  Les attributs du script
 * @param   {Function}  callback    Fonction de callback après le chargement du script
 * @param   {Function}  onerror     Fonction de callback en cas d'erreur
 * @returns {HTMLScriptElement}     L'objet script
 */
const loadJS = function( src, attributes = {}, callback, onerror ) {
    // Arguments explained:
    // `href` [REQUIRED] is the URL for your CSS file.
    // `before` [OPTIONAL] is the element the script should use as a reference for injecting our stylesheet <link> before
    // By default, loadCSS attempts to inject the link after the last stylesheet or script in the DOM. However, you might desire a more specific location in your document.
    // `media` [OPTIONAL] is the media type or query of the stylesheet. By default it will be 'all'
    // `attributes` [OPTIONAL] is the Object of attribute name/attribute value pairs to set on the stylesheet's DOM Element.
    const doc = window.document;
    const ss = doc.createElement( "script" );
    const refs = ( doc.body || doc.getElementsByTagName( "head" )[ 0 ] ).childNodes;
    const ref = refs[ refs.length - 1];
    attributes = Object.assign({type: "text/javascript"}, attributes);
    // Set any of the provided attributes to the stylesheet DOM Element.
    for ( let attributeName in attributes ) {
        if ( attributes[attributeName] !== undefined ) {
            ss.setAttribute( attributeName, attributes[attributeName] );
        }
    }
    ss.src = src;

    // wait until body is defined before injecting link. This ensures a non-blocking load in IE11.
    function ready( cb ){
        if( doc.body ){
            return cb();
        }
        setTimeout(function(){
            ready( cb );
        });
    }
    // Inject link
    // Note: the ternary preserves the existing behavior of "before" argument, but we could choose to change the argument to "after" in a later release and standardize on ref.nextSibling for all refs
    // Note: `insertBefore` is used instead of `appendChild`, for safety re: http://www.paulirish.com/2011/surefire-dom-element-insertion/
    ready( function() {
        ref.parentNode.insertBefore( ss, ref.nextSibling );
    });

    let called = false;
	function newcb() {
        if ( ss.addEventListener ) {
            ss.removeEventListener( "load", newcb );
            if (onerror) ss.removeEventListener('error', onerror);
        }
        if ( !called && callback ) {
            called = true;
            callback.call( ss );
        }
	}

    // once loaded, set link's media back to `all` so that the stylesheet applies once it loads
    if ( ss.addEventListener ) {
        ss.addEventListener( "load", newcb);
        if (onerror) { ss.addEventListener('error', onerror); }
    }
    return ss;
};
/**
 *
 * @param {JQueryStatic} $ - Library JQuery
 */
const launchScript = function($) {
    const debug = false,
          origin = window.location.origin,
          url = window.location.pathname,
          domain = window.location.hostname.substring(window.location.hostname.indexOf('.')+1),
          regDomain = new RegExp(domain, 'i'),
          regexUser = new RegExp('^/membre/[A-Za-z0-9]*$'),
          noop = function () {},
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
    templatePopover = `
        <div class="popover" role="tooltip">
            <div class="arrow"></div>
            <h3 class="popover-header"></h3>
            <div class="popover-body"></div>
        </div>`,
    optionsLazyload = {
        root: null,
        rootMargin: "50px 0px",
        threshold: 0.01,
        selector: '.js-lazy-image'
    };

    // Objet contenant les scripts et feuilles de style utilisées par le userscript
    let scriptsAndStyles = {
        "renderjson": {
            type: 'script',
            id: 'renderjson',
            src: `${serverBaseUrl}/js/renderjson.min.js`,
            integrity: 'sha384-/mHGJ/3gaDqVJCEeed/Uh1fJVO01E+CLBZrFqjv1REaFAZxEBvGMHQyBmwln/uhx',
            called: false,
            loaded: false
        },
        "popover": {
            type: 'style',
            id: 'csspopover',
            href: `${serverBaseUrl}/css/popover.min.css`,
            integrity: 'sha384-yebLb3hn+3mwaxg0KwLhE2YYLEKsMRsxRvUPyBOF6gzkzLEOWEeD9ELZeDACSwO7',
            media: 'all',
            called: false,
            loaded: false
        },
        "bootstrap": {
            type: 'script',
            id: 'jsbootstrap',
            src: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js',
            integrity: 'sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl',
            called: false,
            loaded: false
        },
        "tablecss": {
            type: 'style',
            id: 'tablecss',
            href: `${serverBaseUrl}/css/table.min.css`,
            integrity: 'sha384-tRMvWzqbXtOp2OM+OPoYpWVxHw8eXcFKgzi4q9m6i0rvWTU33pdb8Bx33wBWjlo9',
            media: 'all',
            called: false,
            loaded: false
        },
        "stylehome": {
            type: 'style',
            id: 'stylehome',
            href: `${serverBaseUrl}/css/style.min.css`,
            integrity: 'sha384-Cekddv8gf4cq4AusXXtPX3r9DlcjafJgbufsVTp6JWWlh8r1Jq11d0DKiB53wlIc',
            media: 'all',
            called: false,
            loaded: false
        },
        "awesome": {
            type: 'style',
            id: 'awesome',
            href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
            integrity: 'sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw==',
            media: 'all',
            called: false,
            loaded: false
        },
        "comments": {
            type: 'style',
            id: 'commentstyle',
            href: `${serverBaseUrl}/css/comments.min.css`,
            integrity: 'sha384-37/ghsJZTBvNPxUAy6GMPGxa3BKjrZ2ykMb7gUpkkVvoZwAsm4WhigKhMyYCN+Ft',
            media: 'all',
            called: false,
            loaded: false
        },
        "textcomplete": {
            type: 'script',
            id: 'jstextcomplete',
            src: `${serverBaseUrl}/js/jquery.textcomplete.min.js`,
            integrity: 'sha384-kf6mqav/ZhBkPgNGorOiE7+/0GmfN9NDz0ov5G3fy6PuV/wqAggrTaWkTVfPM79L',
            called: false,
            loaded: false
        },
        "lazyload": {
            type: 'script',
            id: 'lazyload',
            src: `${serverBaseUrl}/js/lazyload.min.js`,
            integrity: 'sha384-ZjtdUVt9uqIO0cVuZ4zQ5r/1QqXlGIct+PFRAMtAlSz3F4apy925Pn5Tm3hnczMg',
            called: false,
            loaded: false
        },
        "jqueryuijs": {
            type: 'script',
            id: 'jqueryui-js',
            src: 'https://code.jquery.com/ui/1.13.1/jquery-ui.js',
            integrity: 'sha384-KUSBBRKMO05pX3xNidXAX5N1p4iNwntmhHY4iugl7mINOyOXFL4KZWceJtMj7M0A',
            called: false,
            loaded: false
        },
        "jqueryuicss": {
            type: 'style',
            id: 'jqueryui-css',
            href: 'https://code.jquery.com/ui/1.13.1/themes/base/jquery-ui.css',
            integrity: 'sha384-Wh/opNnCPQdVc7YXIh18hoqN6NYg40GBaO/GwQSwrIbAIo8uCeYri2DX2IisvVP6',
            called: false,
            loaded: false
        },
        "searchFriend": {
            type: 'script',
            id: 'searchFriendJs',
            src: '/js/search-friends.js',
            called: false,
            loaded: false
        }
    };
    // let indexCallLoad = 0;
    let timer,
    /** @type {Member} */ 
        currentUser, 
        /**@type {Member} */
        user,
        fnLazy, 
        state = {};

    const system = {
        /**
         * Initialisation du script
         */
        init: function() {
            const $head = $('head');
            $head.append(`<link rel="dns-prefetch" href="${new URL(serverOauthUrl).origin}">`);
            $head.append(`<link rel="dns-prefetch" href="${new URL(serverBaseUrl).origin}">`);
            $head.append(`<link rel="preconnect" href="${new URL(serverBaseUrl).origin}" crossorigin>`);
            $head.append(`<link rel="dns-prefetch" href="${new URL(Base.api.url).origin}">`);
            $head.append(`<link rel="preconnect" href="${new URL(Base.api.url).origin}" crossorigin>`);
            system.updateResources();
            /*
                    CHARGEMENT LIBRARY SearchFriend pour la recommandation à un ami
             */
            if (typeof SearchFriend === 'undefined') {
                system.addScriptAndLink(['searchFriend']);
            }
            /*
             *          AJOUT DU LOADER
             */
            $('#popup-bg').after('<div id="loader-bg"><i class="fa fa-spinner fa-pulse fa-4x fa-fw"></i><span class="sr-only">Loading...</span></div>');
            // Ajout des feuilles de styles pour le userscript
            system.addScriptAndLink(['awesome', 'stylehome']);
            if (system.userIdentified()) {
                Member.fetch().then(member => {
                    /** @type {Member} */
                    user = unsafeWindow.user = member;
                    // On affiche la version du script
                    if (Base.debug) console.log('%cUserScript BetaSeries %cv%s - Membre: %c%s', 'color:#e7711b', 'color:inherit', GM_info.script.version, 'color:#00979c', user.login);
                    // On désactive les fonctions de notifications originales
                    unsafeWindow.notificationChecker = () => {};
                    unsafeWindow.growlNotificationChecker = () => {};
                    $('.js-iconNotifications').off('click').on('click', (e) => {
                        e.stopPropagation();
                        $("body").toggleClass("menu-open").toggleClass("menu-open--notifications");
                        const $growl = $("#growl");
                        if ($growl.hasClass("visible")) {
                            $growl.removeClass("visible");
                            localStorage.removeItem("seen-growl-notifications");
                            if (member.notifications.seen) {
                                markAllNotificationsAsSeen();
                                member.notifications.markAllAsSeen();
                            }
                        } else {
                            member.renderNotifications();
                        }
                        $(".notification--standalone").remove();
                });
                    $(".js-close-elements").off('click').on("click", () => {
                        // close notifications
                        $('#growl').removeClass('visible');
                        $("body").toggleClass("menu-open").toggleClass("menu-open--notifications");
                        if (user.notifications.seen) {
                            markAllNotificationsAsSeen();
                            user.notifications.markAllAsSeen();
                        }
                    });
                });
            } else {
                // On affiche la version du script
                if (Base.debug) console.log('%cUserScript BetaSeries %cv%s - Membre: Guest', 'color:#e7711b',   'color:inherit', GM_info.script.version);
            }
            system.checkApiVersion();
            /*
             *          BANDEAU DE NAVIGATION DU SITE WEB
             */
            (function navigation() {
                /** @type {jQuery<HTMLElement>} */
                const $nav = $('nav#top'); // Jquery<HTMLElement> Bandeau de navigation
                let forceNotScrolled = false; // Permet de forcer ou non la taille initiale du bandeau
                /*
                 * Permet de diminuer ou remettre à la normale, le bandeau de navigation durant le scrolling
                 */
                const boundHandleScroll = function() {
                    $nav.toggleClass('scrolled', (window.visualViewport.pageTop > 40 && !forceNotScrolled));
                };
                boundHandleScroll('call initial');
                window.addEventListener("scroll", boundHandleScroll);
                $('#reactjs-header-search .menu-item > button').on('click', () => {
                    /*
                     * Force la taille du bandeau de navigation à sa taille initiale,
                     * lors d'une recherche de média
                     */
                    forceNotScrolled = true;
                    $nav.removeClass('scrolled');
                    $nav.addClass('search');
                    system.waitDomPresent('#reactjs-header-search .menu-item form', () => {
                        $('#reactjs-header-search .menu-item form button:last-child').on('click', () => {
                            $nav.removeClass('search');
                            forceNotScrolled = false;
                            boundHandleScroll();
                        });
                    });
                });
            })();
            /*
                            LAZYLOAD
             */
            system.addScriptAndLink('lazyload', () => {
                fnLazy = function() {
                    $(optionsLazyload.selector).lazyload(optionsLazyload);
                };
            });
            /**
             *          FORMULAIRE DE RECHERCHE DE MEDIAS
             *
             * Permet d'ajouter des améliorations au menu de recherche du site
             */
            (function headerSearch() {
                // On observe l'espace lié à la recherche de séries ou de films, en haut de page.
                // Afin de modifier quelque peu le résultat, pour pouvoir lire l'intégralité du titre
                const observer = new MutationObserver(mutationsList => {
                    const updateTitle = (i, e) => {
                        if (system.isTruncated(e)) {
                            $(e).parents('a').attr('title', $(e).text());
                        }
                    };
                    const updateImg = (i, elt) => {
                        if (debug) console.log('headerSearch updateImg[%d]', i);
                        const $elt = $(elt);
                        const $col = $elt.parents('.col-md-4').first();
                        // if (debug) console.log('col', $col);
                        if ($col.hasClass('show_searchResult')) {
                            // Show
                            const slug = $elt.attr('href').split('/').pop();
                            Show.fetchByUrl(slug).then((show) => {
                                /**
                                 * @typedef {Show} show
                                 */
                                if (show.in_account && show.user.status > 0) {
                                    if (debug) console.log('show[%s]: found and viewed', slug);
                                    $('.mainLink', $elt)
                                        .css('textDecoration', 'line-throught')
                                        .css('color', 'red');
                                }
                            })
                        } else if ($col.hasClass('movie_searchResult')) {
                            // Movie
                            const title = $('.mainLink', $elt).text().trim();
                            Movie.search(title).then(movie => {
                                /**
                                 * @typedef {Movie} movie
                                 */
                                if (movie.in_account && movie.user.status > 0) {
                                    $('.mainLink', $elt)
                                        .css('textDecoration', 'line-throught')
                                        .css('color', 'red');
                                }
                            })
                        }
                    };
                    for (let mutation of mutationsList) {
                        if (mutation.type == 'childList' && mutation.addedNodes.length === 1) {
                            /** @type {JQuery<HTMLElement>} */
                            const $node = $(mutation.addedNodes[0]);
                            if ($node.hasClass('col-md-4')) {
                                $('.mainLink', $node).each(updateTitle);
                                $('a.js-searchResult', $node).each(updateImg);
                            }
                            /*else if ($node.hasClass('js-searchResult')) {
                                const title = $('.mainLink', $node).get(0);
                                if (system.isTruncated(title)) {
                                    $node.attr('title', $(title).text());
                                }
                                updateImg(0, $node);
                            }*/
                            else if (mutation.addedNodes[0].nodeName.toLowerCase() === 'form') {
                                console.log('Observer HeaderSearch mutation', mutation);
                                $('input', $node).keyup((e) => {
                                    const target = $(e.currentTarget);
                                    console.log('HeaderSearch input value', e.currentTarget.value);
                                    if (target && /^imdb:\s*tt\d+/i.test(target.val())) {
                                        e.stopPropagation();
                                        const imdb_id = target.val().match(/^imdb:\s*(tt\d+)/i)[1].trim();
                                        console.log('HeaderSearch imdb_id: ', imdb_id);
                                        Show.fetchByImdb(imdb_id, true).then(show => {
                                            let template = `
                                            <div class="col-md-4 kz_k1 show_searchResult">
                                                <div class="ComponentHeaderSearchTitle kz_il">Séries</div>
                                                <div style="max-height: 580px; overflow-y: hidden;">
                                                    <a href="${show.resource_url}"
                                                        class="js-searchResult kv_kx">
                                                        <div class="media">
                                                            <div class="media-left">
                                                                <img class="greyBorder"
                                                                    src="${show.images.poster}"
                                                                    width="27" height="40" alt="Affiche de ${show.title}">
                                                            </div>
                                                            <div class="media-body media-body--ellipsis">
                                                                <div class="mainLink" style="margin-top: 1px;">${show.title}</div>
                                                                <div class="mainTime" style="margin-top: 2px; display: flex;">
                                                                    <div>${show.creation}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                            `;
                                            $('.ComponentHeaderSearchContainer .row').empty().prepend(template);
                                        });
                                        Movie.fetchByImdb(imdb_id, true).then(movie => {
                                            let template = `
                                            <div class="col-md-4 kz_k1 movie_searchResult">
                                                <div class="ComponentHeaderSearchTitle kz_il">Films</div>
                                                <div style="max-height: 580px; overflow-y: hidden;">
                                                    <a href="${movie.resource_url}"
                                                        class="js-searchResult kv_kx">
                                                        <div class="media">
                                                            <div class="media-left">
                                                                <img class="greyBorder"
                                                                    src="${movie.poster}"
                                                                    width="27" height="40" alt="Affiche de ${movie.title}">
                                                            </div>
                                                            <div class="media-body media-body--ellipsis">
                                                                <div class="mainLink" style="margin-top: 1px;">${movie.title}</div>
                                                                <div class="mainTime" style="margin-top: 2px; display: flex;">
                                                                    <div>${movie.creation}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                            `;
                                            $('.ComponentHeaderSearchContainer .row').empty().prepend(template);
                                        });
                                    }
                                    else if (target && /^tvdb:\s*\d+/i.test(target.val())) {
                                        e.stopPropagation();
                                        const tvdb_id = target.val().match(/^tvdb:\s*(\d+)/i)[1].trim();
                                        console.log('HeaderSearch tvdb_id: ', tvdb_id);
                                        Show.fetchByTvdb(tvdb_id).then(show => {
                                            let template = `
                                            <div class="col-md-4 kz_k1 show_searchResult">
                                                <div class="ComponentHeaderSearchTitle kz_il">Séries</div>
                                                <div style="max-height: 580px; overflow-y: hidden;">
                                                    <a href="${show.resource_url}"
                                                        class="js-searchResult kv_kx">
                                                        <div class="media">
                                                            <div class="media-left">
                                                                <img class="greyBorder"
                                                                    src="${show.images.poster}"
                                                                    width="27" height="40" alt="Affiche de ${show.title}">
                                                            </div>
                                                            <div class="media-body media-body--ellipsis">
                                                                <div class="mainLink" style="margin-top: 1px;">${show.title}</div>
                                                                <div class="mainTime" style="margin-top: 2px; display: flex;">
                                                                    <div>${show.creation}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                            `;
                                            $('.ComponentHeaderSearchContainer .row').empty().prepend(template);
                                        });
                                    }
                                    else if (target && /^tmdb:\s*\d+/i.test(target.val())) {
                                        e.stopPropagation();
                                        const tmdb_id = target.val().match(/^tmdb:\s*(\d+)/i)[1].trim();
                                        console.log('HeaderSearch tmdb_id: ', tmdb_id);
                                        Movie.fetchByTmdb(tmdb_id, true).then(movie => {
                                            let template = `
                                            <div class="col-md-4 kz_k1 movie_searchResult">
                                                <div class="ComponentHeaderSearchTitle kz_il">Films</div>
                                                <div style="max-height: 580px; overflow-y: hidden;">
                                                    <a href="${movie.resource_url}"
                                                        class="js-searchResult kv_kx">
                                                        <div class="media">
                                                            <div class="media-left">
                                                                <img class="greyBorder"
                                                                    src="${movie.poster}"
                                                                    width="27" height="40" alt="Affiche de ${movie.title}">
                                                            </div>
                                                            <div class="media-body media-body--ellipsis">
                                                                <div class="mainLink" style="margin-top: 1px;">${movie.title}</div>
                                                                <div class="mainTime" style="margin-top: 2px; display: flex;">
                                                                    <div>${movie.creation}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                            `;
                                            $('.ComponentHeaderSearchContainer .row').empty().prepend(template);
                                        });
                                    }
                                });
                            }
                        }
                    }
                });
                observer.observe(document.getElementById('reactjs-header-search'), { childList: true, subtree: true });
            })();
        },
        /**
         * Met à jour les attributs integrity des ressources CSS et JS
         * Et ajoute le numéro de version du build aux URLs
         * @returns {void}
         */
        updateResources: function() {
            if (Object.keys(resources) <= 0) {
                return;
            }
            const version = resources.version;
            // Styles
            for (const style in resources.css) {
                if (scriptsAndStyles[style]) {
                    let key = Object.keys(resources.css[style])[0];
                    if (scriptsAndStyles[style].integrity) {
                        scriptsAndStyles[style].integrity = resources.css[style][key];
                    }
                    scriptsAndStyles[style].href += '?v=' + version;
                }
            }
            // Scripts
            for (const script in resources.js) {
                if (scriptsAndStyles[script]) {
                    let key = Object.keys(resources.js[script])[0];
                    if (scriptsAndStyles[script].integrity) {
                        scriptsAndStyles[script].integrity = resources.js[script][key];
                    }
                    scriptsAndStyles[script].src += '?v=' + version;
                }
            }
        },
        /**
         * Patiente en attendant que la fonction de check soit OK
         * @param {Function} check - La fonction de vérification de fin d'attente
         * @param {Function} cb - La fonction de callback
         * @param {number} timeout - Le nombre de secondes avant d'arrêter l'attente
         * @param {number} interval - La valeur de l'intervalle entre chaque vérification en ms
         */
        waitPresent: function(check, cb, timeout = 2, interval = 50) {
            let loopMax = (timeout * 1000) / interval;
            let timer = setInterval(() => {
                if (--loopMax <= 0) {
                    if (debug) console.warn('waitPresent timeout');
                    clearInterval(timer);
                    return cb('error');
                }
                if (!check()) return;
                clearInterval(timer);
                return cb();
            }, interval);
        },
        /**
         * Patiente le temps du chargement du DOM, en attente d'une noeud identifié par le selector
         * @param {string} selector - Le selecteur jQuery
         * @param {Function} cb - La fonction de callback
         * @param {number} timeout - Le nombre de secondes avant d'arrêter l'attente
         * @param {number} interval - La valeur de l'intervalle entre chaque vérification en ms
         */
        waitDomPresent: function(selector, cb, timeout = 2, interval = 50) {
            const check = function() {
                return $(selector).length > 0;
            }
            system.waitPresent(check, (err) => {
                if (err) {
                    console.warn('Timeout waitDomPresent: %s', selector);
                    return;
                }
                cb();
            }, timeout, interval);
        },
        /**
         * Verifie si l'élément est tronqué, généralement, du texte
         * @params {Object} Objet DOMElement
         * @return {boolean}
         */
        isTruncated: function(el) {
            return el.scrollWidth > el.clientWidth;
        },
        /**
         * Verifie si l'utilisateur est connecté
         * @return {boolean}
         */
        userIdentified: function() {
            return typeof betaseries_api_user_token !== 'undefined' && typeof betaseries_user_id !== 'undefined';
        },
        /**
         * Identifie, stocke et retourne le theme CSS utilisé (light or dark)
         * stocké dans window.theme
         * @returns {void}
         */
        checkThemeStyle: function() {
            if (window.theme !== undefined) {
                return window.theme;
            }
            window.theme = 'light';
            const stylesheets = $('link[rel="stylesheet"]');
            for (let s = 0; s < stylesheets.length; s++) {
                if (/dark.css/.test(stylesheets[s].href)) {
                    window.theme = 'dark';
                }
            }
            return window.theme;
        },
        /**
         * Cette fonction vérifie la dernière version de l'API
         */
        checkApiVersion: function() {
            fetch(location.origin + '/api/versions').then((resp) => {
                if (!resp.ok) {
                    return '';
                }
                return resp.text();
            }).then(html => {
                if (html && html.length > 0) {
                    // Convert the HTML string into a document object
                    let parser = new DOMParser(), doc = parser.parseFromString(html, 'text/html');
                    // $('.maincontent > ul > li > strong').last().text().trim().split(' ')[1]
                    const latest = doc.querySelector('.maincontent > ul > li:last-child > strong').textContent.split(' ')[1].trim(), lastF = parseFloat(latest);
                    if (!Number.isNaN(lastF) && lastF > parseFloat(Media.api.versions.last)) {
                        window.alert("L'API possède une nouvelle version: " + latest);
                    }
                }
            });
        },
        /**
         * Permet d'afficher les messages d'erreur liés au script
         *
         * @param {String} title Le titre du message
         * @param {String} text  Le texte du message
         * @return {void}
         */
        notification: function(title, text) {
            // GM_notification(details, ondone), GM_notification(text, title, image, onclick)
            let notifContainer = $('.userscript-notifications');
            // On ajoute notre zone de notifications
            if ($('.userscript-notifications').length <= 0) {
                $('#fb-root').after('<div class="userscript-notifications"><h3><span class="title"></span><i class="fa fa-times" aria-hidden="true"></i></h3><p class="text"></p></div>');
                notifContainer = $('.userscript-notifications');
                $('.userscript-notifications .fa-times').on('click', () => {
                    $('.userscript-notifications').slideUp();
                });
            }
            notifContainer.hide();
            $('.userscript-notifications .title').html(title);
            $('.userscript-notifications .text').html(text);
            notifContainer.slideDown().delay(5000).slideUp();
            console.warn(text);
            console.trace('Notification');
        },
        /**
         * addScriptAndLink - Permet d'ajouter un script ou un link sur la page Web
         *
         * @param  {String|String[]} name Le ou les identifiants des éléments à charger
         * @return {void}
         */
        addScriptAndLink: function(name, onloadFunction = noop/* , index */) {
            if (name instanceof Array) {
                // if (Base.debug) console.log('addScriptAndLink array.length = %d', name.length);
                if (name.length > 1) {
                    const elt = name.shift();
                    system.addScriptAndLink(elt, () => system.addScriptAndLink(name, onloadFunction) );
                    return;
                } else if (name.length === 1) {
                    name = name.shift();
                } else {
                    return;
                }
            }
            // index = index || ++indexCallLoad;
            // if (Base.debug) console.log('[%d] addScriptAndLink: %s', index, name);
            // On vérifie que le nom est connu
            if (!scriptsAndStyles || !(name in scriptsAndStyles)) {
                throw new Error(`${name} ne fait pas partit des données de scripts ou de styles`);
            }
            const data = scriptsAndStyles[name];
            // On vérifie si il est déjà chargé
            if (data.called && data.loaded) {
                // if (Base.debug) console.log('[%d] %s(%s) déjà appelé et chargé, on renvoie direct', index, data.type, name);
                return onloadFunction();
            } else if (data.called && !data.loaded) {
                system.waitPresent(() => { return scriptsAndStyles[name].loaded; }, onloadFunction, 10, 10);
                return;
            }
            scriptsAndStyles[name].called = true;
            if (data.type === 'script') {
                const loadErrorScript = function(oError) {
                    if (Base.debug) console.log('loadErrorScript error', oError);
                    console.error("The script " + oError.target.src + " didn't load correctly.");
                }
                let origOnLoadFunction = onloadFunction;
                onloadFunction = function() {
                    // if (Base.debug) console.log('[%d] script(%s) chargé, on renvoie le callback', index, name);
                    scriptsAndStyles[name].loaded = true;
                    origOnLoadFunction();
                };
                loadJS(data.src, {
                    integrity: data.integrity,
                    id: data.id,
                    crossOrigin: 'anonymous',
                    referrerPolicy: 'no-referrer'
                }, onloadFunction, loadErrorScript);
            }
            else if (data.type === 'style') {
                const loadErrorStyle = function(oError) {
                    if (Base.debug) console.log('loadErrorStyle error', oError);
                    console.error("The style " + oError.target.href + " didn't load correctly.");
                }
                let origOnLoadFunction = onloadFunction;
                onloadFunction = function() {
                    // if (Base.debug) console.log('[%d] style(%s) chargé, on renvoie le callback', index, name);
                    scriptsAndStyles[name].loaded = true;
                    origOnLoadFunction();
                };
                loadCSS( data.href, null, data.media, {
                    integrity: data.integrity,
                    id: data.id,
                    crossOrigin: 'anonymous',
                    referrerPolicy: 'no-referrer'
                }, onloadFunction, loadErrorStyle );
            }
        },
        /**
         * Masque les pubs
         */
        removeAds: function() {
            setTimeout(function () {
                $('script[src*="securepubads"]').remove();
                $('script[src*="static-od.com"]').remove();
                $('script[src*="ad.doubleclick.net"]').remove();
                $('script[src*="sddan.com"]').remove();
                $('.postit').hide();
            }, 500);
            $('.parent-ad-desktop').attr('style', 'display: none !important');
            setInterval(function () {
                let $frame;
                $('iframe[name!="userscript"]').each((i, elt) => {
                    $frame = $(elt);
                    if (!$frame.hasClass('embed-responsive-item')) {
                        $frame.remove();
                    }
                });
            }, 1000);
            $('.blockPartner').attr('style', 'display: none !important');
            //$('.breadcrumb').hide();
        },
        /**
         * Retourne une boîte de dialogue
         * @returns {Dialog}
         */
        getDialog: function() {
            const options = {
                counter: Base.counter.toString.bind(Base.counter)
            };
            const dialog = new Dialog(options);
            return dialog._init();
        },
        /**
         * Fonction d'ajout d'un paginateur en haut de liste des séries
         * @return {void}
         */
        waitPagination: function() {
            let loaded = false,
                isShows = false,
                selectors = {result: '#results', pagination: '#pagination'};
            if (/^\/series\//.test(url)) {
                selectors.result += '-shows';
                selectors.pagination += '-shows';
                isShows = true;
            } else if (/^\/films\//.test(url)) {
                selectors.pagination += '-movies';
            }
            system.waitDomPresent('#annuaire-list', () => {
                if (isShows) {
                    series.displayNotes();
                }
            }, 10);
            // On attend la présence du paginateur
            system.waitDomPresent(selectors.pagination, () => {
                // On copie colle le paginateur en haut de la liste des séries
                // $('#results-shows').prepend($('#pagination-shows').clone(true, true));
                // On observe les modifications dans le noeud du paginateur
                $(selectors.result).on('DOMSubtreeModified', selectors.pagination, function () {
                    if (!loaded) {
                        system.waitPagination();
                        loaded = true;
                        document.getElementsByClassName('maintitle')[0].scrollIntoView();
                    }
                });
            }, 10);
        },
    }
    const medias = {
        /**
         * Cette fonction permet de retourner la ressource principale sous forme d'objet
         * @param  {boolean} [nocache=false] Flag indiquant si il faut utiliser les données en cache
         * @param  {number}  [id=null]       Identifiant de la ressource
         * @return {Promise<Base>}
         */
        getResource: function(nocache = false, id = null) {
            // Indique de quel type de ressource il s'agit
            const type = medias.getApiResource(location.pathname.split('/')[1]);
            id = id || medias.getResourceId();
            if (Base.debug) console.log('getResource{id: %d, nocache: %s, type: %s}', id, ((nocache) ? 'true' : 'false'), type.singular);
            return type.class.fetch(id).then(resource => {
                return resource.init();
            }).catch(err => {
                system.notification('fetch Resource', 'Erreur de récupération de la resource de type ' + type.singular + ', Erreur: ' + err);
            });
        },
        /**
         * Cette fonction permet de récupérer les données API de la ressource principale
         * @param  {boolean} [nocache=true]  Flag indiquant si il faut utiliser les données en cache
         * @param  {number}  [id=null]       Identifiant de la ressource
         * @return {Promise<Object>}
         */
        getResourceData: function(nocache = true, id = null) {
            // Indique de quel type de ressource il s'agit
            const type = medias.getApiResource(location.pathname.split('/')[1]),
                  // Indique la fonction à appeler en fonction de la ressource
                  fonction = type.singular == 'show' || type.singular == 'episode' ? 'display' : 'movie';
            id = (id === null) ? medias.getResourceId() : id;
            if (Base.debug) console.log('getResourceData{id: %d, nocache: %s, type: %s}', id, ((nocache) ? 'true' : 'false'), type.singular);
            return Base.callApi('GET', type.plural, fonction, { 'id': id }, nocache);
        },
        /**
         * Retourne la ressource associée au type de page
         *
         * @param  {String} pageType    Le type de page consultée
         * @return {Object} Retourne le nom de la ressource API au singulier et au pluriel
         */
        getApiResource: function(pageType) {
            let methods = {
                'serie': { singular: 'show', plural: 'shows', "class": Show },
                'film': { singular: 'movie', plural: 'movies', "class": Movie },
                'episode': { singular: 'episode', plural: 'episodes', "class": Episode }
            };
            if (pageType in methods) {
                return methods[pageType];
            }
            return null;
        },
        /**
         * Retourne l'identifiant de la ressource de la page
         * @return {number} L'identifiant de la ressource
         */
        getResourceId: function() {
            const type = medias.getApiResource(url.split('/')[1]), // Le type de ressource
            eltActions = $(`#reactjs-${type.singular}-actions`); // Le noeud contenant l'ID
            return (eltActions.length === 1) ? parseInt(eltActions.data(`${type.singular}-id`), 10) : 0;
        },
        /**
         * Améliore l'affichage de la description de la ressource
         *
         * @return {void}
         */
        upgradeSynopsis: function() {
            let $btnMore = $('a.js-show-fulltext');
            const $paraSynopsis = $('.blockInformations__synopsis');
            if ($paraSynopsis.length > 1) {
                $paraSynopsis.each((_, elt) => {
                    if ($(elt).text().trim().length <= 0) {
                        $(elt).hide();
                    }
                });
            }
            if ($btnMore.length <= 0) {
                return;
            }
            const $span = $('.blockInformations__synopsis span');
            const $btn = $btnMore.clone(false);
            $btn.removeClass('js-show-fulltext').addClass('js-show-full');
            $btnMore.remove();
            $span.before($btn);
            $btnMore = $('a.js-show-full');

            $paraSynopsis.last()
                .before('<style>a[role="button"].js-show-full:before {content: " …"}</style>')
                .prop('title', 'Afficher la totalité de la description')
                .click((e) => {
                    e.stopPropagation();
                    if ($span.hasClass('sr-only')) {
                        $span.removeClass('sr-only');
                        $btnMore.hide();
                        $paraSynopsis.prop('title', 'Tronquer la description');
                    } else {
                        $span.addClass('sr-only');
                        $btnMore.show();
                        $paraSynopsis.prop('title', 'Afficher la totalité de la description');
                    }
                })
                .css('cursor', 'pointer');
        },
        choiceImage: function(res, cb) {
            Base.showLoader();
            const dialog = system.getDialog();
            // Créer une popup affichant les différents posters
            res.getAllPosters().then(posters => {
                const keys = Object.keys(posters);
                console.log('posters', posters, keys);
                let template = '<div class="posters">';
                for (const title of keys) {
                    template += `<div class="row title">${title.charAt(0).toUpperCase() + title.slice(1)}</div><div class="row">`;
                    for (let p = 0; p < posters[title].length; p++) {
                        if (p > 0 && p % 5 === 0) {
                            template += '</div><div class="row">';
                        }
                        let check = '';
                        if ((res.mediaType.singular === 'show' && res.images.poster === posters[title][p]) ||
                            (res.mediaType.singular === 'movie' && res.poster === posters[title][p]))
                        {
                            check = '<i class="fa fa-check-circle fa-3x" aria-hidden="true"></i>';
                        }
                        let cross = '';
                        if (!regDomain.test(posters[title][p])) {
                            cross = ' crossorigin="anonymous"';
                        }
                        template += `<div class="poster" title="Sélectionnez ce poster">
                                        <img class="js-lazy-image img-thumbnail" data-src="${posters[title][p]}" alt="Affiche" width="150"${cross}>${check}</div>`;
                    }
                    template += '</div>';
                }
                // On ajoute les boutons de navigation
                template += `</div>`;
                dialog
                    .setContent(template)
                    .setTitle('Choix du poster')
                    .addStyle(`
                    .posters .row {
                        margin-top: 30px;
                    }
                    .posters .row.title {
                        margin-top: 20px;
                        margin-bottom: 0;
                        font-weight: bold;
                        font-size: 1.4em;
                        border-bottom: 1px #fff solid;
                        padding-bottom: 2px;
                        padding-left: 5px
                    }
                    .posters .row div.poster {
                        position: relative;
                    }
                    .posters .row .poster {
                        margin-left: 30px;
                    }
                    .posters .row .poster > img {
                        display: block;
                    }
                    .posters .row .poster img.js-lazy-image {
                        cursor: pointer;
                    }
                    .posters .row .poster .fa {
                        position: absolute;
                        top: 5px;
                        left: 5px;
                        color: var(--green);
                    }
                    `)

                    .show(() => {
                        Base.hideLoader();
                        $('.posters img').on('click', (e) => {
                            e.stopPropagation();
                            cb(e.target.src);
                            dialog.close();
                        });
                    });
                // console.log('Dialog', dialog);
            });
        },
        /**
         * Vérifie la présence de l'affiche du média
         * @param  {Media} res - L'objet Media principal
         * @return {void}
         */
        checkPoster: function(res) {
            const $poster = $('.blockInformations__poster img');
            if ($poster.length <= 0) {
                if (debug) console.log('checkPoster poster not found');
                res.getDefaultImage('poster').then(img => {
                    /*
                    <img class="displayBlock objectFitCover" src="" width="300" height="450" alt="">
                     */
                    let cross = '';
                    if (!regDomain.test(img)) {
                        cross = 'crossorigin="Anonymous"';
                    }
                    res.elt.find('div.block404').replaceWith(`
                        <img class="displayBlock objectFitCover"
                                width="300"
                                height="450"
                                ${cross}
                                alt="Affiche de la série ${res.title}"
                                src="${img}" />`
                    );
                });
            } else if (res.mediaType.singular === 'show' && res.images.poster && res.images.poster !== $poster.attr('src')) {
                $poster.attr('src', res.images.poster);
            } else if (res.mediaType.singular === 'movie' && res.poster && res.poster !== $poster.attr('src')) {
                $poster.attr('src', res.poster);
            }
            $('.blockInformations__poster').append('<i class="fa fa-camera fa-2x selectPoster" aria-hidden="true" style="position:absolute;top:5px;right:5px;padding:5px;cursor:pointer;z-index:5;"></i>');
            $('.blockInformations__poster .selectPoster').on('click', (e) => {
                e.stopPropagation();
                medias.choiceImage(res, (src) => {
                    res.override('poster', src);
                    $('.blockInformations__poster img').attr('src', src);
                });
            });
        },
        /**
         * Patiente le temps du chargment des saisons et des épisodes
         * @param  {Function} cb Fonction de callback en cas de success
         * @param  {Function} cb Fonction de callback en cas d'error
         * @return {void}
         */
        waitSeasonsAndEpisodesLoaded: function(successCb, errorCb = Base.noop) {
            let waitEpisodes = 0;
            // On ajoute un timer interval en attendant que les saisons et les épisodes soient chargés
            timer = setInterval(function () {
                // On évite une boucle infinie
                if (++waitEpisodes >= 100) {
                    clearInterval(timer);
                    system.notification('Wait Episodes List', 'Les vignettes des saisons et des épisodes n\'ont pas été trouvées.');
                    errorCb('timeout');
                    return;
                }
                let len = parseInt($('#seasons .slide--current .slide__infos').text(), 10), $episodes = $('#episodes .slide_flex');
                // On vérifie que les saisons et les episodes soient chargés sur la page
                if ($episodes.length <= 0 || $episodes.length < len) {
                    if (Base.debug) console.log('waitSeasonsAndEpisodesLoaded: En attente du chargement des vignettes');
                    return;
                }
                if (Base.debug) console.log('waitSeasonsAndEpisodesLoaded, nbVignettes (%d, %d)', $episodes.length, len);
                clearInterval(timer);
                successCb();
            }, 500);
        },
        /**
         * Gère la mise à jour auto des épisodes de la saison courante
         * @param  {Show} show - L'objet de type Show
         * @return {void}
         */
        updateAutoEpisodeList: function(show) {
            UpdateAuto.getInstance(show).then(objUpAuto => {
                /**
                 * Retourne une valeur d'intervalle en fonction de la durée des épisodes de la série
                 * @param {number} duration - La durée des épisodes de la série
                 * @returns {number} La valeur d'une intervalle
                 */
                const getIntervalProp = function(duration) {
                    if (duration <= 25) return 10;
                    else if (duration <= 45) return 15;
                    else if (duration <= 60) return 30;
                    else return 45;
                }
                /**
                 * Fonction retournant le contenu de la Popup des options update
                 * de la liste des épisodes
                 * @param {UpdateAuto} objUpAuto -
                 * @return {String} Contenu HTML de la PopUp des options update
                 */
                const contentUp = function (objUpAuto) {
                    const intervals = UpdateAuto.intervals;
                    const propNumber = getIntervalProp(objUpAuto.show.length);
                    const propText = objUpAuto.show.in_account && objUpAuto.interval <= 0 ? `
                    <div class="form-group"><p class="alert alert-info">Pour cette série, nous vous conseillons une intervalle de <span id="propNumber" data-value="${propNumber}">${propNumber.toString()}</span> minutes.</p></div>` : '';
                    const timerText = objUpAuto.status ? `<div class="form-group"><p class="alert alert-success">Prochain update: <span id="timer_remaining">${objUpAuto.remaining()}</span></p></div>` : '';
                    let contentUpdate = `
                            <form id="optionsUpdateEpisodeList">
                            <div class="form-group form-check">
                                <input type="checkbox"
                                    class="form-check-input"
                                    id="updateEpisodeListAuto"
                                    ${objUpAuto.auto ? ' checked="true"' : ''}
                                    ${!objUpAuto.show.in_account ? ' disabled="true"' : ''}>
                                <label class="form-check-label"
                                    for="updateEpisodeListAuto">Activer la mise à jour auto des épisodes</label>
                            </div>
                            <div class="form-group">
                                <label for="updateEpisodeListTime">Fréquence de mise à jour</label>
                                <select class="form-control"
                                        id="updateEpisodeListTime"
                                        ${!objUpAuto.show.in_account ? ' disabled="true"' : ''}>`;
                    for (let i = 0; i < intervals.length; i++) {
                        contentUpdate += `<option value="${intervals[i].val}"
                            ${objUpAuto.interval === intervals[i].val ? 'selected="true"' : ''}>
                            ${intervals[i].label}</option>`;
                    }
                    contentUpdate += `</select></div>
                            ${!objUpAuto.show.in_account ? '<div class="form-group"><p class="alert alert-warning">Veuillez ajouter la série avant de pouvoir activer cette fonctionnalité.</p></div>' : ''}
                            ${propText}
                            ${timerText}
                            <button type="submit" class="btn btn-primary"${!objUpAuto.show.in_account ? ' disabled="true"' : ''}>Sauver</button>
                            <button type="button" class="close btn btn-danger">Annuler</button>
                            <button type="button" class="btn btn-info relaunch" style="${!objUpAuto.status ? 'display:none;' : ''}">Relancer</button>
                        </form>`;
                    return contentUpdate;
                };
                /**
                 * Fonction retournant le titre de la Popup des options pour l'update
                 * de la liste des épisodes de la saison courante
                 * @param  {UpdateAuto} objUpAuto
                 * @return {String} Contenu HTML du titre de la PopUp des options update
                 */
                const titlePopup = function (objUpAuto) {
                    const className = (objUpAuto && objUpAuto.status) ? 'success' : 'secondary',
                        label = (objUpAuto && objUpAuto.status) ? 'running' : 'not running',
                        title = (objUpAuto && objUpAuto.status) ? 'Arrêter la tâche en cours' : 'Lancer la tâche de mise à jour auto',
                        help = "Cette fonctionnalité permet de mettre à jour les épisodes de la saison courante, à une fréquence choisie.";
                    return `<style>
                                .optionsUpAuto .close {
                                    position: absolute;
                                    right: 5px;
                                    border: none;
                                    background: transparent;
                                    font-size: 1.5em;
                                    top: 0;
                                    color: var(--default_color);
                                }
                                .optionsUpAuto .badge {cursor: pointer;}
                                .optionsUpAuto .close:hover {border: none;outline: none;}
                                .optionsUpAuto .close:focus {border: none;outline: none;}
                            </style>
                            <div class="optionsUpAuto">Options de mise à jour
                            <span class="badge badge-pill badge-${className}" title="${title}">${label}</span>
                            <button type="button" class="close" aria-label="Close" title="Fermer">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <i class="fa fa-question-circle" style="color:blue;margin-left:5px;" aria-hidden="true" title="${help}"></i>
                            </div>`;
                };
                // On relance l'update auto des épisodes au chargement de la page
                if (show.in_account && show.user.remaining > 0 && objUpAuto.status) {
                    objUpAuto.launch();
                }
                else if (objUpAuto.status) {
                    objUpAuto.stop();
                }
                system.addScriptAndLink(['popover', 'bootstrap'], function() {
                    if (Base.debug) console.log('Loaded popover updateEpisodes');
                    $('#updateEpisodeList .updateElement').popover({
                        container: $('#updateEpisodeList'),
                        // delay: { "show": 500, "hide": 100 },
                        html: true,
                        content: ' ',
                        placement: 'right',
                        template: templatePopover,
                        title: ' ',
                        trigger: 'manual',
                        boundary: 'window'
                    });
                    let timeoutHover = null,
                        timerRemaining = null;
                    $('#updateEpisodeList .updateElement')
                        .on('mouseenter', (e) => {
                            e.stopPropagation();
                            timeoutHover = setTimeout(function () {
                                $('#updateEpisodeList .updateElement').popover('show');
                            }, 500);
                        })
                        .on('mouseleave', (e) => {
                            e.stopPropagation();
                            clearTimeout(timeoutHover);
                        });
                    // On ferme et désactive les autres popups lorsque celle des options est ouverte
                    $('#updateEpisodeList .updateElement').on('show.bs.popover', function () {
                        const $updateElement = $('#episodes .slide__image');
                        $updateElement.popover('hide');
                        $updateElement.popover('disable');
                        timerRemaining = setInterval(() => {
                            $('#timer_remaining').text(objUpAuto.remaining());
                        }, 1000);
                    });
                    // On réactive les autres popus lorsque celle des options se ferme
                    // Et on supprime les listeners de la popup
                    $('#updateEpisodeList .updateElement').on('hide.bs.popover', function () {
                        $('#episodes .slide__image').popover('enable');
                        $('.optionsUpAuto .badge').off('click');
                        $('#updateEpisodeList button.close').off('click');
                        $('#optionsUpdateEpisodeList button.btn-primary').off('click');
                        $('#updateEpisodeListAuto').off('change');
                        clearInterval(timerRemaining);
                    });
                    $('#updateEpisodeList .updateElement').on('inserted.bs.popover', function () {
                        $('#updateEpisodeList .popover-header').html(titlePopup(objUpAuto));
                        $('#updateEpisodeList .popover-body').html(contentUp(objUpAuto));
                        $('.optionsUpAuto .badge').on('click', e => {
                            e.stopPropagation();
                            e.preventDefault();
                            const $badge = $(e.currentTarget);
                            if ($badge.hasClass('badge-success')) {
                                // On arrête la tâche d'update auto
                                objUpAuto.stop();
                                $badge
                                    .removeClass('badge-success')
                                    .addClass('badge-secondary')
                                    .text('not running')
                                    .attr('title', 'Activer la tâche de mise à jour auto');
                            } else {
                                if (!objUpAuto.show.in_account) {
                                    if (Base.debug) console.log('La série n\'est pas sur le compte du membre');
                                    return;
                                } else if (objUpAuto.interval <= 0) {
                                    if (Base.debug) console.log('Le paramètre interval est <= 0');
                                    $('.popover button[type="submit"]').before('<div class="form-group"><p class="alert alert-warning">Veuillez renseigner les paramètres de mise à jour.</p></div>');
                                    return;
                                } else if (objUpAuto.interval > 0) {
                                    $('.optionsUpAuto .alert').parent().remove();
                                }
                                objUpAuto.auto = true;
                                const $checkAuto = $('#updateEpisodeListAuto');
                                if (!$checkAuto.is(':checked')) {
                                    $checkAuto.attr('checked', 'true');
                                }
                                objUpAuto.launch();
                                $badge
                                    .removeClass('badge-secondary')
                                    .addClass('badge-success')
                                    .text('running')
                                    .attr('title', 'Arrêter la tâche en cours');
                            }
                        });
                        $('#updateEpisodeList button.close').on('click', (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            $('#updateEpisodeList .updateElement').popover('hide');
                        });
                        $('#updateEpisodeList button.relaunch').on('click', (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            objUpAuto.stop().launch();
                        });
                        $('#optionsUpdateEpisodeList button.btn-primary').on('click', (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            let checkAuto = $('#updateEpisodeListAuto').is(':checked'),
                                intervalAuto = parseInt($('#updateEpisodeListTime').val(), 10),
                                changed = false;
                            if (objUpAuto.auto !== checkAuto) { objUpAuto._auto = checkAuto; changed = true; }
                            if (objUpAuto.interval != intervalAuto) { objUpAuto._interval = intervalAuto; changed = true; }
                            if (changed) objUpAuto._save();
                            if (Base.debug) console.log('updateEpisodeList submit', objUpAuto);
                            objUpAuto.launch();
                            $('#updateEpisodeList .updateElement').popover('hide');
                        });
                        if ($('#propNumber').length > 0) {
                            $('#updateEpisodeListAuto').on('change', (e) => {
                                e.stopPropagation();
                                const $auto = $(e.currentTarget);
                                $('#updateEpisodeListTime').children().each((_, elt) => {
                                    elt.selected = false;
                                });
                                if ($auto.is(':checked')) {
                                    $('#updateEpisodeListTime').find(`option[value="${$('#propNumber').data('value')}"]`).get(0).selected = true;
                                } else {
                                    $('#updateEpisodeListTime').find(`option[value="0"]`).get(0).selected = true;
                                }
                            });
                        }
                    });
                });
            });
        },
        /**
         * Ajoute un bouton Vu sur la vignette d'un épisode
         * @param {Show} res L'objet Show de l'API
         */
        upgradeEpisodes: function(res) {
            // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
            if (!system.userIdentified() || betaseries_api_user_key === '') return;
            if (!(res instanceof Show)) {
                console.error("Le paramètre res n'est pas du type Show", res);
                return;
            }
            const seasons = $('#seasons .slide_flex .slide__image');
            let vignettes = getVignettes();
            if (Base.debug) console.log('Nb seasons: %d, nb vignettes: %d', seasons.length, vignettes.length);
            /**
            * Ajoute une écoute sur l'objet Show, sur l'évenement UPDATE, ARCHIVE et UNARCHIVE
            * pour mettre à jour l'update auto des épisodes
            * @param {Event} event -    L'évènement déclencheur
            * @param {Show} show -      La série associée à l'évènement
            */
            const updateAuto = function(event, show) {
                if (Base.debug) console.log('Listener called');
                UpdateAuto.getInstance(show).then(objUpAuto => {
                    // Si il n'y a plus d'épisodes à regarder sur la série
                    if (event.detail.name === EventTypes.UPDATE && show.user.remaining <= 0) {
                        // Si la série est terminée
                        if (show.isEnded()) {
                            // On supprime la série des options d'update
                            objUpAuto.delete();
                        }
                        else {
                            // On désactive la mise à jour auto
                            objUpAuto.stop();
                        }
                    } else if (event.detail.name === EventTypes.ARCHIVE) {
                        objUpAuto.delete();
                    } else if (event.detail.name === EventTypes.UNARCHIVE) {
                        objUpAuto.launch();
                    }
                    res.getDefaultImage('wide').then(defImgShow => {
                        let onerror = null;
                        if (defImgShow != null) {
                            onerror = (err, elt, url, attr) => {
                                elt.classList.add("js-lazy-image-handled");
                                elt[attr] = defImgShow;
                                elt.classList.add("fade-in");
                            };
                        }
                        $('.blockInformations .blockNextEpisode .js-lazy-image').lazyload(Object.assign({onerror}, optionsLazyload));
                    });
                });
            };
            res.addListener(EventTypes.UPDATE, updateAuto);
            res.addListener(EventTypes.ARCHIVE, updateAuto);
            res.addListener(EventTypes.UNARCHIVE, updateAuto);
            // On ajoute les cases à cocher sur les vignettes courantes
            addCheckSeen();
            // Ajoute les cases à cocher sur les vignettes des épisodes
            function addCheckSeen() {
                vignettes = getVignettes();
                const seasonNum = parseInt($('#seasons .slide--current').attr('href').split('/').pop(), 10);
                if (Base.debug) console.log('season number: ', seasonNum);
                if (res.currentSeason === undefined || res.currentSeason.number !== seasonNum) {
                    res.setCurrentSeason(seasonNum);
                }
                if (Base.debug) console.log('currentSeason: ', res.currentSeason);
                // Contient la promesse de récupérer les épisodes de la saison courante
                res.currentSeason.fetchEpisodes()
                // On ajoute la description des épisodes dans des Popup
                .then(() => {
                    // On ajoute le CSS et le Javascript pour les popup
                    system.addScriptAndLink(['popover', 'bootstrap'], function () {
                        if (Base.debug) console.log('Add synopsis episode');
                        /**
                         * Retourne la position de la popup par rapport à l'image du similar
                         * @param  {Object} _tip -  Unknown
                         * @param  {Object} elt -   Le DOM Element du lien du similar
                         * @return {String}         La position de la popup
                         */
                        let funcPlacement = (_tip, elt) => {
                            //if (Base.debug) console.log('funcPlacement', tip, $(tip).width());
                            let rect = elt.getBoundingClientRect(), width = $(window).width(), sizePopover = 320;
                            return ((rect.left + rect.width + sizePopover) > width) ? 'left' : 'right';
                        };
                        /** @type {JQuery<HTMLElement>} */
                        let $vignette,
                        /** @type {Episode} */
                            objEpisode,
                        /** @type {string} */
                            description;
                        for (let v = 0; v < vignettes.length; v++) {
                            $vignette = $(vignettes.get(v));
                            objEpisode = res.currentSeason.episodes[v];
                            objEpisode.elt = $vignette.parents('.slide_flex');
                            objEpisode.save();
                            description = objEpisode.description;
                            if (description.length > 350) {
                                description = description.substring(0, 350) + '…';
                            }
                            else if (description.length <= 0) {
                                description = 'Aucune description';
                            }
                            // Ajout de l'attribut title pour obtenir le nom complet de l'épisode, lorsqu'il est tronqué
                            objEpisode.addAttrTitle();
                            objEpisode.initCheckSeen(v);
                            // Ajoute la synopsis de l'épisode au survol de la vignette
                            $vignette.popover({
                                container: $vignette,
                                delay: { "show": 500, "hide": 100 },
                                html: true,
                                content: `<p>${description}</p>`,
                                placement: funcPlacement,
                                template: templatePopover,
                                title: `<div><span style="color: var(--link_color);">Episode ${objEpisode.code}</span><div class="stars-outer note"><div class="stars-inner" style="width:${objEpisode.objNote.getPercentage()}%;" title="${objEpisode.objNote.toString()}"></div></div></div>`,
                                trigger: 'hover',
                                boundary: 'window'
                            });
                        }
                        // On ajoute un event click sur la case 'checkSeen'
                        $('#episodes .checkSeen').on('click', async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (res.currentSeason.episodes.length <= 0) {
                                await res.currentSeason.fetchEpisodes();
                            }
                            /** @type {JQuery<HTMLElement>} */
                            const $elt = $(e.currentTarget),
                                episodeId = parseInt($elt.data('id'), 10),
                                episode = res.currentSeason.getEpisode(episodeId);
                            if (Base.debug) console.log('click checkSeen', episode, res);
                            // On vérifie si l'épisode a déjà été vu
                            if ($elt.hasClass('seen')) {
                                // On demande à l'enlever des épisodes vus
                                episode.updateStatus('notSeen', HTTP_VERBS.DELETE);
                            }
                            // Sinon, on l'ajoute aux épisodes vus
                            else {
                                episode.updateStatus('seen', HTTP_VERBS.POST);
                            }
                        });
                        // On ajoute un effet au survol de la case 'checkSeen'
                        $('#episodes .checkSeen')
                            .on("mouseenter", (e) => {
                                $(e.currentTarget)
                                    .siblings('.overflowHidden')
                                    .find('img.js-lazy-image')
                                    .css('transform', 'scale(1.2)');
                                $(e.currentTarget)
                                    .parent('.slide__image')
                                    .popover('hide');
                            })
                            .on("mouseleave", (e) => {
                                $(e.currentTarget)
                                    .siblings('.overflowHidden')
                                    .find('img.js-lazy-image')
                                    .css('transform', 'scale(1.0)');
                                $(e.currentTarget)
                                    .parent('.slide__image')
                                    .popover('show');
                            });
                        res.getDefaultImage('wide').then(defImgShow => {
                            let onerror = null;
                            if (defImgShow != null) {
                                onerror = (err, elt, url, attr) => {
                                    elt.classList.add("js-lazy-image-handled");
                                    elt[attr] = defImgShow;
                                    elt.classList.add("fade-in");
                                    // console.log('lazyload onerror show', elt, res.images.show, attr);
                                };
                            }
                            $('#episodes .js-lazy-image').lazyload(Object.assign({onerror}, optionsLazyload));
                        }).catch(() => {});
                    });
                });
                // Ajouter un bouton de mise à jour des épisodes de la saison courante
                if ($('#updateEpisodeList').length < 1) {
                    $('#episodes .blockTitles').prepend(`
                        <style>#updateEpisodeList .popover {left: 65px; top: 40px;}</style>
                        <div id="updateEpisodeList" class="updateElements">
                        <i class="fa fa-refresh fa-2x updateEpisodes updateElement finish"
                            title="Mise à jour des épisodes de la saison"
                            style="margin-right:10px;"
                            aria-hidden="true"></i>
                        </div>`);
                    // On ajoute l'update auto des épisodes de la saison courante
                    medias.updateAutoEpisodeList(res);
                    // On ajoute la gestion de l'event click sur le bouton
                    $('#episodes .updateEpisodes').on('click', (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (Base.debug) console.groupCollapsed('updateEpisodes');
                        // On ferme la popup des options d'update auto
                        $('#updateEpisodeList .updateElement').popover('hide');
                        const self = $(e.currentTarget);
                        self.removeClass('finish');
                        res.currentSeason.fetchEpisodes().then(() => {
                            // if (Base.debug) console.log('after fetchEpisodes', Object.assign({}, objShow));
                            vignettes = getVignettes();
                            // len = getNbVignettes();
                            /** @type {JQuery<HTMLElement>} */
                            let $vignette,
                            /** @type {Episode} */
                                objEpisode,
                                changed = false;
                            for (let v = 0; v < vignettes.length; v++) {
                                $vignette = $(vignettes.get(v)); // DOMElement jQuery de l'image de l'épisode
                                objEpisode = res.currentSeason.episodes[v];
                                objEpisode.elt = $vignette.parents('.slide_flex'); // Données de l'épisode
                                //if (Base.debug) console.log('Episode ID', getEpisodeId($vignette), episode.id);
                                if (!changed && objEpisode.updateCheckSeen(v)) {
                                    changed = true;
                                }
                            }
                            // On met à jour les éléments, seulement si il y a eu des modifications
                            if (changed) {
                                if (Base.debug) console.log('updateEpisodes changed true', res);
                                res.currentSeason.updateRender();
                                res.update(true).then(() => {
                                    self.addClass('finish');
                                    fnLazy(); // On affiche les images lazyload
                                    if (Base.debug) console.groupEnd(); // On clos le groupe de console
                                }, err => {
                                    system.notification('Erreur de récupération de la ressource Show', 'Show update: ' + err);
                                    self.addClass('finish');
                                    console.warn('Show update error', err);
                                    if (Base.debug) console.groupEnd(); // On clos le groupe de console
                                });
                            }
                            else {
                                if (Base.debug) console.log('updateEpisodes no changes');
                                self.addClass('finish'); // On arrete l'animation de mise à jour
                                if (Base.debug) console.groupEnd(); // On clos le groupe de console
                            }
                        }, (err) => {
                            system.notification('Erreur de mise à jour des épisodes', 'updateEpisodeList: ' + err);
                            self.addClass('finish');
                            if (Base.debug) console.groupEnd();
                        });
                    });
                }
            }
            // On ajoute un event sur le changement de saison
            seasons.on('click', () => {
                if (Base.debug) console.groupCollapsed('season click');
                $('#episodes .checkSeen').off('click');
                $('#episodes .slide__image').off('inserted.bs.popover');
                $('#episodes .slide__image').popover('dispose');
                // On attend que les vignettes de la saison choisie soient chargées
                medias.waitSeasonsAndEpisodesLoaded(() => {
                    addCheckSeen();
                    if (Base.debug) console.groupEnd();
                }, () => {
                    console.error('Season click Timeout');
                    if (Base.debug) console.groupEnd();
                });
            });
            // On active les menus dropdown
            $('.blockInformations .dropdown-toggle').dropdown();
            // On récupère les vignettes des épisodes
            /**
             * Retourne les éléments HTML associés aux épisodes de la série
             * @returns {JQuery<HTMLElement>}
             */
            function getVignettes() {
                return $('#episodes .slide__image');
            }
        },
        /**
         * Modifie le comportement des actions sur les vignettes des saisons
         * @param {Show} res - L'objet Show
         */
        upgradeSeasonsActions: function(res) {
            $('#seasons .slide_flex .dropdown-menu button').off('click').on('click', e => {
                e.stopPropagation();
                e.preventDefault();
                const $btn = $(e.currentTarget);
                let typeBtn = 'watched';
                if ($btn.hasClass('btn--grey')) {
                    typeBtn = 'hide';
                }
                if (debug) console.log('upgradeSeasonsActions typeBtn: %s', typeBtn);
                const seasonNum = parseInt($btn.parents('.dropdown-menu').siblings('.slide__title').text().match(/\d+/).shift(), 10);
                res.seasons[seasonNum-1].fetchEpisodes().then(season => {
                    season[typeBtn]();
                });
            });
            $('#seasons .slide_flex .slide__image').prepend('<div class="fa fa-camera fa-2x selectPoster" aria-hidden="true" style="position:absolute;top:5px;left:5px;padding:5px;cursor:pointer;z-index:5;" title="Choisir une affiche"></div>');
            $('#seasons .slide_flex .slide__image .selectPoster').on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const $target = $(e.target);
                const $poster = $target.siblings('img');
                const indexSeason = parseInt($target.parents('.slide_flex').attr('href').split('/').pop(), 10) - 1;
                // console.log('seasons choiceImg', {indexSeason});
                medias.choiceImage(res, (src) => {
                    res.override('season', src, {season: indexSeason});
                    $poster.attr('src', src);
                });
            });
        },
        /**
         * Modifie le fonctionnement d'ajout d'un similar
         *
         * @param  {Object}   $elt          L'élément DOMElement jQuery
         * @param  {Number[]} [objSimilars] Un tableau des identifiants des similars actuels
         * @return {void}
         */
        replaceSuggestSimilarHandler: function($elt, objSimilars = []) {
            if (typeof $elt === 'string') $elt = $($elt);
            if ($elt.hasClass('usbs')) return;
            // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
            if (!system.userIdentified() || betaseries_api_user_key === '' || !/(serie|film)/.test(url)) return;
            if (Base.debug) console.log('replaceSuggestSimilarHandler');
            const type = medias.getApiResource(url.split('/')[1]), // Le type de ressource
            resId = medias.getResourceId(); // Identifiant de la ressource
            // Gestion d'ajout d'un similar
            $elt.removeAttr('onclick').on('click', () => {
                new PopupAlert({
                    showClose: true,
                    type: 'popin-suggestshow',
                    params: {
                        id: resId
                    },
                    callback: function () {
                        $("#similaire_id_search").focus().on("keyup", (e) => {
                            let search = $(e.currentTarget).val().toString();
                            if (search.length > 0 && e.which != 40 && e.which != 38) {
                                Base.callApi('GET', 'search', type.plural, { autres: 'mine', text: search })
                                .then((data) => {
                                    const medias = data[type.plural];
                                    $("#search_results .title").remove();
                                    $("#search_results .item").remove();
                                    let media;
                                    for (let s = 0; s < medias.length; s++) {
                                        media = medias[s];
                                        if (objSimilars.indexOf(media.id) !== -1) {
                                            continue;
                                        } // Similar déjà proposé
                                        $('#search_results').append(`
                                            <div class="item">
                                            <p><span data-id="${media.id}" style="cursor:pointer;">${media.title}</span></p>
                                            </div>`);
                                    }
                                    $('#search_results .item span').on('click', (e) => {
                                        autocompleteSimilar(e.currentTarget);
                                    });
                                }, (err) => {
                                    system.notification('Ajout d\'un similar', 'Erreur requête Search: ' + err);
                                });
                            }
                            else if (e.which != 40 && e.which != 38) {
                                $("#search_results").empty();
                                $("#similaire_id_search").off("keydown");
                            }
                        });
                        $("#similaire_id_search").off('keydown').on('keydown', (e) => {
                            const current_item = $("#search_results .item.hl");
                            switch (e.which) {
                                /* Flèche du bas */
                                case 40:
                                    if (current_item.length === 0) {
                                        $("#search_results .item:first").addClass("hl");
                                    }
                                    else {
                                        let next_item = $("#search_results .item.hl").next("div");
                                        if (next_item.attr("class") === "title") {
                                            next_item = next_item.next("div");
                                        }
                                        current_item.removeClass("hl");
                                        next_item.addClass("hl");
                                    }
                                    break;
                                /* Flèche du haut */
                                case 38:
                                    if (current_item.length !== 0) {
                                        let prev_item = $("#search_results .item.hl").prev("div");
                                        if (prev_item.attr("class") == "title") {
                                            prev_item = prev_item.prev("div");
                                        }
                                        current_item.removeClass("hl");
                                        prev_item.addClass("hl");
                                    }
                                    break;
                                /* Touche Entrée */
                                case 13:
                                    if (Base.debug) console.log('current_item', current_item);
                                    if (current_item.length !== 0) {
                                        autocompleteSimilar(current_item.find("span"));
                                    }
                                    break;
                                /* Touche Echap */
                                case 27:
                                    $("#search_results").empty();
                                    $("input[name=similaire_id_search]").val("").trigger("blur");
                                    break;
                            }
                        });
                    },
                    onClose: function() {
                        $('#popin-dialog .popin-content-html form')
                            .replaceWith(`
                                <div class="popin-content-ajax"><p></p></div>
                                <div class="button-set">
                                    <button class="btn-reset btn-btn btn--grey js-close-popupalert"
                                            type="button"
                                            id="popupalertno">Non</button>
                                    <button class="btn-reset btn-btn btn-blue2 js-close-popupalert"
                                            type="submit"
                                            id="popupalertyes">OK, j'ai compris</button>
                                </div>`
                            );
                    }
                });
                function autocompleteSimilar(el) {
                    let titre = $(el).html(), id = $(el).data("id");
                    titre = titre.replace(/&amp;/g, "&");
                    $("#search_results .item").remove();
                    $("#search_results .title").remove();
                    $("#similaire_id_search").val(titre).trigger("blur");
                    $("input[name=similaire_id]").val(id);
                    $('#popin-dialog .popin-content-html > form > div.button-set > button').focus();
                }
            });
            $elt.addClass('usbs');
        },
        /**
         * Ajoute la section Similars
         */
        addSimilarsSection: function() {
            $('.scrollNavigation').append(`<a href="#similars" class="u-colorWhiteOpacity05 js-anchor-link">Séries similaires</a>`);
            let template = `
                <div id="similars" class="sectionSeparator">
                    <div class="slidesWrapper">
                        <div class="container-padding60">
                            <div class="blockTitles">
                                <h2 class="blockTitle">Séries similaires</h2>
                                <button type="button" class="btn-reset blockTitle-subtitle u-colorWhiteOpacity05 usbs">Suggérer une série</button>
                            </div>
                        </div>
                        <div class="positionRelative">
                            <div class="slides_flex hideScrollbar js-scroll-slider container-padding60 slides--col125 overflowXScroll">
                                <div class="slide_flex">
                                    <div class="slide__image positionRelative u-insideBorderOpacity u-insideBorderOpacity--01">
                                        <button data-ab-form-validation-submit="" type="button" class="btn-reset positionRelative zIndex1 actorEmpty">
                                            <span class="svgContainer" style="height: 188px">
                                                <svg fill="#0D151C" width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M14 8H8v6H6V8H0V6h6V0h2v6h6z" fill-rule="nonzero"></path>
                                                </svg>
                                            </span>
                                        </button>
                                    </div>
                                    <div class="slide__title">Suggérer la première série</div>
                                </div>
                            </div>
                            <button type="button" class="btn-reset slidesNav slidesNav--left js-scroll-slider__left">
                                <span class="sr-only">left</span>
                            </button>
                            <button type="button" class="btn-reset slidesNav js-scroll-slider__right">
                                <span class="sr-only">right</span>
                            </button>
                        </div>
                    </div>
                </div>`
            ;
            $('#photos').after(template);
            medias.replaceSuggestSimilarHandler($('#similars div.slides_flex div.slide_flex div.slide__image > button'));
            const resId = medias.getResourceId();
            const res = Base.cache.get(DataTypesCache.shows, resId);
            if (res) res.removeListener(EventTypes.ADD, medias.addSimilarsSection);
        },
        /**
         * Vérifie si les séries/films similaires ont été vues
         * Nécessite que l'utilisateur soit connecté et que la clé d'API soit renseignée
         * @param {Media} res La ressource de l'API
         */
        similarsViewed: function(res) {
            // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
            if (!system.userIdentified() || betaseries_api_user_key === '' || !/(serie|film)/.test(url)) return;
            if (Base.debug) console.groupCollapsed('similarsViewed');
            if (res instanceof Show && $('#similars').length <= 0) {
                res.addListener(EventTypes.ADD, medias.addSimilarsSection);
            }
            let $similars = $('#similars .slide__title'), // Les titres des ressources similaires
            len = $similars.length; // Le nombre de similaires
            if (Base.debug) console.log('nb similars: %d', len, res.nbSimilars);
            // On sort si il n'y a aucun similars ou si il s'agit de la vignette d'ajout
            if (len <= 0 || (len === 1 && $($similars.parent().get(0)).find('button').length === 1)) {
                $('.updateSimilars').addClass('finish');
                medias.replaceSuggestSimilarHandler($('#similars div.slides_flex div.slide_flex div.slide__image > button'));
                console.groupEnd();
                return;
            }
            /*
            * On ajoute un bouton de mise à jour des similars
            * et on vérifie qu'il n'existe pas déjà
            */
            if ($('#updateSimilarsBlock').length < 1) {
                // On ajoute les ressources CSS et JS nécessaires
                if ($('#csspopover').length <= 0 && $('#jsbootstrap').length <= 0) {
                    system.addScriptAndLink(['popover', 'bootstrap']);
                }
                // On ajoute le bouton de mise à jour des similaires
                $('#similars .blockTitles').append(`
                    <div id="updateSimilarsBlock" class="updateElements" style="margin-left:10px;">
                    <img src="${serverBaseUrl}/img/update.png"
                        class="updateSimilars updateElement"
                        title="Mise à jour des similaires vus"/>
                    </div>`);
                // Si le bouton d'ajout de similaire n'est pas présent
                // et que la ressource est dans le compte de l'utilisateur, on ajoute le bouton
                if ($('#similars button.blockTitle-subtitle').length === 0 && res.in_account === true) {
                    $('#similars .blockTitle')
                        .after(`<button type="button"
                                        class="btn-reset blockTitle-subtitle u-colorWhiteOpacity05">
                                            ${trans("popup.suggest_show.title", {'%title%': "une série"})}
                                </button>`);
                }
                // On ajoute la gestion de l'event click sur le bouton d'update des similars
                $('.updateSimilars').on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $(this).removeClass('finish');
                    // On supprime les bandeaux Viewed
                    $('.bandViewed').remove();
                    // On supprime les notes
                    $('.stars-outer').remove();
                    $('.fa-wrench').off('click').remove();
                    // On supprime les popovers
                    $('#similars a.slide__image').each((i, elt) => {
                        $(elt).popover('dispose');
                    });
                    // On met à jour les series/films similaires
                    medias.similarsViewed(res);
                });
            }
            let objSimilars = [];
            res.fetchSimilars().then(function (res) {
                const $similarsLength = $('.similarsLength');
                if ($similarsLength.length <= 0) {
                    $('a[href="#similars"]').append(`<span class="unread-count similarsLength">${res.similars.length}</span>`);
                } else {
                    $similarsLength.text(res.similars.length);
                }
                system.addScriptAndLink(['popover', 'bootstrap'], () => {
                    /**
                     * Retourne la position de la popup par rapport à l'image du similar
                     * @param  {Object}         _tip Unknown
                     * @param  {HTMLElement}    elt  Le DOM Element du lien du similar
                     * @return {String}              La position de la popup
                     */
                    let funcPlacement = (_tip, elt) => {
                        //if (Base.debug) console.log('funcPlacement', tip, $(tip).width());
                        let rect = elt.getBoundingClientRect(),
                            width = $(window).width(),
                            sizePopover = 320;
                        return ((rect.left + rect.width + sizePopover) > width) ? 'left' : 'right';
                    };
                    const dialog = system.getDialog();
                    for (let s = 0; s < res.similars.length; s++) {
                        objSimilars.push(res.similars[s].id);
                        let $elt = $($similars.get(s)),
                            $link = $elt.siblings('a'),
                            similar = res.similars[s];
                        similar.elt = $elt.parents('.slide_flex');
                        similar.save();
                        // On décode le titre du similar
                        similar.decodeTitle();
                        // On ajoute l'icone pour visualiser les data JSON du similar
                        if (Base.debug) {
                            similar.wrench(dialog);
                        }
                        //$link.attr('data-placement', funcPlacement(null, $elt.get(0)));
                        similar
                            // On vérifie la présence de l'image du similar
                            .checkImg()
                            // On ajoute le bandeau viewed sur le similar
                            .addViewed()
                            // On ajoute le code HTML pour le rendu de la note
                            .renderStars();
                        // On ajoute la popover sur le similar
                        $link.popover({
                            container: $link,
                            delay: { "show": 250, "hide": 100 },
                            html: true,
                            content: ' ',
                            placement: funcPlacement,
                            template: templatePopover,
                            title: ' ',
                            trigger: 'hover',
                            fallbackPlacement: ['left', 'right']
                        });
                    }
                    // Event à l'ouverture de la Popover
                    $('#similars a.slide__image').on('shown.bs.popover', function () {
                        const $link = $(this),
                            resId = parseInt($link.data('id'), 10),
                            type = $link.data('type'),
                            objSimilar = res.getSimilar(resId);
                        // On gère les modifs sur les cases à cocher de l'état d'un film similar
                        if (type === MediaType.movie) {
                            $('.popover button.reset').on('click', e => {
                                e.stopPropagation();
                                e.preventDefault();
                                let promise = Promise.resolve(true);
                                const $parent = $(e.currentTarget).parents('a.slide__image');
                                // Demander une confirmation lorsque le film est vu
                                if (MovieStatus.SEEN === objSimilar.user.status) {
                                    promise = new Promise((resolve) => {
                                        new PopupAlert({
                                            title: `Suppression de ${objSimilar.title}`,
                                            text: `Souhaitez-vous supprimer le film ${objSimilar.title} de votre compte ?`,
                                            callback_yes: () => resolve(true),
                                            callback_no: () => resolve(false)
                                        });
                                    })
                                }
                                promise.then(resp => {
                                    if (!resp) {
                                        return;
                                    }
                                    objSimilar.changeState(-1).then(() => {
                                        const checked = $(e.currentTarget).siblings('input:checked');
                                        // if (Base.debug) console.log('Reset changeState nbChecked(%d) similar', checked.length, objSimilar);
                                        checked.get(0).checked = false;
                                        checked.removeAttr('checked');
                                        // On supprime le bandeau Vu
                                        if ($parent.find('.bandViewed').length > 0) {
                                            $parent.find('.bandViewed').remove();
                                        }
                                        $(e.currentTarget).hide();
                                    });
                                });
                            });
                            $('.popover input.movie').on('click', (e) => {
                                e.stopPropagation();
                                // e.preventDefault();
                                const $elt = $(e.currentTarget).parent().children('input:checked');
                                if (Base.debug) console.log('input.movie click - checked(%d)', $elt.length);
                                if ($elt.length <= 0) {
                                    $elt.siblings('button').hide();
                                    return;
                                }
                                const state = parseInt($elt.val(), 10);
                                if (Base.debug) console.log('input.movie change: %d', state, $elt);
                                objSimilar.changeState(state).then(similar => {
                                    if (state === MovieStatus.SEEN) {
                                        $elt.parents('a').prepend(`<img src="${serverBaseUrl}/img/viewed.png" class="bandViewed"/>`);
                                    }
                                    else if ($elt.parents('a').find('.bandViewed').length > 0) {
                                        $elt.parents('a').find('.bandViewed').remove();
                                    }
                                    $elt.siblings('button').show();
                                    if (Base.debug) console.log('movie mustSee/seen OK', similar);
                                }, err => {
                                    console.warn('movie mustSee/seen KO', err);
                                });
                            });
                        }
                        // On gère le click sur le lien d'ajout de la série similar sur le compte de l'utilisateur
                        else if (type === MediaType.show) {
                            $('.popover .addShow').on('click', (e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                objSimilar.addToAccount().then(() => {
                                    const para = $(e.currentTarget).parent('p');
                                    $(e.currentTarget).remove();
                                    para.text('<span style="color:var(--link-color)">La série a bien été ajoutée à votre compte</span>').delay(2000).fadeIn(400);
                                }, err => {
                                    console.error('Popover addShow error', err);
                                });
                            });
                            const toggleToSeeShow = async(showId) => {
                                let showsToSee = await dbGetValue('toSee', {});
                                let toSee;
                                if (showsToSee[showId] !== undefined) {
                                    delete showsToSee[showId];
                                    toSee = false;
                                } else {
                                    showsToSee[showId] = true;
                                    toSee = true;
                                }
                                await dbSetValue('toSee', showsToSee);
                                return toSee;
                            };
                            $('.popover .toSeeShow').on('click', e => {
                                e.stopPropagation();
                                e.preventDefault();
                                const $link = $(e.currentTarget);
                                const showId = parseInt($link.data('showId'), 10);
                                const toSee = toggleToSeeShow(showId);
                                if (toSee) {
                                    $link.children('span').text('Ne plus voir');
                                } else {
                                    $link.children('span').text('A voir');
                                }
                            });
                        }
                    })
                    .on('inserted.bs.popover', function() {
                        const $link = $(this),
                              $popover = $('.popover'),
                              placement = funcPlacement(null, this),
                              resId = parseInt($link.data('id'), 10),
                              objSimilar = res.getSimilar(resId);
                        // if (debug) console.log('placement similar: ', placement);
                        $('.popover-header').html(objSimilar.getTitlePopup());
                        $('.popover-body').html(objSimilar.getContentPopup());
                        // On gère le placement de la Popover par rapport à l'image du similar
                        if (placement == 'left') {
                            const img = $popover.siblings('img.js-lazy-image'),
                                  space = $popover.width() + (img.width() / 2) + 5;
                            $popover.css('left', `-${space}px`);
                        }
                    });
                    $('.updateSimilars').addClass('finish');
                    console.groupEnd();
                });
            }, (err) => {
                system.notification('Erreur de récupération des similars', 'similarsViewed: ' + err);
            });
            medias.replaceSuggestSimilarHandler($('#similars button.blockTitle-subtitle'), objSimilars);
            if (res.mediaType.singular === MediaType.show) {
                res.addListener(EventTypes.ADDED, medias.replaceSuggestSimilarHandler, '#similars button.blockTitle-subtitle', objSimilars);
            }
        },
        /**
         * Gère l'affichage des commentaires
         * @param {Base} res La ressource média
         */
        comments: function(res) {
            // On charge le style pour l'affichage des commentaires
            system.addScriptAndLink(['comments', 'textcomplete']);
            let $star = $('symbol#icon-star-empty').clone();
            $star.attr('id', 'icon-stargrey-empty');
            $star.children('path').attr('fill', 'rgba(255,255,255,.5)');
            $('symbol#icon-star-empty').parent().append($star);
            // On remplace les boutons des commentaires, pour supprimer les events
            [].forEach.call(document.querySelectorAll(".js-popinalert-comments"), function(el) {
                const cId = el.getAttribute('data-comment-id');
                $(el).replaceWith(`<button type="button" class="btn-reset js-popup-comments zIndex10" data-comment-id="${cId}"></button>`);
                // if (Base.debug) console.log('eventListener comment retiré');
            });
            const eventComments = () => {
                /**
                 * @type {JQuery<HTMLElement>}
                 */
                const $comments = $('#comments .slide__comment .js-popup-comments');
                if (debug) console.log('eventComments');
                $comments.off('click').on('click', e => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (debug) console.log('eventComments click');
                    let promise = Promise.resolve();
                    if (res.comments.length <= 0 || res.comments.length < $comments.length) {
                        if (debug) console.log('eventComments fetchComments', {comments: res.comments.length, vignettes: $comments.length});
                        promise = res.comments.fetchComments();
                    }
                    promise.then(() => {
                        const commentId = parseInt($(e.currentTarget).data('commentId'), 10),
                            /**
                             * @type {CommentBS}
                             */
                            objComment = res.comments.getComment(commentId);
                        if (debug) console.log('eventComments promise commentId: %d', commentId, objComment);
                        if (!(objComment instanceof CommentBS)) {
                            system.notification('Affichage commentaire', "Le commentaire n'a pas été retrouvé");
                            console.warn('Commentaire introuvable', {commentId, objComment, 'comments': res.comments});
                            return;
                        }
                        objComment.addListener('show', () => {
                            const $textarea = $('.writing textarea');
                            const users = objComment.getLogins();
                            $textarea.textcomplete([{
                                match: /(^|\s)@(\w{1,})$/,
                                search: function (term, callback) {
                                    console.log('textcomplete search term', term);
                                    callback(users.filter(user => { return user.startsWith(term); }));
                                },
                                replace: function (word) {
                                    return '$1@' + word + ' ';
                                }
                            }])
                            .on({
                                'textComplete:show': function (e) {
                                    if (debug) console.log('textComplete:show', e, this);
                                    $('ul.textcomplete-dropdown').get(0).style.zIndex = 2050;
                                }
                            });
                        });
                        objComment.render();
                    });
                });
                const $btnModal = $('#js-open-comments-modal');
                $btnModal.removeAttr('onclick').off('click').on('click', e => {
                    if (debug) console.log('Event click on comments');
                    e.stopPropagation();
                    e.preventDefault();
                    res.comments.render();
                });
                if ($comments.length <= 0 && $btnModal.length <= 0) {
                    $('#comments .slide_flex button.actorEmpty').removeAttr('onclick').off('click').on('click', e => {
                        if (debug) console.log('Event zero comments');
                        e.stopPropagation();
                        e.preventDefault();
                        res.comments.render();
                    });
                }
            };
            $('#comments .slide__comment').off('click');
            system.addScriptAndLink(['textcomplete'], eventComments);
            const evaluations = function() {
                if (debug) console.log('evaluations');
                res.comments.showEvaluations().then((template) => {
                    const $title = $('#comments .blockTitle');
                    $title.popover('dispose');
                    $title.popover({
                        container: $title,
                        delay: { "show": 500, "hide": 100 },
                        html: true,
                        content: template,
                        placement: 'auto',
                        template: templatePopover,
                        title: 'Evaluations',
                        trigger: 'hover',
                        boundary: 'window'
                    });
                });
            }
            // const $btnCmt = $('#comments div.slide__image > button');
            res.comments.addListener(EventTypes.ADDED, eventComments);
            res.comments.addListener(EventTypes.ADD, evaluations);
            res.addListener(EventTypes.NOTE, evaluations);
            res.comments.addListener(EventTypes.SHOW, () => {
                if (debug) console.log('Listener show of comments');
                const $textarea = $('.writing textarea');
                const users = res.comments.getLogins();
                $textarea.textcomplete([{
                    match: /(^|\s)@(\w{1,})$/,
                    search: function (term, callback) {
                        const results = users.filter(user => { return user.startsWith(term); });
                        console.log('textcomplete search term', term, results);
                        callback(results);
                    },
                    replace: function (word) {
                        return '$1@' + word + ' ';
                    }
                }])
                .on({
                    'textComplete:show': function (e) {
                        if (debug) console.log('textComplete:show', e, this);
                        $('ul.textcomplete-dropdown').get(0).style.zIndex = 2050;
                    }
                });
            });
            system.addScriptAndLink(['popover', 'bootstrap'], evaluations);
            res.comments.init();
        },
        /**
         * Remplacement du système de notation
         * @param {Base} res Le média principal
         */
        replaceVoteFn: function(res) {
            const $blockMeta = $('.blockInformations__metadatas'),
                  $btnVote = $blockMeta.find('button');
            const displayNotesInPopup = function() {
                system.addScriptAndLink(['popover', 'bootstrap'], () => {
                    if (Base.debug) console.log('callback after load popover and bootstrap');
                    //res.removeListener(EventTypes.NOTE, displayNotesInPopup);
                    const popupVote = function() {
                        // On met en forme le nombre de votes
                        const total = new Intl.NumberFormat('fr-FR', {style: 'decimal', useGrouping: true}).format(res.objNote.total);
                        return `
                            <div>
                                <p>Nombre de votants: <strong>${total}</strong></p>
                                <div class="render-stars mean">
                                    <p>Note moyenne: <strong>${res.objNote.mean.toFixed(2)}</strong></p>
                                    <span class="stars">
                                        ${Note.renderStars(res.objNote.mean)}
                                    </span>
                                </div>
                                <div class="render-stars user">
                                    <p>Votre note</p>
                                    <span class="stars">
                                        ${Note.renderStars(res.objNote.user, 'blue')}
                                    </span>
                                </div>
                            </div>`;
                    };
                    $btnVote.popover({
                        container: $btnVote,
                        delay: { "show": 500, "hide": 100 },
                        html: true,
                        content: popupVote,
                        placement: 'bottom',
                        template: templatePopover,
                        title: 'Notes du média',
                        trigger: 'hover',
                        // boundary: $btnVote.get(0)
                    });
                    $btnVote.on('inserted.bs.popover', function () {
                        const positionsVote = $btnVote.position();
                        $('.popover')
                            .css('top', positionsVote.top + 30)
                            .css('left', positionsVote.left)
                            .css('cursor', 'initial')
                            .click((e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            });
                    });
                });
            };
            $btnVote.removeAttr('onclick').on('click', e => {
                e.stopPropagation();
                e.preventDefault();
                res.objNote.createPopupForVote((note) => {
                    if (Base.debug) console.log('createPopupForVote callback', note);
                });
            });
            if (res.objNote.user > 0) {
                displayNotesInPopup();
            }
            res.addListener(EventTypes.NOTE, displayNotesInPopup);
        },
        /**
         * Redéfinit l'event click sur le bouton Vu sur la page d'un film
         * @param {Movie} objRes L'objet contenant les infos du film
         */
        observeBtnVu: function(objRes) {
            const $btnVu = $(`.blockInformations__action .label:contains("${trans('film.button.watched.label')}")`).siblings('button');
            if (Base.debug) console.log('observeBtnVu', $btnVu);
            /**
             * Met à jour le bouton Vu
             * @param {number} state L'état de visionnage du film (TOSEE or SEEN)
             */
            function updateRender(state) {
                const Svgs = {
                    0: '<svg fill="#FFF" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M16 2v14H2V2h14zm0-2H2C.9 0 0 .9 0 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z" fill-rule="nonzero"></path></svg>',
                    1: '<svg fill="#54709D" width="17.6" height="13.4" viewBox="2 3 12 10" xmlns="http://www.w3.org/2000/svg"><path fill="inherit" d="M6 10.78l-2.78-2.78-.947.94 3.727 3.727 8-8-.94-.94z"></path></svg>'
                };
                $btnVu.children('span').empty().append(Svgs[state]);
            }
            $btnVu.off('click').on('click', e => {
                e.stopPropagation();
                e.preventDefault();
                if (Base.debug) console.log('observeBtnVu click');

                // _this.markAsView.blur();
                if (!system.userIdentified()) {
                    faceboxDisplay('inscription', {}, function() {});
                    return;
                }
                const state = objRes.user.status !== MovieStatus.SEEN ? MovieStatus.SEEN : MovieStatus.TOSEE;
                objRes.changeStatus(state).then((movie) => {
                    objRes.elt.attr('data-movie-currentstatus', movie.user.status);
                    // Update render SVG
                    updateRender(state);
                    if (state === MovieStatus.SEEN) {
                        objRes.objNote.createPopupForVote();
                    }
                });
            });
            // On active les menus dropdown
            $('.blockInformations .dropdown-toggle').dropdown();
        },
        /**
         * Ajoute un bouton pour le dev pour afficher les données de la ressource
         * dans une modal
         */
        addBtnDev: function() {
            const btnHTML = '<div class="blockInformations__action"><button class="btn-reset btn-transparent" type="button" style="height:44px;width:64px;"><i class="fa fa-wrench" aria-hidden="true" style="font-size:1.5em;"></i></button><div class="label">Dev</div></div>';
            $('.blockInformations__actions').last().append(btnHTML);
            /**
             * @type {Dialog}
             */
            const dialog = system.getDialog();
            $('.blockInformations__actions .fa-wrench').parent().on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                let type = medias.getApiResource(location.pathname.split('/')[1]); // Indique de quel type de ressource il s'agit
                medias.getResourceData().then(function (data) {
                    // if (Base.debug) console.log('addBtnDev promise return', data);
                    dialog
                        .setContent(renderjson.set_show_to_level(2)(data[type.singular]))
                        .setTitle('Données du média')
                        .show();
                }, (err) => {
                    system.notification('Erreur de récupération de la ressource', 'addBtnDev: ' + err);
                });
            });
            /*
             *             Bouton ID clipboard
             */
            const btnId = '<div id="btnCopyId" class="unread-count copy-id" title="Copy ID">ID</div>';
            $('.blockInformations__title').append(btnId);
            $('.blockInformations__title .copy-id').on('click', (e) => {
                e.stopPropagation();
                const $btn = $(e.target);
                const type = medias.getApiResource(location.pathname.split('/')[1]);
                const id = $(`#reactjs-${type.singular}-actions`).attr(`data-${type.singular}-id`);
                navigator.clipboard.writeText(id).then(function() {
                    /* Animation de copie réussie */
                    $btn.on('animationend', () => {
                        $btn.removeClass('copied');
                    });
                    $btn.addClass('copied');
                }).catch(function() {
                    /* échec de l’écriture dans le presse-papiers */
                    const origColor = $btn.css('backgroundColor');
                    const redColor = getComputedStyle(document.documentElement).getPropertyValue('--red');
                    $btn.animate({'background-color': redColor}, {duration: 'slow', complete: () => {
                        $btn.animate({'background-color': origColor}, {duration: 'slow'});
                    }});
                  });
            });
        },
        /**
         * Ajoute la série aux séries à voir
         * @param {Show} res
         */
        addBtnToSee: function() {
            const toggleToSeeShow = async(showId) => {
                let storeToSee = await dbGetValue('toSee', {});
                let toSee;
                if (storeToSee[showId] === undefined) {
                    storeToSee[showId] = true;
                    toSee = true;
                } else {
                    delete storeToSee[showId];
                    toSee = false;
                }
                await dbSetValue('toSee', storeToSee);
                return toSee;
            };
            const $navSeries = $('#js-menu-aim > div.menu-item:nth-child(3) > div.header-navigation');
            $navSeries.append(`<a href="#" class="seriesToSee">Séries à voir</a>`);
            $('#js-menu-aim a.seriesToSee').on('click', async(e) => {
                e.stopPropagation();
                e.preventDefault();
                /**
                 * @type {Dialog}
                 */
                const dialog = system.getDialog();
                let toSee = await dbGetValue('toSee', {});
                Show.fetchMulti(Object.keys(toSee)).then(shows => {
                    let template = '<div id="annuaire-list" class="gridSeries">';
                    for (let s = 0; s < shows.length; s++) {
                        let img = (shows[s].images.poster != null) ? shows[s].images.poster : (shows[s].images.show != null) ? shows[s].images.show : shows[s].images.box;
                        template += `
                        <a class="show-link" href="${shows[s].resource_url}">
                            <div class="blockSearch greyBorder blogThumbnailShowContainer mainBlock position-relative">
                                <div class="media" data-show-id="${shows[s].id}">
                                    <div class="media-left">
                                        <img class="js-lazy-image" data-src="${img}" alt="Affiche de la série ${shows[s].title}" width="119" height="174">
                                    </div>
                                    <div class="media-body" style="height:174px;position:relative;">
                                        <div class="remove" style="">
                                            <span aria-hidden="true">&times;</span>
                                        </div>
                                        <div class="thumbnailSearchTitle mainLink"><span class="showTitle">${shows[s].title}</span>
                                            <i class="fa fa-clipboard" aria-hidden="true" title="Copier le titre"></i>
                                        </div>
                                        <p class="genre-result-search">${shows[s].genres.join(', ')}</p>
                                        <div class="info-result-search">
                                            <p style="min-width: fit-content;">${shows[s].nbEpisodes} Épisodes</p>
                                        </div>
                                        <p class="statut-result-search">
                                            Statut : ${shows[s].isEnded() ? 'Terminée': 'En cours'} - Pays: ${shows[s].country}
                                        </p>
                                        <div class="displayFlex">
                                            <time class="mainTime" datetime="${shows[s].creation}">${shows[s].creation}</time>
                                            <div class="stars" title="${shows[s].objNote.toString()}">${Note.renderStars(shows[s].objNote.mean)}</div>
                                        </div>
                                        <p class="block-with-text">${shows[s].description.substring(0, 200) + '...'}</p>
                                    </div>
                                </div>
                            </div>
                        </a>
                        `;
                    }
                    dialog.setContent(template + '</div>');
                    dialog.setCounter(Base.counter.toString());
                    dialog.setTitle(shows.length + ' séries à regarder plus tard');
                    dialog.addStyle(`
                        #annuaire-list .blockSearch {
                            cursor: pointer;
                            margin: 5px;
                            margin-left: 3px;
                            background: var(--gray_hover);
                            padding-bottom: 0;
                            padding-top: 0;
                            padding-left: 0;
                        }
                        #annuaire-list .blockSearch .media .remove {
                            float: right;
                            top: 2px;
                            right: 5px;
                            font-size: 1.2em;
                            font-weight: 400;
                            cursor: pointer;
                        }
                        #annuaire-list .blockSearch .media .remove:hover {
                            color: var(--default_color);
                        }
                        #annuaire-list .fa-clipboard,
                        #annuaire-list .fa-check-square-o {
                            margin-left: 5px;
                        }
                    `);
                    $('#annuaire-list .blockSearch .media .remove').on('click', e => {
                        e.stopPropagation();
                        e.preventDefault();
                        const $btn = $(e.currentTarget);
                        const showId = parseInt($btn.parents('.media').data('showId'), 10);
                        toggleToSeeShow(showId);
                        $btn.off('click');
                        $btn.parents('.show-link').remove();
                    });
                    $('#annuaire-list .fa-clipboard').on('click', e => {
                        e.stopPropagation();
                        e.preventDefault();
                        const $clip = $(e.currentTarget);
                        const $title = $clip.siblings('.showTitle');
                        navigator.clipboard.writeText($title.text()).then(() => {
                            $clip.fadeOut().removeClass('fa-clipboard').addClass('fa-check-square-o').fadeIn();
                            setTimeout(() => {
                                if ($clip.is(':visible'))
                                    $clip.fadeOut().removeClass('fa-check-square-o').addClass('fa-clipboard').fadeIn();
                            }, 2000);
                        }).catch(() => {
                            console.warn('Erreur de copy dans le clipboard');
                        })
                    });
                    dialog.show();
                });
            });
        },
        /**
         * Réalisation d'une popup pour proposer une plateforme de diffusion
         * @param {Media} res Le média principal
         * @return {void}
         */
        proposePlatform: function(res) {
            system.addScriptAndLink(['jqueryuijs', 'jqueryuicss'], () => {
                let template = `
                    <style>
                        /* select with custom icons */
                        .ui-selectmenu-menu .ui-menu.customicons .ui-menu-item-wrapper {
                          padding: 0.5em 0 0.5em 3em;
                        }
                        .ui-selectmenu-menu .ui-menu.customicons .ui-menu-item .ui-icon,
                        .ui-selectmenu-menu .ui-menu.customicons .ui-menu-item .fa {
                            height: 24px;
                            width: 24px;
                            position: absolute;
                            top: 0;
                            bottom: 0;
                            margin: auto 0;
                        }
                        .ui-selectmenu-menu .ui-menu.customicons .ui-menu-item .ui-icon {
                            top: 0.1em;
                            left: 0.4em;
                        }
                        .ui-selectmenu-menu .ui-menu.customicons .ui-menu-item .fa {
                            left: 0.2em;
                        }
                        .ui-selectmenu-menu.ui-front.ui-selectmenu-open {
                            z-index: 2050;
                        }
                        #platform-menu {
                            height: 350px;
                            overflow-y: scroll;
                        }
                        #platform-button {
                            display: block;
                            width: 100%;
                        }
                        .ui-menu-item .ui-icon-play {
                            background-position: 3px -156px;
                        }
                    </style>
                    <form class="form-middle" method="POST" action="">
                        <fieldset>
                            <p>Veuillez sélectionner la plateforme ci-dessous et indiquer le lien d'accès la série sur cette plateforme.</p>
                            <div>
                                <label for="platform_type">Type plateforme</label>
                                <select class="form-control" name="platformType" id="platform_type" required>
                                    <option value=""></option>
                                    <option value="svod">SVOD</option>
                                    <option value="vod">VOD</option>
                                </select>
                                <label for="platform">Plateforme</label>
                                <select class="form-control" name="platformId" id="platform" required></select>
                                <label for="link">Lien vers la page de la série</label>
                                <input class="form-control" type="url" name="mediaLink" id="link" placeholer="URL de la page de la série" required/>
                            </div>
                            <div class="button-set">
                                <button class="js-close-popupalert btn-reset btn-btn btn-blue2" type="submit" id="popupalertyes">Proposer</button>
                                <button class="js-close-popupalert btn-reset btn-btn btn-grey" type="button" id="popupalertno">Annuler</button>
                            </div>
                        </fieldset>
                        <input type="hidden" name="mediaId" value="${res.id}">
                        <input type="hidden" name="mediaType" value="show">
                    </form>`;
                $('.blockInformations__action .dropdown-menu.header-navigation[aria-labelledby="dropdownOptions"]')
                    .append('<a class="header-navigation-item" href="javascript:;" id="proposePlatform">Proposer une plateforme</a>');
                let pList = null;
                $.widget( "custom.iconselectmenu", $.ui.selectmenu, {
                    _renderItem: function( ul, item ) {
                        const li = $( "<li>" ),
                              wrapper = $( "<div>", { text: item.label } );

                        if ( item.disabled ) {
                            li.addClass( "ui-state-disabled" );
                        }

                        $(`<img data-src="${item.element.attr('data-src')}" class="js-lazy-image ui-icon">`)
                            .appendTo( wrapper );

                        return li.append( wrapper ).appendTo( ul );
                    },
                    _resizeMenu: function() {
                        const clientRect = document.getElementById('platform-button').getBoundingClientRect();
                        const size = window.innerHeight - (clientRect.y + clientRect.height);
                        console.log('_resizeMenu', size);
                        this.menu.height(size);
                        this.menu.width(clientRect.width);
                    }
                });
                const renderOptions = function(platformList, type, $platforms, res) {
                    let exclude = new Array();
                    const types = {svod: 'svods', vod: 'vod'};
                    if (Object.keys(types).indexOf(type) >= 0) {
                        exclude = res.platforms[types[type]].map(elt => elt.id);
                    }
                    $platforms.append(platformList.renderHtmlOptions(type, exclude));
                    if ($('#platform-button').length <= 0) {
                        $platforms
                            .iconselectmenu({
                                open: function() {
                                    console.log('iconselectmenuopen');
                                    const onerror = (err, elt) => {
                                        //console.log('lazyLoad error URL: ', defImgShow);
                                        $(elt).replaceWith('<i class="fa fa-youtube-play fa-2x" aria-hidden="true"></i>');
                                        // console.log('lazyload onerror show', elt, res.images.show, attr);
                                    };
                                    $('#platform-menu .js-lazy-image').lazyload(Object.assign({onerror}, optionsLazyload));
                                }
                            })
                            .iconselectmenu( "menuWidget" )
                            .addClass( "ui-menu-icons customicons" );
                    } else {
                        $platforms.iconselectmenu( 'refresh' );
                    }
                };
                $('#proposePlatform').on('click', (e) => {
                    e.stopPropagation();
                    const popup = new PopupAlert({
                        title: `Proposer une plateforme pour la série`,
                        contentHtml: template,
                        yes: false,
                        no: false,
                        showClose: true,
                        callback: function() {
                            // console.log('callback PopupAlert');
                            $('#platform_type').on('change', () => {
                                // console.log('platform_type change', e);
                                let type = $('#platform_type option:selected').val();
                                const $platforms = $('#platform');
                                $platforms.empty();
                                if (pList == null) {
                                    PlatformList.fetchPlatforms().then((platformList) => {
                                        pList = platformList;
                                        renderOptions(pList, type, $platforms, res);
                                    });
                                } else {
                                    renderOptions(pList, type, $platforms, res);
                                }
                            });
                            $( "form.form-middle" ).on( "submit", function( event ) {
                                event.preventDefault();
                                console.log( $( this ).serializeArray() );
                                popup.closePopin();
                            });
                            $('button.js-close-popupalert[type="button"]').on('click', popup.closePopin);
                        }
                    });
                    popup.yes.style.display = 'none';
                    popup.launchCallback();
                });
            });
        },
        /**
         * Vérifie si l'image du prochain épisode est bien chargée
         * @param {Show} res Le média principal
         * @return {void}
         */
        checkNextEpisode: function(res) {
            const $block404 = $('.blockInformations .blockNextEpisode .media-left .block404');
            if ($block404.length > 0) {
                if (debug) console.log('checkNextEpisode block404 found');
                res.getDefaultImage('wide').then(defImgShow => {
                    let onerror = null;
                    if (defImgShow != null) {
                        onerror = (err, elt, url, attr) => {
                            // console.log('checkNextEpisode lazyLoad error URL: ', defImgShow, url);
                            elt.classList.add("js-lazy-image-handled");
                            if (!regDomain.test(defImgShow)) {
                                elt.crossOrigin = 'anonymous';
                            }
                            elt[attr] = defImgShow;
                            elt.classList.add("fade-in");
                            // console.log('lazyload onerror show', elt, res.images.show, attr);
                        };
                    $block404.replaceWith(`<img class="js-lazy-image" data-src="${defImgShow}" width="124" height="70">`);
                    }
                    $('.blockInformations .blockNextEpisode .js-lazy-image').lazyload(Object.assign({onerror}, optionsLazyload));
                });
            }
        },
        /**
         * Permet d'afficher les infos de l'acteur
         * @param {Show} res Objet de type Show
         */
        upgradeActors: function(res) {
            /*
             * 1. Agrémenter les noeuds des acteurs avec leurs identifiants
             * 2. Afficher leurs infos dans une popup
            */
            /**
             * @type {JQuery<HTMLElement>}
             */
            const $actors = $('#actors .slide_flex .slide__title');
            res.fetchPersonsFromCharacters()
            .then(() => {
                for (let a = 0; a < $actors.length; a++) {
                    const $actor = $($actors.get(a));
                    const name = $actor.text().trim();
                    const character = res.getCharacterByName(name);
                    const $link = $actor.parents('.slide_flex');
                    if (character) {
                        $link
                            .attr('data-person-id', character.person_id)

                    }
                }
            })
        }
    };
    const members = {
        /**
         * Retourne les infos d'un membre
         *
         * @param {Number}   id    Identifiant du membre (par défaut: le membre connecté)
         * @return {Promise} Le membre
         */
        getMember: function(id = null) {
            // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
            if (!system.userIdentified() || betaseries_api_user_key === '') return;
            let args = {};
            if (id) args.id = id;
            return new Promise((resolve) => {
                Base.callApi('GET', 'members', 'infos', args)
                    .then(data => {
                    // On retourne les infos du membre
                    resolve(data.member);
                }, (err) => {
                    system.notification('Erreur de récupération d\'un membre', 'getMember: ' + err);
                });
            });
        },
        /**
         * Compare le membre courant avec un autre membre
         */
        compareMembers: function() {
            let id = parseInt($('#temps').data('loginid'), 10);
            members.getMember(id).
                then(function (member) {
                let otherMember = member;
                const dialogHTML = `
                    <div
                            class="dialog dialog-container table-dark"
                            id="dialog-compare"
                            aria-hidden="true"
                            aria-labelledby="dialog-compare-title">
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
                system.addScriptAndLink('tablecss');
                $('body').append(dialogHTML);
                //if (Base.debug) console.log(currentUser, otherMember, trads);
                for (const [key, value] of Object.entries(trads)) {
                    if (typeof value == 'object') {
                        for (const [subkey, subvalue] of Object.entries(trads[key])) {
                            if (/time/.test(subkey)) {
                                currentUser[key][subkey] = humanizeDuration((currentUser[key][subkey] * 60 * 1000), { language: currentUser.locale });
                                otherMember[key][subkey] = humanizeDuration((otherMember[key][subkey] * 60 * 1000), { language: currentUser.locale });
                            }
                            $('#dialog-compare table tbody').append('<tr><td>' + subvalue + '</td><td>' + currentUser[key][subkey] + '</td><td>' + otherMember[key][subkey] + '</td></tr>');
                        }
                    }
                    else {
                        $('#dialog-compare table tbody').append('<tr><td>' + value + '</td><td>' + currentUser[key] + '</td><td>' + otherMember[key] + '</td></tr>');
                    }
                }
                $('.other-user').append(otherMember.login);
                const dialog = new A11yDialog(document.querySelector('#dialog-compare')), html = document.documentElement;
                $('#stats_container h1')
                    .css('display', 'inline-block')
                    .after('<button type="button" class="button blue" data-a11y-dialog-show="dialog-compare">Se comparer à ce membre</button>');
                $('button.button.blue').on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    dialog.show();
                });
                dialog
                    .on('show', function () {
                    html.style.overflowY = 'hidden';
                    $('#dialog-compare').css('z-index', '1005').css('overflow', 'scroll');
                    $('.dialog-close').on('click', function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        dialog.hide();
                    });
                })
                    .on('hide', function () {
                    html.style.overflowY = '';
                    $('#dialog-compare').css('z-index', '0').css('overflow', 'none');
                    $('.dialog-close').off('click');
                });
            });
        },
        /**
         * Ajoute un champ de recherche sur la page des amis d'un membre
         * @return {void}
         */
        searchFriends: function() {
            // Ajouter un champ de recherche
            $('.maincontent h1').append('<input id="searchFriends" placeholder="Recherche d\'amis" list="friendsdata" autocomplete="off"/>' +
                '<i class="fa fa-times clearSearch" aria-hidden="true" style="display:none;" title="Effacer la recherche"></i>');
            // Recuperer les identifiants et liens des membres
            let $links = $('.timeline-item .infos a'), objFriends = {}, idFriends = [], datalist = '<datalist id="friendsdata">';
            // On recupere les infos des amis
            for (let i = 0; i < $links.length; i++) {
                let elt = $($links.get(i)), text = elt.text().trim();
                objFriends[text.toLowerCase()] = { link: elt.attr('href'), name: text };
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
            const $inpSearchFriends = $('#searchFriends');
            $inpSearchFriends.on('keypress', () => {
                if ($inpSearchFriends.val().toString().trim().length > 0) {
                    $('.clearSearch').show();
                }
            });
            $inpSearchFriends.on('input', () => {
                let val = $inpSearchFriends.val().toString().trim().toLowerCase();
                if (Base.debug) console.log('Search Friends: ' + val, idFriends.indexOf(val), objFriends[val]);
                if (val === '' || idFriends.indexOf(val) === -1) {
                    $('.timeline-item').show();
                    if (val === '') {
                        $('.clearSearch').hide();
                    }
                    return;
                }
                $('.clearSearch').show();
                $('.timeline-item').hide();
                if (Base.debug) console.log('Item: ', $('.timeline-item .infos a[href="' + objFriends[val].link + '"]'));
                $('.timeline-item .infos a[href="' + objFriends[val].link + '"]').parents('.timeline-item').show();
            });
            $('.clearSearch').on('click', () => {
                $('#searchFriends').val('');
                $('.timeline-item').show();
                $('.clearSearch').hide();
            });
        },
        /**
         * Ajoute le statut de la série sur la page de gestion des séries de l'utilisateur
         */
        addStatusToGestionSeries: function() {
            // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
            if (!system.userIdentified() || betaseries_api_user_key === '') return;
            const $shows = $('#member_shows div.showItem.cf');
            if ($shows.length <= 0) return;
            let showIds = new Array();
            for (let s = 0; s < $shows.length; s++) {
                showIds.push(parseInt($($shows.get(s)).data('id'), 10));
            }
            /**
             * @param {Array<Show>} shows - Tableau des séries
             */
            const addInfos = function (shows) {
                let $show, $infos;
                for (let s = 0; s < shows.length; s++) {
                    $show = $(`#${shows[s].slug}`);
                    $show.attr('data-status', shows[s].status);
                    $show.attr('data-advance', shows[s].user.status);
                    $infos = $(`#${shows[s].slug} .infos`);
                    $infos.append(`<br>Statut: ${(shows[s].isEnded()) ? 'Terminée' : 'En cours'}`);
                }
                return shows;
            };
            return Show.fetchMulti(showIds).then(addInfos, (err) => {
                system.notification('Erreur addStatusToGestionSeries', 'Erreur de récupération des séries: ' + err);
            });
        },
        sortGestionSeries: function() {
            // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
            if (!system.userIdentified() || betaseries_api_user_key === '') return;

            const $title = $('#right h1');
            let templateListSort = `
                <div class="sortShows" style="float:right;">
                    <select class="selectSort" style="font-family: 'FontAwesome',Muli,'Lucida Grande','Trebuchet MS',sans-serif;">
                        <option value="">--Select--</option>
                        <option value="name-asc">Nom &#xf0de</option>
                        <option value="name-desc">Nom &#xf0dd</i></option>
                        <option value="duration-asc">Durée &#xf0de</option>
                        <option value="duration-desc">Durée &#xf0dd</i></option>
                        <option value="episode-asc">Nb épisodes &#xf0de</option>
                        <option value="episode-desc">Nb épisodes &#xf0dd</i></option>
                        <option value="status-asc">Statut &#xf0de</option>
                        <option value="status-desc">Statut &#xf0dd</i></option>
                        <option value="vote-asc">Vote &#xf0de</option>
                        <option value="vote-desc">Vote &#xf0dd</i></option>
                        <option value="advance-asc">Avancement &#xf0de</option>
                        <option value="advance-desc">Avancement &#xf0dd</i></option>
                    </select>
                </div>
            `;
            $title.append(templateListSort);
            $('.selectSort').on('change', (e) => {
                const value = $(e.currentTarget).find('option:selected').val();
                if (value == '') return;
                const sortName = value.split('-')[0];
                const sortOrder = value.split('-')[1];
                const $shows = $('#member_shows div.showItem.cf');
                const sortList = Array.prototype.sort.bind($shows);
                sortList(function ( a, b ) {
                    let aText, bText;
                    const ascending = sortOrder === 'asc' ? true : false;
                    // Cache inner content from the first element (a) and the next sibling (b)
                    switch (sortName) {
                        case 'name':
                            aText = $(a).find('.title a').text();
                            bText = $(b).find('.title a').text();
                            break;
                        case 'duration':
                            aText = $(a).data('mins') ? parseInt($(a).data('mins'), 10) : 0;
                            bText = $(b).data('mins') ? parseInt($(b).data('mins'), 10) : 0;
                            break;
                        case 'episode':
                            aText = $(a).data('eps') ? parseInt($(a).data('eps'), 10) : 0;
                            bText = $(b).data('eps') ? parseInt($(b).data('eps'), 10) : 0;
                            break;
                        case 'status':
                            aText = $(a).data('status') || '';
                            bText = $(b).data('status') || '';
                            break;
                        case 'vote':
                            aText = $(a).data('vote') ? parseInt($(a).data('vote'), 10) : 0;
                            bText = $(b).data('vote') ? parseInt($(b).data('vote'), 10) : 0;
                            break;
                        case 'advance':
                            aText = $(a).data('advance') ? parseInt($(a).data('advance'), 10) : 0;
                            bText = $(b).data('advance') ? parseInt($(b).data('advance'), 10) : 0;
                            break;
                    }

                    // Returning -1 will place element `a` before element `b`
                    if ( aText < bText ) {
                        return ascending ? -1 : 1;
                    }

                    // Returning 1 will do the opposite
                    if ( aText > bText ) {
                        return ascending ? 1 : -1;
                    }

                    // Returning 0 leaves them as-is
                    return 0;
                });
                $('#member_shows').append($shows);
            });
        },
        lastSeen: function() {
            const $navSeries = $('#js-menu-aim > div.menu-item:nth-child(3) > div.header-navigation');
            $navSeries.append(`<a href="#" class="lastSeen">10 last seen</a>`);
            /**
             * @type {Dialog}
             */
            const dialog = system.getDialog();
            $('#js-menu-aim a.lastSeen').on('click', e => {
                e.stopPropagation();
                e.preventDefault();
                dialog
                    .setContent('<div style="text-align:center;"><i class="fa fa-spinner fa-3x" aria-hidden="true"></i></div>')
                    .setTitle('10 dernières séries vues');
                Show.fetchLastSeen().then(async (shows) => {
                    let template = '<div id="annuaire-list" class="gridSeries">';
                    for (let s = 0; s < shows.length; s++) {
                        let img = await shows[s].getDefaultImage('poster');
                        template += `
                        <a class="show-link" href="${shows[s].resource_url}">
                            <div class="blockSearch greyBorder blogThumbnailShowContainer mainBlock position-relative">
                                <div class="media" data-show-id="${shows[s].id}">
                                    <div class="media-left">
                                        <img class="js-lazy-image" data-src="${img}" alt="Affiche de la série ${shows[s].title}" />
                                    </div>
                                    <div class="media-body" style="height:174px;position:relative;">
                                        <div class="thumbnailSearchTitle mainLink"><span class="showTitle">${shows[s].title}</span>
                                            <i class="fa fa-clipboard" aria-hidden="true" title="Copier le titre"></i>
                                        </div>
                                        <p class="genre-result-search">${shows[s].genres.join(', ')}</p>
                                        <div class="info-result-search">
                                            <p style="min-width: fit-content;">${shows[s].nbEpisodes} Épisodes</p>
                                        </div>
                                        <p class="statut-result-search">Statut : ${shows[s].isEnded() ? 'Terminée': 'En cours'}</p>
                                        <div class="displayFlex">
                                            <time class="mainTime" datetime="${shows[s].creation}">${shows[s].creation}</time>
                                            <div class="stars">${Note.renderStars(shows[s].objNote.user, 'blue')}</div>
                                        </div>
                                        <p class="block-with-text">${shows[s].description.substring(0, 200) + '...'}</p>
                                    </div>
                                </div>
                            </div>
                        </a>
                        `;
                    }
                    dialog.setContent(template + '</div>');
                    dialog.setCounter(Base.counter.toString());
                    dialog.addStyle(`
                        #annuaire-list .blockSearch {
                            cursor: pointer;
                            margin: 5px;
                            margin-left: 3px;
                            background: var(--gray_hover);
                            padding-bottom: 0;
                            padding-top: 0;
                            padding-left: 0;
                        }
                        #annuaire-list .blockSearch .media .remove {
                            float: right;
                            top: 2px;
                            right: 5px;
                            font-size: 1.2em;
                            font-weight: 400;
                            cursor: pointer;
                        }
                        #annuaire-list .blockSearch .media .remove:hover {
                            color: var(--default_color);
                        }
                        #annuaire-list .fa-clipboard,
                        #annuaire-list .fa-check-square-o {
                            margin-left: 5px;
                        }
                        #annuaire-list .media-left {
                            max-width: 119px;
                        }
                        #annuaire-list .media-left img {
                            width: 119px;
                            height = 174px;
                            aspect-ratio: auto 119 / 174;
                        }
                    `);
                    $('#annuaire-list .fa-clipboard').on('click', e => {
                        e.stopPropagation();
                        e.preventDefault();
                        const $clip = $(e.currentTarget);
                        const $title = $clip.siblings('.showTitle');
                        navigator.clipboard.writeText($title.text()).then(() => {
                            $clip.fadeOut().removeClass('fa-clipboard').addClass('fa-check-square-o').fadeIn();
                            setTimeout(() => {
                                if ($clip.is(':visible'))
                                    $clip.fadeOut().removeClass('fa-check-square-o').addClass('fa-clipboard').fadeIn();
                            }, 2000);
                        }).catch(() => {
                            console.warn('Erreur de copy dans le clipboard');
                        })
                    });
                    dialog.show();
                });
            });
        }
    };
    const series = {
        /**
         * Fonction modifiant le fonctionnement du filtre pays
         * pour permettre d'ajouter plusieurs pays sur la page des séries
         * @return {void}
         */
        seriesFilterPays: function() {
            if (url.split('/').pop() == 'agenda') return;
            let $input = $('.filter-container-others-countries input');
            // Supprimer l'attribut onclick de l'input other-countries
            $input.removeAttr('onchange');
            $input.on('change', function () {
                let hasSelect = $('option[value="' + $input.val() + '"]'), btnTemp = '<button type="button" class="btn-reset btn-btn filter-btn active" id="' +
                    hasSelect.attr("id") + '" onclick="searchOption(this);">' +
                    hasSelect.attr("value") + '</button>';
                $('#pays > button').last().after(btnTemp);
                deleteFilterOthersCountries();
                countFilter("pays");
            });
            const baseUrl = generate_route("shows");
            let hash = url.substring(baseUrl.length);
            if (hash.length === 0) {
                return;
            }
            const data = hash.split('/');
            if (!data.find((el) => el.match(/^tri-|sort-/g))) {
                data.push(CONSTANTE_FILTER.tri + "-" + CONSTANTE_SORT.popularite);
            }
            for (let i in data) {
                const splitData = data[i].split('-'), filter = splitData.shift(), dataFilter = decodeURIComponent(splitData.join('-'));
                if (filter && dataFilter &&
                    (filter === CONSTANTE_FILTER.paspays || filter === CONSTANTE_FILTER.pays)) {
                    const hasActive = filter === CONSTANTE_FILTER.pays, hasButton = $("#left #pays > button#" + dataFilter.toUpperCase()), optionExist = $('datalist[id="other-countries"] option[id="' + dataFilter.toUpperCase() + '"]');
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
                    let len = $('#pays > button.hactive, #pays > button.active').length, display = 'none';
                    current.text(len);
                    if (len >= 1) {
                        display = 'block';
                    }
                    current.css('display', display);
                    hideButtonReset();
                }
            }
        },
        displayNotes: function() {
            if (url.split('/').pop() == 'agenda') return;
            if (debug) console.log('series displayNotes');
            let $actionsShows = $('#annuaire-list .bottomActionMovie');
            if ($actionsShows.length > 0) {
                let ids = [];
                for (let elt of $actionsShows) {
                    ids.push(elt.dataset.sid);
                }
                if (ids.length > 0) {
                    Show.fetchMulti(ids)
                    .then((shows) => {
                        for (let show of shows) {
                            $('#add-' + show.id).parents('.media-body')
                                .find('.displayFlex .stars')
                                .attr('title', show.objNote.toString())
                                .css('zIndex', 5);
                        }
                    })
                    .catch(err => {
                        console.warn('displayNotes error fetchMulti', err);
                    });
                }
            }
        },
        addBtnToSee: async function() {
            const toggleToSeeShow = async (showId) => {
                const storeToSee = await Base.gm_funcs.getValue('toSee', {});
                let toSee;
                if (storeToSee[showId] === undefined) {
                    storeToSee[showId] = true;
                    toSee = true;
                } else {
                    delete storeToSee[showId];
                    toSee = false;
                }
                Base.gm_funcs.setValue('toSee', storeToSee);
                return toSee;
            };
            /** @type {JQuery<HTMLElement>} */
            const $bottomActions = $('#annuaire-list .bottomActionMovie');
            $bottomActions.each(
                /**
                 * Iterator
                 * @param {number} _ - Index de boucle
                 * @param {HTMLElement} elt - Container des boutons d'action
                 */
                async (_, elt) =>
            {
                console.log('bottomActionMovie elt', elt);
                const showId = elt.dataset.sid;
                const btnHTML = `
                        <button class="btn-reset btnMarkToSee" type="button" title="Ajouter la série aux séries à voir">
                            <i class="fa fa-clock-o" aria-hidden="true"></i>
                        </button>`;
                const iconTitleHTML = '<i class="fa fa-clock-o" aria-hidden="true" title="Série à voir plus tard"></i>';
                $(elt).prepend(btnHTML);
                /** @type {JQuery<HTMLButtonElement} */
                const $btn = $('.btnMarkToSee', elt);
                const $title = $btn.parents('.media-body').find('.thumbnailSearchTitle');
                $btn.on('click', async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    // const $btn = jQuery(e.currentTarget);
                    const toSee = await toggleToSeeShow(showId);
                    if (toSee) {
                        $btn.addClass('marked');
                        $btn.attr('title', 'Retirer la série des séries à voir');
                        $title.append(iconTitleHTML);
                    } else {
                        $btn.removeClass('marked');
                        $btn.attr('title', 'Ajouter la série aux séries à voir');
                        $('.fa', $title).remove();
                    }
                });
                const toSee = await dbGetValue('toSee', {});
                if (toSee[showId] !== undefined && toSee[showId]) {
                    $btn.addClass('marked');
                    $btn.attr('title', 'Retirer la série des séries à voir');
                    $title.append(iconTitleHTML);
                }
            });
        },
        /**
         * Permet de mettre à jour la liste des épisodes à voir
         * sur la page de l'agenda
         * @return {void}
         */
        updateAgenda: function() {
            // Identifier les informations des épisodes à voir
            // Les containers
            let $containersEpisode = $('#reactjs-episodes-to-watch .ComponentEpisodeContainer'),
                len = $containersEpisode.length,
                currentShowIds = {};
            // En attente du chargement des épisodes
            if (len <= 0) {
                if (Base.debug) console.log('updateAgenda - nb containers: %d', len);
                return;
            }
            const params = {
                limit: 1,
                order: 'smart',
                showsLimit: len,
                released: 1,
                specials: false,
                subtitles: 'all'
            };
            Base.callApi('GET', 'episodes', 'list', params)
                .then((data) => {
                for (let t = 0; t < len; t++) {
                    $($containersEpisode.get(t))
                        .data('showId', data.shows[t].id)
                        .data('code', data.shows[t].unseen[0].code.toLowerCase());
                    currentShowIds[data.shows[t].id] = { code: data.shows[t].unseen[0].code.toLowerCase() };
                    //if (Base.debug) console.log('title: %s - code: %s', title, episode);
                }
            });
            if ($('.updateElements').length === 0) {
                // On ajoute le bouton de mise à jour des similaires
                $('.maintitle > div:nth-child(1)').after(`
                    <div class="updateElements">
                      <img src="${serverBaseUrl}/img/update.png" width="20" class="updateEpisodes updateElement finish" title="Mise à jour des similaires vus"/>
                    </div>
                `);
                $('.updateEpisodes').on('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (Base.debug) console.groupCollapsed('Agenda updateEpisodes');
                    $containersEpisode = $('#reactjs-episodes-to-watch .ComponentEpisodeContainer');
                    const self = $(e.currentTarget), len = $containersEpisode.length;
                    self.removeClass('finish');
                    const params = {
                        limit: 1,
                        order: 'smart',
                        showsLimit: len,
                        released: 1,
                        specials: false,
                        subtitles: 'all'
                    };
                    Media.callApi('GET', 'episodes', 'list', params)
                    .then((data) => {
                        let newShowIds = {}, show;
                        if (Base.debug) console.log('updateAgenda updateEpisodes', data);
                        for (let s = 0; s < data.shows.length; s++) {
                            show = data.shows[s];
                            newShowIds[show.id] = { code: show.unseen[0].code.toLowerCase() };
                            if (currentShowIds[show.id] === undefined) {
                                if (Base.debug) console.log('Une nouvelle série est arrivée', show);
                                // Il s'agit d'une nouvelle série
                                // TODO Ajouter un nouveau container
                                let newContainer = $(buildContainer(show.unseen[0]));
                                renderNote(show.unseen[0].note.mean, newContainer);
                                $($containersEpisode.get(s)).parent().after(newContainer);
                            }
                        }
                        if (Base.debug) console.log('Iteration principale');
                        let container, unseen;
                        // Itération principale sur les containers
                        for (let e = 0; e < len; e++) {
                            container = $($containersEpisode.get(e));
                            unseen = null;
                            // Si la serie n'est plus dans la liste
                            if (newShowIds[container.data('showId')] === undefined) {
                                if (Base.debug) console.log('La série %d ne fait plus partie de la liste', container.data('showId'));
                                container.parent().remove();
                                continue;
                            }
                            if (container.data('showId') == data.shows[e].id) {
                                unseen = data.shows[e].unseen[0];
                            }
                            else {
                                for (let u = 0; u < len; u++) {
                                    if (container.data('showId') == data.shows[u].id) {
                                        unseen = data.shows[u].unseen[0];
                                        break;
                                    }
                                }
                            }
                            if (unseen && container.data('code') !== unseen.code.toLowerCase()) {
                                if (Base.debug) console.log('Episode à mettre à jour', unseen);
                                // Mettre à jour l'épisode
                                let mainLink = $('a.mainLink', container), text = unseen.code + ' - ' + unseen.title;
                                // On met à jour le titre et le lien de l'épisode
                                mainLink.attr('href', mainLink.attr('href').replace(/s\d{2}e\d{2}/, unseen.code.toLowerCase()));
                                mainLink.attr('title', `Accéder à la fiche de l'épisode ${text}`);
                                mainLink.text(text);
                                // On met à jour la date de sortie
                                $('.date .mainTime', container).text(unseen.date.format('dd mmmm yyyy'));
                                // On met à jour la synopsis
                                $('.m_s p.m_ay', container).html(unseen.description);
                                // On met à jour la barre de progression
                                $('.media-left > .m_ab > .m_ag', container).css('width', String(unseen.show.progress) + '%');
                                // On met à jour la note
                                renderNote(unseen.note.mean, container);
                            }
                            else {
                                console.log('Episode Show unchanged', unseen);
                            }
                        }
                        fnLazy();
                        self.addClass('finish');
                        if (Base.debug) console.groupEnd();
                    }, (err) => {
                        system.notification('Erreur de mise à jour des épisodes', 'updateAgenda: ' + err);
                        if (Base.debug) console.groupEnd();
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
                renderStars
                    .empty()
                    .attr('title', `${parseFloat(note).toFixed(1)} / 5`)
                    .append(Note.renderStars(note));
            }
            /**
             * Permet de construire le container d'un episode
             * @param  {Object} unseen Correspond à l'objet Episode non vu
             * @return {String}
             */
            function buildContainer(unseen) {
                let description = unseen.description;
                if (description.length <= 0) {
                    description = 'Aucune description';
                }
                else if (description.length > 145) {
                    description = description.substring(0, 145) + '…';
                }
                const urlShow = unseen.resource_url.replace('episode', 'serie').replace(/\/s\d{2}e\d{2}$/, '');
                let template = `
                <div class="a6_ba displayFlex justifyContentSpaceBetween" style="opacity: 1; transition: opacity 300ms ease-out 0s, transform;">
                  <div class="a6_a8 ComponentEpisodeContainer media">
                    <div class="media-left">
                      <img class="js-lazy-image greyBorder a6_a2" data-src="https://api.betaseries.com/pictures/shows?key=${betaseries_api_user_key}&id=${unseen.show.id}&width=119&height=174" width="119" height="174" alt="Affiche de la série ${unseen.show.title}">
                    </div>
                    <div class="a6_bc media-body alignSelfStretch displayFlex flexDirectionColumn">
                      <div class="media">
                        <div class="media-body minWidth0 alignSelfStretch displayFlex flexDirectionColumn alignItemsFlexStart">
                          <a class="a6_bp displayBlock nd" href="${urlShow}" title="${trans("agenda.episodes_watch.show_link_title", { title: unseen.show.title })}">
                            <strong>${unseen.show.title}</strong>
                          </a>
                          <a class="a6_bp a6_ak mainLink displayBlock nd" href="${unseen.resource_url}" title="${trans("agenda.episodes_watch.episode_link_title", { code: unseen.code.toUpperCase(), title: unseen.title })}">${unseen.code.toUpperCase()} - ${unseen.title}</a>
                          <div class="date displayFlex a6_bv">
                            <time class="mainTime">${unseen.date.format('dd mmmm yyyy')}</time>
                            <span class="stars" title=""></span>
                          </div>
                        </div>
                        <div class="a6_bh media-right" data-tour="step: 6; title: ${trans("tourguide.series-agenda.6.title")}; content: ${trans("tourguide.series-agenda.6.content")};">
                          <div class="displayFlex alignItemsCenter">
                            <button type="button" class="btn-reset alignSelfCenter ij_il ij_in"></button>
                          </div>
                        </div>
                      </div>
                      <p class="a6_bt" style="margin: 11px 0px 10px;">${description}</p>
                      <div class="media">
                        <div class="media-left alignSelfCenter">
                          <div class="a6_bj">
                            <div class="a6_bn" style="width: ${unseen.show.progress}%;"></div>
                          </div>
                        </div>
                        <div class="media-body alignSelfCenter displayFlex flexDirectionColumn alignItemsFlexStart">
                          <span class="a6_bl">${secondsToDhms(unseen.show.minutes_remaining * 60)} (${unseen.show.remaining} ép.)</span>
                        </div>
                      </div>
                      <div class="media" style="margin-top: 9px;">
                        <div class="media-body alignSelfCenter">
                          <div class="listAvatars listAvatars--small marginTopAuto">${watchedAvatar(unseen.watched_by)}</div>
                        </div>
                        <div class="a6_aq media-right alignSelfCenter positionRelative" data-tour="step: 5; title: Masquer un épisode; content: Si vous le souhaitez, choisissez de masquer cet épisode de votre liste d’épisodes à regarder ou retrouvez-en les sous-titres.;">
                          <div class="displayFlex">`;
                if (unseen.subtitles.length > 0) {
                    template += `
                            <div class="svgContainer a6_0">
                              <svg class="SvgSubtitles" width="20" height="16" viewBox="0 0 20 16" xmlns="http://www.w3.org/2000/svg">
                                <g fill="none">
                                  <path d="M2.083.751c2.389-.501 5.028-.751 7.917-.751 2.939 0 5.619.259 8.04.778.75.161 1.342.736 1.524 1.481.29 1.188.435 3.102.435 5.742s-.145 4.554-.435 5.742c-.182.745-.774 1.32-1.524 1.481-2.421.518-5.101.778-8.04.778-2.89 0-5.529-.25-7.917-.751-.734-.154-1.321-.706-1.519-1.43-.376-1.375-.564-3.315-.564-5.819s.188-4.443.564-5.819c.198-.724.784-1.276 1.519-1.43z"></path>
                                  <path class="SvgSubtitles__stroke" stroke="#C1E1FA" d="M2.237 1.485c-.459.096-.825.441-.949.894-.356 1.3-.538 3.178-.538 5.621 0 2.443.182 4.321.538 5.621.124.452.49.797.949.894 2.336.49 4.923.735 7.763.735 2.889 0 5.516-.254 7.883-.761.469-.1.839-.46.953-.926.273-1.116.414-2.979.414-5.564 0-2.584-.141-4.447-.414-5.563-.114-.466-.484-.825-.953-.926-2.367-.507-4.995-.761-7.883-.761-2.84 0-5.428.246-7.763.735z"></path>
                                  <path class="SvgSubtitles__fill" fill="#C1E1FA" d="M4 7h12v2h-12zm2 3h8v2h-8z"></path>
                                </g>
                              </svg>
                            </div>`;
                }
                template += `
                          </div>
                        </div>
                        <div class="media-right alignSelfCenter positionRelative" style="min-height: 24px;">
                          <div class="positionRelative">
                            <div class="btn-group">
                              <button id="dropdownSubtitle-8899" role="button" aria-haspopup="true" aria-expanded="false" type="button" class="a6_as btn-reset dropdown-toggle -toggle btn btn-default">
                                <span class="svgContainer">
                                  <svg fill="#999" width="4" height="16" viewBox="0 0 4 16" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill-rule="nonzero" fill="inherit"></path>
                                  </svg>
                                </span>
                                <span class="caret"></span>
                              </button>
                              <ul role="menu" class="-menu" aria-labelledby="dropdownSubtitle-8899"></ul>
                            </div>
                            <div class="dropdown-menu dropdown-menu--topRight ho_hy" aria-labelledby="dropdownSubtitle-8899" style="top: 0px;">
                              <div class="sousTitres">
                                <div class="ho_hu">
                                  <button type="button" class="ho_g btn-reset btn-btn btn--grey">Ne pas regarder cet épisode</button>
                                  <button type="button" class="ho_g btn-reset btn-btn btn-blue2">J'ai récupéré cet épisode</button>
                                </div>
                                ${renderSubtitles(unseen)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                `;
                return template;
                function watchedAvatar(friends) {
                    let template = '', friend;
                    for (let f = 0; f < friends.length; f++) {
                        friend = friends[f];
                        template += `
                            <a href="/membre/${friend.login}" class="listAvatar">
                              <img class="js-lazy-image" data-src="https://api.betaseries.com/pictures/members?key=${betaseries_api_user_key}&id=${friend.id}&width=24&height=24&placeholder=png" width="24" height="24" alt="Avatar de ${friend.login}">
                            </a>`;
                    }
                    return template;
                }
                function secondsToDhms(seconds) {
                    seconds = Number(seconds);
                    const d = Math.floor(seconds / (3600 * 24)),
                          h = Math.floor(seconds % (3600 * 24) / 3600),
                          m = Math.floor(seconds % 3600 / 60);
                    //s = Math.floor(seconds % 60);
                    let dDisplay = d > 0 ? d + ' j ' : '',
                        hDisplay = h > 0 ? h + ' h ' : '',
                        mDisplay = m >= 0 && d <= 0 ? m + ' min' : '';
                    //sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
                    return dDisplay + hDisplay + mDisplay;
                }
                function renderSubtitles(unseen) {
                    if (unseen.subtitles.length <= 0) return '';
                    let template = `
                        <div>
                            <div class="ho_gh ComponentTitleDropdown">Sous-titres de l'épisode</div>
                            <div style="display: grid; row-gap: 5px;">
                                <div class="maxHeight280px overflowYScroll">
                                    <div>`;
                    let subtitle;
                    for (let st = 0; st < unseen.subtitles.length; st++) {
                        subtitle = unseen.subtitles[st];
                        if (st > 0) template += '<div style="margin-top: 5px;">';
                        template += `
                            <div style="align-items: center; display: flex; justify-content: flex-start;">
                              <div class="svgContainer">
                                <svg class="SvgPertinence" fill="#EEE" width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                                  <rect fill="${subtitle.quality >= 1 ? '#999' : 'inherit'}" x="0" y="10" width="4" height="6"></rect>
                                  <rect fill="${subtitle.quality >= 3 ? '#999' : 'inherit'}" x="6" y="5" width="4" height="11"></rect>
                                  <rect fill="${subtitle.quality >= 5 ? '#999' : 'inherit'}" x="12" y="0" width="4" height="16"></rect>
                                </svg>
                              </div>
                              <div class="ComponentLang" style="border: 1px solid currentcolor; border-radius: 4px; color: rgb(51, 51, 51); flex-shrink: 0; font-size: 10px; font-weight: 700; height: 18px; line-height: 17px; margin: 0px 10px 0px 5px; min-width: 22px; padding: 0px 3px; text-align: center;">${subtitle.language}</div>
                              <div class="minWidth0" style="flex-grow: 1;">
                                <a href="${subtitle.url}" class="displayBlock mainLink nd" title="Provenance : ${subtitle.source} / ${subtitle.file} / Ajouté le ${subtitle.date.format('dd/mm/yyyy')}" style="max-width: 365px; margin: 0px; font-size: 12px;">
                                  ${ellipsisSubtitles(subtitle)}
                                </a>
                              </div>
                              <button title="Signaler ce sous-titre" type="button" class="btn-reset" onclick="srtInaccurate(${subtitle.id});">
                                <span class="svgContainer">
                                  <svg fill="#eee" width="22" height="19" viewBox="0 0 22 19" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 19h22l-11-19-11 19zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill-rule="nonzero" fill="inherit"></path>
                                  </svg>
                                </span>
                              </button>
                            </div>
                            `;
                    }
                    template += `
                          </div>
                        </div>
                      </div>
                    </div>
                    `;
                    function ellipsisSubtitles(subtitle) {
                        let subtitleName = subtitle.file, LIMIT_ELLIPSIS = 50;
                        if (subtitleName.length <= LIMIT_ELLIPSIS) {
                            return `<div class="nd displayInlineBlock">${subtitleName}</div>`;
                        }
                        let LENGTH_LAST_ELLIPSIS = 45;
                        return `
                          <div>
                            <div class="nd displayInlineBlock" style="max-width: 40px;">${subtitleName}</div>
                            <div class="nd displayInlineBlock">${subtitleName.slice(-LENGTH_LAST_ELLIPSIS)}</div>
                          </div>
                        `;
                    }
                    return template;
                }
            }
        }
    };
    const movies = {
        updateAgenda: function() {
            // Les containers
            let $containersMovie = $('#reactjs-movies-to-watch .ComponentEpisodeContainer'),
                len = $containersMovie.length;
            // En attente du chargement des épisodes
            if (len <= 0) {
                if (Base.debug) console.log('updateAgenda - nb containers: %d', len);
                return;
            }
            const params = {
                limit: len,
                state: 0
            };
            Base.callApi('GET', 'movies', 'member', params)
            .then((data) => {
                for (let t = 0; t < len; t++) {
                    $($containersMovie.get(t))
                        .data('movieId', data.movies[t].id)
                        .find('.stars').attr('title', data.movies[t].notes.mean.toFixed(2) + ' / 5');
                }
            });
        }
    };
    const api = {
        /**
         * Ajoute des améliorations sur la page de la console de l'API
         */
        updateApiConsole: function() {
            // Listener sur le btn nouveau paramètre
            $('div.form-group button.btn-btn.btn--blue').prop('onclick', null).off('click').on('click', (e, key) => {
                e.stopPropagation();
                e.preventDefault();
                if (Base.debug) console.log('nouveau parametre handler', key);
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
                $('#result').hide();
                $('.toggle i').removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
                // On supprime tous les paramètres existants
                $('#api-params .remove').remove();
                $('#doc').empty();
                // En attente de la documentation de l'API
                system.waitDomPresent('#doc code', () => {
                    let paramsDoc = $('#doc > ul > li > code');
                    if (Base.debug) console.log('paramsDoc', paramsDoc);
                    paramsDoc.css('cursor', 'pointer');
                    // On ajoute la clé du paramètre dans une nouvelle ligne de paramètre
                    paramsDoc.click((e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        $('div.form-group button.btn-btn.btn--blue').trigger('click', [$(e.currentTarget).text().trim()]);
                    });
                });
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
                $('.remove-input').on('click', (e) => {
                    $(e.currentTarget).parent('.api-params').remove();
                });
                $('.lock-param', elts).on('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    let self = $(e.currentTarget);
                    if (Base.debug) console.log('lock-param', self, self.hasClass('fa-unlock'));
                    if (self.hasClass('fa-unlock')) {
                        self.removeClass('fa-unlock').addClass('fa-lock');
                        self.parent('.api-params').removeClass('remove').addClass('lock');
                    }
                    else {
                        self.removeClass('fa-lock').addClass('fa-unlock');
                        self.parent('.api-params').addClass('remove').removeClass('lock');
                    }
                });
            }
            function addToggleShowResult() {
                let $result = $('#result');
                // On ajoute un titre pour la section de résultat de la requête
                $result.before('<h2>Résultat de la requête <span class="toggle" style="margin-left:10px;"><i class="fa fa-chevron-circle-down" aria-hidden="true"></i></span></h2>');
                $('.toggle').on('click', () => {
                    // On réalise un toggle sur la section de résultat et on modifie l'icône du chevron
                    $result.toggle(400, () => {
                        if ($result.is(':hidden')) {
                            $('.toggle i').removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down');
                        }
                        else {
                            $('.toggle i').removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
                        }
                    });
                });
                // On modifie le sens du chevron lors du lancement d'une requête
                $('button.is-full').on('click', () => {
                    $('.toggle i').removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
                });
            }
        },
        /**
         * Ajoute un sommaire sur les pages de documentation des méthodes de l'API
         * Le sommaire est constitué des liens vers les fonctions des méthodes.
         */
        sommaireDevApi: function() {
            if (Base.debug) console.log('build sommaire');
            let titles = $('.maincontent h2'), methods = {};
            // Ajout du style CSS pour les tables
            system.addScriptAndLink('tablecss');
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
                    cell += `<i data-id="${methods[key][verb].id}"
                                class="linkSommaire fa fa-check fa-2x"
                                title="${methods[key][verb].title}"></i>`;
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
                let row = `<tr><th scope="row" class="fonction">${methods[key].title}</th>`;
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
                let $table = $(`
                    <style>i.fa {cursor: pointer;margin-left: 10px;}</style>
                    <div id="sommaire" class="table-responsive" style="display:none;">
                        <table class="table table-dark table-striped table-bordered">
                            <thead class="thead-dark">
                                <tr>
                                    <th colspan="5" scope="col" class="col-lg-12 liTitle">
                                        Sommaire <i class="fa fa-chevron-circle-up" aria-hidden="true" title="Fermer le sommaire"></i>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="col" class="col-lg-3">Fonction</th>
                                    <th scope="col" class="col-lg-2">GET</th>
                                    <th scope="col" class="col-lg-2">POST</th>
                                    <th scope="col" class="col-lg-2">PUT</th>
                                    <th scope="col" class="col-lg-2">DELETE</th>
                                </tr>
                            </tbody>
                        </table>
                    </div>`), $tbody = $table.find('tbody');
                for (let key in methods) {
                    $tbody.append(buildRow(key));
                }
                return $table;
            }
            for (let t = 0; t < titles.length; t++) {
                // ajouter les ID aux titres des methodes, ainsi qu'un chevron pour renvoyer au sommaire
                let $title = $(titles.get(t)), id = $title.text().trim().toLowerCase().replace(/ /, '_').replace(/\//, '-'), txt = $title.text().trim().split(' ')[1], desc = $title.next('p').text(), key = txt.toLowerCase().replace(/\//, ''), verb = $title.text().trim().split(' ')[0].toUpperCase();
                $title.attr('id', id);
                $title.append('<i class="fa fa-chevron-circle-up" aria-hidden="true" title="Retour au sommaire"></i>');
                if (!(key in methods)) methods[key] = { title: txt };
                methods[key][verb] = { id: id, title: desc };
            }
            // Construire un sommaire des fonctions
            //if (Base.debug) console.log('methods', methods);
            $('.maincontent h1').after(buildTable());
            $('#sommaire').slideDown();
            $('.linkSommaire').on('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                $('#' + $(e.currentTarget).data('id')).get(0).scrollIntoView(true);
            });
            $('h2 .fa-chevron-circle-up').on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                document.getElementById('sommaire').scrollIntoView(true);
            });
            $('#sommaire .fa-chevron-circle-up').on('click', e => {
                e.stopPropagation();
                e.preventDefault();
                const $tbody = $('#sommaire table tbody');
                // On réalise un toggle sur la section de résultat et on modifie l'icône du chevron
                $tbody.slideToggle(600, 'swing', () => {
                    if ($tbody.is(':hidden')) {
                        $(e.currentTarget).removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down');
                    }
                    else {
                        $(e.currentTarget).removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
                    }
                });
            });
        }
    };
    const articles = {
        /**
         * Ajoute l'event click sur les liens d'une page article
         */
        checkArticle: function() {
            $('a').on('click', () => {
                $('a').off('click');
                console.log('Event click', origin, url, window.location.pathname);
                if (window.history.state != state) {
                    console.log('on a changé de page');
                    state = window.history.state;
                    setTimeout(noop, 0);
                    if (/^\/article\//.test(location.pathname))
                        articles.addPopupOnLinks();
                        articles.checkArticle();
                }
            });
        },
        /**
         * Ajoute des popups pour visualiser les fiches des séries
         * et des films lors du survol des liens dans les articles
         */
        addPopupOnLinks: function() {
            system.addScriptAndLink(['popover', 'bootstrap'], () => {
                system.waitDomPresent('.blogArticleMain .blogArticleContent a', () => {
                    const $article = $('.blogArticleMain .blogArticleContent');
                    let $links = $article.find('a');
                    if (Base.debug) console.log('links(%d) before filter', $links.length);
                    $links = $links.filter(function() {
                        // console.log('filter', this);
                        if (this.onclick !== null) return false;
                        return /^\/(serie|film)\//.test(this.pathname);
                    });
                    if (Base.debug) console.log('links(%d) after filter', $links.length);
                    let popups = {};
                    $('head').append(`
                        <style type="text/css">
                            .popover { min-width: 350px !important; }
                            .popover .popover-header { margin-top: 0; display: block; }
                            .popover .popover-body { padding-top: 0; }
                            .popover .popover-body .media .mainTime { color: #212529; }
                            .popover .popover-body .media p { font-size: 13px; }
                        </style>
                    `);
                    const createMedia = function(link) {
                        const url = link.href.substring(link.href.lastIndexOf('/') + 1);
                        return new Promise((resolve) => {
                            if (/^\/serie\//.test(link.pathname)) {
                                Show.fetchByUrl(url).then(show => {
                                    resolve({
                                        title: '<i class="fa fa-film" aria-hidden="true"></i> Détails de la série',
                                        html: `
                                        <div class="media">
                                            <div class="media-left">
                                                <img src="${show.images.poster}" alt="${show.title}" width="119" height="174">
                                            </div>
                                            <div class="media-body">
                                                <div class="blogThumbnailShowTitle mainLink">
                                                    ${show.title} ${show.in_account ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>': '<i class="fa fa-square-o" aria-hidden="true"></i>'}
                                                </div>
                                                <div class="display">
                                                    <div>${show.seasons.length} saisons - ${show.nbEpisodes} épisodes</div>
                                                    <div>Statut: ${show.isEnded() ? 'Terminé' : 'En cours'}</div>
                                                    <time class="mainTime" datetime="${show.creation}">${show.creation}</time>
                                                    <div class="stars" title="${show.objNote.total} votes: ${show.objNote.mean.toFixed(2)} / 5">${Note.renderStars(show.objNote.mean)}</div>
                                                </div>
                                                <div>${show.description.substring(0, 150)}...</div>
                                            </div>
                                        </div>`
                                    });
                                });
                            } else {
                                // Récupérer l'ID du film
                                const movieId = url.match(/^(\d+)/)[1];
                                Movie.fetch(movieId, true).then(movie => {
                                    resolve({
                                        title: '<i class="fa fa-film" aria-hidden="true"></i> Détails du film',
                                        html: `
                                        <div class="media">
                                            <div class="media-left">
                                                <img src="${movie.poster}" alt="${movie.title}" width="119" height="174">
                                            </div>
                                            <div class="media-body">
                                                <div class="blogThumbnailShowTitle mainLink">
                                                    ${movie.title} ${movie.user.status === 1 ? '<i class="fa fa-check-square-o" aria-hidden="true"></i>': '<i class="fa fa-square-o" aria-hidden="true"></i>'}
                                                </div>
                                                <div class="display">
                                                    <time class="mainTime" datetime="${movie.release_date.format('yyyy-mm-dd')}">${movie.release_date.format('dd mmmm yyyy')}</time>
                                                    <div class="stars" title="${movie.objNote.total} votes: ${movie.objNote.mean.toFixed(2)} / 5">${Note.renderStars(movie.objNote.mean)}</div>
                                                </div>
                                                <div>${movie.description.substring(0, 150)}...</div>
                                            </div>
                                        </div>`
                                    });
                                });
                            }
                        });
                    }
                    const addPopup = (anchor) => {
                        let key = anchor.text().toLowerCase().trim().replace(/[^0-9a-z]/g, '');
                        if (popups[key] == undefined) {
                            popups[key] = createMedia(anchor.get(0));
                        }
                        if (Base.debug) console.log('Popup created', anchor.text(), typeof popups[key]);
                        if (popups[key] instanceof Promise) {
                            popups[key].then(data => {
                                // console.log('Promise popus[%s]', key, data);
                                anchor.popover({
                                    container: anchor,
                                    delay: { "show": 500, "hide": 100 },
                                    html: true,
                                    content: data.html,
                                    placement: 'bottom',
                                    template: templatePopover,
                                    title: data.title,
                                    trigger: 'hover'
                                });
                                popups[key] = data;
                            });
                        } else {
                            // console.log('Object popup[%s]', key, popups[key]);
                            anchor.popover({
                                container: anchor,
                                delay: { "show": 500, "hide": 100 },
                                html: true,
                                content: popups[key].html,
                                placement: 'bottom',
                                template: templatePopover,
                                title: popups[key].title,
                                trigger: 'hover'
                            });
                        }
                        anchor.on('inserted.bs.popover', function () {
                            const positions = anchor.position();
                            $('.popover')
                                .css('top', positions.top + 30)
                                .css('left', positions.left)
                                .css('cursor', 'initial')
                                .click((e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                });
                        });
                    }
                    for (let l = 0; l < $links.length; l++) {
                        addPopup($($links.get(l)));
                    }
                }, 10, 500);
            });
        }
    };

    const cache = new CacheUS();

    /**
     * dbGetValue - Permet de récuperer des données partagées
     * @param {string} key - La clé d'identification des données souhaitées
     * @param {object|number|string} defaults - La valeur par défaut
     * @returns {object}
     */
    const dbGetValue = async function(key, defaults) {
        if (!key) {
            throw new Error('dbGetValue - key are missing');
        }
        if (!system.userIdentified()) {
            return GM_getValue(key, defaults);
        }
        if (Base.networkState === NetworkState.offline) {
            if (cache.has(DataTypesCache.db, key)) {
                return cache.get(DataTypesCache.db, key);
            }
            return null;
        }
        const url = `${serverBaseUrl}/db/get/${key}`;
        const paramsReq = {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Accept': 'application/json',
                'x-betaseries-user': betaseries_user_id
            }
        };

        const resp = await fetch(url, paramsReq);
        if (!resp.ok) {
            throw new Error('dbGetValue error connection server');
        }
        const result = await resp.json();
        if (result && result.error) {
            throw new Error('dbGetValue error result: ' + result.error);
        } else if (result.data === null) {
            return defaults;
        }
        cache.set(DataTypesCache.db, key, result.data);
        return result.data;
    };

    /** @type {Record<string, any>} */
    const dbPendingRequests = {};

    /**
     * dbSetValue - Permet de stocker des données partagées
     * @param   {string} key - La clé d'identification des données
     * @param   {object|number|string} data - Les données à sauvegarder
     * @returns {boolean}
     */
    const dbSetValue = async function(key, data) {
        if (!key || !data) {
            throw new Error('dbSetValue - key or data are missing');
        }
        if (!system.userIdentified()) {
            GM_setValue(key, data);
            return true;
        }
        cache.set(DataTypesCache.db, key, data);
        if (Base.networkState === NetworkState.offline) {
            dbPendingRequests[key] = data;
            return true;
        }
        let url = `${serverBaseUrl}/db/save/${key}`;
        const paramsReq = {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'x-betaseries-user': betaseries_user_id
            },
            body: JSON.stringify(data)
        };
        const resp = await fetch(url, paramsReq);
        if (!resp.ok) {
            throw new Error('dbSetValue error connection server');
        }
        const result = await resp.json();
        if (result && result.error) {
            throw new Error('dbSetValue error result: ' + result.error);
        }
        return result.save;
    }

    /**
     * Dialog - Classe servant à manipuler une boîte de dialogue
     * pour y afficher des informations
     * @class
     */
    class Dialog {
        /** @type {HTMLElement} */
        _dialog;
        /** @type {HTMLElement} */
        _html;
        /** @type {JQuery<HTMLElement>} */
        _$content;
        /** @type {JQuery<HTMLElement>} */
        _$title;
        /** @type {JQuery<HTMLElement>} */
        _$counter;
        /** @type {JQuery<HTMLElement>} */
        _$style;
        /** @type {JQuery<HTMLElement>} */
        _$overlay;
        /** @type {JQuery<HTMLElement>} */
        _$btnClose;
        /**
         * @type {object}
         * @property {function} onShow - Fonction de callback perso à l'affichage de la popup
         * @property {function} onHide - Fonction de callback perso au masquage de la popup
         */
        _callbacks = {onShow: null, onHide: null};

        /**
         * Constructeur de la classe Dialog
         * @param {object}          options -          Options à fournir à la popup
         * @param {function|number} options.counter -  Le compteur d'appels à l'API
         * @param {string}          options.dialog -   Le sélecteur CSS de la boîte de dialogue
         * @param {string}          options.template - La template de la boîte de dialogue
         */
        constructor(options) {
            this.settings = Object.assign({}, options);
            this._html = document.documentElement;
            if (this.settings.template) {
                this.template = this.settings.template;
            }
        }
        /**
         * Fonction de callback après ouverture de la popup
         * @callback
         * @private
         */
        _onShow() {
            if (this.settings.counter && typeof this.settings.counter === 'function') {
                this.setCounter(this.settings.counter());
            }
            this._html.style.overflowY = 'hidden';
            this._dialog
                .css('z-index', '1005')
                .css('overflow', 'scroll');
            this._$btnClose.on('click', this.close.bind(this));
            this._$overlay.on('click', this.close.bind(this));
            document.addEventListener("keydown", this._bindKeypress);
            $('.js-lazy-image', this._dialog).lazyload(optionsLazyload);
            if (typeof this._callbacks.onShow === 'function') this._callbacks.onShow();
        }
        /**
         * Fonction liée à l'event keypress
         * @param {Event} e - Event keypress
         * @private
         */
        _bindKeypress(e) {
            e.stopPropagation();
            // console.log('_bindKeypress', this, e);
            if (27 === e.which) {
                e.preventDefault();
                this.close();
            }
        }
        /**
         * Fonction de callback après fermeture de la popup
         * @callback
         * @private
         */
        _onHide() {
            if (typeof this._callbacks.onHide === 'function') this._callbacks.onHide();
            this._html.style.overflowY = '';
            this._dialog
                .css('z-index', '0')
                .css('overflow', 'none');
            this._$btnClose.off('click');
            this._$overlay.off('click');
            this._dialog.off('keypress');
            document.removeEventListener("keydown", this._bindKeypress);
            $('style.temp', this._dialog).remove();
        }
        /**
         * Fonction d'initialisation de la popup
         * @returns {Dialog}
         * @private
         */
        _init() {
            this._dialog = this.settings.dialog !== undefined ? $(this.settings.dialog) : $('#dialog-resource');
            if (this._dialog.length <= 0) {
                $('body').prepend(this.template);
                this._dialog = this.settings.dialog !== undefined ? $(this.settings.dialog) : $('#dialog-resource');
            }
            this._$content = $('.dialog-content > .content', this._dialog);
            this._$title = $('.dialog-content > h1 .blockTitle', this._dialog);
            this._$counter = $('.dialog-content > h1 .counter', this._dialog);
            this._$style = $('style', this._dialog);
            this._$overlay = $('.dialog-overlay', this._dialog);
            this._$btnClose = $('button.close', this._dialog);
            this._bindKeypress = this._bindKeypress.bind(this);
            this._onHide = this._onHide.bind(this);
            this._onShow = this._onShow.bind(this);
            return this;
        }
        /**
         * Fonction servant à masquer la popup
         * @param   {function} [cb] - Fonction de callback
         * @returns {Dialog}
         */
        close(cb) {
            if (cb) this._callbacks.onHide = cb;
            this._dialog.hide('fast', this._onHide);
            return this;
        }
        /**
         * Fonction servant à afficher la popup
         * @param   {function} [cb] - Fonction de callback
         * @returns {Dialog}
         */
        show(cb) {
            if (cb) this._callbacks.onShow = cb;
            this._dialog.show('slow', this._onShow);
            return this;
        }
        /**
         * Définit le nombre d'appels à l'API BetaSeries
         * Le compteur est affiché dans le titre de la popup
         * @param   {number} counter - Nombre d'appels à l'API
         * @returns {Dialog}
         */
        setCounter(counter) {
            this._$counter.text(counter);
            return this;
        }
        /**
         * Définit le contenu HTML de la popup
         * @param   {string} content - Le contenu HTML de la popup
         * @returns {Dialog}
         */
        setContent(content) {
            this._$content.html(content);
            return this;
        }
        /**
         * Définit le titre de la popup
         * @param   {string} title - Le titre de la popup
         * @returns {Dialog}
         */
        setTitle(title) {
            this._$title.text(title);
            return this;
        }
        /**
         * Permet d'ajouter du code CSS à la popup
         * @param   {string} style - Le code CSS à ajouter dans une balise style
         * @returns {Dialog}
         */
        addStyle(style) {
            this._$style.after(`<style class="temp">${style}</style>`);
            return this;
        }
        template = `
            <div
                class="dialog dialog-container table-dark"
                id="dialog-resource"
                aria-labelledby="dialog-resource-title"
                style="display:none;"
            >
                <style>
                    .dialog-container .close {
                        float: right;
                        font-size: 1.5rem;
                        font-weight: 700;
                        line-height: 1;
                        color: #fff;
                        text-shadow: 0 1px 0 #fff;
                        opacity: .5;
                        margin-right: 20px;
                    }
                    .dialog-container .close:hover {color: #000;text-decoration: none;}
                    .dialog-container .close:not(:disabled):hover, .close:not(:disabled):focus {opacity: .75;}
                    .dialog-container button.close {padding: 0;background-color: transparent;border: 0;}
                    .dialog-container .counter {margin-left: 15px;}
                    .dialog-container .counter, .dialog-container .suffixCounter {font-size:0.8em;}
                </style>
                <div class="dialog-overlay"></div>
                <div class="dialog-content" role="document" style="width: 80%;">
                <h1 id="dialog-resource-title"><span class="blockTitle">Données de la ressource</span>
                    <span class="counter"></span> <span class="suffixCounter">appels à l'API</span>
                    <button type = "button"
                            class = "close"
                            aria-label = "Close"
                            title = "Fermer la boîte de dialogue">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </h1>
                <div class="data-resource content"></div>
                </div>
            </div>
        `;
    }

    /**
     * Paramétrage de la super classe abstraite Base et UpdateAuto
     */
    Base.debug = debug;
    Base.cache = cache;
    Base.notification = system.notification;
    Base.userIdentified = system.userIdentified;
    Base.token = typeof betaseries_api_user_token !== 'undefined' ? betaseries_api_user_token : null;
    Base.userKey = typeof betaseries_api_user_key !== 'undefined' ? betaseries_api_user_key : null;
    Base.userId = typeof betaseries_user_id !== 'undefined' ? parseInt(betaseries_user_id, 10) : null;
    Base.trans = trans;
    Base.ratings = ratings;
    Base.themoviedb_api_user_key = themoviedb_api_user_key;
    Base.serverBaseUrl = serverBaseUrl;
    Base.serverOauthUrl = serverOauthUrl;
    Base.theme = system.checkThemeStyle();
    Base.gm_funcs.getValue = dbGetValue;
    Base.gm_funcs.setValue = dbSetValue;

    unsafeWindow.addEventListener('offline', () => {
        console.log('userscript Event Network Offline');
        Base.changeNetworkState(NetworkState.offline);
        UpdateAuto.getInstance().then(updateAuto => {
            updateAuto.stop();
        });
    });
    unsafeWindow.addEventListener('online', () => {
        console.log('userscript Event Network Online');
        Base.changeNetworkState(NetworkState.online);
        UpdateAuto.getInstance().then(updateAuto => {
            if (updateAuto.auto) updateAuto.launch();
        });
        if (dbPendingRequests.length > 0) {
            for (const key of Object.keys(dbPendingRequests)) {
                dbSetValue(key, dbPendingRequests[key]);
            }
        }
    });

    /**
     * Initialization du script
     */
    system.init();

    // Fonctions appeler pour les pages des series, des films et des episodes
    if (/^\/(serie|film|episode)\/.*/.test(url)) {
        system.addScriptAndLink('renderjson');
        // On récupère d'abord la ressource courante pour instancier un objet Media
        medias.getResource(true).then((objRes) => {
            if (debug) {
                console.log('objet resource Media(%s)', objRes.constructor.name, objRes);
                medias.addBtnDev(); // On ajoute le bouton de Dev
            }
            system.removeAds(); // On retire les pubs
            medias.similarsViewed(objRes); // On s'occupe des ressources similaires
            // objRes.decodeTitle(); // On décode le titre de la ressource
            // objRes.addNumberVoters(); // On ajoute le nombre de votes à la note
            // objRes.objNote.updateStars(); // On met à jour l'affichage de la note
            medias.upgradeSynopsis(); // On améliore le fonctionnement de l'affichage du synopsis
            medias.comments(objRes); // On modifie le fonctionnement de l'affichage des commentaires
            medias.addBtnToSee();
            members.lastSeen();
            medias.replaceVoteFn(objRes);
            medias.checkPoster(objRes);
            if (/^\/serie\//.test(url)) {
                objRes.addRating(); // On ajoute la classification TV de la ressource courante
                // .blockInformations .blockInformations__action .dropdown-menu a:nth-child(1)
                $('.blockInformations .blockInformations__action .dropdown-menu a.header-navigation-item')
                    .first().attr('target', '_blank');
                // On ajoute la gestion des épisodes
                medias.waitSeasonsAndEpisodesLoaded(() => medias.upgradeEpisodes(objRes));
                medias.upgradeSeasonsActions(objRes);
                medias.proposePlatform(objRes);
                medias.checkNextEpisode(objRes);
                medias.upgradeActors(objRes);
            }
            else if (/^\/film\//.test(url)) {
                medias.observeBtnVu(objRes); // On modifie le fonctionnement du btn Vu
            }
        });
    }
    // Fonctions appeler pour la page de gestion des series du membre
    else if (/^\/membre\/.*\/series$/.test(url)) {
        members.addStatusToGestionSeries().then((shows) => {
            Base.shows = shows;
            members.sortGestionSeries();
        });
        medias.addBtnToSee();
        members.lastSeen();
    }
    // Fonctions appeler sur les pages des membres
    else if (system.userIdentified() && (regexUser.test(url) || /^\/membre\/[A-Za-z0-9]*\/amis$/.test(url))) {
        system.waitPresent(() => { return typeof user !== 'undefined'; }, () => {
            if (debug) console.log('regexUser OK');

            if (regexUser.test(url)) {
                // On récupère les infos du membre connecté
                members.getMember()
                    .then(function (member) {
                    currentUser = member;
                    let login = url.split('/')[2];
                    // On ajoute la fonction de comparaison des membres
                    if (currentUser && login != currentUser.login) {
                        members.compareMembers();
                    }
                });
            }
            else if (!url.includes(user.login)) {
                members.searchFriends();
            }
        });
        medias.addBtnToSee();
        members.lastSeen();
    }
    // Fonctions appeler sur les pages de documentation de l'API
    else if (/^\/api/.test(url)) {
        if (/\/methodes/.test(url)) {
            api.sommaireDevApi();
        }
        else if (/\/console/.test(url)) {
            api.updateApiConsole();
        }
    }
    // Fonctions appeler sur la page de recherche des séries
    else if (/^\/series\//.test(url)) {
        if (Base.debug) console.log('Page des séries');
        system.waitPagination();
        series.seriesFilterPays();
        if (/agenda/.test(url)) {
            system.waitDomPresent('#reactjs-episodes-to-watch .ComponentEpisodeContainer', series.updateAgenda, 50, 1000);
        }
        series.addBtnToSee();
        members.lastSeen();
    }
    // Fonctions appeler sur la page de recherche des films
    else if (/^\/films\//.test(url)) {
        if (debug) console.log('Pages des films');
        system.waitPagination();
        medias.addBtnToSee();
        members.lastSeen();
        if (/agenda/.test(url)) {
            system.waitDomPresent('#reactjs-movies-to-watch .ComponentEpisodeContainer', movies.updateAgenda, 50, 1000);
        }
    }
    // Fonctions appeler sur les pages des articles
    else if (/^\/article\//.test(url)) {
        if (Base.debug) console.log('Page d\'un article');
        articles.checkArticle();
        articles.addPopupOnLinks();
        medias.addBtnToSee();
        members.lastSeen();
    }
};
/*
API: /timeline
types: [
    'film_del',
    'film_add',
    'del_serie',
    'add_serie',
    'markas', // Marquer un épisode
    'archive',
    'badge',
    'comment',
    'forum'
]
*/
const initFetch = {
    method: 'GET',
    headers: {
        accept: 'application/json'
    },
    mode: 'cors',
    cache: 'no-cache'
};
/*
 * Récupère le manifest des ressources pour le userscript
 */
fetch(`${serverBaseUrl}/config/betaseries/manifest.json`, initFetch)
.then(resp => {
    if (resp.ok) {
        return resp.json();
    }
    return null;
}).then(manifest => {
    if (!manifest) {
        return;
    }
    resources = manifest;
    const now = new Date().getTime();
    let loop = 0;
    let timerLaunch = setInterval(function() {
        if (loop++ > 150) { // timeout 30 seconds
            clearInterval(timerLaunch);
            console.warn('Le UserScript BetaSeries n\'a pas pu être lancé, car il manque jQuery');
            GM_notification({
                title: "Erreur Timeout UserScript BS",
                text: "Le userscript n'a pas pu être chargé, car jQuery n'est pas présent. Rechargez la page SVP",
                timeout: 30000
            });
            return;
        }
        if (typeof jQuery === 'undefined') { return; }
        clearInterval(timerLaunch);
        loadJS(`${serverBaseUrl}/js/app-bundle.js?t=${now}`, {
                integrity: sriBundle,
                crossOrigin: 'anonymous',
                referrerPolicy: 'no-referrer'
            }, () => launchScript(jQuery), (oError) => {
                GM_notification({
                    title: "Erreur chargement UserScript BS",
                    text: "Le userscript n'a pas pu être chargé, rechargez la page SVP",
                    timeout: 30000
                });
                throw new URIError("The script " + oError.target.src + " didn't load correctly.");
            }
        );
    }, 200);
});