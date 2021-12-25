import {Base, HTTP_VERBS, MediaTypes, Obj} from './Base';

declare var moment, currentLogin: string, getScrollbarWidth;
export interface implRepliesComment {
    fetchRepliesOfComment(commentId: number): Promise<Array<CommentBS>>;
    changeThumbsComment(commentId: number, thumbs: number, thumbed: number): boolean;
}
interface implReplyUser {
    id: number;
    login: string;
}
export class CommentBS {
    id: number;
    /**
     * Référence du média, pour créer l'URL (type.titleUrl)
     */
    reference: string;
    /**
     * Type de média
     */
    type: string;
    /**
     * Identifiant du média
     */
    ref_id: number;
    /**
     * Identifiant du membre du commentaire
     */
    user_id: number;
    /**
     * Login du membre du commentaire
     */
    login: string;
    /**
     * URL de l'avatar du membre du commentaire
     */
    avatar: string;
    /**
     * Date de création du commentaire
     */
    date: Date;
    /**
     * Contenu du commentaire
     */
    text: string;
    /**
     * Index du commentaire dans la liste des commentaires du média
     */
    inner_id: number;
    /**
     * Index du commentaire dont celui-ci est une réponse
     */
    in_reply_to: number;
    /**
     * Identifiant du commentaire dont celui-ci est une réponse
     */
    in_reply_id: number;
    /**
     * Informations sur le membre du commentaire original
     */
    in_reply_user: implReplyUser;
    /**
     * Note du membre pour le média
     */
    user_note: number;
    /**
     * Votes pour ce commentaire
     */
    thumbs: number;
    /**
     * Vote du membre connecté
     */
    thumbed: number;
    /**
     * Nombre de réponse à ce commentaires
     */
    nbReplies: number;
    /**
     * Les réponses au commentaire
     * @type {Array<CommentBS>}
     */
    replies: Array<CommentBS>;
    /**
     * Message de l'administration
     */
    from_admin: boolean;
    /**
     * ???
     */
    user_rank: string;
    first: boolean;
    last: boolean;

    private _parent: Base;

    constructor(data: any, parent: Base) {
        this._parent = parent;
        this.id = parseInt(data.id, 10);
        this.reference = data.reference;
        this.type = data.type;
        this.ref_id = parseInt(data.ref_id, 10);
        this.user_id = parseInt(data.user_id, 10);
        this.login = data.login;
        this.avatar = data.avatar;
        this.date = new Date(data.date);
        this.text = data.text;
        this.inner_id = parseInt(data.inner_id, 10);
        this.in_reply_to = parseInt(data.in_reply_to, 10);
        this.in_reply_id = parseInt(data.in_reply_id, 10);
        this.in_reply_user = data.in_reply_user;
        this.user_note = data.user_note ? parseInt(data.user_note, 10) : 0;
        this.thumbs = parseInt(data.thumbs, 10);
        this.thumbed = data.thumbed ? parseInt(data.thumbed, 10) : 0;
        this.nbReplies = parseInt(data.replies, 10);
        this.replies = new Array();
        this.from_admin = data.from_admin;
        this.user_rank = data.user_rank;
        this.first = !!data.first;
        this.last = !!data.last;
    }

