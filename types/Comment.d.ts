import { Base, Obj, EventTypes, Callback } from './Base';
import { CommentsBS, OrderComments } from './Comments';
export interface implRepliesComment {
    fetchReplies(commentId: number): Promise<Array<CommentBS>>;
    changeThumbs(commentId: number, thumbs: number, thumbed: number): boolean;
}
export declare type implReplyUser = {
    id: number;
    login: string;
};
export declare class CommentBS extends Base {
    /*************************************************/
    /*************************************************/
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes: Array<EventTypes>;
    /**
     * Contient le nom des classes CSS utilisées pour le rendu du commentaire
     * @type Obj
     */
    static classNamesCSS: Obj;
    /*************************************************/
    /*************************************************/
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
    /**
     * @type {CommentsBS} La collection de commentaires
     */
    private _parent;
    /**
     * @type {Array<CustomEvent>} Liste des events déclarés par la fonction loadEvents
     */
    private _events;
    constructor(data: Obj, parent: CommentsBS | CommentBS);
    get parent(): CommentsBS | CommentBS;
    set parent(par: CommentsBS | CommentBS);
    /**
     * Remplit l'objet CommentBS avec les données provenant de l'API
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {CommentBS}
     */
    fill(data: Obj): CommentBS;
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
     * Modifie le texte du commentaire
     * @param   {string} msg - Le nouveau message du commentaire
     * @returns {CommentBS}
     */
    edit(msg: string): Promise<CommentBS>;
    /**
     * Supprime le commentaire sur l'API
     * @returns
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
     * @returns {CommentBS | void} La réponse
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
     * @param   {Function} onComplete - Fonction de callback
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
     * @returns {Promise<void | CommentBS>}
     */
    sendReply(text: string): Promise<void | CommentBS>;
}
