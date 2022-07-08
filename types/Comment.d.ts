import { Base, Obj, EventTypes, Callback } from './Base';
import { CommentsBS, OrderComments } from './Comments';
import { implFillDecorator } from './Decorators';
import { Changes, RelatedProp } from './RenderHtml';
export interface implRepliesComment {
    fetchReplies(commentId: number): Promise<Array<CommentBS>>;
    changeThumbs(commentId: number, thumbs: number, thumbed: number): boolean;
}
/**
 * ReplyUser
 * @memberof CommentBS
 * @alias ReplyUser
 */
export declare type ReplyUser = {
    id: number;
    login: string;
};
/**
 * TypeDisplayComment
 * @memberof CommentBS
 * @enum
 * @alias TypeDisplayComment
 */
export declare enum TypeDisplayComment {
    'hidden' = 0,
    'page' = 1,
    'collection' = 2,
    'alone' = 3
}
/**
 * CommentBS - Classe servant à manipuler les commentaires provenant de l'API BetaSeries
 * @class
 * @extends Base
 * @implements {implFillDecorator}
 */
export declare class CommentBS extends Base implements implFillDecorator {
    /*************************************************/
    /*************************************************/
    /**
     * @type {Object.<string, RelatedProp>}
     */
    static relatedProps: Record<string, RelatedProp>;
    /**
     * Types d'évenements gérés par cette classe
     * @type {EventTypes[]}
     */
    static EventTypes: Array<EventTypes>;
    /**
     * Contient le nom des classes CSS utilisées pour le rendu du commentaire
     * @type {Obj}
     */
    static classNamesCSS: Obj;
    /*************************************************/
    /*************************************************/
    /**
     * Identifiant du commentaire
     * @type {number}
     */
    id: number;
    /**
     * Référence du média, pour créer l'URL (type.titleUrl)
     * @type {string}
     */
    reference: string;
    /**
     * Type de média
     * @type {string}
     */
    type: string;
    /**
     * Identifiant du média
     * @type {number}
     */
    ref_id: number;
    /**
     * Identifiant du membre du commentaire
     * @type {number}
     */
    user_id: number;
    /**
     * Login du membre du commentaire
     * @type {string}
     */
    login: string;
    /**
     * URL de l'avatar du membre du commentaire
     * @type {string}
     */
    avatar: string;
    /**
     * Date de création du commentaire
     * @type {Date}
     */
    date: Date;
    /**
     * Contenu du commentaire
     * @type {string}
     */
    text: string;
    /**
     * Index du commentaire dans la liste des commentaires du média
     * @type {number}
     */
    inner_id: number;
    /**
     * Index du commentaire dont celui-ci est une réponse
     * @type {number}
     */
    in_reply_to: number;
    /**
     * Identifiant du commentaire dont celui-ci est une réponse
     * @type {number}
     */
    in_reply_id: number;
    /**
     * Informations sur le membre du commentaire original
     * @type {ReplyUser}
     */
    in_reply_user: ReplyUser;
    /**
     * Note du membre pour le média
     * @type {number}
     */
    user_note: number;
    /**
     * Votes pour ce commentaire
     * @type {number}
     */
    thumbs: number;
    /**
     * Vote du membre connecté
     * @type {number}
     */
    thumbed: number;
    /**
     * Nombre de réponse à ce commentaires
     * @type {number}
     */
    nbReplies: number;
    /**
     * Les réponses au commentaire
     * @type {CommentBS[]}
     */
    replies: Array<CommentBS>;
    /**
     * Message de l'administration
     * @type {boolean}
     */
    from_admin: boolean;
    /**
     * ???
     * @type {string}
     */
    user_rank: string;
    /**
     * Indique le type d'affichage en cours du commentaire
     * @type {TypeDisplayComment}
     */
    private _typeDisplay;
    /**
     * La collection de commentaires
     * @type {CommentsBS}
     */
    private _parent;
    /**
     * Liste des events déclarés par la fonction loadEvents
     * @type {CustomEvent[]}
     */
    private _events;
    /**
     * Decorators de la classe
     * @type {Object.<string, AbstractDecorator>}
     */
    private __decorators;
    /**
     * Element HTML de référence du commentaire
     * @type {JQuery<HTMLElement>}
     */
    private __elt;
    /**
     * Flag d'initialisation de l'objet, nécessaire pour la methode fill
     * @type {boolean}
     */
    __initial: boolean;
    /**
     * Stocke les changements des propriétés de l'objet
     * @type {Object.<string, Changes>}
     */
    __changes: Record<string, Changes>;
    /**
     * Tableau des propriétés énumerables de l'objet
     * @type {string[]}
     */
    __props: Array<string>;
    constructor(data: Obj, parent: CommentsBS | CommentBS);
    /**
     * Initialise l'objet CommentBS
     * @returns {CommentBS}
     */
    init(): CommentBS;
    get elt(): JQuery<HTMLElement>;
    set elt(elt: JQuery<HTMLElement>);
    get parent(): CommentsBS | CommentBS;
    set parent(par: CommentsBS | CommentBS);
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {CommentBS}
     * @see FillDecorator.fill
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
    /**
     * Récupère les réponses du commentaire
     * @param   {OrderComments} order - Ordre de tri des réponses
     * @returns {Promise<CommentBS>}
     */
    fetchReplies(order?: OrderComments): Promise<CommentBS>;
    /**
     * Permet de trier les réponses du commentaires selon l'ordre passé en paramètre
     * @param   {OrderComments} [order='asc'] - Ordre de tri des réponses
     * @returns {CommentBS[]}
     */
    sortReplies(order?: OrderComments): Array<CommentBS>;
    /**
     * Modifie le texte du commentaire
     * @param   {string} msg - Le nouveau message du commentaire
     * @returns {CommentBS}
     */
    edit(msg: string): Promise<CommentBS>;
    /**
     * Supprime le commentaire sur l'API
     * @returns {void}
     */
    delete(): void;
    /**
     * Indique si le commentaire est le premier de la liste
     * @returns {boolean}
     */
    isFirst(): boolean;
    /**
     * Indique si le commentaire est le dernier de la liste
     * @returns {boolean}
     */
    isLast(): boolean;
    /**
     * Indique si le message est un spoiler
     * @returns {boolean}
     */
    isSpoiler(): boolean;
    /**
     * Renvoie la template HTML pour l'affichage d'un commentaire
     * @param   {CommentBS} comment Le commentaire à afficher
     * @returns {string}
     */
    static getTemplateComment(comment: CommentBS): string;
    /**
     * Renvoie la template HTML pour l'écriture d'un commentaire
     * @param   {CommentBS} [comment?] - L'objet commentaire sur lequel envoyé les réponses
     * @returns {string}
     */
    static getTemplateWriting(comment?: CommentBS): string;
    /**
     * Renvoie la template HTML pour l'écriture d'un signalement de commentaire
     * @param   {CommentBS} [comment] - L'objet commentaire à signaler
     * @returns {string}
     */
    static getTemplateReport(comment: CommentBS): string;
    /**
     * Retourne le login du commentaire et des réponses
     * @returns {string[]}
     */
    getLogins(): Array<string>;
    /**
     * Met à jour le rendu des votes de ce commentaire
     * @param   {number} vote Le vote
     * @returns {void}
     */
    updateRenderThumbs(vote?: number): void;
    /**
     * Indique si le comment fournit en paramètre fait parti des réponses
     * @param   {number} commentId L'identifiant de la réponse
     * @returns {boolean}
     */
    isReply(commentId: number): Promise<boolean>;
    /**
     * Retourne la réponse correspondant à l'identifiant fournit
     * @param   {number} commentId L'identifiant de la réponse
     * @returns {Promise<(CommentBS | void)>} La réponse
     */
    getReply(commentId: number): Promise<CommentBS>;
    /**
     * Supprime une réponse
     * @param   {number} cmtId - L'identifiant de la réponse
     * @returns {boolean}
     */
    removeReply(cmtId: number): boolean;
    /**
     * Retourne l'objet CommentsBS
     * @returns {CommentsBS}
     */
    getCollectionComments(): CommentsBS;
    /**
     * Ajoute les évènements sur les commentaires lors du rendu
     * @param   {JQuery<HTMLElement>} $container - Le conteneur des éléments d'affichage
     * @param   {Obj} funcPopup - Objet des fonctions d'affichage/ de masquage de la popup
     * @returns {void}
     */
    protected loadEvents($container: JQuery<HTMLElement>, funcPopup: Obj): void;
    /**
     * Nettoie les events créer par la fonction loadEvents
     * @param   {Callback} onComplete - Fonction de callback
     * @returns {void}
     */
    protected cleanEvents(onComplete?: Callback): void;
    /**
     * Affiche le commentaire dans une dialogbox
     */
    render(): Promise<void>;
    /**
     * Envoie une réponse de ce commentaire à l'API
     * @param   {string} text        Le texte de la réponse
     * @returns {Promise<(void | CommentBS)>}
     */
    sendReply(text: string): Promise<void | CommentBS>;
}
