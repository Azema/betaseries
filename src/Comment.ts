import {Base, HTTP_VERBS, Obj} from './Base';

declare var moment;
export interface implRepliesComment {
    fetchRepliesOfComment(commentId: number): Promise<Array<CommentBS>>;
    changeThumbsComment(commentId: number, thumbs: number): boolean;
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
     * ???
     */
    thumbed: boolean;
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
        this.user_note = parseInt(data.user_note, 10);
        this.thumbs = parseInt(data.thumbs, 10);
        this.thumbed = data.thumbed;
        this.nbReplies = parseInt(data.replies, 10);
        this.replies = new Array();
        this.from_admin = data.from_admin;
        this.user_rank = data.user_rank;
        this.first = !!data.first;
        this.last = !!data.last;
    }

    /**
     * Affiche le commentaire sur la page Web
     */
    display(): void {
        // La popup et ses éléments
        const _this = this,
              $popup = jQuery('#popin-dialog'),
              $contentHtmlElement = $popup.find(".popin-content-html"),
              $contentReact = $popup.find('.popin-content-reactmodule'),
              $title = $contentHtmlElement.find(".title"),
              $text = $popup.find("p"),
              $closeButtons = $popup.find("#popin-showClose"),
              hidePopup = () => { 
                  $popup.attr('aria-hidden', 'true'); 
                  $popup.find("#popupalertyes").show();
                  $popup.find("#popupalertno").show();
                  $contentHtmlElement.hide();
                  // On désactive les events
                  $popup.find('.comments .comment .btnThumb').off('click');
                  $popup.find('.btnToggleOptions').off('click');
              },
              showPopup = () => { 
                  $popup.find("#popupalertyes").hide();
                  $popup.find("#popupalertno").hide();
                  $contentHtmlElement.show();
                  $contentReact.hide();
                  $closeButtons.show();
                  $popup.attr('aria-hidden', 'false'); 
              };
        // On vérifie que la popup est masquée
        hidePopup();
        /**
         * Permet d'afficher une note avec des étoiles
         * @param  {Number} note      La note à afficher
         * @param  {Object} container DOMElement contenant la note à afficher
         * @return {string}
         */
        function renderNote(note: number): string {
            let typeSvg: string,
                template: string = '';
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
        function templateComment(comment: CommentBS) {
            let spoiler = /\[spoiler\]/.test(comment.text);
            let className = (comment.in_reply_to !== 0) ? 'iv_i5' : '';
            return `
                <div class="comment ${className} positionRelative iv_iz" style="animation: 3s ease 0s 1 normal forwards running backgroundFadeOut;">
                    <div class="media">
                        <div class="media-left">
                            <a href="/membre/${comment.login}" class="avatar">
                                <img src="https://api.betaseries.com/pictures/members?key=${Base.userKey}&amp;id=${comment.user_id}&amp;width=64&amp;height=64&amp;placeholder=png" width="32" height="32" alt="">
                            </a>
                        </div>
                        <div class="media-body">
                            <a href="/membre/${comment.login}">
                                <span class="mainLink">${comment.login}</span>&nbsp;
                                <span class="mainLink mainLink--regular">&nbsp;</span>
                            </a>
                            <span style="line-height: 15px; word-break: break-word;${spoiler ? 'display:none;':''}" class="comment-text">${comment.text}</span>
                            ${spoiler ? '<button type="button" class="btn-reset mainLink view-spoiler" style="vertical-align: 0px;">Voir le spoiler</button>': ''}
                            <div class="iv_i3">
                                <div class="options-main options-comment" data-commentId="${comment.id}">
                                    <button type="button" class="btn-reset btnUpVote btnThumb">
                                        <svg data-disabled="false" class="SvgLike" fill="#fff" width="16" height="14" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg">
                                            <g fill="inherit" fill-rule="nonzero">
                                                <path fill="#fff" fill-rule="evenodd" d="M.67 6h2.73v8h-2.73v-8zm14.909.67c0-.733-.614-1.333-1.364-1.333h-4.302l.648-3.047.02-.213c0-.273-.116-.527-.3-.707l-.723-.7-4.486 4.393c-.252.24-.402.573-.402.94v6.667c0 .733.614 1.333 1.364 1.333h6.136c.566 0 1.05-.333 1.255-.813l2.059-4.7c.061-.153.095-.313.095-.487v-1.273l-.007-.007.007-.053z"></path>
                                                <path class="SvgLikeStroke" stroke="#54709D" d="M1.17 6.5v7h1.73v-7h-1.73zm13.909.142c-.016-.442-.397-.805-.863-.805h-4.92l.128-.604.639-2.99.018-.166c0-.13-.055-.257-.148-.348l-.373-.361-4.144 4.058c-.158.151-.247.355-.247.578v6.667c0 .455.387.833.864.833h6.136c.355 0 .664-.204.797-.514l2.053-4.685c.04-.1.06-.198.06-.301v-1.063l-.034-.034.034-.265z"></path>
                                            </g>
                                        </svg>
                                    </button>
                                    <button type="button" class="btn-reset btnDownVote btnThumb">
                                        <svg data-disabled="false" class="SvgLike" fill="#fff" width="16" height="14" viewBox="0 0 16 14" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(180deg) scaleX(-1); margin-left: 4px; vertical-align: -4px;">
                                            <g fill="inherit" fill-rule="nonzero">
                                                <path fill="#fff" fill-rule="evenodd" d="M.67 6h2.73v8h-2.73v-8zm14.909.67c0-.733-.614-1.333-1.364-1.333h-4.302l.648-3.047.02-.213c0-.273-.116-.527-.3-.707l-.723-.7-4.486 4.393c-.252.24-.402.573-.402.94v6.667c0 .733.614 1.333 1.364 1.333h6.136c.566 0 1.05-.333 1.255-.813l2.059-4.7c.061-.153.095-.313.095-.487v-1.273l-.007-.007.007-.053z"></path>
                                                <path class="SvgLikeStroke" stroke="#54709D" d="M1.17 6.5v7h1.73v-7h-1.73zm13.909.142c-.016-.442-.397-.805-.863-.805h-4.92l.128-.604.639-2.99.018-.166c0-.13-.055-.257-.148-.348l-.373-.361-4.144 4.058c-.158.151-.247.355-.247.578v6.667c0 .455.387.833.864.833h6.136c.355 0 .664-.204.797-.514l2.053-4.685c.04-.1.06-.198.06-.301v-1.063l-.034-.034.034-.265z"></path>
                                            </g>
                                        </svg>
                                    </button>
                                    <strong class="mainLink" style="margin-left: 5px;">${comment.nbReplies > 0 ? '+' + comment.nbReplies : (comment.nbReplies < 0) ? '-' + comment.nbReplies : comment.nbReplies}</strong>
                                    <span class="mainLink">&nbsp;∙&nbsp;</span>
                                    <button type="button" class="btn-reset mainLink mainLink--regular btnResponse" style="vertical-align: 0px;">Répondre</button>
                                    <a href="#c_1269819" class="mainTime">
                                        <span class="mainLink">&nbsp;∙&nbsp;</span>
                                        Le ${/* eslint-disable-line no-undef */typeof moment !== 'undefined' ? moment(comment.date).format('D MM YYYY HH:mm') : comment.date.toString()}
                                    </a>
                                    <span class="stars" title="${comment.user_note} / 5">
                                        ${renderNote(comment.user_note)}
                                    </span>
                                    <div class="iv_ix">
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
                        </div>
                    </div>
                </div>
            `;
        }
        let template = '<div class="comments overflowYScroll" style="margin-bottom: 0px;">';
        template += templateComment(this);
        let promise: Promise<boolean> = Promise.resolve(true);
        if (this.nbReplies > 0 && this.replies.length <= 0) {
            promise = this._parent.fetchRepliesOfComment(this.id)
            .then((replies: Array<CommentBS>) => {
                _this.replies = replies;
                for (let r = 0; r < replies.length; r++) {
                    template += templateComment(replies[r]);
                }
                return true;
            });
        } else if (this.nbReplies > 0) {
            for (let r = 0; r < this.replies.length; r++) {
                template += templateComment(this.replies[r]);
            }
        }
        // On attend les réponses du commentaire
        promise.then(() => {
            // On vide la popup et on ajoute le commentaire
            $popup.attr('data-popin-type', 'comments');
            $title.empty().append('Commentaires <i class="fa fa-chevron-circle-left prev-comment" aria-hidden="true"></i> <i class="fa fa-chevron-circle-right next-comment" aria-hidden="true"></i>');
            $text.empty().append(template + '</div>');
            $closeButtons.click(() => { 
                hidePopup(); 
                $popup.removeAttr('data-popin-type');
            });
            const $prevCmt = $title.find('.prev-comment');
            if (this.first) {
                $prevCmt.css('color', 'grey').css('cursor', 'initial');
            } else {
                $prevCmt.click((e: JQuery.ClickEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    // Il faut tout nettoyer, comme pour la fermeture
                    $popup.find('.comments .comment .btnThumb').off('click');
                    $popup.find('.btnToggleOptions').off('click');
                    $popup.find('i.fa').off('click');
                    // Il faut demander au parent d'afficher le commentaire précédent
                    _this._parent.getPrevComment(_this.id).display();
                });
            }
            
            const $nextCmt = $title.find('.next-comment');
            // TODO: Je ne suis pas très sur de ce test
            if (this.last) {
                $nextCmt.css('color', 'grey').css('cursor', 'initial');
            } else {
                $nextCmt.click((e: JQuery.ClickEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    // Il faut tout nettoyer, comme pour la fermeture
                    $popup.find('.comments .comment .btnThumb').off('click');
                    $popup.find('.btnToggleOptions').off('click');
                    $popup.find('i.fa').off('click');
                    // Il faut demander au parent d'afficher le commentaire précédent
                    _this._parent.getNextComment(_this.id).display();
                });
            }
            const $btnSpoiler = $text.find('.view-spoiler');
            if ($btnSpoiler.length > 0) {
                $btnSpoiler.click((e:JQuery.ClickEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    $(e.currentTarget).prev('span.comment-text').fadeIn();
                    $(e.currentTarget).fadeOut();
                });
            }
            /*
            * Ajoutons les events:
            *  - btnUpVote: Voter pour ce commentaire
            *  - btnDownVote: Voter contre ce commentaire
            *  - btnToggleOptions: Switcher les options
            */
            $popup.find('.comments .comment .btnThumb').click((e: JQuery.ClickEvent) => {
                e.stopPropagation();
                e.preventDefault();
                // Ajouter un flag pour indiquer qu'un vote a déjà eu lieu
                const $btn = jQuery(e.currentTarget);
                const commentId = parseInt($btn.parent().data('commentId'), 10);
                let params: Obj = {id: commentId, type: 1, switch: false};
                // On a déjà voté
                if ($btn.data('thumbed') == '1') {
                    params.switch = true;
                }
                if ($btn.hasClass('btnDownVote')) {
                    params.type = -1;
                }
                Base.callApi(HTTP_VERBS.POST, 'comments', 'thumb', params)
                .then((data: Obj) => {
                    if (commentId == _this.id) {
                        _this.thumbs = data.comment.thumbs;
                    } else {
                        // Demander au parent d'incrémenter les thumbs du commentaire
                        _this._parent.changeThumbsComment(commentId, data.comment.thumbs);
                    }
                    // On ajoute le flag pour indiquer que l'on a déjà voté
                    $btn.attr('data-thumbed', '1');
                });
            });
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
            showPopup();
        });
    }
}