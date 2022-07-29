import { Obj } from "./Base";
import { implFillDecorator } from "./Decorators";
import { NotificationList } from "./Notification";
import { Changes, RelatedProp } from "./RenderHtml";
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
export declare class Member implements implFillDecorator {
    static logger: import("./Debug").Debug;
    static debug: any;
    static relatedProps: Record<string, RelatedProp>;
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
    _notifications: NotificationList;
    private __decorators;
    __initial: boolean;
    __changes: Record<string, Changes>;
    __props: string[];
    elt: JQuery<HTMLElement>;
    /**
     * Constructeur de la classe Membre
     * @param data Les données provenant de l'API
     * @returns {Member}
     */
    constructor(data: Obj);
    get notifications(): NotificationList;
    /**
     * Définit la propriété `notifications` et lui ajoute un listener sur l'event SEEN
     * @param  {NotificationList} list - La liste des notifications
     * @throws {TypeError}
     */
    set notifications(list: NotificationList);
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Member}
     */
    fill(data: Obj): this;
    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey: string): void;
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object;
    checkNotifs(): void;
    addNotifications(notifs: Obj): void;
    /**
     * renderNotifications - Affiche les notifications du membre sur la page Web
     * @returns {void}
     */
    renderNotifications(): void;
}
