import { Base, Obj, HTTP_VERBS, EventTypes, Callback } from "./Base";
import { CommentBS, implRepliesComment } from "./Comment";
import { Note } from "./Note";

declare const getScrollbarWidth, faceboxDisplay;

/* interface JQuery<TElement = HTMLElement> extends Iterable<TElement> {
    popover?(params: any): this;
} */
export enum OrderComments {
    DESC = 'desc',
    ASC = 'asc'
}
export enum MediaStatusComments {
    OPEN = 'open',
    CLOSED = 'close'
}
export type CustomEvent = {
    elt: JQuery<HTMLElement>;
    event: string;
};
export class CommentsBS implements implRepliesComment {
    /*************************************************/
    /*                  STATIC                       */
    /*************************************************/

    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes: Array<string> = [
        'update',
        'save',
        'add',
        'added',
        'delete',
        'show'
    ];

    /**
     * Envoie une réponse de ce commentaire à l'API
     * @param   {Base} media - Le média correspondant à la collection
     * @param   {string} text - Le texte de la réponse
     * @returns {Promise<void | CommentBS>}
     */
    public static sendComment(media: Base, text: string): Promise<void | CommentBS> {
        const params = {
            type: media.mediaType.singular,
            id: media.id,
            text: text
        };
        return Base.callApi(HTTP_VERBS.POST, 'comments', 'comment', params)
        .then((data: Obj) => {
            const comment = new CommentBS(data.comment, media.comments);
            media.comments.addComment(comment);
            media.comments.is_subscribed = true;
            return comment;
        })
        .catch(err => {
            Base.notification('Commentaire', "Erreur durant l'ajout d'un commentaire");
            console.error(err);
        });
    }

    /*************************************************/
    /*                  PROPERTIES                   */
    /*************************************************/
    /**
     * @type {Array<CommentBS>} Tableau des commentaires
     */
    comments: Array<CommentBS>;
    /**
     * @type {number} Nombre total de commentaires du média
     */
    nbComments: number;
    /**
     * @type {boolean} Indique si le membre à souscrit aux alertes commentaires du média
     */
    is_subscribed: boolean;
    /**
     * @type {string} Indique si les commentaires sont ouverts ou fermés
     */
    status: string;
    /**
     * @type {Base} Le média auquel sont associés les commentaires
     * @private
     */
    private _parent: Base;
    /**
     * @type {Array<CustomEvent>} Tableau des events déclarés par la fonction loadEvents
     * @private
     */
    private _events: Array<CustomEvent>;
    /**
     * @type {object} Objet contenant les fonctions à l'écoute des changements
     * @private
     */
    private _listeners: object;
    /**
     * @type {OrderComments} Ordre de tri des commentaires et des réponses
     */
    private _order: OrderComments;

