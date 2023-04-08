import { Obj } from "./Base";
import { CommentBS } from "./Comment";
import { implFillDecorator } from "./Decorators";
import { Changes, RelatedProp } from "./RenderHtml";
export declare class EventTimeline {
    id: number;
    type: string;
    ref: string;
    ref_id: number;
    user: string;
    user_id: number;
    html: string;
    picture_url: string;
    date: Date;
    comments: number;
    first_comments: CommentBS[];
    data: Obj | Array<Obj>;
    comments_by_user: number;
}
export declare enum TimelineType {
    'event' = "event",
    'feed' = "feed",
    'friends' = "friends",
    'home' = "home",
    'member' = "member",
    'show' = "show"
}
export declare class Timeline implements implFillDecorator {
    static logger: import("./Debug").Debug;
    static debug: any;
    static relatedProps: Record<string, RelatedProp>;
    /**
     * Méthode static servant à récupérer une série sur l'API BS
     * @static
     * @private
     * @param  {Obj} params - Critères de recherche de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Timeline>}
     */
    protected static _fetch(type: TimelineType, params?: Obj, force?: boolean): Promise<Timeline>;
    /**
     * Methode static servant à récupérer les dernières activités des amis d'un membre
     * @static
     * @return {Promise<Timeline>}
     */
    static fetchFriends(): Promise<Timeline>;
    /**
     * Methode static servant à récupérer les dernières activités d'un membre sur une série
     * @static
     * @param  {number} id - L'identifiant de la série
     * @return {Promise<Timeline>}
     */
    static fetchShow(id: number): Promise<Timeline>;
    /**
     * Methode static servant à récupérer les dernières activités d'un membre
     * @static
     * @param  {number} [id?] - L'identifiant du membre
     * @return {Promise<Timeline>}
     */
    static fetchMember(id?: number): Promise<Timeline>;
    events: EventTimeline[];
    private __decorators;
    __initial: boolean;
    __changes: Record<string, Changes>;
    __props: string[];
    elt: JQuery<HTMLElement>;
    constructor(data: Obj);
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Timeline}
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
}
