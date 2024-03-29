import { UsBetaSeries, HTTP_VERBS, Obj, isNull, EventTypes } from "./Base";
import { AbstractDecorator, FillDecorator, implFillDecorator } from "./Decorators";
import { NotificationBS, NotificationList } from "./Notification";
import { Changes, RelatedProp } from "./RenderHtml";

/**
 * DaysOfWeek
 * @enum
 * @memberof Stats
 * @alias DaysOfWeek
 */
export enum DaysOfWeek {
    monday = 'lundi',
    tuesday = 'mardi',
    wednesday = 'mercredi',
    thursday = 'jeudi',
    friday = 'vendredi',
    saturday = 'samedi',
    sunday = 'dimanche'
}
/**
 * Stats
 * @class
 * @memberof Member
 */
export class Stats {
    friends: number
    shows: number
    seasons: number
    episodes: number
    comments: number
    progress: number
    episodes_to_watch: number
    time_on_tv: number
    time_to_spend: number
    movies: number
    badges: number
    member_since_days: number
    friends_of_friends: number
    episodes_per_month: number
    favorite_day: DaysOfWeek
    five_stars_percent: number
    four_five_stars_total: number
    streak_days: number
    favorite_genre: string
    written_words: number
    without_days: number
    shows_finished: number
    shows_current: number
    shows_to_watch: number
    shows_abandoned: number
    movies_to_watch: number
    time_on_movies: number
    time_to_spend_movies: number

    constructor(data: Obj) {
        for (const key in Object.keys(data)) {
            this[key] = data[key];
        }
    }
}
/**
 * OptionsMember
 * @class
 * @memberof Member
 */
export class OptionsMember {
    downloaded: boolean
    notation: boolean
    timelag: boolean
    global: boolean
    specials: boolean
    episodes_tri: string
    friendship: string
    country: string
    language: string
    mail_mois: boolean
    mail_hebdo: boolean
    notification_news: boolean
    twitter_auto: boolean

    constructor(data: Obj) {
        for (const key in Object.keys(data)) {
            this[key] = data[key];
        }
    }
}
/* eslint-disable-next-line no-unused-vars */
export class Member implements implFillDecorator {
    /*
                    STATIC
     */
    static logger = new UsBetaSeries.setDebug('Member');
    static debug = Member.logger.debug.bind(Member.logger);

    static relatedProps: Record<string, RelatedProp> = {
        "id": {key: "id", type: 'number'},
        "fb_id": {key: "fb_id", type: 'number'},
        "login": {key: "login", type: 'string'},
        "xp": {key: "xp", type: 'number'},
        "locale": {key: "locale", type: 'string'},
        "cached": {key: "cached", type: 'number'},
        "avatar": {key: "avatar", type: 'string'},
        "profile_banner": {key: "profile_banner", type: 'string'},
        "in_account": {key: "in_account", type: 'boolean'},
        "is_admin": {key: "is_admin", type: 'boolean', default: false},
        "subscription": {key: "subscription", type: 'number'},
        "valid_email": {key: "valid_email", type: 'boolean', default: false},
        "screeners": {key: "screeners", type: 'array<string>', default: []},
        "twitterLogin": {key: "twitterLogin", type: 'string'},
        "stats": {key: "stats", type: Stats},
        "options": {key: "options", type: OptionsMember}
    };

