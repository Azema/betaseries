import { UsBetaSeries, HTTP_VERBS, Obj } from "./Base";
import { NotificationList } from "./Notification";

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
export class Member {
    /*
                    STATIC
     */
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
    notifications: NotificationList;

    /*
                    METHODS
     */

    /**
     * Constructeur de la classe Membre
     * @param data Les données provenant de l'API
     * @returns {Member}
     */
    constructor(data: Obj) {
        this.id = parseInt(data.id, 10);
        this.fb_id = parseInt(data.fb_id, 10);
        this.login = data.login;
        this.xp = parseInt(data.xp, 10);
        this.locale = data.locale;
        this.cached = parseInt(data.cached, 10);
        this.avatar = data.avatar;
        this.profile_banner = data.profile_banner;
        this.in_account = !!data.in_account;
        this.is_admin = !!data.is_admin;
        this.subscription = parseInt(data.subscription, 10);
        this.valid_email = !!data.valid_email;
        this.screeners = data.screeners;
        this.twitterLogin = data.twitterLogin;
        this.stats = new Stats(data.stats);
        this.options = new OptionsMember(data.options);
        this.checkNotifs();
    }
    public checkNotifs(): void {
        /**
         * Fonction de traitement de récupération des notifications du membre
         * Alerte le membre de nouvelles notifications à l'aide d'un badge sur l'icone Bell dans le header
         */
         const fetchNotifs = () => {
            NotificationList.fetch(50).then(notifs => {
                this.notifications = notifs;
                const $badge = jQuery('#menuUnseenNotifications');
                if (notifs.new.length > 0) {
                    if ($badge.length <= 0) {
                        // Alerter le membre de nouvelles notifications
                        jQuery('.menu-wrapper .js-iconNotifications').append(`<i class="unread-count unread-notifications" id="menuUnseenNotifications">${notifs.new.length}</i>`);
                    } else {
                        $badge.text(notifs.new.length);
                    }
                    jQuery('.menu-icon--bell').removeClass('has-notifications');
                } else if ($badge.length > 0) {
                    $badge.remove();
                }
            });
        };
        // On met à jour les notifications toutes les 5 minutes
        setInterval(fetchNotifs, 300000);
        fetchNotifs();
    }

    /**
     * renderNotifications - Affiche les notifications du membre
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