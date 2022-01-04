// ==UserScript==
// @name         us_betaseries
// @namespace    https://github.com/Azema/betaseries
// @version      1.1.6
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
// @exclude      https://www.betaseries.com/membre/*/badges
// @match        https://www.betaseries.com/api/*
// @match        https://www.betaseries.com/article/*
// @icon         https://www.betaseries.com/images/site/favicon-32x32.png
// @require      https://cdnjs.cloudflare.com/ajax/libs/humanize-duration/3.27.0/humanize-duration.min.js#sha512-C6XM91cD52KknT8jaQF1P2PrIRTrbMzq6hzFkc22Pionu774sZwVPJInNxfHNwPvPne3AMtnRWKunr9+/gQR5g==
// @require      https://azema.github.io/betaseries-oauth/js/renderjson.min.js#sha384-ISyV9OQhfEYzpNqudVhD/IgzIRu75gnAc0wA/AbxJn+vP28z4ym6R7hKZXyqcm6D
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// ==/UserScript==
'use strict';

/* globals Base:false, CacheUS: false, Episode: false, Media: false, Movie: false, Show: false,
   UpdateAuto: false, EventTypes: false, HTTP_VERBS: false, MediaType: false, CommentBS: false,
   MovieStatus: false, Member: false, DataTypesCache: false, Note: false,

   betaseries_api_user_token:  true, betaseries_user_id: false, trans: false, lazyLoad: false, deleteFilterOthersCountries: false, generate_route: false,
   CONSTANTE_SORT: false, CONSTANTE_FILTER: false, hideButtonReset: false, newApiParameter: false, renderjson: false, humanizeDuration: false, A11yDialog: false,
   viewMoreFriends: false, bootstrap: false, PopupAlert: false, moment, faceboxDisplay: false
 */
