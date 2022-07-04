import { Base, Obj, HTTP_VERBS } from "./Base";

/*
{
    "id": 1733094685,
    "type": "episode",
    "ref_id": "2688065",
    "text": "Nouvel \u00e9pisode : HPI S02E06 - S comme Italie\ufeff",
    "html": "Nouvel \u00e9pisode : <a href=\"\/serie\/hpi\">HPI<\/a> S02E06 - <a href=\"\/episode\/hpi\/s02e06\">S comme Italie<\/a>\ufeff",
    "date": "2022-06-02 03:21:02",
    "seen": "2022-06-02 09:39:25",
    "payload": {
        "title": "S comme Italie",
        "code": "S02E06",
        "show_title": "HPI",
        "picture": "https:\/\/pictures.betaseries.com\/banners\/episodes\/387368\/a8f59c7993bc92134626899f38a7e830.jpg",
        "url": "https:\/\/www.betaseries.com\/episode\/hpi\/s02e06"
    }
},
*/
/**
 * Les différents types de notifications
 */
export enum NotifTypes {
    episode = 'episode',
    reportNew = 'report_new',
    reportTreated = 'report_treated',
    xpMany = 'xp_many',
    bugResolved = 'bug_resolved',
    bugCommented = 'bug_commented',
    poll = 'poll',
    season = 'season',
    comment = 'comment',
    badge = 'badge',

    banner = 'banner',
    character = 'character',
    movie = 'movie',
    forum = 'forum',
    friend = 'friend',
    message = 'message',
    quizz = 'quizz',
    recommend = 'recommend',
    site = 'site',
    subtitles = 'subtitles',
    video = 'video'
}
/**
 * Classe NotifPayload
 * Contient les data de l'objet Payload dans les notifications
 * @class NotifPayload
 */
export class NotifPayload {
    /**
     * Tableau des différentes propriétés de la classe NotifPayload
     * avec leur type, leur valeur par défaut et leur fonction de traitement
     */
    static props = [
        {key: 'url', type: 'string', fn: null, default: ''},
        {key: 'title', type: 'string', fn: null, default: ''},
        {key: 'code', type: 'string', fn: null, default: ''},
        {key: 'show_title', type: 'string', fn: null, default: ''},
        {key: 'picture', type: 'string', fn: null, default: ''},
        {key: 'season', type: 'number', fn: parseInt, default: 0},
        {key: 'name', type: 'string', fn: null, default: ''},
        {key: 'xp', type: 'number', fn: parseInt, default: 0},
        {key: 'user', type: 'string', fn: null, default: ''},
        {key: 'user_id', type: 'number', fn: parseInt, default: 0},
        {key: 'user_picture', type: 'string', fn: null, default: 'https://img.betaseries.com/5gtv-uQY0aSPqDtcyu7rhHLcu6Q=/40x40/smart/https%3A%2F%2Fwww.betaseries.com%2Fimages%2Fsite%2Flogo-64x64.png'},
        {key: 'type', type: 'string', fn: null, default: ''},
        {key: 'type_id', type: 'number', fn: parseInt, default: 0}
    ];
    url: string; // all
    title?: string; // season, episode, comment
    code?: string; // episode
    show_title?: string; // episode
    picture?: string; // badge, episode, season, comment
    season?: number; // season
    name?: string; // badge
    xp?: number; // xp_many
    user?: string; // report_treated, comment
    user_id?: number; // report_treated, comment
    user_picture?: string; // report_treated, comment
    type?: string; // comment
    type_id?: number; // comment

    constructor(data: Obj) {
        let prop: Obj, val: string|number;
        for (let p = 0; p < NotifPayload.props.length; p++) {
            prop = NotifPayload.props[p];
            val = NotifPayload.props[p].default;
            // eslint-disable-next-line no-prototype-builtins
            if (data && data.hasOwnProperty(prop.key)) {
                val = data[prop.key];
                if (prop.fn !== null) {
                    val = prop.fn(val, 10);
                }
            }
            this[prop.key] = val;
        }
    }
}
/**
 * Classe NotificationList
 * Contient les notifications anciennes et nouvelles
 * @class NotificationList
 */