    /*************************************************/
    /*                  METHODS                      */
    /*************************************************/
    constructor(nbComments: number, media: Base) {
        this.comments = [];
        this._parent = media;
        this.is_subscribed = false;
        this.status = MediaStatusComments.OPEN;
        this.nbComments = nbComments;
        this._order = OrderComments.DESC;
        this._initListeners();
    }
    /**
     * Initialise la collection de commentaires
     */
    public init() {
        const self = this;
        const addCommentId = function() {
            const $vignettes = jQuery('#comments .slides_flex .slide_flex .slide__comment');
            let vignette: JQuery<HTMLElement>;
            for (let v = 0; v < $vignettes.length; v++) {
                vignette = jQuery($vignettes.get(v));
                vignette.attr('data-comment-id', self.comments[v].id);
            }
        };
        if (this.comments.length <= 0 && this.nbComments > 0) {
            const $vignettes = jQuery('#comments .slides_flex .slide_flex');
            this.fetchComments($vignettes.length)
            .then(addCommentId);
        } else {
            addCommentId();
        }
    }
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object {
        const obj: object = {};
        const keys = Reflect.ownKeys(this)
            .filter((key:string) => !key.startsWith('_'));
        for (const key of keys) {
            obj[key] = this[key];
        }
        return obj;
    }
    /**
     * Initialize le tableau des écouteurs d'évènements
     * @returns {Base}
     * @private
     */
    private _initListeners(): this {
        this._listeners = {};
        const EvtTypes = CommentsBS.EventTypes;
        for (let e = 0; e < EvtTypes.length; e++) {
            this._listeners[EvtTypes[e]] = [];
        }
        return this;
    }
    /**
     * Permet d'ajouter un listener sur un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @param  {Function}   fn   - La fonction à appeler
     * @return {Base} L'instance du média
     */
    public addListener(name: EventTypes, fn: Callback, ...args): this {
        // On vérifie que le type d'event est pris en charge
        if (CommentsBS.EventTypes.indexOf(name) < 0) {
            throw new Error(`${name} ne fait pas partit des events gérés par cette classe`);
        }
        if (this._listeners[name] === undefined) {
            this._listeners[name] = [];
        }
        for (const func in this._listeners[name]) {
            if (func.toString() == fn.toString()) {
                if (Base.debug) console.warn('Cette fonction est déjà présente pour event[%s]', name);
                return;
            }
        }
        if (args.length > 0) {
            this._listeners[name].push({fn: fn, args: args});
        } else {
            this._listeners[name].push(fn);
        }
        if (Base.debug) console.log('Base[%s] add Listener on event %s', this.constructor.name, name, this._listeners[name]);
        return this;
    }
    /**
     * Permet de supprimer un listener sur un type d'évenement
     * @param  {string}   name - Le type d'évenement
     * @param  {Function} fn   - La fonction qui était appelée
     * @return {Base} L'instance du média
     */
    public removeListener(name: EventTypes, fn: Callback): this {
        if (this._listeners[name] !== undefined) {
            for (let l = 0; l < this._listeners[name].length; l++) {
                if ((typeof this._listeners[name][l] === 'function' && this._listeners[name][l].toString() === fn.toString()) ||
                    this._listeners[name][l].fn.toString() == fn.toString())
                {
                    this._listeners[name].splice(l, 1);
                }
            }
        }
        return this;
    }
    /**
     * Appel les listeners pour un type d'évenement
     * @param  {EventTypes} name - Le type d'évenement
     * @return {Base} L'instance du média
     */
    protected _callListeners(name: EventTypes): this {
        if (this._listeners[name] !== undefined && this._listeners[name].length > 0) {
            const event = new CustomEvent('betaseries', {detail: {name: name}});
            if (Base.debug) console.log('Comments call %d Listeners on event %s', this._listeners[name].length, name);
            for (let l = 0; l < this._listeners[name].length; l++) {
                if (typeof this._listeners[name][l] === 'function') {
                    this._listeners[name][l].call(this, event, this);
                } else {
                    this._listeners[name][l].fn.apply(this, this._listeners[name][l].args);
                }
            }
        }
        return this;
    }
    /**
     * Retourne la taille de la collection
     * @readonly
     */
    public get length(): number {
        return this.comments.length;
    }
    /**
     * Retourne le média auxquels sont associés les commentaires
     * @readonly
     */
    public get media(): Base {
        return this._parent;
    }
    /**
     * Retourne l'ordre de tri des commentaires
     * @returns {OrderComments}
     */
    public get order(): OrderComments {
        return this._order;
    }
    /**
     * Définit l'ordre de tri des commentaires
     * @param {OrderComments} o - Ordre de tri
     */
    public set order(o: OrderComments) {
        this._order = o;
    }
    /**
     * Récupère les commentaires du média sur l'API
     * @param   {number} [nbpp=50] - Le nombre de commentaires à récupérer
     * @param   {number} [since=0] - L'identifiant du dernier commentaire reçu
     * @param   {OrderComments} [order='desc'] - Ordre de tri des commentaires
     * @returns {Promise<CommentsBS>}
     */
    public fetchComments(nbpp = 50, since = 0, order: OrderComments = OrderComments.DESC): Promise<CommentsBS> {
        if (order !== this._order) { this.order = order; }
        const self = this;
        return new Promise((resolve, reject) => {
            const params: Obj = {
                type: self._parent.mediaType.singular,
                id: self._parent.id,
                nbpp: nbpp,
                replies: 0,
                order: self.order
            };
            if (since > 0) {
                params.since_id = since;
            }
            Base.callApi(HTTP_VERBS.GET, 'comments', 'comments', params)
            .then((data: Obj) => {
                if (data.comments !== undefined) {
                    if (since <= 0) {
                        self.comments = [];
                    }
                    for (let c = 0; c < data.comments.length; c++) {
                        self.comments.push(new CommentBS(data.comments[c], self));
                        // self.addComment(data.comments[c]);
                    }
                }
                self.nbComments = parseInt(data.total, 10);
                self.is_subscribed = !!data.is_subscribed;
                self.status = data.status;
                resolve(self);
            })
            .catch(err => {
                console.warn('fetchComments', err);
                Base.notification('Récupération des commentaires', "Une erreur est apparue durant la récupération des commentaires");
                reject(err);
            });
        });
    }
    /**
     * Ajoute un commentaire à la collection
     * /!\ (Ne l'ajoute pas sur l'API) /!\
     * @param   {Obj} data - Les données du commentaire provenant de l'API
     * @returns {CommentsBS}
     */
    public addComment(data: Obj | CommentBS): this {
        const method = this.order == OrderComments.DESC ? Array.prototype.unshift : Array.prototype.push;
        if (Base.debug) console.log('addComment order: %s - method: %s', this.order, method.name);
        if (data instanceof CommentBS) {
            method.call(this.comments, data);
        } else {
            method.call(this.comments, new CommentBS(data, this));
        }
        this.nbComments++;
        this.media.nbComments++;
        if (Base.debug) console.log('addComment listeners', this._listeners);
        this._callListeners(EventTypes.ADD);
        return this;
    }
    /**
     * Retire un commentaire de la collection
     * /!\ (Ne le supprime pas sur l'API) /!\
     * @param   {number} cmtId - L'identifiant du commentaire à retirer
     * @returns {CommentsBS}
     */
    public removeComment(cmtId: number): this {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cmtId) {
                this.comments.splice(c, 1);
                // retire le commentaire de la liste des commentaires
                this.removeFromPage(cmtId);
                this.nbComments--;
                this.media.nbComments--;
                this._callListeners('delete' as EventTypes);
                break;
            }
        }
        return this;
    }
    /**
     * Indique si il s'agit du premier commentaire
     * @param cmtId - L'identifiant du commentaire
     * @returns {boolean}
     */
    public isFirst(cmtId: number): boolean {
        return this.comments[0].id === cmtId;
    }
    /**
     * Indique si il s'agit du dernier commentaire
     * @param cmtId - L'identifiant du commentaire
     * @returns {boolean}
     */
    public isLast(cmtId: number): boolean {
        return this.comments[this.comments.length - 1].id === cmtId;
    }
    /**
     * Indique si on peut écrire des commentaires sur ce média
     * @returns {boolean}
     */
    public isOpen(): boolean {
        return this.status === MediaStatusComments.OPEN;
    }
    /**
     * Retourne le commentaire correspondant à l'ID fournit en paramètre
     * @param   {number} cId - L'identifiant du commentaire
     * @returns {CommentBS|void}
     */
    public getComment(cId: number): CommentBS {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cId) {
                return this.comments[c];
            }
        }
        return null;
    }
    /**
     * Retourne le commentaire précédent celui fournit en paramètre
     * @param   {number} cId - L'identifiant du commentaire
     * @returns {CommentBS|null}
     */
    public getPrevComment(cId: number): CommentBS {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === cId && c > 0) {
                return this.comments[c - 1];
            }
        }
        return null;
    }
    /**
     * Retourne le commentaire suivant celui fournit en paramètre
     * @param   {number} cId - L'identifiant du commentaire
     * @returns {CommentBS|null}
     */
    public getNextComment(cId: number): CommentBS|null {
        const len = this.comments.length;
        for (let c = 0; c < this.comments.length; c++) {
            // TODO: Vérifier que tous les commentaires ont été récupérer
            if (this.comments[c].id === cId && c < len - 1) {
                return this.comments[c + 1];
            }
        }
        return null;
    }
    /**
     * Retourne les réponses d'un commentaire
     * @param   {number} commentId - Identifiant du commentaire original
     * @param   {OrderComments} [order='desc'] - Ordre de tri des réponses
     * @returns {Promise<Array<CommentBS>>} Tableau des réponses
     */
    public async fetchReplies(commentId: number, order: OrderComments = OrderComments.ASC): Promise<Array<CommentBS>> {
        const data = await Base.callApi(HTTP_VERBS.GET, 'comments', 'replies', { id: commentId, order });
        const replies = [];
        if (data.comments) {
            for (let c = 0; c < data.comments.length; c++) {
                replies.push(new CommentBS(data.comments[c], this));
            }
        }
        return replies;
    }
    /**
     * Modifie le nombre de votes et le vote du membre pour un commentaire
     * @param   {number} commentId - Identifiant du commentaire
     * @param   {number} thumbs - Nombre de votes
     * @param   {number} thumbed - Le vote du membre connecté
     * @returns {boolean}
     */
    public changeThumbs(commentId: number, thumbs: number, thumbed: number): boolean {
        for (let c = 0; c < this.comments.length; c++) {
            if (this.comments[c].id === commentId) {
                this.comments[c].thumbs = thumbs;
                this.comments[c].thumbed = thumbed;
                return true;
            }
        }
        return false;
    }
    /**
     * Retourne la template pour l'affichage de l'ensemble des commentaires
     * @param   {number} nbpp - Le nombre de commentaires à récupérer
     * @returns {Promise<string>} La template
     */
    public async getTemplate(nbpp: number): Promise<string> {
        const self = this;
        return new Promise((resolve, reject) => {
            let promise = Promise.resolve(self);

            if (Base.debug) console.log('Base ', {length: self.comments.length, nbComments: self.nbComments});
            if (self.comments.length <= 0 && self.nbComments > 0) {
                if (Base.debug) console.log('Base fetchComments call');
                promise = self.fetchComments(nbpp) as Promise<this>;
            }
            promise.then(async () => {
                let comment: CommentBS,
                    template = `
                        <div data-media-type="${self._parent.mediaType.singular}"
                            data-media-id="${self._parent.id}"
                            class="displayFlex flexDirectionColumn"
                            style="margin-top: 2px; min-height: 0">`;
                if (Base.userIdentified()) {
                    template += `
                    <button type="button" class="btn-reset btnSubscribe" style="position: absolute; top: 3px; right: 31px; padding: 8px;">
                        <span class="svgContainer">
                            <svg></svg>
                        </span>
                    </button>`;
                }
                template += '<div class="comments overflowYScroll">';
                for (let c = 0; c < self.comments.length; c++) {
                    comment = self.comments[c];
                    template += CommentBS.getTemplateComment(comment);
                    // Si le commentaires à des réponses et qu'elles ne sont pas chargées
                    if (comment.nbReplies > 0 && comment.replies.length <= 0) {
                        // On récupère les réponses
                        if (Base.debug) console.log('Comments render getTemplate fetchReplies');
                        await comment.fetchReplies();
                        // On ajoute un boutton pour afficher/masquer les réponses
                    }
                    for (let r = 0; r < comment.replies.length; r++) {
                        template += CommentBS.getTemplateComment(comment.replies[r]);
                    }
                }
                // On ajoute le bouton pour voir plus de commentaires
                if (self.comments.length < self.nbComments) {
                    template += `
                        <button type="button" class="btn-reset btn-greyBorder moreComments" style="margin-top: 10px; width: 100%;">
                            ${Base.trans("timeline.comments.display_more")}
                            <i class="fa fa-cog fa-spin fa-2x fa-fw" style="display:none;margin-left:15px;vertical-align:middle;"></i>
                            <span class="sr-only">Loading...</span>
                        </button>`;
                }
                template += '</div>'; // Close div.comments
                if (self.isOpen() && Base.userIdentified()) {
                    template += CommentBS.getTemplateWriting();
                }
                resolve(template + '</div>');
            })
            .catch(err => {
                reject(err);
            });
        });
    }
    /**
     * Retourne un tableau contenant les logins des commentaires
     * @returns {Array<string>}
     */
    protected getLogins(): Array<string> {
        const users = [];
        for (let c = 0; c < this.comments.length; c++) {
            if (!users.includes(this.comments[c].login)) {
                users.push(this.comments[c].login);
            }
        }
        return users;
    }
    /**
     * Met à jour le nombre de commentaires sur la page
     */
    public updateCounter() {
        const $counter = jQuery('#comments .blockTitle');
        $counter.text($counter.text().replace(/\d+/, this.nbComments.toString()));
    }
    /**
     * Ajoute les évènements sur les commentaires lors du rendu
     * @param   {JQuery<HTMLElement>} $container - Le conteneur des éléments d'affichage
     * @param   {number} nbpp - Le nombre de commentaires à récupérer sur l'API
     * @param   {Obj} funcPopup - Objet des fonctions d'affichage/ de masquage de la popup
     * @returns {void}
     */
    protected loadEvents($container: JQuery<HTMLElement>, nbpp: number, funcPopup: Obj): void {
        // Tableau servant à contenir les events créer pour pouvoir les supprimer plus tard
        this._events = [];
        const self = this;
        const $popup = jQuery('#popin-dialog');
        const $btnClose = jQuery("#popin-showClose");
        /**
         * Retourne l'objet CommentBS associé au DOMElement fournit en paramètre
         * @param   {JQuery<HTMLElement>} $comment - Le DOMElement contenant le commentaire
         * @returns {Promise<CommentBS>}
         */
        const getObjComment = async function($comment: JQuery<HTMLElement>): Promise<CommentBS> {
            const commentId: number = parseInt($comment.data('commentId'), 10);
            let comment: CommentBS;
            // Si il s'agit d'une réponse, il nous faut le commentaire parent
            if ($comment.hasClass('reply')) {
                let $parent = $comment.prev();
                while ($parent.hasClass('reply')) {
                    $parent = $parent.prev();
                }
                const parentId: number = parseInt($parent.data('commentId'), 10);
                if (commentId == parentId) {
                    comment = self.getComment(commentId);
                } else {
                    const cmtParent = self.getComment(parentId);
                    comment = await cmtParent.getReply(commentId);
                }
            } else {
                comment = self.getComment(commentId);
            }
            return comment;
        };
        // On ajoute les templates HTML du commentaire,
        // des réponses et du formulaire de d'écriture
        // On active le bouton de fermeture de la popup
        $btnClose.click(() => {
            funcPopup.hidePopup();
            $popup.removeAttr('data-popin-type');
        });
        this._events.push({elt: $btnClose, event: 'click'});

        const $btnAllReplies = $container.find('.toggleAllReplies');
        $btnAllReplies.click((e: JQuery.ClickEvent) => {
            const $btn = jQuery(e.currentTarget);
            const stateReplies = $btn.attr('data-toggle'); // 0: Etat masqué, 1: Etat affiché
            const $btnReplies = $container.find(`.toggleReplies[data-toggle="${stateReplies}"]`);
            if (stateReplies == '1') {
                $btnReplies.trigger('click');
                $btn.attr('data-toggle', '0');
                $btn.text('Afficher toutes les réponses');
            } else {
                $btnReplies.trigger('click');
                $btn.attr('data-toggle', '1');
                $btn.text('Masquer toutes les réponses');
            }
        });
        this._events.push({elt: $btnAllReplies, event: 'click'});

        const $btnSubscribe = $container.find('.btnSubscribe');
        /**
         * Met à jour l'affichage du bouton de souscription
         * des alertes de nouveaux commentaires
         * @param   {JQuery<HTMLElement>} $btn - L'élément jQuery correspondant au bouton de souscription
         * @returns {void}
         */
        function displaySubscription($btn: JQuery<HTMLElement>): void {
            if (!self.is_subscribed) {
                $btn.removeClass('active');
                $btn.attr('title', "Recevoir les commentaires par e-mail");
                $btn.find('svg').replaceWith(`
                    <svg fill="${Base.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333'}" width="14" height="16" style="position: relative; top: 1px; left: -1px;">
                        <path fill-rule="nonzero" d="M13.176 13.284L3.162 2.987 1.046.812 0 1.854l2.306 2.298v.008c-.428.812-.659 1.772-.659 2.806v4.103L0 12.709v.821h11.307l1.647 1.641L14 14.13l-.824-.845zM6.588 16c.914 0 1.647-.73 1.647-1.641H4.941c0 .91.733 1.641 1.647 1.641zm4.941-6.006v-3.02c0-2.527-1.35-4.627-3.705-5.185V1.23C7.824.55 7.272 0 6.588 0c-.683 0-1.235.55-1.235 1.23v.559c-.124.024-.239.065-.346.098a2.994 2.994 0 0 0-.247.09h-.008c-.008 0-.008 0-.017.009-.19.073-.379.164-.56.254 0 0-.008 0-.008.008l7.362 7.746z"></path>
                    </svg>
                `);
            } else if (self.is_subscribed) {
                $btn.addClass('active');
                $btn.attr('title', "Ne plus recevoir les commentaires par e-mail");
                $btn.find('svg').replaceWith(`
                    <svg width="20" height="22" viewBox="0 0 20 22" style="width: 17px;">
                        <g transform="translate(-4)" fill="none">
                            <path d="M0 0h24v24h-24z"></path>
                            <path fill="${Base.theme == 'dark' ? 'rgba(255, 255, 255, .5)' : '#333'}" d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32v-.68c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68c-2.87.68-4.5 3.24-4.5 6.32v5l-2 2v1h16v-1l-2-2z"></path>
                        </g>
                    </svg>
                `);
            }
        }
        $btnSubscribe.click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
                faceboxDisplay('inscription', {}, () => {});
                return;
            }
            const $btn = $(e.currentTarget);
            const params: Obj = {type: self._parent.mediaType.singular, id: self._parent.id};
            if ($btn.hasClass('active')) {
                Base.callApi(HTTP_VERBS.DELETE, 'comments', 'subscription', params)
                .then(() => {
                    self.is_subscribed = false;
                    displaySubscription($btn);
                });
            } else {
                Base.callApi(HTTP_VERBS.POST, 'comments', 'subscription', params)
                .then(() => {
                    self.is_subscribed = true;
                    displaySubscription($btn);
                });
            }
        });
        displaySubscription($btnSubscribe);
        this._events.push({elt: $btnSubscribe, event: 'click'});

        // On active le lien pour afficher le spoiler
        const $btnSpoiler = $container.find('.view-spoiler');
        if ($btnSpoiler.length > 0) {
            $btnSpoiler.click((e:JQuery.ClickEvent) => {
                e.stopPropagation();
                e.preventDefault();
                const $btn = jQuery(e.currentTarget);
                const $spoiler = $btn.next('.comment-text').find('.spoiler');
                if ($spoiler.is(':visible')) {
                    $spoiler.fadeOut('fast');
                    $btn.text('Voir le spoiler');
                } else {
                    $spoiler.fadeIn('fast');
                    $btn.text('Cacher le spoiler');
                }
            });
        }
        this._events.push({elt: $btnSpoiler, event: 'click'});
        /**
         * Ajoutons les events pour:
         *  - btnUpVote: Voter pour ce commentaire
         *  - btnDownVote: Voter contre ce commentaire
         */
        const $btnThumb = $container.find('.comments .comment .btnThumb');
        $btnThumb.click(async (e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
                faceboxDisplay('inscription', {}, () => {});
                return;
            }
            const $btn = jQuery(e.currentTarget);
            const $comment = $btn.parents('.comment');
            const commentId: number = parseInt($comment.data('commentId'), 10);
            let comment: CommentBS;
            // Si il s'agit d'une réponse, il nous faut le commentaire parent
            if ($comment.hasClass('reply')) {
                let $parent = $comment.prev();
                while ($parent.hasClass('reply')) {
                    $parent = $parent.prev();
                }
                const parentId: number = parseInt($parent.data('commentId'), 10);
                if (commentId == parentId) {
                    comment = this.getComment(commentId);
                } else {
                    const cmtParent = this.getComment(parentId);
                    comment = await cmtParent.getReply(commentId);
                }
            } else {
                comment = this.getComment(commentId);
            }
            let verb = HTTP_VERBS.POST;
            const vote: number = $btn.hasClass('btnUpVote') ? 1 : -1;
            let params: Obj = {id: commentId, type: vote, switch: false};
            // On a déjà voté
            if (comment.thumbed == vote) {
                verb = HTTP_VERBS.DELETE;
                params = {id: commentId};
            }
            else if (comment.thumbed != 0) {
                console.warn("Le vote est impossible. Annuler votre vote et recommencer");
                return;
            }
            Base.callApi(verb, 'comments', 'thumb', params)
            .then((data: Obj) => {
                comment.thumbs = parseInt(data.comment.thumbs, 10);
                comment.thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                comment.updateRenderThumbs(vote);
            })
            .catch(err => {
                const msg = err.text !== undefined ? err.text : err;
                Base.notification('Thumb commentaire', "Une erreur est apparue durant le vote: " + msg);
            });
        });
        this._events.push({elt: $btnThumb, event: 'click'});
        /**
         * On affiche/masque les options du commentaire
         */
        const $btnOptions = $container.find('.btnToggleOptions');
        $btnOptions.click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            jQuery(e.currentTarget).parents('.actionsCmt').first()
                .find('.options-comment').each((_index: number, elt: HTMLElement) => {
                    const $elt = jQuery(elt);
                    if ($elt.is(':visible')) {
                        $elt.hide();
                    } else {
                        $elt.show();
                    }
                }
            );
        });
        this._events.push({elt: $btnOptions, event: 'click'});
        /**
         * On envoie la réponse à ce commentaire à l'API
         */
        const $btnSend = $container.find('.sendComment');
        $btnSend.click(async (e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
                faceboxDisplay('inscription', {}, () => {});
                return;
            }
            const getNodeCmt = function(cmtId: number): JQuery<HTMLElement> {
                return jQuery(e.currentTarget).parents('.writing').prev('.comments').find(`.comment[data-comment-id="${cmtId.toString()}"]`);
            };
            const $textarea = $(e.currentTarget).siblings('textarea');
            if (($textarea.val() as string).length > 0) {
                const action = $textarea.data('action');
                const msg = $textarea.val() as string;
                let comment: CommentBS;
                let promise;
                if ($textarea.data('replyTo')) {
                    const cmtId = parseInt($textarea.data('replyTo'), 10);
                    comment = self.getComment(cmtId);
                    const $comment = getNodeCmt(cmtId);
                    promise = comment.sendReply($textarea.val() as string).then((reply) => {
                        if (reply instanceof CommentBS) {
                            $textarea.val('');
                            $textarea.siblings('button').attr('disabled', 'true');
                            $textarea.removeAttr('data-reply-to');
                            const template = CommentBS.getTemplateComment(reply);
                            if ($comment.next('.comment').hasClass('reply')) {
                                let $next = $comment.next('.comment');
                                let $prev: JQuery<HTMLElement>;
                                while ($next.hasClass('reply')) {
                                    $prev = $next;
                                    $next = $next.next('.comment');
                                }
                                $prev.after(template);
                            } else {
                                $comment.after(template);
                            }
                        }
                    });
                } else if (action && action === 'edit') {
                    const cmtId = parseInt($textarea.data('commentId'), 10);
                    let $comment = getNodeCmt(cmtId);
                    const comment = await getObjComment($comment);
                    promise = comment.edit(msg).then((comment) => {
                        $comment.find('.comment-text').text(comment.text);
                        $comment = jQuery(`#comments .slide_flex .slide__comment[data-comment-id="${cmtId}"]`);
                        $comment.find('p').text(comment.text);
                        $textarea.removeAttr('data-action');
                        $textarea.removeAttr('data-comment-id');
                        $textarea.val('');
                        $textarea.siblings('button').attr('disabled', 'true');
                    });
                } else {
                    promise = CommentsBS.sendComment(self._parent, $textarea.val() as string)
                    .then((comment: CommentBS) => {
                        if (comment) {
                            $textarea.val('');
                            $textarea.siblings('button').attr('disabled', 'true');
                            const $comments = $textarea.parents('.writing').prev('.comments');
                            if (this.order === OrderComments.DESC) {
                                $comments.prepend(CommentBS.getTemplateComment(comment));
                            } else {
                                $comments.append(CommentBS.getTemplateComment(comment));
                            }
                            $comments.find(`.comment[data-comment-id="${comment.id}"]`).get(0).scrollIntoView();
                            self.addToPage(comment.id);
                        }
                    });
                }
                promise.then(() => {
                    self.cleanEvents(() => {
                        self.loadEvents($container, nbpp, funcPopup);
                    });
                });
            }
        });
        this._events.push({elt: $btnSend, event: 'click'});
        /**
         * On active / desactive le bouton d'envoi du commentaire
         * en fonction du contenu du textarea
         */
        const $textarea = $container.find('textarea');
        $textarea.keypress((e: JQuery.KeyPressEvent) => {
            const $textarea = $(e.currentTarget);
            if (($textarea.val() as string).length > 0) {
                $textarea.siblings('button').removeAttr('disabled');
            } else {
                $textarea.siblings('button').attr('disabled', 'true');
            }
        });
        this._events.push({elt: $textarea, event: 'keypress'});
        /**
         * On ajoute les balises SPOILER au message dans le textarea
         */
        const $baliseSpoiler = $container.find('.baliseSpoiler');
        /**
         * Permet d'englober le texte du commentaire en écriture
         * avec les balises [spoiler]...[/spoiler]
         */
        $baliseSpoiler.click(() => {
            const $textarea = $popup.find('textarea');
            if (/\[spoiler\]/.test($textarea.val() as string)) {
                return;
            }
            // TODO: Gérer la balise spoiler sur une zone de texte sélectionnée
            const text = '[spoiler]' + $textarea.val() + '[/spoiler]';
            $textarea.val(text);
        });
        this._events.push({elt: $baliseSpoiler, event: 'click'});

        const $btnReplies = $container.find('.comments .toggleReplies');
        /**
         * Affiche/masque les réponses d'un commentaire
         */
        $btnReplies.click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            const $btn: JQuery<HTMLElement> = jQuery(e.currentTarget);
            const state = $btn.attr('data-toggle'); // 0: Etat masqué, 1: Etat affiché
            const $comment: JQuery<HTMLElement> = $btn.parents('.comment');
            const inner: string = $comment.data('commentInner');
            const $replies = $comment.parents('.comments').find(`.comment[data-comment-reply="${inner}"]`);
            if (state == '0') {
                // On affiche
                $replies.fadeIn('fast');
                $btn.find('.btnText').text(Base.trans("comment.hide_answers"));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s; transform: rotate(180deg);');
                $btn.attr('data-toggle', '1');
            } else {
                // On masque
                $replies.fadeOut('fast');
                $btn.find('.btnText').text(Base.trans("comment.button.reply", {"%count%": $replies.length.toString()}, $replies.length));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s;');
                $btn.attr('data-toggle', '0');
            }
        });
        this._events.push({elt: $btnReplies, event: 'click'});

        const $btnResponse = $container.find('.btnResponse');
        /**
         * Permet de créer une réponse à un commentaire
         */
        $btnResponse.click(async (e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
                faceboxDisplay('inscription', {}, () => {});
                return;
            }
            const $btn: JQuery<HTMLElement> = $(e.currentTarget);
            const $comment: JQuery<HTMLElement> = $btn.parents('.comment');
            const comment: CommentBS = await getObjComment($comment);
            $container.find('textarea')
                .val('@' + comment.login)
                .attr('data-reply-to', comment.id);
        });
        this._events.push({elt: $btnResponse, event: 'click'});

        const $btnMore = $container.find('.moreComments');
        /**
         * Permet d'afficher plus de commentaires
         */
        $btnMore.click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            const $btn = jQuery(e.currentTarget);
            if (self.comments.length >= self.nbComments) {
                $btn.hide();
                return;
            }
            const $loader = $btn.find('.fa-spin');
            $loader.show();
            const lastCmtId = self.comments[self.comments.length - 1].id;
            const oldLastCmtIndex = self.comments.length - 1;
            self.fetchComments(nbpp, lastCmtId).then(async () => {
                let template = '', comment: CommentBS;
                const firstCmtId: number = self.comments[oldLastCmtIndex + 1].id;
                for (let c = oldLastCmtIndex + 1; c < self.comments.length; c++) {
                    comment = self.comments[c];
                    template += CommentBS.getTemplateComment(comment);
                    // Si le commentaires à des réponses et qu'elles ne sont pas chargées
                    if (comment.nbReplies > 0 && comment.replies.length <= 0) {
                        // On récupère les réponses
                        comment.replies = await self.fetchReplies(comment.id);
                        // On ajoute un boutton pour afficher/masquer les réponses
                    }
                    for (let r = 0; r < comment.replies.length; r++) {
                        template += CommentBS.getTemplateComment(comment.replies[r]);
                    }
                }
                $btn.before(template);
                jQuery(`.comment[data-comment-id="${firstCmtId.toString()}"]`).get(0).scrollIntoView();
                self.cleanEvents(() => {
                    self.loadEvents($container, nbpp, funcPopup);
                });
                if (self.comments.length >= self.nbComments) {
                    $btn.hide();
                }
            }).finally(() => {
                $loader.hide();
            });
        });
        this._events.push({elt: $btnMore, event: 'click'});

        const $btnEdit = $container.find('.btnEditComment');
        $btnEdit.click(async (e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            const $comment = jQuery(e.currentTarget).parents('.comment');
            const commentId = parseInt($comment.data('commentId'), 10);

            const comment = await getObjComment($comment);
            $textarea.val(comment.text);
            $textarea.attr('data-action', 'edit');
            $textarea.attr('data-comment-id', commentId);
        });
        this._events.push({elt: $btnEdit, event: 'click'});

        const $btnDelete = $container.find('.btnDeleteComment');
        $btnDelete.click(async (e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            const $comment = jQuery(e.currentTarget).parents('.comment');
            const $options = jQuery(e.currentTarget).parents('.options-options');
            const template = `
                <div class="options-delete">
                    <span class="mainTime">Supprimer mon commentaire :</span>
                    <button type="button" class="btn-reset fontWeight700 btnYes" style="vertical-align: 0px; padding-left: 10px; padding-right: 10px; color: rgb(208, 2, 27);">Oui</button>
                    <button type="button" class="btn-reset mainLink btnNo" style="vertical-align: 0px;">Non</button>
                </div>
            `;
            $options.hide().after(template);
            const $btnYes = $comment.find('.options-delete .btnYes');
            const $btnNo = $comment.find('.options-delete .btnNo');
            const comment = await getObjComment($comment);
            $btnYes.click((e: JQuery.ClickEvent) => {
                e.stopPropagation();
                e.preventDefault();
                comment.delete();
                let $next = $comment.next('.comment');
                let $prev: JQuery<HTMLElement>;
                while($next.hasClass('reply')) {
                    $prev = $next;
                    $next = $next.next('.comment');
                    $prev.remove();
                }
                $comment.remove();
                self.updateCounter();
            });
            $btnNo.click((e: JQuery.ClickEvent) => {
                e.stopPropagation();
                e.preventDefault();
                $comment.find('.options-delete').remove();
                $options.show();
                $btnYes.off('click');
                $btnNo.off('click');
            });
        });
        this._events.push({elt: $btnDelete, event: 'click'});
        this._callListeners(EventTypes.SHOW);
    }
    /**
     * Nettoie les events créer par la fonction loadEvents
     * @param   {Function} onComplete - Fonction de callback
     * @returns {void}
     */
    protected cleanEvents(onComplete: Callback = Base.noop): void {
        if (this._events && this._events.length > 0) {
            let data: CustomEvent;
            for (let e = 0; e < this._events.length; e++) {
                data = this._events[e];
                if (data.elt.length > 0)
                    data.elt.off(data.event);
            }
        }
        this._events = [];
        onComplete();
    }
    /**
     * Gère l'affichage de l'ensemble des commentaires
     * @returns {void}
     */
    public render(): void {
        if (Base.debug) console.log('CommentsBS render');
        // La popup et ses éléments
        const self = this,
              $popup = jQuery('#popin-dialog'),
              $contentHtmlElement = $popup.find(".popin-content-html"),
              $contentReact = $popup.find('.popin-content-reactmodule'),
              $closeButtons = $popup.find("#popin-showClose"),
              hidePopup = () => {
                  document.body.style.overflow = "visible";
                  document.body.style.paddingRight = "";
                  $popup.attr('aria-hidden', 'true');
                  $popup.find("#popupalertyes").show();
                  $popup.find("#popupalertno").show();
                  $contentHtmlElement.hide();
                  $contentReact.empty();
                  self.cleanEvents();
                },
              showPopup = () => {
                  document.body.style.overflow = "hidden";
                  document.body.style.paddingRight = getScrollbarWidth() + "px";
                  $popup.find("#popupalertyes").hide();
                  $popup.find("#popupalertno").hide();
                  $contentHtmlElement.hide();
                  $contentReact.show();
                  $closeButtons.show();
                  $popup.attr('aria-hidden', 'false');
              };
        // On ajoute le loader dans la popup et on l'affiche
        $contentReact.empty().append(`<div class="title" id="dialog-title" tabindex="0">${Base.trans("blog.title.comments")}</div>`);
        const $title = $contentReact.find('.title');
        $title.append(`<button type="button" class="btn-primary toggleAllReplies" data-toggle="1" style="border-radius:4px;margin-left:10px;">Cacher toutes les réponses</button>`);
        let templateLoader = `
            <div class="loaderCmt">
                <svg class="sr-only">
                    <defs>
                        <clipPath id="placeholder">
                            <path d="M50 25h160v8H50v-8zm0-18h420v8H50V7zM20 40C8.954 40 0 31.046 0 20S8.954 0 20 0s20 8.954 20 20-8.954 20-20 20z"></path>
                        </clipPath>
                    </defs>
                </svg>
        `;
        for (let l = 0; l < 4; l++) {
            templateLoader += `
                <div class="er_ex null"><div class="ComponentPlaceholder er_et " style="height: 40px;"></div></div>`;
        }
        $contentReact.append(templateLoader + '</div>');
        showPopup();

        const nbCmts = 20; // Nombre de commentaires à récupérer sur l'API
        self.getTemplate(nbCmts).then((template) => {
            // On définit le type d'affichage de la popup
            $popup.attr('data-popin-type', 'comments');
            // On masque le loader pour ajouter les données à afficher
            $contentReact.fadeOut('fast', () => {
                $contentReact.find('.loaderCmt').remove();
                $contentReact.append(template);
                $contentReact.fadeIn();
                self.cleanEvents();
                self.loadEvents($contentReact, nbCmts, {hidePopup, showPopup});
            });
        });
    }
    /**
     * Ajoute un commentaire dans la liste des commentaires de la page
     * @param {number} cmtId - L'identifiant du commentaire
     */
    public addToPage(cmtId: number) {
        const comment: CommentBS = this.getComment(cmtId);
        const headMsg = comment.text.substring(0, 210);
        let hideMsg = '';
        if (comment.text.length > 210)
            hideMsg = '<span class="u-colorWhiteOpacity05 u-show-fulltext positionRelative zIndex1"></span><span class="sr-only">' + comment.text.substring(210) + '</span>';
        const avatar = comment.avatar || 'https://img.betaseries.com/NkUiybcFbxbsT_EnzkGza980XP0=/42x42/smart/https%3A%2F%2Fwww.betaseries.com%2Fimages%2Fsite%2Favatar-default.png';
        const template = `
            <div class="slide_flex">
                <div class="slide__comment positionRelative u-insideBorderOpacity u-insideBorderOpacity--01" data-comment-id="${comment.id}">
                    <p>${headMsg} ${hideMsg}</p>
                    <button type="button" class="btn-reset js-popup-comments zIndex10" data-comment-id="${comment.id}"></button>
                </div>
                <div class="slide__author">
                    <div class="media">
                        <span class="media-left avatar">
                            <a href="https://www.betaseries.com/membre/${comment.login}">
                                <img class="u-opacityBackground" src="${avatar}" width="42" height="42" alt="avatar de ${comment.login}" />
                            </a>
                        </span>
                        <div class="media-body">
                            <div class="displayFlex alignItemsCenter">
                                ${comment.login}
                                <span class="stars">${Note.renderStars(comment.user_note, comment.user_id === Base.userId ? 'blue' : '')}</span>
                            </div>
                            <div>
                                <time class="u-colorWhiteOpacity05" style="font-size: 14px;">
                                    ${comment.date.format('dd mmmm yyyy')}
                                </time>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
        jQuery('#comments .slides_flex').prepend(template);
        // On met à jour le nombre de commentaires
        jQuery('#comments .blockTitle').text(jQuery('#comments .blockTitle').text().replace(/\d+/, this._parent.nbComments.toString()));
        this._callListeners(EventTypes.ADDED);
    }
    /**
     * Supprime un commentaire dans la liste des commentaires de la page
     * @param {number} cmtId - L'identifiant du commentaire
     */
    public removeFromPage(cmtId: number) {
        const $vignette = jQuery(`#comments .slides_flex .slide__comment[data-comment-id="${cmtId}"]`);
        $vignette.parents('.slide_flex').remove();
    }
    /**
     * Retourne la template affichant les notes associés aux commentaires
     * @returns {string} La template affichant les évaluations des commentaires
     */
    public showEvaluations(): Promise<string> {
        const self = this;
        const params = {
            type: this.media.mediaType.singular,
            id: this.media.id,
            replies: 1,
            nbpp: this.media.nbComments
        };
        return Base.callApi(HTTP_VERBS.GET, 'comments', 'comments', params)
        .then((data: Obj) => {
            let comments = data.comments || [];
            comments = comments.filter((comment: Obj) => { return comment.user_note > 0; });
            const notes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            const userIds = [];
            let nbEvaluations = 0;
            for (let c = 0; c < comments.length; c++) {
                // Pour éviter les doublons
                if (!userIds.includes(comments[c].user_id)) {
                    userIds.push(comments[c].user_id);
                    nbEvaluations++;
                    notes[comments[c].user_note]++;
                }
            }
            const buildline = function(index: number, notes: object): string {
                const percent:number = nbEvaluations > 0 ? (notes[index] * 100) / nbEvaluations : 0;
                return `<tr class="histogram-row">
                    <td class="nowrap">${index} étoile${index > 1 ? 's':''}</td>
                    <td class="span10">
                        <div class="meter" role="progressbar" aria-valuenow="${percent.toFixed(1)}%">
                            <div class="meter-filled" style="width: ${percent.toFixed(1)}%"></div>
                        </div>
                    </td>
                    <td class="nowrap">${percent.toFixed(1)}%</td>
                </tr>`;
            };
            /*
             * Construction de la template
             *  - Le nombre de notes
             *  - La note moyenne
             *  - Les barres de progression par note
             */
            let template = `
                <div class="evaluations">
                    <div class="size-base">${this.media.objNote.total} évaluation${this.media.objNote.total > 1 ? 's': ''} dont ${nbEvaluations} parmis les commentaires</div>
                    <div class="size-base average">Note globale: <strong>${self._parent.objNote.mean.toFixed(2)}</strong></div>
                    <div><table><tbody>`;
            for (let i = 5; i > 0; i--) {
                template += buildline(i, notes);
            }
            return template + '</tbody></table><p class="alert alert-info"><small>Les pourcentages sont calculés uniquement sur les évaluations dans les commentaires.</small></p></div>';
        });
    }
}