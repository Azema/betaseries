import { Base, Obj, HTTP_VERBS, MediaTypes } from "./Base";
import { CommentBS, implRepliesComment } from "./Comment";

declare var getScrollbarWidth, faceboxDisplay: Function;

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
     * Envoie une réponse de ce commentaire à l'API
     * @param   {Base} media - Le média correspondant à la collection
     * @param   {string} text - Le texte de la réponse
     * @returns {Promise<void | CommentBS>}
     */
    public static sendComment(media: Base, text: string): Promise<void | CommentBS> {
        const _this = this;
        const params = {
            type: media.mediaType.singular,
            id: media.id,
            text: text
        };
        return Base.callApi(HTTP_VERBS.POST, 'comments', 'comment', params)
        .then((data: Obj) => {
            const comment = new CommentBS(data.comment, media.comments, media);
            media.comments.addComment(comment);
            media.comments.nbComments++;
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
    _parent: Base;
    comments: Array<CommentBS>;
    nbComments: number;
    is_subscribed: boolean;
    status: string;
    private _events: Array<CustomEvent>;

    /*************************************************/
    /*                  METHODS                      */
    /*************************************************/
    constructor(nbComments: number, media: Base) {
        this.comments = new Array();
        this._parent = media;
        this.is_subscribed = false;
        this.status = MediaStatusComments.OPEN;
        this.nbComments = nbComments;
    }
    /**
     * Retourne la taille de la collection
     * @readonly
     */
    public get length(): number {
        return this.comments.length;
    }

    /**
     * Récupère les commentaires du média sur l'API
     * @param   {number} [nbpp=50] - Le nombre de commentaires à récupérer
     * @param   {number} [since=0] - L'identifiant du dernier commentaire reçu
     * @returns {Promise<CommentsBS>}
     */
    public fetchComments(nbpp: number = 50, since: number = 0): Promise<CommentsBS> {
        const self = this;
        return new Promise((resolve: Function, reject: Function) => {
            let params: Obj = {
                type: self._parent.mediaType.singular,
                id: self._parent.id,
                nbpp: nbpp,
                replies: 0,
                order: 'desc'
            };
            if (since > 0) {
                params.since_id = since;
            }
            Base.callApi(HTTP_VERBS.GET, 'comments', 'comments', params)
            .then((data: Obj) => {
                if (data.comments !== undefined) {
                    if (since <= 0) {
                        self.comments = new Array();
                    }
                    for (let c = 0; c < data.comments.length; c++) {
                        self.addComment(data.comments[c]);
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
     * @param   {Obj} data - Les données du commentaire provenant de l'API
     * @returns {CommentsBS}
     */
    public addComment(data: Obj | CommentBS): this {
        if (data instanceof CommentBS) {
            this.comments.push(data);
        } else {
            this.comments.push(new CommentBS(data, this, this._parent));
        }
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
    public getNextComment(cId: number): CommentBS {
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
     * @returns {Promise<Array<CommentBS>>} Tableau des réponses
     */
    public async fetchReplies(commentId: number): Promise<Array<CommentBS>> {
        const data = await Base.callApi(HTTP_VERBS.GET, 'comments', 'replies', { id: commentId, order: 'desc' });
        const replies = new Array();
        if (data.comments) {
            for (let c = 0; c < data.comments.length; c++) {
                replies.push(new CommentBS(data.comments[c], this, this._parent));
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
        return new Promise((resolve: Function, reject: Function) => {
            let promise = Promise.resolve(self);

            if (Base.debug) console.log('Base ', {length: self.comments.length, nbComments: self.nbComments});
            if (self.comments.length <= 0 && self.nbComments > 0) {
                if (Base.debug) console.log('Base fetchComments call');
                promise = self.fetchComments(nbpp) as Promise<this>;
            }
            let comment: CommentBS,
                template: string = `
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
            promise.then(async () => {
                for (let c = 0; c < self.comments.length; c++) {
                    comment = self.comments[c];
                    template += CommentBS.getTemplateComment(comment, true);
                    // Si le commentaires à des réponses et qu'elles ne sont pas chargées
                    if (comment.nbReplies > 0 && comment.replies.length <= 0) {
                        // On récupère les réponses
                        comment.replies = await self.fetchReplies(comment.id);
                        // On ajoute un boutton pour afficher/masquer les réponses
                    }
                    for (let r = 0; r < comment.replies.length; r++) {
                        template += CommentBS.getTemplateComment(comment.replies[r], true);
                    }
                }
                // On ajoute le bouton pour voir plus de commentaires
                if (self.comments.length < self.nbComments) {
                    template += `<button type="button" class="btn-reset btn-greyBorder moreComments" style="margin-top: 10px; width: 100%;">${Base.trans("timeline.comments.display_more")}<i class="fa fa-cog fa-spin fa-2x fa-fw" style="display:none;margin-left:15px;vertical-align:middle;"></i><span class="sr-only">Loading...</span></button>`;
                }
                template + '</div>';
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
     * Ajoute les évènements sur les commentaires lors du rendu
     * @param   {JQuery<HTMLElement>} $container - Le conteneur des éléments d'affichage
     * @param   {number} nbpp - Le nombre de commentaires à récupérer sur l'API
     * @param   {Obj} funcPopup - Objet des fonctions d'affichage/ de masquage de la popup
     * @returns {void}
     */
    protected loadEvents($container: JQuery<HTMLElement>, nbpp: number, funcPopup: Obj): void {
        // Tableau servant à contenir les events créer pour pouvoir les supprimer plus tard
        this._events = new Array();
        const self = this;
        const $popup = jQuery('#popin-dialog');
        const $btnClose = jQuery("#popin-showClose");
        // On ajoute les templates HTML du commentaire,
        // des réponses et du formulaire de d'écriture
        // On active le bouton de fermeture de la popup
        $btnClose.click(() => {
            funcPopup.hidePopup();
            $popup.removeAttr('data-popin-type');
        });
        this._events.push({elt: $btnClose, event: 'click'});

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
                faceboxDisplay('inscription', {}, function() {});
                return;
            }
            const $btn = $(e.currentTarget);
            let params: Obj = {type: self._parent.mediaType.singular, id: self._parent.id};
            if ($btn.hasClass('active')) {
                Base.callApi(HTTP_VERBS.DELETE, 'comments', 'subscription', params)
                .then((data: Obj) => {
                    self.is_subscribed = false;
                    displaySubscription($btn);
                });
            } else {
                Base.callApi(HTTP_VERBS.POST, 'comments', 'subscription', params)
                .then((data: Obj) => {
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
                $(e.currentTarget).prev('span.comment-text').fadeIn();
                $(e.currentTarget).fadeOut();
            });
        }
        this._events.push({elt: $btnSpoiler, event: 'click'});
        /**
         * Ajoutons les events pour:
         *  - btnUpVote: Voter pour ce commentaire
         *  - btnDownVote: Voter contre ce commentaire
         */
        const $btnThumb = $container.find('.comments .comment .btnThumb');
        $btnThumb.click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
                faceboxDisplay('inscription', {}, function() {});
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
                    comment = cmtParent.getReply(commentId);
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
        $btnSend.click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
                faceboxDisplay('inscription', {}, function() {});
                return;
            }
            const $textarea = $(e.currentTarget).siblings('textarea');
            if (($textarea.val() as string).length > 0) {
                let comment: CommentBS;
                if ($textarea.data('replyTo')) {
                    comment = self.getComment(parseInt($textarea.data('replyTo'), 10));
                    comment.reply($textarea.val() as string);
                } else {
                    CommentsBS.sendComment(self._parent, $textarea.val() as string)
                    .then((comment: CommentBS) => {
                        if (comment) {
                            $textarea.val('');
                            $textarea.parents('.writing').siblings('.comments').append(CommentBS.getTemplateComment(comment));
                        }
                    });
                }
            }
        });
        this._events.push({elt: $btnSend, event: 'click'});
        /**
         * On active / desactive le bouton d'envoi du commentaire
         * en fonction du contenu du textarea
         */
        const $textarea = $container.find('textarea')
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
        $baliseSpoiler.click((e: JQuery.ClickEvent) => {
            const $textarea = $popup.find('textarea');
            if (/\[spoiler\]/.test($textarea.val() as string)) {
                return;
            }
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
            const $btn: JQuery<HTMLElement> = $(e.currentTarget);
            const state = $btn.data('toggle'); // 0: Etat masqué, 1: Etat affiché
            const $comment: JQuery<HTMLElement> = $btn.parents('.comment');
            const inner: string = $comment.data('commentInner');
            const $replies = $comment.parents('.comments').find(`.comment[data-comment-reply="${inner}"]`);
            if (state == '0') {
                // On affiche
                $replies.fadeIn('fast');
                $btn.find('.btnText').text(Base.trans("comment.hide_answers"));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s; transform: rotate(180deg);');
                $btn.data('toggle', '1');
            } else {
                // On masque
                $replies.fadeOut('fast');
                $btn.find('.btnText').text(Base.trans("comment.button.reply", {"%count%": $replies.length.toString()}, $replies.length));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s;');
                $btn.data('toggle', '0');
            }
        });
        this._events.push({elt: $btnReplies, event: 'click'});

        const $btnResponse = $container.find('.btnResponse');
        /**
         * Permet de créer une réponse à un commentaire
         */
        $btnResponse.click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            if (!Base.userIdentified()) {
                faceboxDisplay('inscription', {}, function() {});
                return;
            }
            const $btn: JQuery<HTMLElement> = $(e.currentTarget);
            const $comment: JQuery<HTMLElement> = $btn.parents('.comment');
            const commentId: number = parseInt($comment.data('commentId'), 10);
            let comment: CommentBS;
            // Si il s'agit d'une réponse, il nous faut le commentaire parent
            if ($comment.hasClass('iv_i5') || $comment.hasClass('it_i3')) {
                const $parent = $comment.siblings('.comment:not(.iv_i5)').first();
                const parentId: number = parseInt($parent.data('commentId'), 10);
                if (commentId == parentId) {
                    comment = this.getComment(commentId);
                } else {
                    const cmtParent = this.getComment(parentId);
                    comment = cmtParent.getReply(commentId);
                }
            } else {
                comment = this.getComment(commentId);
            }
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
                let template = '', comment: CommentBS,
                    firstCmtId: number = self.comments[oldLastCmtIndex + 1].id;
                for (let c = oldLastCmtIndex + 1; c < self.comments.length; c++) {
                    comment = self.comments[c];
                    template += CommentBS.getTemplateComment(comment, true);
                    // Si le commentaires à des réponses et qu'elles ne sont pas chargées
                    if (comment.nbReplies > 0 && comment.replies.length <= 0) {
                        // On récupère les réponses
                        comment.replies = await self.fetchReplies(comment.id);
                        // On ajoute un boutton pour afficher/masquer les réponses
                    }
                    for (let r = 0; r < comment.replies.length; r++) {
                        template += CommentBS.getTemplateComment(comment.replies[r], true);
                    }
                }
                $btn.before(template);
                jQuery(`.comment[data-comment-id="${firstCmtId.toString()}"]`).get(0).scrollIntoView();
                self.cleanEvents(self.loadEvents);
                if (self.comments.length >= self.nbComments) {
                    $btn.hide();
                }
            }).finally(() => {
                $loader.hide();
            });
        });
        this._events.push({elt: $btnMore, event: 'click'});
    }

    /**
     * Nettoie les events créer par la fonction loadEvents
     * @param   {Function} onComplete - Fonction de callback
     * @returns {void}
     */
    protected cleanEvents(onComplete: Function = Base.noop): void {
        if (this._events && this._events.length > 0) {
            let data: CustomEvent;
            for (let e = 0; e < this._events.length; e++) {
                data = this._events[e];
                data.elt.off(data.event);
            }
        }
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
                self.loadEvents($contentReact, nbCmts, {hidePopup, showPopup});
            });

        });
    }
}