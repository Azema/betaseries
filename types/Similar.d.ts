import { Obj, MediaTypes } from "./Base";
import { Media } from "./Media";
import { Season } from "./Season";
import { implShow, Showrunner, Platforms, Images, Picture } from "./Show";
import { implMovie, OtherTitle } from "./Movie";
import { Platform_link } from "./Episode";
import { Person } from "./Character";
interface implDialog {
    show: () => void;
    close: () => void;
    setContent: (text: string) => void;
    setCounter: (text: string) => void;
    setTitle: (title: string) => void;
    init: () => void;
}
export declare class Similar extends Media implements implShow, implMovie {
    static relatedProps: {};
    backdrop: string;
    director: string;
    original_release_date: Date;
    other_title: OtherTitle;
    platform_links: Platform_link[];
    poster: string;
    production_year: number;
    release_date: Date;
    sale_date: Date;
    tagline: string;
    tmdb_id: number;
    trailer: string;
    url: string;
    aliases: object;
    creation: string;
    country: string;
    images: Images;
    nbEpisodes: number;
    network: string;
    next_trailer: string;
    next_trailer_host: string;
    rating: string;
    pictures: Picture[];
    platforms: Platforms;
    seasons: Season[];
    nbSeasons: number;
    showrunner: Showrunner;
    social_links: string[];
    status: string;
    thetvdb_id: number;
    persons: Array<Person>;
    constructor(data: Obj, type: MediaTypes);
    /**
     * Remplit l'objet avec les données fournit en paramètre
     * @param  {Obj} data Les données provenant de l'API
     * @returns {Similar}
     * @override
     */
    fill(data: Obj): this;
    /**
     * Récupère les données de la série sur l'API
     * @param  {boolean} [force=true]   Indique si on utilise les données en cache
     * @return {Promise<*>}             Les données de la série
     */
    fetch(force?: boolean): Promise<Obj>;
    /**
     * Ajoute le bandeau Viewed sur le poster du similar
     * @return {Similar}
     */
    addViewed(): Similar;
    /**
     * Ajoute l'icône wrench à côté du titre du similar
     * pour permettre de visualiser les données du similar
     * @param   {implDialog} dialog L'objet Dialog pour afficher les données
     * @returns {Similar}
     */
    wrench(dialog: implDialog): Similar;
    /**
     * Retourne le contenu HTML pour la popup
     * de présentation du similar
     * @return {string}
     */
    getContentPopup(): string;
    /**
     * Retourne le contenu HTML du titre de la popup
     * @return {string}
     */
    getTitlePopup(): string;
    /**
     * Met à jour l'attribut title de la note du similar
     * @param  {Boolean} change Indique si il faut modifier l'attribut
     * @return {string}         La valeur modifiée de l'attribut title
     */
    updateTitleNote(change?: boolean): string;
    /**
     * Ajoute la note, sous forme d'étoiles, du similar sous son titre
     * @return {Similar}
     */
    renderStars(): Similar;
    /**
     * Vérifie la présence de l'image du similar
     * et tente d'en trouver une si celle-ci n'est pas présente
     * @return {Similar}
     */
    checkImg(): Similar;
    /**
     * Add Show to account member
     * @return {Promise<Similar>} Promise of show
     */
    addToAccount(state?: number): Promise<Similar>;
    /**
     * Modifie le statut du similar
     * @param   {number} state Le nouveau statut du similar
     * @returns {Promise<Similar>}
     */
    changeState(state: number): Promise<Similar>;
    /**
     * Ajoute une note au média
     * @param   {number} note Note du membre connecté pour le média
     * @returns {Promise<boolean>}
     */
    addVote(note: number): Promise<boolean>;
}
export {};
