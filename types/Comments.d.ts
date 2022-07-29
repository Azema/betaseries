import { Base, Obj, EventTypes, Callback } from "./Base";
import { CommentBS, implRepliesComment } from "./Comment";
import { MediaBase } from "./Media";
export declare enum OrderComments {
    DESC = "desc",
    ASC = "asc"
}
export declare enum MediaStatusComments {
    OPEN = "open",
    CLOSED = "close"
}
export declare type CustomEvent = {
    elt: JQuery<HTMLElement>;
    event: string;
};
export declare class CommentsBS extends Base implements implRepliesComment {
    /*************************************************/
    /*************************************************/
    static logger: import("./Debug").Debug;
    static debug: any;
    /**
     * Types d'évenements gérés par cette classe
     * @type {Array}
     */
    static EventTypes: Array<EventTypes>;
    /**
     * Envoie une réponse de ce commentaire à l'API
     * @param   {Base} media - Le média correspondant à la collection
     * @param   {string} text - Le texte de la réponse
     * @returns {Promise<void | CommentBS>}
     */
    static sendComment(media: MediaBase, text: string): Promise<void | CommentBS>;
    /*************************************************/
    /*************************************************/
    /**
     * Tableau des commentaires
     * @type {CommentBS[]}
     */
    comments: Array<CommentBS>;
    /**
     * Nombre total de commentaires du média
     * @type {number}
     */
    nbComments: number;
    /**
     * Indique si le membre à souscrit aux alertes commentaires du média
     * @type {boolean}
     */
    is_subscribed: boolean;
    /**
     * Indique si les commentaires sont ouverts ou fermés
     * @type {string}
     */
    status: string;
    /**
     * Le média auquel sont associés les commentaires
     * @type {Base}
     * @private
     */
    private _parent;
    /**
     * Tableau des events déclarés par la fonction loadEvents
     * @type {Array<CustomEvent>}
     * @private
     */
    private _events;
    /**
     * Ordre de tri des commentaires et des réponses
     * @type {OrderComments}
     */
    private _order;
    /**
     * Indique si la collection est affiché ou non
     * @type {boolean}
     */
    private _display;
    /*************************************************/
    /*************************************************/
    constructor(nbComments: number, media: MediaBase);
    /**
     * Initialise la collection de commentaires
     */
    init(): void;
    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object;
    get parent(): MediaBase;
    set parent(media: MediaBase);
    /**
     * Retourne la taille de la collection
     * @readonly
     */
    get length(): number;
    /**
     * Retourne le média auxquels sont associés les commentaires
     * @readonly
     */
    get media(): MediaBase;
    /**
     * Retourne l'ordre de tri des commentaires
     * @returns {OrderComments}
     */
    get order(): OrderComments;
    /**
     * Définit l'ordre de tri des commentaires
     * @param {OrderComments} o - Ordre de tri
     */
    set order(o: OrderComments);
    /**
     * Récupère les commentaires du média sur l'API
     * @param   {number} [nbpp=50] - Le nombre de commentaires à récupérer
     * @param   {number} [since=0] - L'identifiant du dernier commentaire reçu
     * @param   {OrderComments} [order='desc'] - Ordre de tri des commentaires
     * @returns {Promise<CommentsBS>}
     */
    fetchComments(nbpp?: number, since?: number, order?: OrderComments): Promise<CommentsBS>;
    /**
     * Ajoute un commentaire à la collection
     * /!\ (Ne l'ajoute pas sur l'API) /!\
     * @param   {Obj} data - Les données du commentaire provenant de l'API
     * @returns {CommentsBS}
     */
    addComment(data: Obj | CommentBS): this;
    /**
     * Retire un commentaire de la collection
     * /!\ (Ne le supprime pas sur l'API) /!\
     * @param   {number} cmtId - L'identifiant du commentaire à retirer
     * @returns {CommentsBS}
     */
    removeComment(cmtId: number): this;
    /**
     * Indique si il s'agit du premier commentaire
     * @param cmtId - L'identifiant du commentaire
     * @returns {boolean}
     */
    isFirst(cmtId: number): boolean;
    /**
     * Indique si il s'agit du dernier commentaire
     * @param cmtId - L'identifiant du commentaire
     * @returns {boolean}
     */
    isLast(cmtId: number): boolean;
    /**
     * Indique si on peut écrire des commentaires sur ce média
     * @returns {boolean}
     */
    isOpen(): boolean;
    /**
     * Retourne le commentaire correspondant à l'ID fournit en paramètre
     * @param   {number} cId - L'identifiant du commentaire
     * @returns {CommentBS|void}
     */
    getComment(cId: number): CommentBS;
    /**
     * Retourne le commentaire précédent celui fournit en paramètre
     * @param   {number} cId - L'identifiant du commentaire
     * @returns {CommentBS|null}
     */
    getPrevComment(cId: number): CommentBS;
    /**
     * Retourne le commentaire suivant celui fournit en paramètre
     * @param   {number} cId - L'identifiant du commentaire
     * @returns {CommentBS|null}
     */
    getNextComment(cId: number): CommentBS | null;
    /**
     * Retourne les réponses d'un commentaire
     * @param   {number} commentId - Identifiant du commentaire original
     * @param   {OrderComments} [order='desc'] - Ordre de tri des réponses
     * @returns {Promise<Array<CommentBS>>} Tableau des réponses
     */
    fetchReplies(commentId: number, order?: OrderComments): Promise<Array<CommentBS>>;
    /**
     * Modifie le nombre de votes et le vote du membre pour un commentaire
     * @param   {number} commentId - Identifiant du commentaire
     * @param   {number} thumbs - Nombre de votes
     * @param   {number} thumbed - Le vote du membre connecté
     * @returns {boolean}
     */
    changeThumbs(commentId: number, thumbs: number, thumbed: number): boolean;
    /**
     * Retourne la template pour l'affichage de l'ensemble des commentaires
     * @param   {number} nbpp - Le nombre de commentaires à récupérer
     * @returns {Promise<string>} La template
     */
    getTemplate(nbpp: number): Promise<string>;
    /**
     * Retourne un tableau contenant les logins des commentaires
     * @returns {Array<string>}
     */
    protected getLogins(): Array<string>;
    /**
     * Met à jour le nombre de commentaires sur la page
     */
    updateCounter(): void;
    /**
     * Ajoute les évènements sur les commentaires lors du rendu
     * @param   {JQuery<HTMLElement>} $container - Le conteneur des éléments d'affichage
     * @param   {number} nbpp - Le nombre de commentaires à récupérer sur l'API
     * @param   {Obj} funcPopup - Objet des fonctions d'affichage/ de masquage de la popup
     * @returns {void}
     */
    protected loadEvents($container: JQuery<HTMLElement>, nbpp: number, funcPopup: Obj): void;
    /**
     * Nettoie les events créer par la fonction loadEvents
     * @param   {Function} onComplete - Fonction de callback
     * @returns {void}
     */
    protected cleanEvents(onComplete?: Callback): void;
    /**
     * Gère l'affichage de l'ensemble des commentaires
     * @returns {void}
     */
    render(): void;
    /**
     * Ajoute un commentaire dans la liste des commentaires de la page
     * @param {number} cmtId - L'identifiant du commentaire
     */
    addToPage(cmtId: number): void;
    /**
     * Supprime un commentaire dans la liste des commentaires de la page
     * @param {number} cmtId - L'identifiant du commentaire
     */
    removeFromPage(cmtId: number): void;
    /**
     * Retourne la template affichant les notes associés aux commentaires
     * @returns {string} La template affichant les évaluations des commentaires
     */
    showEvaluations(): Promise<string>;
}
