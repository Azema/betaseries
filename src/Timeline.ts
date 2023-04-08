import { UsBetaSeries, HTTP_VERBS, Obj, isNull } from "./Base";
import { CommentBS } from "./Comment";
import { AbstractDecorator, FillDecorator, implFillDecorator } from "./Decorators";
import { Changes, RelatedProp } from "./RenderHtml";

export class EventTimeline {
  id: number;
  type: string; // add_serie, markas, archive, season_watched
  ref: string; // Voué à disparaître au profit des ID de référence
  ref_id: number;
  user: string;
  user_id: number;
  html: string; // message HTML
  picture_url: string;
  date: Date;
  comments: number; // Nombre de commentaires
  first_comments: CommentBS[];
  data: Obj | Array<Obj>;
  comments_by_user: number;
}

export enum TimelineType {
    'event' = 'event',
    'feed' = 'feed',
    'friends' = 'friends',
    'home' = 'home',
    'member' = 'member',
    'show' = 'show'
}

export class Timeline implements implFillDecorator {
    static logger = new UsBetaSeries.setDebug('Timeline');
    static debug = Timeline.logger.debug.bind(Timeline.logger);

    static relatedProps: Record<string, RelatedProp> = {
        'events': {key: 'events', type: Array<EventTimeline>, default: []}
    };

    /**
     * Méthode static servant à récupérer une série sur l'API BS
     * @static
     * @private
     * @param  {Obj} params - Critères de recherche de la série
     * @param  {boolean} [force=false] - Indique si on utilise le cache ou non
     * @return {Promise<Timeline>}
     */
     protected static _fetch(type: TimelineType, params?: Obj, force = false): Promise<Timeline> {
        return UsBetaSeries.callApi(HTTP_VERBS.GET, 'timeline', type, params, force)
            .then(data => {
                try {
                    const timeline = new Timeline(data);
                    // Show.debug('Show::_fetch', timeline);
                    return timeline;
                } catch (err) {
                    console.error('Timeline::_fetch', err);
                    throw err;
                }
            });
    }

    /**
     * Methode static servant à récupérer les dernières activités des amis d'un membre
     * @static
     * @return {Promise<Timeline>}
     */
    static fetchFriends(): Promise<Timeline> {
        return this._fetch(TimelineType.friends);
    }

    /**
     * Methode static servant à récupérer les dernières activités d'un membre sur une série
     * @static
     * @param  {number} id - L'identifiant de la série
     * @return {Promise<Timeline>}
     */
    static fetchShow(id: number): Promise<Timeline> {
        return this._fetch(TimelineType.show, {id});
    }

    /**
     * Methode static servant à récupérer les dernières activités d'un membre
     * @static
     * @param  {number} [id?] - L'identifiant du membre
     * @return {Promise<Timeline>}
     */
    static fetchMember(id?: number): Promise<Timeline> {
        if (isNull(id)) id = UsBetaSeries.userId;
        return this._fetch(TimelineType.member, {id});
    }

    events: EventTimeline[];

    private __decorators: Record<string, AbstractDecorator> = {
        fill: new FillDecorator(this)
    };
    __initial: boolean;
    __changes: Record<string, Changes>;
    __props: string[];
    elt: JQuery<HTMLElement>;

    constructor(data: Obj) {
        return this.fill(data);
    }

    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param   {Obj} data - Les données provenant de l'API
     * @returns {Timeline}
     */
    public fill(data: Obj): this {
        try {
            return (this.__decorators.fill as FillDecorator).fill.call(this, data);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Met à jour le rendu HTML des propriétés de l'objet,
     * si un sélecteur CSS exite pour la propriété fournit en paramètre\
     * **Méthode appelée automatiquement par le setter de la propriété**
     * @see Show.selectorsCSS
     * @param   {string} propKey - La propriété de l'objet à mettre à jour
     * @returns {void}
     */
    updatePropRender(propKey: string): void {
        try {
            (this.__decorators.fill as FillDecorator).updatePropRender.call(this, propKey);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Retourne l'objet sous forme d'objet simple, sans référence circulaire,
     * pour la méthode JSON.stringify
     * @returns {object}
     */
    toJSON(): object {
        const obj: object = {};
        for (const key of this.__props) {
            obj[key] = this[key];
        }
        return obj;
    }
}