    /**
     * Permet d'afficher une note avec des étoiles
     * @param   {number} note    La note à afficher
     * @returns {string}
     */
    protected _renderNote(note: number): string {
        let typeSvg: string,
            template: string = '';
        note = note || 0;
        Array.from({
            length: 5
        }, (_index: number, number) => {
            typeSvg = note <= number ? "empty" : (note < number + 1) ? 'half' : "full";
            template += `
                <svg viewBox="0 0 100 100" class="star-svg">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink"
                        xlink:href="#icon-star-${typeSvg}">
                    </use>
                </svg>
            `;
        });
        return template;
    }
    /**
     * Renvoie la template HTML pour l'affichage d'un commentaire
     * @param   {CommentBS} comment Le commentaire à afficher
     * @returns {string}
     */
    public getTemplateComment(comment: CommentBS, all: boolean = false): string {
        const text = new Option(comment.text).innerHTML;
        const spoiler = /\[spoiler\]/.test(text);
        let btnSpoiler = spoiler ? `<button type="button" class="btn-reset mainLink view-spoiler" style="vertical-align: 0px;">${Base.trans("comment.button.display_spoiler")}</button>` : '';
        // let classNames = {reply: 'iv_i5', actions: 'iv_i3', comment: 'iv_iz'};
        let classNames = {reply: 'it_i3', actions: 'it_i1', comment: 'it_ix'};
        let className = (comment.in_reply_to > 0) ? classNames.reply : '';
        let btnToggleReplies = comment.nbReplies > 0 ? `
        <button type="button" class="btn-reset mainLink mainLink--regular toggleReplies" style="margin-top: 2px; margin-bottom: -3px;" data-toggle="1">
            <span class="svgContainer" style="display: inline-flex; height: 16px; width: 16px;">
                <svg width="8" height="6" xmlns="http://www.w3.org/2000/svg" style="transition: transform 200ms ease 0s; transform: rotate(180deg);">
                    <path d="M4 5.667l4-4-.94-.94L4 3.78.94.727l-.94.94z" fill="#54709D" fill-rule="nonzero"></path>
                </svg>
            </span>&nbsp;<span class="btnText">${Base.trans("comment.hide_answers")}</span>
        </button>` : '';
        return `
            <div class="comment ${className} positionRelative ${classNames.comment}" data-comment-id="${comment.id}" ${comment.in_reply_to > 0 ? 'data-comment-reply="' + comment.in_reply_to + '"' : ''} data-comment-inner="${comment.inner_id}">
                <div class="media">
                    <div class="media-left">
                        <a href="/membre/${comment.login}" class="avatar">
                            <img src="https://api.betaseries.com/pictures/members?key=${Base.userKey}&amp;id=${comment.user_id}&amp;width=64&amp;height=64&amp;placeholder=png" width="32" height="32" alt="Profil de ${comment.login}">
                        </a>
                    </div>
                    <div class="media-body">
                        <a href="/membre/${comment.login}">
                            <span class="mainLink">${comment.login}</span>&nbsp;
                            <span class="mainLink mainLink--regular">&nbsp;</span>
                        </a>
                        <span style="${spoiler ? 'display:none;':''}" class="comment-text">${text}</span>
                        ${btnSpoiler}
                        <div class="${classNames.actions}">
                            <div class="options-main options-comment">
                                <button type="button" class="btn-reset btnUpVote btnThumb">
                                    <svg data-disabled="false" class="SvgLike" fill="#fff" width="16" height="14" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg">
                                        <g fill="${comment.thumbed > 0 ? '#FFAC3B' : 'inherit'}" fill-rule="nonzero">
                                            <path fill="#fff" fill-rule="evenodd" d="M.67 6h2.73v8h-2.73v-8zm14.909.67c0-.733-.614-1.333-1.364-1.333h-4.302l.648-3.047.02-.213c0-.273-.116-.527-.3-.707l-.723-.7-4.486 4.393c-.252.24-.402.573-.402.94v6.667c0 .733.614 1.333 1.364 1.333h6.136c.566 0 1.05-.333 1.255-.813l2.059-4.7c.061-.153.095-.313.095-.487v-1.273l-.007-.007.007-.053z"></path>
                                            <path class="SvgLikeStroke" stroke="#54709D" d="M1.17 6.5v7h1.73v-7h-1.73zm13.909.142c-.016-.442-.397-.805-.863-.805h-4.92l.128-.604.639-2.99.018-.166c0-.13-.055-.257-.148-.348l-.373-.361-4.144 4.058c-.158.151-.247.355-.247.578v6.667c0 .455.387.833.864.833h6.136c.355 0 .664-.204.797-.514l2.053-4.685c.04-.1.06-.198.06-.301v-1.063l-.034-.034.034-.265z"></path>
                                        </g>
                                    </svg>
                                </button>
                                <button type="button" class="btn-reset btnDownVote btnThumb">
                                    <svg data-disabled="false" class="SvgLike" fill="#fff" width="16" height="14" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(180deg) scaleX(-1); margin-left: 4px; vertical-align: -4px;">
                                        <g fill="${comment.thumbed < 0 ? '#FFAC3B' : 'inherit'}" fill-rule="nonzero">
                                            <path fill="#fff" fill-rule="evenodd" d="M.67 6h2.73v8h-2.73v-8zm14.909.67c0-.733-.614-1.333-1.364-1.333h-4.302l.648-3.047.02-.213c0-.273-.116-.527-.3-.707l-.723-.7-4.486 4.393c-.252.24-.402.573-.402.94v6.667c0 .733.614 1.333 1.364 1.333h6.136c.566 0 1.05-.333 1.255-.813l2.059-4.7c.061-.153.095-.313.095-.487v-1.273l-.007-.007.007-.053z"></path>
                                            <path class="SvgLikeStroke" stroke="#54709D" d="M1.17 6.5v7h1.73v-7h-1.73zm13.909.142c-.016-.442-.397-.805-.863-.805h-4.92l.128-.604.639-2.99.018-.166c0-.13-.055-.257-.148-.348l-.373-.361-4.144 4.058c-.158.151-.247.355-.247.578v6.667c0 .455.387.833.864.833h6.136c.355 0 .664-.204.797-.514l2.053-4.685c.04-.1.06-.198.06-.301v-1.063l-.034-.034.034-.265z"></path>
                                        </g>
                                    </svg>
                                </button>
                                <strong class="mainLink thumbs" style="margin-left: 5px;">${comment.thumbs > 0 ? '+' + comment.thumbs : (comment.thumbs < 0) ? '-' + comment.thumbs : comment.thumbs}</strong>
                                <span class="mainLink">&nbsp;∙&nbsp;</span>
                                <button type="button" class="btn-reset mainLink mainLink--regular btnResponse" style="vertical-align: 0px;">${Base.trans("timeline.comment.reply")}</button>
                                <a href="#c_1269819" class="mainTime">
                                    <span class="mainLink">&nbsp;∙&nbsp;</span>
                                    Le ${/* eslint-disable-line no-undef */typeof moment !== 'undefined' ? moment(comment.date).format('DD/MM/YYYY HH:mm') : comment.date.toString()}
                                </a>
                                <span class="stars" title="${comment.user_note} / 5">
                                    ${this._renderNote(comment.user_note)}
                                </span>
                                <div class="it_iv">
                                    <button type="button" class="btn-reset btnToggleOptions">
                                        <span class="svgContainer">
                                            <svg width="4" height="16" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="transform: rotate(90deg);">
                                                <defs>
                                                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" id="svgthreedots"></path>
                                                </defs>
                                                <use fill="rgba(255, 255, 255, .5)" fill-rule="nonzero" xlink:href="#svgthreedots" transform="translate(-10 -4)"></use>
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <div class="options-options options-comment" style="display:none;">
                                <a href="/messages/nouveau?login=${comment.login}" class="mainLink">Envoyer un message</a>
                                <span class="mainLink">&nbsp;∙&nbsp;</span>
                                <button type="button" class="btn-reset mainLink btnSignal" style="vertical-align: 0px;">Signaler</button>
                                <button type="button" class="btn-reset btnToggleOptions" style="margin-left: 4px;">
                                    <span class="svgContainer">
                                        <svg fill="#333" width="9" height="9" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M14 1.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"></path>
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                        ${btnToggleReplies}
                    </div>
                </div>
            </div>
        `;
    }
    /**
     * Renvoie la template HTML pour l'écriture d'un commentaire
     * @returns {string}
     */
    public static getTemplateWriting(): string {
        const login = Base.userIdentified() ? currentLogin : '';
        return `
            <div class="writing">
                <div class="media">
                    <div class="media-left">
                        <div class="avatar">
                            <img src="https://api.betaseries.com/pictures/members?key=${Base.userKey}&amp;id=${Base.userId}&amp;width=32&amp;height=32&amp;placeholder=png" width="32" height="32" alt="Profil de ${login}">
                        </div>
                    </div>
                    <div class="media-body">
                        <form class="gz_g1">
                            <textarea rows="2" placeholder="${Base.trans("timeline.comment.write")}" class="form-control"></textarea>
                            <button class="btn-reset sendComment" disabled="" aria-label="${Base.trans("comment.send.label")}">
                                <span class="svgContainer" style="width: 16px; height: 16px;">
                                    <svg fill="${Base.theme === 'dark' ? "#fff" : "#333"}" width="15" height="12" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M.34 12l13.993-6L.34 0 .333 4.667l10 1.333-10 1.333z"></path>
                                    </svg>
                                </span>
                            </button>
                        </form>
                        <p class="mainTime">Utilisez la balise <span class="baliseSpoiler" title="Ajouter la balise spoiler à votre commentaire">[spoiler]…[/spoiler]</span> pour masquer le contenu pouvant spoiler les lecteurs.</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Met à jour le rendu des votes de ce commentaire
     * @param   {number} vote Le vote
     * @returns {void}
     */
    public updateRenderThumbs(vote: number = 0): void {
        const $thumbs = jQuery(`.comments .comment[data-comment-id="${this.id}"] .thumbs`);
        const val = parseInt($thumbs.text(), 10);
        const result = (vote == this.thumbed) ? val + vote : val - vote;
        const text = result > 0 ? `+${result}` : result.toString();
        // if (Base.debug) console.log('renderThumbs: ', {val, vote, result, text});
        $thumbs.text(text);
        if (this.thumbed == 0) {
            // On supprime la couleur de remplissage des icones de vote
            $thumbs.siblings('.btnThumb').find('g').attr('fill', 'inherited');
            return;
        }
        // On affiche le vote en remplissant l'icone correspondant d'une couleur jaune
        const $btnVote = this.thumbed > 0 ? $thumbs.siblings('.btnThumb.btnUpVote') : $thumbs.siblings('.btnThumb.btnDownVote');
        $btnVote.find('g').attr('fill', '#FFAC3B');
    }

    /**
     * Indique si le comment fournit en paramètre fait parti des réponses
     * @param   {number} commentId L'identifiant de la réponse
     * @returns {boolean}
     */
    public isReply(commentId: number): boolean {
        if (this.replies.length <= 0) return false;
        for (let r = 0; r < this.replies.length; r++) {
            if (this.replies[r].id == commentId) {
                return true;
            }
        }
        return false;
    }

    /**
     * Retourne la réponse correspondant à l'identifiant fournit
     * @param   {number} commentId L'identifiant de la réponse
     * @returns {CommentBS} La réponse
     */
    public getReply(commentId: number): CommentBS {
        for (let r = 0; r < this.replies.length; r++) {
            if (this.replies[r].id == commentId) {
                return this.replies[r];
            }
        }
        return null;
    }

    /**
     * Affiche le commentaire dans une dialogbox
     */
    async display(): Promise<void> {
        // La popup et ses éléments
        const _this = this,
              $popup = jQuery('#popin-dialog'),
              $contentHtml = $popup.find(".popin-content-html"),
              $contentReact = $popup.find('.popin-content-reactmodule'),
              $closeButtons = $popup.find("#popin-showClose"),
              cleanEvents = () => {
                // On désactive les events
                $popup.find("#popin-showClose").off('click');
                $popup.find('.comments .comment .btnThumb').off('click');
                $popup.find('.btnToggleOptions').off('click');
                $contentReact.find('.prev-comment').off('click');
                $contentReact.find('.next-comment').off('click');
                $contentReact.find('.view-spoiler').off('click');
                $popup.find('.sendComment').off('click');
                $popup.find('textarea').off('keypress');
                $popup.find('.baliseSpoiler').off('click');
              },
              hidePopup = () => {
                  document.body.style.overflow = "visible";
                  document.body.style.paddingRight = "";
                  $popup.attr('aria-hidden', 'true');
                  $popup.find("#popupalertyes").show();
                  $popup.find("#popupalertno").show();
                  $contentReact.empty();
                  $contentHtml.hide();
                  cleanEvents();
                },
              showPopup = () => {
                  document.body.style.overflow = "hidden";
                  document.body.style.paddingRight = getScrollbarWidth() + "px";
                  $popup.find("#popupalertyes").hide();
                  $popup.find("#popupalertno").hide();
                  $contentHtml.hide();
                  $contentReact.show();
                  $closeButtons.show();
                  $popup.attr('aria-hidden', 'false');
              };
        // On vérifie que la popup est masquée
        hidePopup();

        let template = '<div class="comments overflowYScroll">' +
                     this.getTemplateComment(this);

        // Récupération des réponses sur l'API
        // On ajoute les réponses, par ordre décroissant à la template
        if (this.nbReplies > 0 && this.replies.length <= 0) {
            const replies = await this._parent.fetchRepliesOfComment(this.id);
            if (replies && replies.length > 0) {
                this.replies = replies;
            }
        }
        for (let r = this.replies.length - 1; r >= 0; r--) {
            template += this.getTemplateComment(this.replies[r]);
        }
        // On définit le type d'affichage de la popup
        $popup.attr('data-popin-type', 'comments');
        // On affiche le titre de la popup
        // avec des boutons pour naviguer
        $contentReact.empty().append(`<div class="title" id="dialog-title" tabindex="0"></div>`);
        const $title = $contentReact.find('.title');
        $title.append(Base.trans("blog.title.comments") + ' <i class="fa fa-chevron-circle-left prev-comment" aria-hidden="true"></i> <i class="fa fa-chevron-circle-right next-comment" aria-hidden="true"></i>');
        // On ajoute les templates HTML du commentaire,
        // des réponses et du formulaire de d'écriture
        $contentReact.append(template + '</div>' + CommentBS.getTemplateWriting());
        // On active le bouton de fermeture de la popup
        $closeButtons.click(() => {
            hidePopup();
            $popup.removeAttr('data-popin-type');
        });
        // On récupère le bouton de navigation 'précédent'
        const $prevCmt = $title.find('.prev-comment');
        // Si le commentaire est le premier de la liste
        // on ne l'active pas
        if (this.first) {
            $prevCmt.css('color', 'grey').css('cursor', 'initial');
        } else {
            // On active le btn précédent
            $prevCmt.click((e: JQuery.ClickEvent) => {
                e.stopPropagation();
                e.preventDefault();
                // Il faut tout nettoyer, comme pour la fermeture
                cleanEvents();
                // Il faut demander au parent d'afficher le commentaire précédent
                _this._parent.getPrevComment(_this.id).display();
            });
        }

        const $nextCmt = $title.find('.next-comment');
        // Si le commentaire est le dernier de la liste
        // on ne l'active pas
        if (this.last) {
            $nextCmt.css('color', 'grey').css('cursor', 'initial');
        } else {
            // On active le btn suivant
            $nextCmt.click((e: JQuery.ClickEvent) => {
                e.stopPropagation();
                e.preventDefault();
                // Il faut tout nettoyer, comme pour la fermeture
                cleanEvents();
                // Il faut demander au parent d'afficher le commentaire suivant
                _this._parent.getNextComment(_this.id).display();
            });
        }
        // On active le lien pour afficher le spoiler
        const $btnSpoiler = $contentReact.find('.view-spoiler');
        if ($btnSpoiler.length > 0) {
            $btnSpoiler.click((e:JQuery.ClickEvent) => {
                e.stopPropagation();
                e.preventDefault();
                $(e.currentTarget).prev('span.comment-text').fadeIn();
                $(e.currentTarget).fadeOut();
            });
        }
        /**
         * Ajoutons les events pour:
         *  - btnUpVote: Voter pour ce commentaire
         *  - btnDownVote: Voter contre ce commentaire
         */
        $popup.find('.comments .comment .btnThumb').click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            const $btn = jQuery(e.currentTarget);
            const commentId = parseInt($btn.parents('.comment').data('commentId'), 10);
            let verb = HTTP_VERBS.POST;
            const vote: number = $btn.hasClass('btnUpVote') ? 1 : -1;
            let params: Obj = {id: commentId, type: vote, switch: false};
            // On a déjà voté
            if (_this.thumbed == vote) {
                verb = HTTP_VERBS.DELETE;
                params = {id: commentId};
            }
            else if (_this.thumbed != 0) {
                console.warn("Le vote est impossible. Annuler votre vote et recommencer");
                return;
            }
            Base.callApi(verb, 'comments', 'thumb', params)
            .then((data: Obj) => {
                if (commentId == _this.id) {
                    _this.thumbs = parseInt(data.comment.thumbs, 10);
                    _this.thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                    _this.updateRenderThumbs(vote);
                } else if (_this.isReply(commentId)) {
                    const reply: CommentBS = _this.getReply(commentId);
                    reply.thumbs = parseInt(data.comment.thumbs, 10);
                    reply.thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                    reply.updateRenderThumbs(vote);
                } else {
                    // Demander au parent d'incrémenter les thumbs du commentaire
                    const thumbed = data.comment.thumbed ? parseInt(data.comment.thumbed, 10) : 0;
                    _this._parent.changeThumbsComment(commentId, data.comment.thumbs, thumbed);
                }
            })
            .catch(err => {
                const msg = err.text !== undefined ? err.text : err;
                Base.notification('Vote commentaire', "Une erreur est apparue durant le vote: " + msg);
            });
        });
        /**
         * On affiche/masque les options du commentaire
         */
        $popup.find('.btnToggleOptions').click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            jQuery(e.currentTarget).parents('.iv_i3').first()
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
        /**
         * On envoie la réponse à ce commentaire à l'API
         */
        $popup.find('.sendComment').click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            const $textarea = $(e.currentTarget).siblings('textarea');
            if (($textarea.val() as string).length > 0) {
                const replyId = parseInt($textarea.data('replyTo'), 10);
                const msg = $textarea.val() as string;
                if (replyId && replyId == _this.id) {
                    _this.reply(msg).then(comment => {
                        if (comment) {
                            let template = _this.getTemplateComment(comment);
                            $contentReact.find('.comments').append(template);
                        }
                    })
                } else if (replyId) {
                    const reply = _this.getReply(replyId);
                    if (reply) {
                        reply.reply(msg).then(comment => {
                            if (comment) {
                                let template = _this.getTemplateComment(comment);
                                $contentReact.find(`.comments .comment[data-comment-id="${reply.id}"]`)
                                    .after(template);
                            }
                        });
                    } else {
                        // Allo Houston, on a un problème
                    }
                } else {
                    CommentBS.sendComment(_this._parent, msg);
                }
                $textarea.val('');
            }
        });
        /**
         * On active / desactive le bouton d'envoi du commentaire
         * en fonction du contenu du textarea
         */
        $popup.find('textarea').keypress((e: JQuery.KeyPressEvent) => {
            const $textarea = $(e.currentTarget);
            if (($textarea.val() as string).length > 0) {
                $textarea.siblings('button').removeAttr('disabled');
            } else {
                $textarea.siblings('button').attr('disabled', 'true');
            }
        });
        /**
         * On ajoute les balises SPOILER au message dans le textarea
         */
        $popup.find('.baliseSpoiler').click((e: JQuery.ClickEvent) => {
            const $textarea = $popup.find('textarea');
            if (/\[spoiler\]/.test($textarea.val() as string)) {
                return;
            }
            const text = '[spoiler]' + $textarea.val() + '[/spoiler]';
            $textarea.val(text);
        });
        $contentReact.find('.comments .toggleReplies').click((e: JQuery.ClickEvent) => {
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
                $btn.find('.btnText').text(Base.trans("comment.button.reply", {"%count%": $replies.length.toString()}));
                $btn.find('svg').attr('style', 'transition: transform 200ms ease 0s;');
                $btn.data('toggle', '0');
            }
        });
        $contentReact.find('.btnResponse').click((e: JQuery.ClickEvent) => {
            e.stopPropagation();
            e.preventDefault();
            const $btn: JQuery<HTMLElement> = $(e.currentTarget);
            const $comment: JQuery<HTMLElement> = $btn.parents('.comment');
            const commentId: number = parseInt($comment.data('commentId'), 10);
            let comment: CommentBS;
            // Si il s'agit d'une réponse, il nous faut le commentaire parent
            if ($comment.hasClass('iv_i5') || $comment.hasClass('it_i3')) {
                const $parent = $comment.siblings('.comment:not(.iv_i5)').first();
                const parentId: number = parseInt($parent.data('commentId'), 10);
                if (commentId == parentId) {
                    comment = _this._parent.getComment(commentId);
                } else {
                    const cmtParent = _this._parent.getComment(parentId);
                    comment = cmtParent.getReply(commentId);
                }
            } else {
                comment = _this._parent.getComment(commentId);
            }
            $contentReact.find('textarea')
                .val('@' + comment.login)
                .attr('data-reply-to', comment.id);
        });
        showPopup();
    }
    /**
     * Envoie une réponse de ce commentaire à l'API
     * @param   {string} text        Le texte de la réponse
     * @returns {Promise<void | CommentBS>}
     */
    public reply(text: string): Promise<void | CommentBS> {
        const _this = this;
        const params = {
            type: this._parent.mediaType.singular,
            id: this._parent.id,
            in_reply_to: this.inner_id,
            text: text
        };
        return Base.callApi(HTTP_VERBS.POST, 'comments', 'comment', params)
        .then((data: Obj) => {
            const comment = new CommentBS(data.comment, _this._parent);
            _this.replies.push(comment);
            // _this._parent.comments.push(comment);
            return comment;
        })
        .catch(err => {
            Base.notification('Commentaire', "Erreur durant l'ajout d'un commentaire");
            console.error(err);
        });
    }
    /**
     * Envoie une réponse de ce commentaire à l'API
     * @param   {string} text        Le texte de la réponse
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
            const comment = new CommentBS(data.comment, media);
            // On change le flag du dernier comment
            media.comments[media.comments.length - 1].last = false;
            comment.last = true;
            media.comments.push(comment);
            return comment;
        })
        .catch(err => {
            Base.notification('Commentaire', "Erreur durant l'ajout d'un commentaire");
            console.error(err);
        });
    }
}