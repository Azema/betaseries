import { Obj } from "./Base";
import { NotificationList } from "./Notification";
/**
 * DaysOfWeek
 * @enum
 * @memberof Stats
 * @alias DaysOfWeek
 */
export declare enum DaysOfWeek {
    monday = "lundi",
    tuesday = "mardi",
    wednesday = "mercredi",
    thursday = "jeudi",
    friday = "vendredi",
    saturday = "samedi",
    sunday = "dimanche"
}
/**
 * Stats
 * @class
 * @memberof Member
 */
export declare class Stats {
    friends: number;
    shows: number;
    seasons: number;
    episodes: number;
    comments: number;
    progress: number;
    episodes_to_watch: number;
    time_on_tv: number;
    time_to_spend: number;
    movies: number;
    badges: number;
    member_since_days: number;
    friends_of_friends: number;
    episodes_per_month: number;
    favorite_day: DaysOfWeek;
    five_stars_percent: number;
    four_five_stars_total: number;
    streak_days: number;
    favorite_genre: string;
    written_words: number;
    without_days: number;
    shows_finished: number;
    shows_current: number;
    shows_to_watch: number;
    shows_abandoned: number;
    movies_to_watch: number;
    time_on_movies: number;
    time_to_spend_movies: number;
    constructor(data: Obj);
}
/**
 * OptionsMember
 * @class
 * @memberof Member
 */
export declare class OptionsMember {
    downloaded: boolean;
    notation: boolean;
    timelag: boolean;
    global: boolean;
    specials: boolean;
    episodes_tri: string;
    friendship: string;
    country: string;
    language: string;
    mail_mois: boolean;
    mail_hebdo: boolean;
    notification_news: boolean;
    twitter_auto: boolean;
    constructor(data: Obj);
}
export declare class Member {
    /**
     * Retourne les infos du membre connecté
     * @returns {Promise<Member>} Une instance du membre connecté
     */
    static fetch(): Promise<Member>;
    /**
     * Identifiant du membre
     * @type {number}
     */
    id: number;
    /**
     * Identifiant Facebook ?
     * @type {number}
     */
    fb_id: number;
    /**
     * Login du membre
     * @type {string}
     */
    login: string;
    /**
     * Points d'expérience
     * @type {number}
     */
    xp: number;
    /**
     * Locale utiliser par le membre
     * @type {string}
     */
    locale: string;
    /**
     * ???
     * @type {number}
     */
    cached: number;
    /**
     * URL de l'avatar du membre
     * @type {string}
     */
    avatar: string;
    /**
     * URL de la bannière du membre
     * @type {string}
     */
    profile_banner: string;
    /**
     * ???
     * @type {boolean}
     */
    in_account: boolean;
    /**
     * Membre Administrateur ?
     * @type {boolean}
     */
    is_admin: boolean;
    /**
     * Année d'inscription
     * @type {number}
     */
    subscription: number;
    /**
     * Indique si l'adresse mail a été validée
     * @type {boolean}
     */
    valid_email: boolean;
    /**
     * ???
     * @type {string[]}
     */
    screeners: Array<string>;
    /**
     * Login Twitter
     * @type {string}
     */
    twitterLogin: string;
    /**
     * Les statistiques du membre
     * @type {Stats}
     */
    stats: Stats;
    /**
     * Les options de paramétrage du membre
     * @type {OptionsMember}
     */
    options: OptionsMember;
    /**
     * Tableau des notifications du membre
     * @type {NotificationList}
     */
    notifications: NotificationList;
    /**
     * Constructeur de la classe Membre
     * @param data Les données provenant de l'API
     * @returns {Member}
     */
    constructor(data: Obj);
    checkNotifs(): void;
    /**
     * renderNotifications - Affiche les notifications du membre
     */
    renderNotifications(): void;
}