export class NotificationList {
    /**
     * Retourne les notifications du membre
     * @param   {number} [nb = 10] Nombre de notifications à récupérer
     * @returns {Promise<NotificationList>}
     */
    public static fetch(nb = 20): Promise<NotificationList> {
        const params: Obj = {
            all: true,
            sort: 'DESC',
            number: nb
        };
        return Base.callApi(HTTP_VERBS.GET, 'members', 'notifications', params)
        .then((data: Obj) => {
            const notifications = new NotificationList();
            for (let n = 0; n < data.notifications.length; n++) {
                notifications.add(new NotificationBS(data.notifications[n]));
            }
            return notifications;
        })/*
        .catch(err => {
            console.warn('Erreur de récupération des notifications du membre', err);
            return new NotificationList();
        }) */;
    }

    old: Array<NotificationBS>;
    new: Array<NotificationBS>;
    seen: boolean;
    constructor() {
        this.old = [];
        this.new = [];
        this.seen = false;
    }
    /**
     * Symbol Iterator pour pouvoir itérer sur l'objet dans les boucles for
     */
    *[Symbol.iterator] () {
        yield "new";
        yield "old";
    }
    /**
     * length - Retourne le nombre total de notifications
     * @returns {number}
     */
    get length(): number {
        return this.old.length + this.new.length;
    }
    /**
     * add - Ajoute une notification
     * @param {NotificationBS} notif La notification à ajouter
     */
    public add(notif: NotificationBS): void {
        const category = (notif.seen === null) ? 'new' : 'old';
        this[category].push(notif);
    }
    /**
     * markAllAsSeen - Met à jour les nouvelles notifications en ajoutant
     * la date à la propriété seen et en déplacant les notifs dans le
     * tableau old
     */
    public markAllAsSeen(): void {
        if (this.seen && this.new.length > 0) {
            for (let n = this.new.length - 1; n >= 0; n--) {
                this.new[n].seen = new Date();
                this.old.unshift(this.new[n]);
            }
            this.new = [];
            this.seen = false;
        }
    }
}
/**
 * Classe NotificationBS
 * Définit l'objet Notification reçu de l'API BetaSeries
 * @class NotificationBS
 */
export class NotificationBS {
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
    payload: NotifPayload; // sauf report_new

    constructor(data: Obj) {
        this.id = parseInt(data.id, 10);
        this.type = NotifTypes[String(data.type).camelCase()];
        this.ref_id = parseInt(data.ref_id, 10);
        this.text = data.text;
        this.html = data.html;
        this.date = new Date(data.date);
        this.seen = data.seen != null ? new Date(data.seen) : null;
        this.payload = new NotifPayload(data.payload);
    }

    public render(): string {
        if (0 === this.text.length)
            return null;

        let link: string;
        if (this.payload.user.length > 0) {
            link = `<a
                    href="https://www.betaseries.com/membre/${this.payload.user}"
                    target="_blank" class="avatar" data-displaylink="1"
                    >
                <img src="${this.payload.user_picture}" width="40" height="40" alt="avatar" />
            </a>`;
        } else {
            link = `<span class="avatar"><img src="${this.payload.user_picture}" width="40" height="40" alt="avatar" /></span>`;
        }
        const img = (this.payload.picture?.length > 0) ?
            `<div class="notification__image alignSelfFlexStart" data-displayimage="1"}"><img src="${this.payload.picture}" alt="image ${this.type}" height="38" width="38" /></div>` : '';
        return `
            <div
                class="notification${this.seen == null ? ' notification--unread' : ''}"
                id="i${this.id.toString()}"
                data-ref-id="${this.ref_id.toString()}"
                data-type="${this.type}"
            >
                <div class="media">
                    <div class="media-left">${link}</div>
                    <div class="media-body">
                        <div class="displayFlex">
                            <div class="notification__text alignSelfFlexStart">
                                <p>${this.html}</p>
                                <div class="notification__datas">
                                    <span class="mainTime" title="${this.date.format('datetime')}">${this.date.duration()}</span>
                                    <button type="button" class="btn-reset" onclick="deleteNotification('${this.id.toString()}');"><span class="mainTime">∙</span> Masquer</button>
                                </div>
                            </div>
                            ${img}
                        </div>
                    </div>
                </div>
            </div>`.trim();
    }
}