import { Obj, EventTypes } from "./Base";
import { fnEmitter, implEmitterDecorator } from "./Decorators";
/**
 * Les différents types de notifications
 */
export declare enum NotifTypes {
    episode = "episode",
    reportNew = "report_new",
    reportTreated = "report_treated",
    xpMany = "xp_many",
    bugResolved = "bug_resolved",
    bugCommented = "bug_commented",
    poll = "poll",
    season = "season",
    comment = "comment",
    badge = "badge",
    banner = "banner",
    character = "character",
    movie = "movie",
    forum = "forum",
    friend = "friend",
    message = "message",
    quizz = "quizz",
    recommend = "recommend",
    site = "site",
    subtitles = "subtitles",
    video = "video"
}
/**
 * Classe NotifPayload
 * Contient les data de l'objet Payload dans les notifications
 * @class NotifPayload
 */
export declare class NotifPayload {
    /**
     * Tableau des différentes propriétés de la classe NotifPayload
     * avec leur type, leur valeur par défaut et leur fonction de traitement
     */
    static props: Record<string, any>[];
    url: string;
    title?: string;
    code?: string;
    show_title?: string;
    picture?: string;
    season?: number;
    name?: string;
    xp?: number;
    user?: string;
    user_id?: number;
    user_picture?: string;
    type?: string;
    type_id?: number;
    constructor(data: Obj);
}
/**
 * Classe NotificationList
 * Contient les notifications anciennes et nouvelles
 * @class NotificationList
 */
export declare class NotificationList implements implEmitterDecorator {
    static logger: import("./Debug").Debug;
    static debug: any;
    static EventTypes: EventTypes[];
    /**
     * Retourne les notifications du membre
     * @param   {number} [nb = 10] Nombre de notifications à récupérer
     * @returns {Promise<NotificationList>}
     */
    static fetch(nb?: number): Promise<NotificationList>;
    static fromJSON(notifs: any): NotificationList;
    old: Array<NotificationBS>;
    new: Array<NotificationBS>;
    seen: boolean;
    private __decorators;
    constructor();
    hasListeners(event: EventTypes): boolean;
    on(event: EventTypes, fn: fnEmitter): implEmitterDecorator;
    off(event: EventTypes, fn?: fnEmitter): implEmitterDecorator;
    once(event: EventTypes, fn: fnEmitter): implEmitterDecorator;
    emit(event: EventTypes): implEmitterDecorator;
    /**
     * Symbol Iterator pour pouvoir itérer sur l'objet dans les boucles for
     */
    [Symbol.iterator](): Generator<"new" | "old", void, unknown>;
    /**
     * length - Retourne le nombre total de notifications
     * @returns {number}
     */
    get length(): number;
    /**
     * add - Ajoute une notification
     * @param {NotificationBS} notif La notification à ajouter
     */
    add(notif: NotificationBS): void;
    /**
     * Tri les tableaux des notifications en ordre DESC
     * @returns {NotificationList}
     */
    sort(): NotificationList;
    /**
     * markAllAsSeen - Met à jour les nouvelles notifications en ajoutant
     * la date à la propriété seen et en déplacant les notifs dans le
     * tableau old
     */
    markAllAsSeen(): void;
    getLastId(): number;
    hasNew(): boolean;
    toJSON(): object;
}
/**
 * Classe NotificationBS
 * Définit l'objet Notification reçu de l'API BetaSeries
 * @class NotificationBS
 */
export declare class NotificationBS {
    /**
     * Identifiant de la notification
     * @type {number}
     */
    id: number;
    /**
     * Type de notification
     * @type {NotifTypes}
     */
    type: NotifTypes;
    /**
     * Identifiant correspondant à l'objet définit par le type de notification
     * @type {number}
     */
    ref_id: number;
    /**
     * Texte brut de la notification
     * @type {string}
     */
    text: string;
    /**
     * Version HTML du texte de la notification
     * @type {string}
     */
    html: string;
    /**
     * Date de création de la notification
     * @type {Date}
     */
    date: Date;
    /**
     * Date à laquelle le membre à vu la notification
     * @type {Date}
     */
    seen: Date;
    /**
     * Payload - contient les données de référence liées à la notification
     */
    payload: NotifPayload;
    constructor(data: Obj);
    render(): string;
}