/************************************************************************************************/
/*                               PARAMETRES A MODIFIER                                          */
/************************************************************************************************/
/* Ajouter ici votre clé d'API BetaSeries (Demande de clé API: https://www.betaseries.com/api/) */
let betaseries_api_user_key = '';
/* Ajouter ici votre clé d'API V3 à themoviedb */
let themoviedb_api_user_key = '';
/* Ajouter ici l'URL de base de votre serveur distribuant les CSS, IMG et JS */
const serverBaseUrl = 'https://azema.github.io/betaseries-oauth';
/* SRI du fichier app-bundle.js */
const sriBundle = 'sha384-oAo1484K59MKxWlqYkhW7jcF+vsmYxi9yTc+bbNnfPTiGoDMofNNTo3Uf2xtf85y';
/************************************************************************************************/

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
const loadCSS = function( href, before, media, attributes, callback, onerror ) {
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
    }
    else {
        const refs = ( doc.body || doc.getElementsByTagName( "head" )[ 0 ] ).childNodes;
        ref = refs[ refs.length - 1];
    }

    const sheets = doc.styleSheets;
    // Set any of the provided attributes to the stylesheet DOM Element.
    if( attributes ){
        for( let attributeName in attributes ){
            if ( attributes[attributeName] !== undefined ){
                ss.setAttribute( attributeName, attributes[attributeName] );
            }
        }
    }
    ss.rel = "stylesheet";
    ss.href = href;
    // temporarily set media to something inapplicable to ensure it'll fetch without blocking render
    ss.media = "only x";

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
	function newcb(){
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
const loadJS = function( src, attributes, callback, onerror ) {
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

    // Set any of the provided attributes to the stylesheet DOM Element.
    if ( attributes ) {
        for ( let attributeName in attributes ) {
            if ( attributes[attributeName] !== undefined ) {
                ss.setAttribute( attributeName, attributes[attributeName] );
            }
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
const launchScript = function($) {
    const debug = false,
          origin = window.location.origin,
          url = window.location.pathname,
          noop = function () {},
          regexUser = new RegExp('^/membre/[A-Za-z0-9]*$'),
    // Objet contenant les scripts et feuilles de style utilisées par le userscript
    scriptsAndStyles = {
        "moment": {
            type: 'script',
            id: 'jsmomment',
            src: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js',
            integrity: 'sha512-qTXRIMyZIFb8iQcfjXWCO8+M5Tbc38Qi5WzdPOYZHIlZpzBHG3L3by84BBBOiRGiEb7KKtAOAs5qYdUiZiQNNQ==',
            called: false,
            loaded: false
        },
        "localefr": {
            type: 'script',
            id: 'jslocalefr',
            src: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/locale/fr.min.js',
            integrity: 'sha512-RAt2+PIRwJiyjWpzvvhKAG2LEdPpQhTgWfbEkFDCo8wC4rFYh5GQzJBVIFDswwaEDEYX16GEE/4fpeDNr7OIZw==',
            called: false,
            loaded: false
        },
        "popover": {
            type: 'style',
            id: 'csspopover',
            href: `${serverBaseUrl}/css/popover.min.css`,
            integrity: 'sha384-UPi41tFgvFfGGtsdAAjqp9REEAkjVSkUxK6mWhlO3JBxsCTXu/sFpyayM1ofuGHj',
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
            integrity: 'sha384-NoJYNIzjwvIRv16fC7a8i8D/17deFhgAZnR/H8F6NvJb8S5npNfBYzNSHq1G5M1v',
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
            integrity: 'sha384-yQcOjOUfl4J3t613qravFq+UWIggK53/GS51F9EKqusGsWEiFIbDISOQAAghxww5',
            media: 'all',
            called: false,
            loaded: false
        }
    },
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
    };
    let timer, timerUA, currentUser, cache, fnLazy, state = {},
        mainLogoMargins = {top: 0, bottom: 0}, mainlogoModified = false;
    /**
     * @type Member
     */
    let user;

    /* Initialize the cache */
    cache = new CacheUS();

    /**
     * Paramétrage de la super classe abstraite Base et UpdateAuto
     */
    Base.debug = debug;
    Base.cache = cache;
    Base.notification = notification;
    Base.userIdentified = userIdentified;
    Base.token = typeof betaseries_api_user_token !== 'undefined' ? betaseries_api_user_token : null;
    Base.userKey = typeof betaseries_api_user_key !== 'undefined' ? betaseries_api_user_key : null;
    Base.userId = typeof betaseries_user_id !== 'undefined' ? betaseries_user_id : null;
    Base.trans = trans;
    Base.ratings = ratings;
    Base.themoviedb_api_user_key = themoviedb_api_user_key;
    Base.serverBaseUrl = serverBaseUrl;
    Base.theme = checkThemeStyle();
    UpdateAuto.getValue = GM_getValue;
    UpdateAuto.setValue = GM_setValue;

    /**
     * Initialization du script
     */
    init();

    // Fonctions appeler pour les pages des series, des films et des episodes
    if (/^\/(serie|film|episode)\/.*/.test(url)) {
        // On récupère d'abord la ressource courante pour instancier un objet Media
        getResource(true).then((objRes) => {
            if (Base.debug) console.log('objet resource Media(%s)', objRes.constructor.name, objRes);
            if (Base.debug) addBtnDev(); // On ajoute le bouton de Dev
            removeAds(); // On retire les pubs
            similarsViewed(objRes); // On s'occupe des ressources similaires
            objRes.decodeTitle(); // On décode le titre de la ressource
            objRes.addNumberVoters(); // On ajoute le nombre de votes à la note
            objRes.objNote.updateStars(); // On met à jour l'affichage de la note
            upgradeSynopsis(); // On améliore le fonctionnement de l'affichage du synopsis
            comments(objRes); // On modifie le fonctionnement de l'affichage des commentaires
            replaceVoteFn(objRes);
            if (/^\/serie\//.test(url)) {
                objRes.addRating(); // On ajoute la classification TV de la ressource courante
                // On ajoute la gestion des épisodes
                waitSeasonsAndEpisodesLoaded(() => upgradeEpisodes(objRes));
            }
            else if (/^\/film\//.test(url)) {
                observeBtnVu(objRes); // On modifie le fonctionnement du btn Vu
            }
        });
    }
    // Fonctions appeler pour la page de gestion des series
    else if (/^\/membre\/.*\/series$/.test(url)) {
        addStatusToGestionSeries();
    }
    // Fonctions appeler sur la page des membres
    else if ((regexUser.test(url) || /^\/membre\/[A-Za-z0-9]*\/amis$/.test(url)) && userIdentified()) {
        if (debug) console.log('regexUser OK');
        if (regexUser.test(url)) {
            // On récupère les infos du membre connecté
            getMember()
                .then(function (member) {
                currentUser = member;
                let login = url.split('/')[2];
                // On ajoute la fonction de comparaison des membres
                if (currentUser && login != currentUser.login) {
                    compareMembers();
                }
            });
        }
        else {
            searchFriends();
        }
    }
    // Fonctions appeler sur les pages des méthodes de l'API
    else if (/^\/api/.test(url)) {
        if (/\/methodes/.test(url)) {
            sommaireDevApi();
        }
        else if (/\/console/.test(url)) {
            updateApiConsole();
        }
    }
    // Fonctions appeler sur les pages des séries
    else if (/^\/series\//.test(url)) {
        if (Base.debug) console.log('Page des séries');
        waitPagination();
        seriesFilterPays();
        if (/agenda/.test(url)) {
            let countTimer = 0;
            timerUA = setInterval(function () {
                if (++countTimer > 50) {
                    clearInterval(timerUA);
                    notification('Erreur Update Agenda', 'Le timer de chargement a dépassé le temps max autorisé.');
                    return;
                }
                updateAgenda();
            }, 1000);
        }
    }
    // Fonctions appeler sur les pages des articles
    else if (/^\/article\//.test(url)) {
        if (Base.debug) console.log('Page d\'un article');
        checkArticle();
        addPopupOnLinks();
    }

    /**
     * Initialisation du script
     */
    function init() {
        // Ajout des feuilles de styles pour le userscript
        addScriptAndLink(['awesome', 'stylehome']);
        if (userIdentified()) {
            Member.fetch().then(member => {
                user = member;
                // On affiche la version du script
                if (Base.debug) console.log('%cUserScript BetaSeries %cv%s - Membre: %c%s', 'color:#e7711b', 'color:inherit', GM_info.script.version, 'color:#00979c', user.login);
            });
        } else {
            // On affiche la version du script
                if (Base.debug) console.log('%cUserScript BetaSeries %cv%s - Membre: Guest', 'color:#e7711b', 'color:inherit', GM_info.script.version);
        }
        checkApiVersion();
        const $mainlogo = $('nav .mainlogo');
        const boundHandleScroll = function() {
            // console.log('scrollEvent', window.visualViewport.pageTop, mainlogoModified);
            if (window.visualViewport.pageTop > 40 && !mainlogoModified) {
                mainLogoMargins.top = $mainlogo.css('margin-top');
                mainLogoMargins.bottom = $mainlogo.css('margin-bottom');
                $mainlogo.css('margin-top', '0px');
                $mainlogo.css('margin-bottom', '0px');
                const $body = $('body');
                if (!$body.hasClass('is-scrolled')) {
                    $body.addClass('is-scrolled');
                }
                mainlogoModified = true;
            } else if (window.visualViewport.pageTop < 40 && mainlogoModified) {
                $mainlogo.css('margin-top', mainLogoMargins.top);
                $mainlogo.css('margin-bottom', mainLogoMargins.bottom);
                mainlogoModified = false;
            }
        }
        boundHandleScroll('call initial');
        window.addEventListener("scroll", boundHandleScroll);
        $('#reactjs-header-search .menu-item .b_g').click(() => {
            // if (debug) console.log('click search menu');
            if (window.visualViewport.pageTop > 40 || mainlogoModified) {
                $mainlogo.css('margin-top', mainLogoMargins.top);
                $mainlogo.css('margin-bottom', mainLogoMargins.bottom);
                const $body = $('body');
                if (!$body.hasClass('is-scrolled')) {
                    $body.addClass('is-scrolled');
                }
                mainlogoModified = false;
            }
            waitDomPresent('#reactjs-header-search .menu-item form .c4_c8', () => {
                $('#reactjs-header-search .menu-item form .c4_c8').click(boundHandleScroll);
            });
        });
        if (typeof lazyLoad === 'undefined') {
            let notLoop = 0;
            let timerLazy = setInterval(function () {
                // Pour eviter une boucle infinie
                if (++notLoop >= 20) {
                    clearInterval(timerLazy);
                    // Ca ne fera pas le job, mais ça ne déclenchera pas d'erreur
                    fnLazy = { init: function () { console.warn('fake lazyLoad'); } };
                    return;
                }
                if (typeof lazyLoad !== 'undefined') {
                    fnLazy = new lazyLoad({});
                    clearInterval(timerLazy);
                    timerLazy = null;
                }
            }, 500);
        }
        else {
            fnLazy = new lazyLoad({});
        }
        headerSearch();
    }
    /**
     * Patiente en attendant que la fonction de check soit OK
     * @param {Function} check - La fonction de vérification de fin d'attente
     * @param {Function} cb - La fonction de callback
     * @param {number} timeout - Le nombre de secondes avant d'arrêter l'attente
     * @param {number} interval - La valeur de l'intervalle entre chaque vérification en ms
     */
    function waitPresent(check, cb, timeout = 2, interval = 50) {
        let loopMax = (timeout * 1000) / interval;
        let timer = setInterval(() => {
            if (--loopMax <= 0) {
                if (debug) console.log('waitDomPresent timeout');
                clearInterval(timer);
                return;
            }
            if (!check()) return;
            clearInterval(timer);
            return cb();
        }, interval);
    }
    /**
     * Patiente le temps du chargement du DOM, en attente d'une noeud identifié par le selector
     * @param {string} selector - Le selecteur jQuery
     * @param {Function} cb - La fonction de callback
     * @param {number} timeout - Le nombre de secondes avant d'arrêter l'attente
     * @param {number} interval - La valeur de l'intervalle entre chaque vérification en ms
     */
    function waitDomPresent(selector, cb, timeout = 2, interval = 50) {
        const check = function() {
            return $(selector).length > 0;
        }
        waitPresent(check, cb, timeout, interval);
    }

    function checkArticle() {
        $('a').click(() => {
            $('a').off('click');
            console.log('Event click', origin, url, window.location.pathname);
            if (window.history.state != state) {
                console.log('on a changé de page');
                state = window.history.state;
                setTimeout(noop, 0);
                if (/^\/article\//.test(location.pathname))
                    addPopupOnLinks();
                    checkArticle();
            }
        });
    }
    /**
     * Permet d'ajouter des améliorations au menu de recherche du site
     */
    function headerSearch() {
        // On observe l'espace lié à la recherche de séries ou de films, en haut de page.
        // Afin de modifier quelque peu le résultat, pour pouvoir lire l'intégralité du titre
        const observer = new MutationObserver(mutationsList => {
            let updateTitle = (i, e) => { if (isTruncated(e)) {
                $(e).parents('a').attr('title', $(e).text());
            } };
            for (let mutation of mutationsList) {
                if (mutation.type == 'childList' && mutation.addedNodes.length === 1) {
                    let node = mutation.addedNodes[0], $node = $(node);
                    if ($node.hasClass('col-md-4')) {
                        $('.mainLink', $node).each(updateTitle);
                    }
                    else if ($node.hasClass('js-searchResult')) {
                        let title = $('.mainLink', $node).get(0);
                        if (isTruncated(title)) {
                            $node.attr('title', $(title).text());
                        }
                    }
                }
            }
        });
        observer.observe(document.getElementById('reactjs-header-search'), { childList: true, subtree: true });
    }
    /**
     * Verifie si l'élément est tronqué, généralement, du texte
     * @params {Object} Objet DOMElement
     * @return {boolean}
     */
    function isTruncated(el) {
        return el.scrollWidth > el.clientWidth;
    }
    /**
     * Verifie si l'utilisateur est connecté
     * @return {boolean}
     */
    function userIdentified() {
        return typeof betaseries_api_user_token !== 'undefined' && typeof betaseries_user_id !== 'undefined';
    }
    /**
     * Identifie, stocke et retourne le theme CSS utilisé (light or dark)
     * stocké dans window.theme
     * @returns {void}
     */
    function checkThemeStyle() {
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
    }
    /**
     * Cette fonction vérifie la dernière version de l'API
     */
    function checkApiVersion() {
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
    }
    /**
     * Permet d'afficher les messages d'erreur liés au script
     *
     * @param {String} title Le titre du message
     * @param {String} text  Le texte du message
     * @return {void}
     */
    function notification(title, text) {
        // GM_notification(details, ondone), GM_notification(text, title, image, onclick)
        let notifContainer = $('.userscript-notifications');
        // On ajoute notre zone de notifications
        if ($('.userscript-notifications').length <= 0) {
            $('#fb-root').after('<div class="userscript-notifications"><h3><span class="title"></span><i class="fa fa-times" aria-hidden="true"></i></h3><p class="text"></p></div>');
            notifContainer = $('.userscript-notifications');
            $('.userscript-notifications .fa-times').click(() => {
                $('.userscript-notifications').slideUp();
            });
        }
        notifContainer.hide();
        $('.userscript-notifications .title').html(title);
        $('.userscript-notifications .text').html(text);
        notifContainer.slideDown().delay(5000).slideUp();
        console.trace('Notification');
    }
    /**
     * addScriptAndLink - Permet d'ajouter un script ou un link sur la page Web
     *
     * @param  {String|String[]} name Le ou les identifiants des éléments à charger
     * @return {void}
     */
    function addScriptAndLink(name, onloadFunction = noop) {
        if (name instanceof Array) {
            if (name.length > 1) {
                for (let n = 0; n < name.length; n++) {
                    if (n === name.length - 1) {
                        addScriptAndLink(name[n], onloadFunction);
                    } else {
                        addScriptAndLink(name[n]);
                    }
                }
                return;
            }
            else {
                name = name[0];
            }
        }
        // On vérifie que le nom est connu
        if (!scriptsAndStyles || !(name in scriptsAndStyles)) {
            throw new Error(`${name} ne fait pas partit des données de scripts ou de styles`);
        }
        const data = scriptsAndStyles[name];
        // On vérifie si il est déjà chargé
        if ($('#' + data.id).length === 1) {
            return onloadFunction();
        }
        if (data.type === 'script') {
            const loadErrorScript = function(oError) {
                if (debug) console.log('loadErrorScript error', oError);
                console.error("The script " + oError.target.src + " didn't load correctly.");
            }
            loadJS(data.src, {
                integrity: data.integrity,
                id: data.id,
                crossOrigin: 'anonymous',
                referrerPolicy: 'no-referrer'
            }, onloadFunction, loadErrorScript);
        }
        else if (data.type === 'style') {
            const loadErrorStyle = function(oError) {
                if (debug) console.log('loadErrorStyle error', oError);
                console.error("The style " + oError.target.href + " didn't load correctly.");
            }
            loadCSS( data.href, null, null, {
                integrity: data.integrity,
                id: data.id,
                crossOrigin: 'anonymous',
                referrerPolicy: 'no-referrer'
            }, onloadFunction, loadErrorStyle );
        }
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
            $('#results-shows').on('DOMSubtreeModified', '#pagination-shows', function () {
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
        $('div.form-group button.btn-btn.btn--blue').prop('onclick', null).off('click').click((e, key) => {
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
                if ($('#doc code').length <= 0) return;
                clearInterval(timer); // On supprime le timer
                let paramsDoc = $('#doc > ul > li > code');
                if (debug) console.log('paramsDoc', paramsDoc);
                paramsDoc.css('cursor', 'pointer');
                // On ajoute la clé du paramètre dans une nouvelle ligne de paramètre
                paramsDoc.click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    $('div.form-group button.btn-btn.btn--blue').trigger('click', [$(e.currentTarget).text().trim()]);
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
            $('.toggle').click(() => {
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
        if (debug) console.log('build sommaire');
        let titles = $('.maincontent h2'), methods = {};
        // Ajout du style CSS pour les tables
        addScriptAndLink('tablecss');
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
        //if (debug) console.log('methods', methods);
        $('.maincontent h1').after(buildTable());
        $('#sommaire').slideDown();
        $('.linkSommaire').click((e) => {
            e.stopPropagation();
            e.preventDefault();
            $('#' + $(e.currentTarget).data('id')).get(0).scrollIntoView(true);
        });
        $('h2 .fa-chevron-circle-up').click(function (e) {
            e.stopPropagation();
            e.preventDefault();
            document.getElementById('sommaire').scrollIntoView(true);
        });
        $('#sommaire .fa-chevron-circle-up').click(e => {
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
    /**
     *
     * @returns {Dialog}
     */
    function getDialog() {
        const dialogHTML = `
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
                <div
                  class="dialog dialog-container table-dark"
                  id="dialog-resource"
                  aria-labelledby="dialog-resource-title"
                  style="display:none;"
                >
                  <div class="dialog-overlay"></div>
                  <div class="dialog-content" role="document" style="width: 80%;">
                    <h1 id="dialog-resource-title">Données de la ressource
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
        if ($('#dialog-resource').length <= 0) {
        $('body').append(dialogHTML);
        }

        return {
            _dialog: $('#dialog-resource'),
            _html: document.documentElement,
            _onShow: function () {
                this._html.style.overflowY = 'hidden';
                this._dialog
                .css('z-index', '1005')
                    .css('overflow', 'scroll')
                    .find('button.close').click(this.close.bind(this));
                this._dialog.find('.dialog-overlay').click(this.close.bind(this));
                document.addEventListener("keydown", this._bindKeypress);
            },
            _bindKeypress: function(e) {
                e.stopPropagation();
                e.preventDefault();
                // console.log('_bindKeypress', this, e);
                if (27 === e.which) {
                    this.close();
                }
            },
            _onHide: function () {
                this._html.style.overflowY = '';
                this._dialog
                .css('z-index', '0')
                    .css('overflow', 'none')
                    .find('button.close').off('click');
                this._dialog.find('.dialog-overlay').off('click');
                this._dialog.off('keypress');
                document.removeEventListener("keydown", this._bindKeypress);
            },
            init: function() {
                this._bindKeypress = this._bindKeypress.bind(this);
                this._onHide = this._onHide.bind(this);
                this._onShow = this._onShow.bind(this);
                return this;
            },
            close: function () {
                this._dialog.hide('fast', this._onHide);
            },
            show: function() {
                this._dialog.show('slow', this._onShow);
            },
            setCounter: function(counter) {
                this._dialog.find('.counter').text(counter);
            },
            setContent: function(content) {
                this._dialog.find('.data-resource').html(content);
            }
        }.init();
    }
    /**
     * Ajoute un bouton pour le dev pour afficher les données de la ressource
     * dans une modal
     */
    function addBtnDev() {
        const btnHTML = '<div class="blockInformations__action"><button class="btn-reset btn-transparent" type="button" style="height:44px;width:64px;"><i class="fa fa-wrench" aria-hidden="true" style="font-size:1.5em;"></i></button><div class="label">Dev</div></div>';
        $('.blockInformations__actions').append(btnHTML);
        /**
         * @type {Dialog}
         */
        const dialog = getDialog();
        $('.blockInformations__actions .fa-wrench').parent().click((e) => {
            e.stopPropagation();
            e.preventDefault();
            let type = getApiResource(location.pathname.split('/')[1]); // Indique de quel type de ressource il s'agit
            getResourceData().then(function (data) {
                // if (debug) console.log('addBtnDev promise return', data);
                dialog.setContent(renderjson.set_show_to_level(2)(data[type.singular]));
                dialog.setCounter(Base.counter.toString());
                dialog.show();
            }, (err) => {
                notification('Erreur de récupération de la ressource', 'addBtnDev: ' + err);
            });
        });
    }
    /**
     * Cette fonction permet de retourner la ressource principale sous forme d'objet
     * @param  {boolean} [nocache=false] Flag indiquant si il faut utiliser les données en cache
     * @param  {number}  [id=null]       Identifiant de la ressource
     * @return {Promise<Base>}
     */
    function getResource(nocache = false, id = null) {
        const type = getApiResource(location.pathname.split('/')[1]), // Indique de quel type de ressource il s'agit
        fonction = type.singular === 'show' || type.singular === 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource
        id = (id === null) ? getResourceId() : id;
        if (debug) console.log('getResource{id: %d, nocache: %s, type: %s}', id, ((nocache) ? 'true' : 'false'), type.singular);
        return new Promise((resolve, reject) => {
            Base.callApi('GET', type.plural, fonction, { 'id': id }, nocache)
                .then(data => {
                resolve(new type.class(data[type.singular], $('.blockInformations')));
            }, err => {
                reject(err);
            });
        });
    }
    /**
     * Cette fonction permet de récupérer les données API de la ressource principale
     * @param  {boolean} [nocache=true]  Flag indiquant si il faut utiliser les données en cache
     * @param  {number}  [id=null]       Identifiant de la ressource
     * @return {Promise<Object>}
     */
    function getResourceData(nocache = true, id = null) {
        const type = getApiResource(location.pathname.split('/')[1]), // Indique de quel type de ressource il s'agit
        fonction = type.singular == 'show' || type.singular == 'episode' ? 'display' : 'movie'; // Indique la fonction à appeler en fonction de la ressource
        id = (id === null) ? getResourceId() : id;
        if (debug) console.log('getResourceData{id: %d, nocache: %s, type: %s}', id, ((nocache) ? 'true' : 'false'), type.singular);
        return Base.callApi('GET', type.plural, fonction, { 'id': id }, nocache);
    }
    /**
     * Retourne la ressource associée au type de page
     *
     * @param  {String} pageType    Le type de page consultée
     * @return {Object} Retourne le nom de la ressource API au singulier et au pluriel
     */
    function getApiResource(pageType) {
        let methods = {
            'serie': { singular: 'show', plural: 'shows', "class": Show },
            'film': { singular: 'movie', plural: 'movies', "class": Movie },
            'episode': { singular: 'episode', plural: 'episodes', "class": Episode }
        };
        if (pageType in methods) {
            return methods[pageType];
        }
        return null;
    }
    /**
     * Retourne l'identifiant de la ressource de la page
     * @return {number} L'identifiant de la ressource
     */
    function getResourceId() {
        const type = getApiResource(url.split('/')[1]), // Le type de ressource
        eltActions = $(`#reactjs-${type.singular}-actions`); // Le noeud contenant l'ID
        return (eltActions.length === 1) ? parseInt(eltActions.data(`${type.singular}-id`), 10) : 0;
    }
    /**
     * Retourne les infos d'un membre
     *
     * @param {Number}   id    Identifiant du membre (par défaut: le membre connecté)
     * @return {Promise} Le membre
     */
    function getMember(id = null) {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (!userIdentified() || betaseries_api_user_key === '') return;
        let args = {};
        if (id) args.id = id;
        return new Promise((resolve) => {
            Base.callApi('GET', 'members', 'infos', args)
                .then(data => {
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
        let id = parseInt($('#temps').data('loginid'), 10);
        getMember(id).
            then(function (member) {
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
                </div>`, trads = {
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
            addScriptAndLink('tablecss');
            $('body').append(dialogHTML);
            //if (debug) console.log(currentUser, otherMember, trads);
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
            $('button.button.blue').click(function (e) {
                e.stopPropagation();
                e.preventDefault();
                dialog.show();
            });
            dialog
                .on('show', function () {
                html.style.overflowY = 'hidden';
                $('#dialog-compare').css('z-index', '1005').css('overflow', 'scroll');
                $('.dialog-close').click(function (e) {
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
    }
    /**
     * Ajoute un champ de recherche sur la page des amis d'un membre
     * @return {void}
     */
    function searchFriends() {
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
    }
    /**
     * Améliore l'affichage de la description de la ressource
     *
     * @return {void}
     */
    function upgradeSynopsis() {
        let $span = $('.blockInformations__synopsis span'), $btnMore = $('a.js-show-fulltext');
        if ($btnMore.length <= 0) {
            return;
        }
        // On ajoute le bouton Moins et son event click
        $span.append('<button role="button" class="u-colorWhiteOpacity05 js-show-truncatetext textTransformUpperCase cursorPointer"></button>');
        const $btnLess = $('button.js-show-truncatetext');
        $btnLess.click((e) => {
            e.stopPropagation();
            e.preventDefault();
            if ($span.hasClass('sr-only')) return;
            // Toggle display synopsis
            $btnMore.show();
            $span.addClass('sr-only');
        });
        // On remplace le lien Plus par un bouton
        $btnMore.replaceWith('<button role="button" class="u-colorWhiteOpacity05 js-show-fulltext textTransformUpperCase cursorPointer"></button>');
        $btnMore = $('button.js-show-fulltext');
        $btnMore.on('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (!$span.hasClass('sr-only')) return;
            $btnMore.hide();
            $span.removeClass('sr-only');
        });
    }
    /**
     * Patiente le temps du chargment des saisons et des épisodes
     * @param  {Function} cb Fonction de callback en cas de success
     * @param  {Function} cb Fonction de callback en cas d'error
     * @return {void}
     */
    function waitSeasonsAndEpisodesLoaded(successCb, errorCb = Base.noop) {
        let waitEpisodes = 0;
        // On ajoute un timer interval en attendant que les saisons et les épisodes soient chargés
        timer = setInterval(function () {
            // On évite une boucle infinie
            if (++waitEpisodes >= 100) {
                clearInterval(timer);
                notification('Wait Episodes List', 'Les vignettes des saisons et des épisodes n\'ont pas été trouvées.');
                errorCb('timeout');
                return;
            }
            let len = parseInt($('#seasons .slide--current .slide__infos').text(), 10), $episodes = $('#episodes .slide_flex');
            // On vérifie que les saisons et les episodes soient chargés sur la page
            if ($episodes.length <= 0 || $episodes.length < len) {
                if (debug) console.log('waitSeasonsAndEpisodesLoaded: En attente du chargement des vignettes');
                return;
            }
            if (debug) console.log('waitSeasonsAndEpisodesLoaded, nbVignettes (%d, %d)', $episodes.length, len);
            clearInterval(timer);
            successCb();
        }, 500);
    }
    /**
     * Gère la mise à jour auto des épisodes de la saison courante
     * @param  {Show} show L'objet de type Show
     * @return {void}
     */
    function updateAutoEpisodeList(show) {
        let objUpAuto = UpdateAuto.getInstance(show);
        /**
         * Fonction retournant le contenu de la Popup des options update
         * de la liste des épisodes
         * @param {UpdateAuto} objUpAuto -
         * @return {String} Contenu HTML de la PopUp des options update
         */
        const contentUp = function (objUpAuto) {
            const intervals = UpdateAuto.intervals;
            let contentUpdate = `
                    <style>
                        .alert {
                          position: relative;
                          padding: 0.75rem 1.25rem;
                          margin-bottom: 1rem;
                          border: 1px solid transparent;
                          border-radius: 0.25rem;
                        }
                        .alert-info {
                          color: #0c5460;
                          background-color: #d1ecf1;
                          border-color: #bee5eb;
                        }
                        .alert-warning {
                          color: #856404;
                          background-color: #fff3cd;
                          border-color: #ffeeba;
                        }
                    </style>
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
                    <button type="submit" class="btn btn-primary"${!objUpAuto.show.in_account ? ' disabled="true"' : ''}>Sauver</button>
                    <button type="button" class="close btn btn-danger">Annuler</button>
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
            const className = (objUpAuto && objUpAuto.status) ? 'success' : 'secondary', label = (objUpAuto && objUpAuto.status) ? 'running' : 'not running', help = "Cette fonctionnalité permet de mettre à jour les épisodes de la saison courante, à une fréquence choisie.";
            return `<style>
                        .optionsUpAuto .close {
                            position: absolute;
                            right: 5px;
                            border: none;
                            background: transparent;
                            font-size: 1.5em;
                            top: 0;
                        }
                        .optionsUpAuto .close:hover {border: none;outline: none;}
                        .optionsUpAuto .close:focus {border: none;outline: none;}
                    </style>
                    <div class="optionsUpAuto" style="color:#000;">Options de mise à jour
                      <span class="badge badge-pill badge-${className}"${objUpAuto.status ? 'title="Arrêter la tâche en cours"' : ''}>${label}</span>
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
        let notLoop = 0;
        let intTime = setInterval(function () {
            if (++notLoop >= 20) {
                clearInterval(intTime);
                return;
            }
            if (typeof bootstrap === 'undefined' || typeof bootstrap.Popover !== 'function') {
                return;
            }
            else clearInterval(intTime);
            if (debug) console.log('Loaded popover updateEpisodes');
            $('#updateEpisodeList .updateElement').popover({
                container: $('#updateEpisodeList'),
                // delay: { "show": 500, "hide": 100 },
                html: true,
                content: ' ',
                placement: 'right',
                title: ' ',
                trigger: 'manual',
                boundary: 'window'
            });
            let timeoutHover = null;
            $('#updateEpisodeList .updateElement').hover(
            // In
            function (e) {
                e.stopPropagation();
                timeoutHover = setTimeout(function () {
                    $('#updateEpisodeList .updateElement').popover('show');
                }, 500);
            },
            // Out
            function (e) {
                e.stopPropagation();
                clearTimeout(timeoutHover);
            });
            // On ferme et désactive les autres popups lorsque celle des options est ouverte
            $('#updateEpisodeList .updateElement').on('show.bs.popover', function () {
                const $updateElement = $('#episodes .slide__image');
                $updateElement.popover('hide');
                $updateElement.popover('disable');
            });
            // On réactive les autres popus lorsque celle des options se ferme
            // Et on supprime les listeners de la popup
            $('#updateEpisodeList .updateElement').on('hide.bs.popover', function () {
                $('#episodes .slide__image').popover('enable');
                $('.optionsUpAuto .badge').css('cursor', 'initial').off('click');
                $('#updateEpisodeList button.close').off('click');
                $('#optionsUpdateEpisodeList button.btn-primary').off('click');
            });
            $('#updateEpisodeList .updateElement').on('shown.bs.popover', function () {
                $('#updateEpisodeList .popover-header').html(titlePopup(objUpAuto));
                $('#updateEpisodeList .popover-body').html(contentUp(objUpAuto));
                if (objUpAuto.status) {
                    $('.optionsUpAuto .badge').css('cursor', 'pointer').click(e => {
                        e.stopPropagation();
                        e.preventDefault();
                        const $badge = $(e.currentTarget);
                        if ($badge.hasClass('badge-success')) {
                            // On arrête la tâche d'update auto
                            objUpAuto.stop();
                        }
                    });
                }
                $('#updateEpisodeList button.close').click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    $('#updateEpisodeList .updateElement').popover('hide');
                });
                $('#optionsUpdateEpisodeList button.btn-primary').click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    let checkAuto = $('#updateEpisodeListAuto').is(':checked'),
                        intervalAuto = parseInt($('#updateEpisodeListTime').val(), 10);
                    if (objUpAuto.auto !== checkAuto) objUpAuto.auto = checkAuto;
                    if (objUpAuto.interval != intervalAuto) objUpAuto.interval = intervalAuto;
                    if (debug) console.log('updateEpisodeList submit', objUpAuto);
                    objUpAuto.launch();
                    $('#updateEpisodeList .updateElement').popover('hide');
                });
            });
        }, 500);
    }
    /**
     * Ajoute un bouton Vu sur la vignette d'un épisode
     * @param {Show} res L'objet Show de l'API
     */
    function upgradeEpisodes(res) {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (!userIdentified() || betaseries_api_user_key === '') return;
        if (!(res instanceof Show)) {
            console.error("Le paramètre res n'est pas du type Show", res);
            return;
        }
        const seasons = $('#seasons .slide_flex');
        let vignettes = getVignettes();
        if (debug) console.log('Nb seasons: %d, nb vignettes: %d', seasons.length, vignettes.length);
        /*
         * Ajoute une écoute sur l'objet Show, sur l'évenement UPDATE,
         * pour mettre à jour l'update auto des épisodes
         */
        res.addListener(EventTypes.UPDATE, function (show) {
            if (debug) console.log('Listener called');
            // Si il n'y a plus d'épisodes à regarder sur la série
            if (show.user.remaining <= 0) {
                let objUpAuto = UpdateAuto.getInstance(show);
                // Si la série est terminée
                if (show.isEnded()) {
                    // On supprime la série des options d'update
                    objUpAuto.delete();
                }
                else {
                    // On désactive la mise à jour auto
                    objUpAuto.stop();
                }
            }
        });
        // On ajoute les cases à cocher sur les vignettes courantes
        addCheckSeen();
        // Ajoute les cases à cocher sur les vignettes des épisodes
        function addCheckSeen() {
            vignettes = getVignettes();
            const seasonNum = parseInt($('#seasons div[role="button"].slide--current .slide__title').text().match(/\d+/).shift(), 10);
            res.setCurrentSeason(seasonNum);
            let promise = res.currentSeason.fetchEpisodes(); // Contient la promesse de récupérer les épisodes de la saison courante
            // On ajoute le CSS et le Javascript pour les popup
            if ($('#csspopover').length === 0 && $('#jsbootstrap').length === 0) {
                addScriptAndLink(['popover', 'bootstrap']);
            }
            /**
             * Retourne la position de la popup par rapport à l'image du similar
             * @param  {Object} _tip Unknown
             * @param  {Object} elt Le DOM Element du lien du similar
             * @return {String}     La position de la popup
             */
            let funcPlacement = (_tip, elt) => {
                //if (debug) console.log('funcPlacement', tip, $(tip).width());
                let rect = elt.getBoundingClientRect(), width = $(window).width(), sizePopover = 320;
                return ((rect.left + rect.width + sizePopover) > width) ? 'left' : 'right';
            };
            // On ajoute la description des épisodes dans des Popup
            promise.then(() => {
                let intTime = setInterval(function () {
                    if (typeof bootstrap === 'undefined' || typeof bootstrap.Popover !== 'function') {
                        return;
                    }
                    else clearInterval(intTime);
                    if (debug) console.log('Add synopsis episode');
                    let $vignette, objEpisode, description;
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
                            title: ' ',
                            trigger: 'hover',
                            boundary: 'window'
                        });
                    }
                    $('#episodes .slide__image').on('shown.bs.popover', function () {
                        const $checkSeen = $(this).find('.checkSeen'), episodeId = parseInt($checkSeen.data('id'), 10), episode = res.currentSeason.getEpisode(episodeId);
                        if (!episode) {
                            console.warn('episode title popup', episodeId, res);
                        }
                        $('#episodes .slide__image .popover-header').html(episode.getTitlePopup());
                    });
                    // On ajoute un event click sur la case 'checkSeen'
                    $('#episodes .checkSeen').click(function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        const $elt = $(e.currentTarget), episodeId = parseInt($elt.data('id'), 10), episode = res.currentSeason.getEpisode(episodeId);
                        if (debug) console.log('click checkSeen', episode, res);
                        episode.toggleSpinner(true);
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
                    $('#episodes .checkSeen').hover(
                        // IN
                        (e) => {
                            $(e.currentTarget)
                                .siblings('.overflowHidden')
                                .find('img.js-lazy-image')
                                .css('transform', 'scale(1.2)');
                            $(e.currentTarget)
                                .parent('.slide__image')
                                .popover('hide');
                        },
                        // OUT
                        (e) => {
                            $(e.currentTarget)
                                .siblings('.overflowHidden')
                                .find('img.js-lazy-image')
                                .css('transform', 'scale(1.0)');
                            $(e.currentTarget)
                                .parent('.slide__image')
                                .popover('show');
                        }
                    );
                }, 500);
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
                updateAutoEpisodeList(res);
                // On ajoute la gestion de l'event click sur le bouton
                $('.updateEpisodes').click((e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (debug) console.groupCollapsed('updateEpisodes');
                    // On ferme la popup des options d'update auto
                    $('#updateEpisodeList .updateElement').popover('hide');
                    const self = $(e.currentTarget);
                    self.removeClass('finish');
                    // Le numéro de la saison courante
                    // const seasonNum = $('#seasons .slide_flex.slide--current .slide__title').text().match(/\d+/).shift();
                    res.currentSeason.fetchEpisodes().then(() => {
                        // if (debug) console.log('after fetchEpisodes', Object.assign({}, objShow));
                        vignettes = getVignettes();
                        // len = getNbVignettes();
                        let $vignette, objEpisode, changed = false, retour;
                        for (let v = 0; v < vignettes.length; v++) {
                            $vignette = $(vignettes.get(v)); // DOMElement jQuery de l'image de l'épisode
                            objEpisode = res.currentSeason.episodes[v];
                            objEpisode.elt = $vignette.parents('.slide_flex'); // Données de l'épisode
                            //if (debug) console.log('Episode ID', getEpisodeId($vignette), episode.id);
                            retour = objEpisode.updateCheckSeen(v);
                            if (!changed) {
                                changed = retour;
                            }
                        }
                        // On met à jour les éléments, seulement si il y a eu des modifications
                        if (changed) {
                            if (debug) console.log('updateEpisodes changed true', res);
                            // Si il reste des épisodes à voir, on scroll
                            if ($('#episodes .slide_flex.slide--notSeen').length > 0) {
                                $('#episodes .slides_flex').get(0).scrollLeft =
                                    $('#episodes .slide_flex.slide--notSeen').get(0).offsetLeft - 69;
                            }
                            res.update(true).then(() => {
                                self.addClass('finish');
                                fnLazy.init(); // On affiche les images lazyload
                                if (debug) console.groupEnd(); // On clos le groupe de console
                            }, err => {
                                notification('Erreur de récupération de la ressource Show', 'Show update: ' + err);
                                self.addClass('finish');
                                console.warn('Show update error', err);
                                if (debug) console.groupEnd(); // On clos le groupe de console
                            });
                        }
                        else {
                            if (debug) console.log('updateEpisodes no changes');
                            self.addClass('finish'); // On arrete l'animation de mise à jour
                            if (debug) console.groupEnd(); // On clos le groupe de console
                        }
                    }, (err) => {
                        notification('Erreur de mise à jour des épisodes', 'updateEpisodeList: ' + err);
                        self.addClass('finish');
                        if (debug) console.groupEnd();
                    });
                });
            }
        }
        // On ajoute un event sur le changement de saison
        seasons.click(() => {
            if (debug) console.groupCollapsed('season click');
            $('#episodes .checkSeen').off('click');
            // On attend que les vignettes de la saison choisie soient chargées
            waitSeasonsAndEpisodesLoaded(() => {
                addCheckSeen();
                if (debug) console.groupEnd();
            }, () => {
                console.error('Season click Timeout');
                if (debug) console.groupEnd();
            });
        });
        // On active les menus dropdown
        $('.dropdown-toggle').dropdown();
        // On récupère les vignettes des épisodes
        function getVignettes() {
            return $('#episodes .slide__image');
        }
    }
    /**
     * Modifie le fonctionnement d'ajout d'un similar
     *
     * @param  {Object}   $elt          L'élément DOMElement jQuery
     * @param  {Number[]} [objSimilars] Un tableau des identifiants des similars actuels
     * @return {void}
     */
    function replaceSuggestSimilarHandler($elt, objSimilars = []) {
        if ($elt.hasClass('usbs')) return;
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (!userIdentified() || betaseries_api_user_key === '' || !/(serie|film)/.test(url)) return;
        if (debug) console.log('replaceSuggestSimilarHandler');
        const type = getApiResource(url.split('/')[1]), // Le type de ressource
        resId = getResourceId(); // Identifiant de la ressource
        // Gestion d'ajout d'un similar
        $elt.removeAttr('onclick').click(() => {
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
                                $('#search_results .item span').click((e) => {
                                    autocompleteSimilar(e.currentTarget);
                                });
                            }, (err) => {
                                notification('Ajout d\'un similar', 'Erreur requête Search: ' + err);
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
                                if (debug) console.log('current_item', current_item);
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
    }
    /**
     * Ajoute la section Similars
     */
    function addSimilarsSection() {
        $('.scrollNavigation').append(`<a href="#similars" class="u-colorWhiteOpacity05 js-anchor-link">Séries similaires</a>`);
        let template = `
            <div id="similars" class="sectionSeparator">
                <div class="slidesWrapper">
                    <div class="container-padding60">
                        <div class="blockTitles">
                            <h2 class="blockTitle">Séries similaires</h2>
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
        replaceSuggestSimilarHandler($('#similars div.slides_flex div.slide_flex div.slide__image > button'));
        const resId = getResourceId();
        const res = Base.cache.get(DataTypesCache.shows, resId);
        if (res) res.removeListener(EventTypes.ADD, addSimilarsSection);
    }
    /**
     * Vérifie si les séries/films similaires ont été vues
     * Nécessite que l'utilisateur soit connecté et que la clé d'API soit renseignée
     * @param {Media} res La ressource de l'API
     */
    function similarsViewed(res) {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (!userIdentified() || betaseries_api_user_key === '' || !/(serie|film)/.test(url)) return;
        if (debug) console.groupCollapsed('similarsViewed');
        if (res instanceof Show && !res.in_account && $('#similars').length <= 0) {
            res.addListener(EventTypes.ADD, addSimilarsSection);
        }
        let $similars = $('#similars .slide__title'), // Les titres des ressources similaires
        len = $similars.length; // Le nombre de similaires
        if (debug) console.log('nb similars: %d', len, res.nbSimilars);
        // On sort si il n'y a aucun similars ou si il s'agit de la vignette d'ajout
        if (len <= 0 || (len === 1 && $($similars.parent().get(0)).find('button').length === 1)) {
            $('.updateSimilars').addClass('finish');
            replaceSuggestSimilarHandler($('#similars div.slides_flex div.slide_flex div.slide__image > button'));
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
                addScriptAndLink(['popover', 'bootstrap']);
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
                                        Suggérer une série
                            </button>`);
            }
            // On ajoute la gestion de l'event click sur le bouton d'update des similars
            $('.updateSimilars').click(function (e) {
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
                similarsViewed(res);
            });
        }
        let objSimilars = [];
        res.fetchSimilars().then(function (res) {
            let intTime = setInterval(function () {
                if (typeof bootstrap === 'undefined' || typeof bootstrap.Popover !== 'function') {
                    return;
                }
                else clearInterval(intTime);
                /**
                 * Retourne la position de la popup par rapport à l'image du similar
                 * @param  {Object}         _tip Unknown
                 * @param  {HTMLElement}    elt  Le DOM Element du lien du similar
                 * @return {String}              La position de la popup
                 */
                let funcPlacement = (_tip, elt) => {
                    //if (debug) console.log('funcPlacement', tip, $(tip).width());
                    let rect = elt.getBoundingClientRect(), width = $(window).width(), sizePopover = 320;
                    return ((rect.left + rect.width + sizePopover) > width) ? 'left' : 'right';
                };
                const dialog = getDialog();
                for (let s = 0; s < res.similars.length; s++) {
                    objSimilars.push(res.similars[s].id);
                    let $elt = $($similars.get(s)),
                        $link = $elt.siblings('a'),
                        similar = res.similars[s];
                    similar.elt = $elt.parents('.slide_flex');
                    similar.save();
                    // similar = new Similar(resource, $elt.parents('.slide_flex'), type);
                    // On décode le titre du similar
                    similar.decodeTitle();
                    // On ajoute l'icone pour visualiser les data JSON du similar
                    if (debug) {
                        similar.wrench(dialog);
                    }
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
                    if (debug && !objSimilar) console.log('resId[%d], type: %s',resId, type, objSimilar, res);
                    $('.popover-header').html(objSimilar.getTitlePopup());
                    $('.popover-body').html(objSimilar.getContentPopup());
                    // On gère les modifs sur les cases à cocher de l'état d'un film similar
                    if (type === MediaType.movie) {
                        $('.popover button.reset').click(e => {
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
                                    // if (debug) console.log('Reset changeState nbChecked(%d) similar', checked.length, objSimilar);
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
                        $('.popover input.movie').click((e) => {
                            e.stopPropagation();
                            // e.preventDefault();
                            const $elt = $(e.currentTarget).parent().children('input:checked');
                            if (debug) console.log('input.movie click - checked(%d)', $elt.length);
                            if ($elt.length <= 0) {
                                $elt.siblings('button').hide();
                                return;
                            }
                            const state = parseInt($elt.val(), 10);
                            if (debug) console.log('input.movie change: %d', state, $elt);
                            objSimilar.changeState(state).then(similar => {
                                if (state === MovieStatus.SEEN) {
                                    $elt.parents('a').prepend(`<img src="${serverBaseUrl}/img/viewed.png" class="bandViewed"/>`);
                                }
                                else if ($elt.parents('a').find('.bandViewed').length > 0) {
                                    $elt.parents('a').find('.bandViewed').remove();
                                }
                                $elt.siblings('button').show();
                                if (debug) console.log('movie mustSee/seen OK', similar);
                            }, err => {
                                console.warn('movie mustSee/seen KO', err);
                            });
                        });
                    }
                    // On gère le click sur le lien d'ajout de la série similar sur le compte de l'utilisateur
                    else if (type === MediaType.show) {
                        $('.popover .addShow').click((e) => {
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
                    }
                    // On gère le placement de la Popover par rapport à l'image du similar
                    let popover = $('.popover'), img = popover.siblings('img.js-lazy-image'), placement = $('.popover').attr('x-placement'), space = 0;
                    if (placement == 'left') {
                        space = popover.width() + (img.width() / 2) + 5;
                        popover.css('left', `-${space}px`);
                    }
                });
                $('.updateSimilars').addClass('finish');
                console.groupEnd();
            }, 500);
        }, (err) => {
            notification('Erreur de récupération des similars', 'similarsViewed: ' + err);
        });
        replaceSuggestSimilarHandler($('#similars button.blockTitle-subtitle'), objSimilars);
    }
    /**
     * Gère l'affichage des commentaires
     * @param {Base} res La ressource média
     */
    function comments(res) {
        // On remplace les boutons des commentaires, pour supprimer les events
        [].forEach.call(document.querySelectorAll(".js-popinalert-comments"), function(el) {
            const cId = el.getAttribute('data-comment-id');
            $(el).replaceWith(`<button type="button" class="btn-reset js-popup-comments zIndex10" data-comment-id="${cId}"></button>`);
            // if (debug) console.log('eventListener comment retiré');
        });
        $('head').append(`
            <style type="text/css">
                .it_iv, .iv_ix {
                    display: inline-block;
                    position: relative;
                    top: -1px;
                    margin-left: 11px;
                    vertical-align: middle;
                }
                .it_ix:hover .it_iv, .iv_iz:hover .iv_ix {
                    opacity: 1;
                    visiblity: visible;
                }
                .it_iz, .iv_i1 { display:none; }
                .it_ix:hover .it_iz, .iv_iz:hover .iv_i1 { display: inline-block; }
                .it_i1, .iv_i3 {
                    display: flex;
                    align-items: center;
                    margin-top: -1px;
                }
                .comments {
                    margin-bottom: 0px;
                }
                .comments .comment {
                    animation: 2s ease 0s 1 normal forwards running backgroundFadeOut;
                }
                .comments .comment .comment-text {
                    line-height: 15px;
                    word-break: break-word;
                }
                .writing {
                    border-top: 0px;
                }
                .writing textarea {
                    overflow-x: hidden;
                    overflow-wrap: break-word;
                    width: 95%;
                    display: inline;
                }
                .writing .sendComment {
                    display: inline;
                    transition: opacity 200ms ease 0s;
                    vertical-align: middle;
                }
                .writing .mainTime {
                    margin-top: 10px;
                    margin-bottom: 0px;
                }
                .writing .mainTime .baliseSpoiler {
                    cursor: pointer;
                }
                @media (max-width:330px) {
                    .it_ix .media-left, .iv_iz .media-left { display: none; }
                    .it_ix .media-body, .iv_iz .media-body { margin-left: 0;}
                }
                @media (max-width:424px) {
                    .it_i3, .iv_i5 { margin-left: 20px; }
                    .it_i1, .iv_i3 { flex-wrap: wrap; }
                    .it_ix img, .iv_iz img {
                            width: 24px;
                            height: 24px;
                        }
                    .it_ix .stars, .iv_iz .stars { display: none; }
                }
                @media (min-width:425px) {
                    .it_ix, .iv_iz { padding-right: 25px; }
                    .it_i3, .iv_i5 { margin-left: 40px; }
                    .it_i1, .iv_i3 {
                        height: 24px;
                        line-height: 24px;
                    }
                    .it_iv, .iv_ix {
                        opacity: 0;
                        visiblity: hidden;
                    }
                }
                .popinWrapper .popin-content .title i.fa {
                    cursor: pointer;
                    margin-left: 5px;
                    color: var(--default_color);
                }
                @keyframes backgroundFadeOut {
                    0%  { background-color: rgba(193,225,250,.3) }
                    80% { background-color: rgba(193,225,250,.3) }
                    to  { background-color: transparent }
                }
                .gz_g1 { position:relative; }
                .gz_g1 .form-control {
                    padding-right: 30px;
                    overflow: hidden;
                }
                .gz_g1 button {
                    position: absolute;
                    top: 8px;
                    right: 10px;
                    font-size: 0;
                    width: 16px;
                    height: 16px;
                }
                .gz_g1 button[disabled] { cursor: inherit }
                .gz_g1 button svg { position: relative; top: -1px; }
                .er_et {
                    width: 100%;
                    height: 185px;
                    background-image: linear-gradient(-90deg, #f2f3f6, #edeef1 50%, #f2f3f6);
                    background-size: 600px 104px;
                    animation-name: er_ev;
                    animation-duration: 1.5s;
                    animation-iteration-count: infinite;
                    animation-timing-function: linear;
                    animation-fill-mode: forwards;
                    transform: translateZ(0);
                    clip-path: url("#placeholder");
                    -webkit-clip-path: url("#placeholder")
                }
                .er_ex+.er_ex { margin-top: 9px; padding-top: 10px }
                .er_ez+.er_ez { border-top: 1px var(--gray_light) solid}
                @keyframes er_ev {
                    0% { background-position: -600px 0 }
                    to { background-position: 600px 0 }
                }
                .ef_eh {
                    display: inline-block;
                    position: relative;
                    vertical-align: middle;
                }
                .ef_eh:after {
                    content: "";
                    z-index: 1;
                    position: absolute;
                    top: 50%;
                    right: -11px;
                    width: 0;
                    height: 0;
                    border-top: 3px solid currentColor;
                    border-right: 3px solid transparent;
                    border-left: 3px solid transparent;
                }
                @media (max-width:420px) {
                    .ef_ej { margin-bottom: 5px; }
                }
                @media (min-width:421px) {
                    .ef_ej {
                        z-index: 1;
                        position: absolute;
                        top: 17px;
                        left: 128px;
                    }
                }
            </style>`
        );
        const eventComments = () => {
        const $comments = $('#comments .slide__comment .js-popup-comments');
        $comments.off('click').click(e => {
            e.stopPropagation();
            e.preventDefault();

            let promise = new Promise(resolve => resolve());
            if (res.comments.length <= 0) {
                    promise = res.comments.fetchComments();
            }
            promise.then(() => {
                const commentId = parseInt($(e.currentTarget).data('comment-id'), 10),
                    /**
                     * @type {CommentBS}
                     */
                    objComment = res.comments.getComment(commentId);
                if (!(objComment instanceof CommentBS)) {
                    notification('Affichage commentaire', "Le commentaire n'a pas été retrouvé");
                    console.warn('Commentaire introuvable', {commentId, objComment, 'comments': res.comments});
                    return;
                }
                    objComment.render();
            });
        });
        $('#comments .blockTitles button').removeAttr('onclick').off('click').click(e => {
            e.stopPropagation();
            e.preventDefault();
            res.comments.render();
        });
        };
        $('#comments .slide__comment').off('click');
        addScriptAndLink('moment', () => {
            addScriptAndLink('localefr', eventComments);
        });
    }
    /**
     *
     * @param {Base} res Le média principal
     */
    function replaceVoteFn(res) {
        const $blockMeta = $('.blockInformations__metadatas'),
              $btnVote = $blockMeta.find('button');
        $btnVote.removeAttr('onclick').click(e => {
            e.stopPropagation();
            e.preventDefault();
            res.objNote.createPopupForVote();
        });
    }
    /**
     * Redéfinit l'event click sur le bouton Vu sur la page d'un film
     * @param {Movie} objRes L'objet contenant les infos du film
     */
    function observeBtnVu(objRes) {
        const $btnVu = $(`.blockInformations__action .label:contains("${trans('film.button.watched.label')}")`).siblings('button');
        if (debug) console.log('observeBtnVu', $btnVu);
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
        $btnVu.off('click').click(e => {
            e.stopPropagation();
            e.preventDefault();
            if (debug) console.log('observeBtnVu click');

            // _this.markAsView.blur();
            if (!userIdentified()) {
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
    }
    /**
     * Permet de mettre à jour la liste des épisodes à voir
     * sur la page de l'agenda
     * @return {void}
     */
    function updateAgenda() {
        // Identifier les informations des épisodes à voir
        // Les containers
        let $containersEpisode = $('#reactjs-episodes-to-watch .ComponentEpisodeContainer'), len = $containersEpisode.length, currentShowIds = {};
        // En attente du chargement des épisodes
        if (len > 0) {
            if (debug) console.log('updateAgenda - nb containers: %d', len);
            clearInterval(timerUA);
        }
        else {
            if (debug) console.log('updateAgenda en attente');
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
                //if (debug) console.log('title: %s - code: %s', title, episode);
            }
        });
        if ($('.updateElements').length === 0) {
            // On ajoute le bouton de mise à jour des similaires
            $('.maintitle > div:nth-child(1)').after(`
                <div class="updateElements">
                  <img src="${serverBaseUrl}/img/update.png" width="20" class="updateEpisodes updateElement finish" title="Mise à jour des similaires vus"/>
                </div>
            `);
            addScriptAndLink('moment');
            setTimeout(() => {
                addScriptAndLink('localefr');
            }, 250);
            $('.updateEpisodes').click((e) => {
                e.stopPropagation();
                e.preventDefault();
                if (debug) console.groupCollapsed('Agenda updateEpisodes');
                $containersEpisode = $('#reactjs-episodes-to-watch .ComponentEpisodeContainer');
                const self = $(e.currentTarget), len = $containersEpisode.length;
                self.removeClass('finish');
                let countIntTime = 0;
                Media.callApi('GET', 'episodes', 'list', { limit: 1, order: 'smart', showsLimit: len, released: 1, specials: false, subtitles: 'all' })
                    .then((data) => {
                    let intTime = setInterval(function () {
                        if (++countIntTime > 60) {
                            clearInterval(intTime);
                            self.addClass('finish');
                            notification('Erreur de mise à jour des épisodes', 'updateAgenda: updateEpisodes.click interval time over');
                            if (debug) console.groupEnd();
                            return;
                        }
                        if (typeof moment !== 'function') {
                            return;
                        }
                        else clearInterval(intTime);
                        // moment.locale('fr');
                        let newShowIds = {}, show;
                        if (debug) console.log('updateAgenda updateEpisodes', data);
                        for (let s = 0; s < data.shows.length; s++) {
                            show = data.shows[s];
                            newShowIds[show.id] = { code: show.unseen[0].code.toLowerCase() };
                            if (currentShowIds[show.id] === undefined) {
                                if (debug) console.log('Une nouvelle série est arrivée', show);
                                // Il s'agit d'une nouvelle série
                                // TODO Ajouter un nouveau container
                                let newContainer = $(buildContainer(show.unseen[0]));
                                renderNote(show.unseen[0].note.mean, newContainer);
                                $($containersEpisode.get(s)).parent().after(newContainer);
                            }
                        }
                        if (debug) console.log('Iteration principale');
                        let container, unseen;
                        // Itération principale sur les containers
                        for (let e = 0; e < len; e++) {
                            container = $($containersEpisode.get(e));
                            unseen = null;
                            // Si la serie n'est plus dans la liste
                            if (newShowIds[container.data('showId')] === undefined) {
                                if (debug) console.log('La série %d ne fait plus partie de la liste', container.data('showId'));
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
                                if (debug) console.log('Episode à mettre à jour', unseen);
                                // Mettre à jour l'épisode
                                let mainLink = $('a.mainLink', container), text = unseen.code + ' - ' + unseen.title;
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
                            else {
                                console.log('Episode Show unchanged', unseen);
                            }
                        }
                        fnLazy.init();
                        self.addClass('finish');
                        if (debug) console.groupEnd();
                    }, 500);
                }, (err) => {
                    notification('Erreur de mise à jour des épisodes', 'updateAgenda: ' + err);
                    if (debug) console.groupEnd();
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
                typeSvg = note <= number ? "empty" : (note < number + 1) ? 'half' : "full";
                renderStars.append(`
                    <svg viewBox="0 0 100 100" class="star-svg">
                      <use xmlns:xlink="http://www.w3.org/1999/xlink"
                           xlink:href="#icon-star-${typeSvg}">
                      </use>
                    </svg>
                `);
            });
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
                        <time class="mainTime">${moment(unseen.date).format('D MMMM YYYY')}</time>
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
                const d = Math.floor(seconds / (3600 * 24)), h = Math.floor(seconds % (3600 * 24) / 3600), m = Math.floor(seconds % 3600 / 60);
                //s = Math.floor(seconds % 60);
                let dDisplay = d > 0 ? d + ' j ' : '', hDisplay = h > 0 ? h + ' h ' : '', mDisplay = m >= 0 && d <= 0 ? m + ' min' : '';
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
                for (let st = 0; st < unseen.subtitles.length; st++) {
                    let subtitle = unseen.subtitles[st];
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
                            <a href="${subtitle.url}" class="displayBlock mainLink nd" title="Provenance : ${subtitle.source} / ${subtitle.file} / Ajouté le ${moment(subtitle.date).format('DD/MM/YYYY')}" style="max-width: 365px; margin: 0px; font-size: 12px;">
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
    /**
     * Ajoute le statut de la série sur la page de gestion des séries de l'utilisateur
     */
    function addStatusToGestionSeries() {
        // On vérifie que l'utilisateur est connecté et que la clé d'API est renseignée
        if (!userIdentified() || betaseries_api_user_key === '') return;
        const $series = $('#member_shows div.showItem.cf');
        if ($series.length <= 0) return;
        $series.each(function (_index, serie) {
            let id = parseInt($(serie).data('id'), 10), infos = $(serie).find('.infos');
            Show.fetch(id).then(function (show) {
                infos.append(`<br>Statut: ${(show.isEnded()) ? 'Terminée' : 'En cours'}`);
            }, (err) => {
                notification('Erreur de modification d\'une série', 'addStatusToGestionSeries: ' + err);
            });
        });
    }
};

const now = new Date().getTime();
let loop = 0;
let timerLaunch = setInterval(function() {
    if (loop++ > 150) { // timeout 30 seconds
        clearInterval(timerLaunch);
        console.warn('Le UserScript BetaSeries n\'a pas pu être lancé, car il manque jQuery');
        GM_notification({
            title: "Erreur Timeout UserScript BS",
            text: "Le userscript n'a pas pu être chargé, car jQuery n'est pas présent. Rechargez la page SVP"
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
                text: "Le userscript n'a pas pu être chargé, rechargez la page SVP"
            });
            throw new URIError("The script " + oError.target.src + " didn't load correctly.");
        }
    );
}, 200);