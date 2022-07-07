import { Obj } from "./Base";
import { NotificationList } from "./Notification";
declare enum DaysOfWeek {
    monday = "lundi",
    tuesday = "mardi",
    wednesday = "mercredi",
    thursday = "jeudi",
    friday = "vendredi",
    saturday = "samedi",
    sunday = "dimanche"
}
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
export declare class Options {
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
     * @type {number} Identifiant du membre
     */
    id: number;
    /**
     * @type {number} Identifiant Facebook ?
     */
    fb_id: number;
    /**
     * @type {string} Login du membre
     */
    login: string;
    /**
     * @type {number} Points d'expérience
     */
    xp: number;
    /**
     * @type {string} Locale utiliser par le membre
     */
    locale: string;
    /**
     * @type {number} ?
     */
    cached: number;
    /**
     * @type {string} URL de l'avatar du membre
     */
    avatar: string;
    /**
     * @type {string} URL de la bannière du membre
     */
    profile_banner: string;
    /**
     * @type {boolean} ?
     */
    in_account: boolean;
    /**
     * @type {boolean} Membre Administrateur ?
     */
    is_admin: boolean;
    /**
     * @type {number} Année d'inscription
     */
    subscription: number;
    /**
     * @type {boolean} Indique si l'adresse mail a été validée
     */
    valid_email: boolean;
    /**
     * @type {Array<string>} ?
     */
    screeners: Array<string>;
    /**
     * @type {string} Login Twitter
     */
    twitterLogin: string;
    /**
     * @type {Stats} Les statistiques du membre
     */
    stats: Stats;
    /**
     * @type {Options} Les options de paramétrage du membre
     */
    options: Options;
    /**
     * @type {NotificationList} Tableau des notifications du membre
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
export {};