    /**
     * Retourne les infos du membre connecté
     * @returns {Promise<Member>} Une instance du membre connecté
     */
    public static fetch(): Promise<Member> {
        const params: Obj = {};
        if (UsBetaSeries.userId !== null) {
            params.id = UsBetaSeries.userId;
        }
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'members', 'infos', params)
        .then((data: Obj) => {
            return new Member(data.member);
        })
        .catch(err => {
            console.warn('Erreur lors de la récupération des infos du membre', err);
            throw new Error("Erreur de récupération du membre");
        });
    }

    /*
                    PROPERTIES
     */

    /**
     * Identifiant du membre
     * @type {number}
     */
    id: number
    /**
     * Identifiant Facebook ?
     * @type {number}
     */
    fb_id: number
    /**
     * Login du membre
     * @type {string}
     */
    login: string
    /**
     * Points d'expérience
     * @type {number}
     */
    xp: number
    /**
     * Locale utiliser par le membre
     * @type {string}
     */
    locale: string
    /**
     * ???
     * @type {number}
     */
    cached: number
    /**
     * URL de l'avatar du membre
     * @type {string}
     */
    avatar: string
    /**
     * URL de la bannière du membre
     * @type {string}
     */
    profile_banner: string
    /**
     * ???
     * @type {boolean}
     */
    in_account: boolean
    /**
     * Membre Administrateur ?
     * @type {boolean}
     */
    is_admin: boolean
    /**
     * Année d'inscription
     * @type {number}
     */
    subscription: number
    /**
     * Indique si l'adresse mail a été validée
     * @type {boolean}
     */
    valid_email: boolean
    /**
     * ???
     * @type {string[]}
     */
    screeners: Array<string>
    /**
     * Login Twitter
     * @type {string}
     */
    twitterLogin: string
    /**
     * Les statistiques du membre
     * @type {Stats}
     */
    stats: Stats
    /**
     * Les options de paramétrage du membre
     * @type {OptionsMember}
     */
    options: OptionsMember
    /**
     * Tableau des notifications du membre
     * @type {NotificationList}
     */
    _notifications: NotificationList;

    private __decorators: Record<string, AbstractDecorator> = {
        fill: new FillDecorator(this)
    };

    __initial = true;
    __changes: Record<string, Changes> = {};
    __props: string[] = [];

    elt: JQuery<HTMLElement>;

    /*
                    METHODS
     */

    /**
     * Constructeur de la classe Membre
     * @param data Les données provenant de l'API
     * @returns {Member}
     */
    constructor(data: Obj) {
        this.notifications = new NotificationList();
        return this.fill(data);
    }

    get notifications(): NotificationList {
        return this._notifications;
    }

    /**
     * Définit la propriété `notifications` et lui ajoute un listener sur l'event SEEN
     * @param  {NotificationList} list - La liste des notifications
     * @throws {TypeError}
     */
    set notifications(list: NotificationList) {
        if (!(list instanceof NotificationList)) {
            throw new TypeError("Property notifications must be an instance of NotificationList");
        }
        this._notifications = list;
        /**
         *
         * @param {CustomEvent} event
         * @this NotificationList
         */
        const addBadgeNotifs = function(event: CustomEvent) {
            Member.debug('NotificationList.setter notifications - function addBadgeNotifs', event, this);
            if (jQuery('.menu-icon--bell').length > 0) {
                jQuery('.menu-icon--bell').replaceWith(`<span class="menu-icon menu-icon-bell fa-solid fa-bell"></span>`);
            }
            const $bell = jQuery('.menu-item.js-growl-container .menu-icon-bell');
            const $badge = jQuery('#menuUnseenNotifications');
            if (this.hasNew()) {
                if ($badge.length <= 0) {
                    // Alerter le membre de nouvelles notifications
                    jQuery('.menu-wrapper .js-iconNotifications').append(`<i class="unread-count unread-notifications" id="menuUnseenNotifications">${this.new.length}</i>`);
                } else {
                    $badge.text(this.new.length);
                }
            } else if ($badge.length > 0) {
                $badge.remove();
            }
            $bell.toggleClass('fa-shake', this.hasNew());
        };
        const removeBadgeNotifs = function(event: CustomEvent) {
            Member.debug('NotificationList.setter notifications - function removeBadgeNotifs', event, this);
            jQuery('#menuUnseenNotifications').remove();
            jQuery('.menu-item.js-growl-container .menu-icon-bell').removeClass('fa-shake');
            localStorage.setItem('notifications', JSON.stringify(this));
        };
        this._notifications
            .on(EventTypes.NEW, addBadgeNotifs)
            .on(EventTypes.SEEN, removeBadgeNotifs);
    }

    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Member}
     */
    public fill(data: Obj): this {
        try {
            return (this.__decorators.fill as FillDecorator).fill.call(this, data);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey: string): void {
        try {
            (this.__decorators.fill as FillDecorator).updatePropRender.call(this, propKey);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object {
        const obj: object = {};
        for (const key of this.__props) {
            obj[key] = this[key];
        }
        return obj;
    }

    public checkNotifs(): void {
        /**
         * Fonction de traitement de récupération des notifications du membre
         * Alerte le membre de nouvelles notifications à l'aide d'un badge sur l'icone Bell dans le header
         */
         const fetchNotifs = () => {
            NotificationList.fetch(50).then(notifs => {
                this.notifications = notifs;
            });
        };
        // On met à jour les notifications toutes les 5 minutes
        setInterval(fetchNotifs, 300000);
        fetchNotifs();
    }

    public addNotifications(notifs: Obj): void {
        if (isNull(this.notifications)) {
            this.notifications = new NotificationList();
        }
        for (let n = 0, _len = notifs.length; n < _len; n++) {
            this.notifications.add(new NotificationBS(notifs[n]));
        }
        this.notifications.sort();
    }

    /**
     * renderNotifications - Affiche les notifications du membre sur la page Web
     * @returns {void}
     */
    public renderNotifications(): void {
        const $growl = jQuery('#growl'),
              $loader = jQuery('#growl .notifications__loader'),
              $deleteAll = jQuery('#growl .notification.notification--delete-all'),
              $notifNew = jQuery('#growl .js-notificationsNew-list'),
              $notifOld = jQuery('#growl .js-notificationsOld-list'),
              $lists = jQuery('#growl .notificationsList'),
              $notifs = {
                  'old': $notifOld,
                  'new': $notifNew
              };
        // On vide les listes de notifications pour commencer
        $notifNew.empty();
        $notifOld.empty();
        $deleteAll.hide(); // On masque la partie actions de suppression
        $lists.hide(); // On masque les listes de notifications
        // On affiche le conteneur de listes de notifications et le loader
        $growl.addClass('visible');
        $loader.show();
        // On ajoute les notifications aux conteneurs
        for (const key of this.notifications) {
            for (let n = 0; n < this.notifications[key].length; n++) {
                $notifs[key].append(this.notifications[key][n].render());
            }
            // On affiche la liste, si il y a du contenu
            if (this.notifications[key].length > 0) {
                $notifs[key].parents('.notificationsList').show();
            }
        }
        // On masque le loader
        $loader.hide();
        if (this.notifications.length > 0) {
            // On affiche la partie actions de suppression
            $deleteAll.show();
            // On passe toutes les nouvelles notifications en anciennes (déjà vues)
            if (this.notifications.new.length > 0) {
                this.notifications.seen = true;
            }
            jQuery('#menuUnseenNotifications').remove();
        }
    }
}