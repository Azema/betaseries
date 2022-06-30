import { Obj } from "./Base";
import { Show } from "./Show";
export declare class UpdateAuto {
    private static instance;
    static intervals: Array<Obj>;
    /**
     * Objet Show contenant les infos de la série
     * @type {Show}
     */
    private _show;
    /**
     * Identifiant de la série
     * @type {number}
     */
    private _showId;
    /**
     * Flag indiquant si une config updateAuto existe déjà
     * en mémoire
     * @type {boolean}
     */
    private _exist;
    /**
     * Etat de la tâche de mise à jour
     * @type {boolean}
     */
    private _status;
    /**
     * Flag indiquant si la mise à jour doit être lancée automatiquement
     * @type {boolean}
     */
    private _auto;
    /**
     * Intervalle des mises à jour
     * @type {number}
     */
    private _interval;
    /**
     * Timer des mises à jour
     * @type {NodeJS.Timer}
     */
    private _timer;
    /**
     * DateTime de la dernière mise à jour
     * @type {Date}
     */
    private _lastUpdate;
    /**
     * Constructeur privé, modèle Singleton
     * @private
     * @param {Show} show - L'objet Show sur lequel faire les mises à jour
     * @returns {UpdateAuto} L'instance de mise à jour
     */
    private constructor();
    private _init;
    /**
     * Retourne l'instance de l'objet de mise à jour auto des épisodes
     * @static
     * @param   {Show} [s] - L'objet de la série
     * @returns {UpdateAuto}
     */
    static getInstance(s?: Show): Promise<UpdateAuto>;
    /**
     * _save - Sauvegarde les options de la tâche d'update
     * auto dans l'espace de stockage de Tampermonkey
     *
     * @private
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    _save(): Promise<this>;
    /**
     * Retourne l'objet Show associé
     * @returns {Show}
     */
    get show(): Show;
    /**
     * get status - Retourne le statut de la tâche d'update auto
     * des épisodes
     *
     * @return {boolean}  Le statut
     */
    get status(): boolean;
    /**
     * set status - Modifie le statut de la tâche d'update auto
     * des épisodes
     *
     * @param  {boolean} status Le statut de la tâche
     */
    set status(status: boolean);
    /**
     * get auto - Flag indiquant l'autorisation de pouvoir lancer
     * la tâche d'update auto
     *
     * @return {boolean}  Flag d'autorisation
     */
    get auto(): boolean;
    /**
     * set auto - Modifie l'autorisation de lancer la tâche
     * d'update auto
     *
     * @param  {boolean} auto Le flag
     */
    set auto(auto: boolean);
    /**
     * get interval - Retourne l'intervalle de temps entre
     * chaque update auto
     *
     * @return {number}  L'intervalle de temps en minutes
     */
    get interval(): number;
    /**
     * set interval - Définit l'intervalle de temps, en minutes,
     * entre chaque update auto
     *
     * @param  {number} val L'intervalle de temps en minutes
     */
    set interval(val: number);
    /**
     * Retourne la date de la dernière mise à jour éffectuée
     * @return {Date} La date de la dernière mise à jour
     */
    get lastUpdate(): number;
    /**
     * changeColorBtn - Modifie la couleur du bouton d'update
     * des épisodes sur la page Web
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    changeColorBtn(): UpdateAuto;
    /**
     * stop - Permet de stopper la tâche d'update auto et
     * aussi de modifier le flag et l'intervalle en fonction
     * de l'état de la série
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    stop(): UpdateAuto;
    /**
     * delete - Supprime les options d'update auto
     * de la série de l'espace de stockage
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    delete(): Promise<UpdateAuto>;
    /**
     * launch - Permet de lancer la tâche d'update auto
     * des épisodes
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    launch(): UpdateAuto;
    /**
     * _tick: Fonction Tick pour la mise à jour des épisodes à intervalle régulère
     * @private
     * @returns {void}
     */
    private _tick;
    /**
     * Retourne le temps restant avant le prochain update
     * sous forme mm:ss
     * @returns {string}
     */
    remaining(): string;
}
