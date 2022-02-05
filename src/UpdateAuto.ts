import { Base, Obj } from "./Base";
import { DataTypesCache } from "./Cache";
import { Show } from "./Show";
declare var moment;
// eslint-disable-next-line no-unused-vars
export class UpdateAuto {
    private static instance: UpdateAuto;

    static intervals: Array<Obj> = [
        {val: 0, label: 'Jamais'},
        {val: 1, label: '1 min.'},
        {val: 5, label: '5 min.'},
        {val: 10, label: '10 min.'},
        {val: 15, label: '15 min.'},
        {val: 30, label: '30 min.'},
        {val: 45, label: '45 min.'},
        {val: 60, label: '60 min.'}
    ];

    private _show: Show;
    private _showId: number;
    private _exist: boolean;
    private _status: boolean;
    private _auto: boolean;
    private _interval: number;
    private _timer: NodeJS.Timer;

    private constructor(show: Show) {
        if (UpdateAuto.instance) {
            return UpdateAuto.instance;
        }
        this._show = show;
        this._showId = show.id;
        let objUpAuto = Base.gm_funcs.getValue('objUpAuto', {});
        this._exist = false;
        if (objUpAuto[this._showId] !== undefined) {
            this._exist = true;
            this._status = objUpAuto[this._showId].status;
            this._auto = objUpAuto[this._showId].auto;
            this._interval = objUpAuto[this._showId].interval;
        } else {
            this._status = false; // Statut de la tâche d'update
            this._auto = false; // Autorise l'activation de la tâche d'update des épisodes
            this._interval = 0; // Intervalle de temps entre les mises à jour
        }
        this.changeColorBtn();
        return this;
    }

    /**
     * Retourne l'instance de l'objet de mise à jour auto des épisodes
     * @param   {Show} s - L'objet de la série
     * @returns {UpdateAuto}
     */
    public static getInstance(s: Show): UpdateAuto {
        if (! UpdateAuto.instance) {
            UpdateAuto.instance = new UpdateAuto(s);
        }
        return UpdateAuto.instance;
    }

    /**
     * _save - Sauvegarde les options de la tâche d'update
     * auto dans l'espace de stockage de Tampermonkey
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    _save() {
        let objUpAuto = Base.gm_funcs.getValue('objUpAuto', {});
        let obj = {
            status: this._status,
            auto: this._auto,
            interval: this._interval
        };
        objUpAuto[this._showId] = obj;
        Base.gm_funcs.setValue('objUpAuto', objUpAuto);
        this._exist = true;
        this.changeColorBtn();
        return this;
    }

    /**
     * Retourne l'objet Show associé
     * @returns {Show}
     */
    get show(): Show {
        return this._show;
    }

    /**
     * get status - Retourne le statut de la tâche d'update auto
     * des épisodes
     *
     * @return {boolean}  Le statut
     */
    get status(): boolean {
        return this._status;
    }

    /**
     * set status - Modifie le statut de la tâche d'update auto
     * des épisodes
     *
     * @param  {boolean} status Le statut de la tâche
     */
    set status(status: boolean) {
        this._status = status;
        this._save();
    }

    /**
     * get auto - Flag indiquant l'autorisation de pouvoir lancer
     * la tâche d'update auto
     *
     * @return {boolean}  Flag d'autorisation
     */
    get auto(): boolean {
        return this._auto;
    }

    /**
     * set auto - Modifie l'autorisation de lancer la tâche
     * d'update auto
     *
     * @param  {boolean} auto Le flag
     */
    set auto(auto: boolean) {
        this._auto = auto;
        this._save();
    }

    /**
     * get interval - Retourne l'intervalle de temps entre
     * chaque update auto
     *
     * @return {number}  L'intervalle de temps en minutes
     */
    get interval(): number {
        return this._interval;
    }

    /**
     * set interval - Définit l'intervalle de temps, en minutes,
     * entre chaque update auto
     *
     * @param  {number} val L'intervalle de temps en minutes
     */
    set interval(val: number) {
        this._interval = val;
        this._save();
    }

    /**
     * changeColorBtn - Modifie la couleur du bouton d'update
     * des épisodes sur la page Web
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    changeColorBtn(): UpdateAuto {
        let color = '#fff';
        if (! this._exist) {
            color = '#6c757d'; // grey
        } else if (this._status && this._auto) {
            color = 'green';
        } else if (this._auto && ! this._status) {
            color = 'orange';
        } else if (! this._auto && ! this._status) {
            color = 'red';
        }
        $('.updateEpisodes').css('color', color);
        return this;
    }

    /**
     * stop - Permet de stopper la tâche d'update auto et
     * aussi de modifier le flag et l'intervalle en fonction
     * de l'état de la série
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    stop(): UpdateAuto {
        if (this._show.user.remaining <= 0 && this._show.isEnded()) {
            this._auto = false;
            this._interval = 0;
        } else if (this._show.user.remaining <= 0) {
            this._auto = false;
        }
        this.status = false;
        clearInterval(this._timer);
        this._timer = null;
        return this;
    }

    /**
     * delete - Supprime les options d'update auto
     * de la série de l'espace de stockage
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    delete(): UpdateAuto {
        this.stop();
        let objUpAuto = Base.gm_funcs.getValue('objUpAuto', {});
        if (objUpAuto[this._showId] !== undefined) {
            delete objUpAuto[this._showId];
            Base.gm_funcs.setValue('objUpAuto', objUpAuto);
            this._auto = false;
            this._interval = 0;
            this._exist = false;
            this.changeColorBtn();
        }
        return this;
    }

    /**
     * launch - Permet de lancer la tâche d'update auto
     * des épisodes
     *
     * @return {UpdateAuto} L'instance unique UpdateAuto
     */
    launch(): UpdateAuto {
        // Si les options sont modifiées pour arrêter la tâche
        // et que le statut est en cours
        if (this._status && (!this._auto || this._interval <= 0)) {
            if (Base.debug) console.log('close interval updateEpisodeListAuto');
            return this.stop();
        }
        // Si les options modifiées pour lancer
        else if (this._auto && this._interval > 0) {
            if (this._show.user.remaining <= 0) {
                this.stop();
                return this;
            }
            if (this._timer) {
                if (Base.debug) console.log('close old interval timer');
                clearInterval(this._timer);
            }
            const _this = this;
            this.status = true;
            const run = function() {
                // if (debug) console.log('UpdateAuto setInterval objShow', Object.assign({}, _this._objShow));
                if (! _this._auto || _this._show.user.remaining <= 0) {
                    if (Base.debug) console.log('Arrêt de la mise à jour auto des épisodes');
                    _this.stop();
                    return;
                }
                if (Base.debug) {
                    let prefix = '';
                    if (typeof moment !== 'undefined') {
                        const now = new Date();
                        // eslint-disable-next-line no-undef
                        prefix = '[' + moment(now).format('DD/MM/YY HH:mm') + ']: ';
                    }
                    console.log('%supdate episode list', prefix);
                }
                const btnUpEpisodeList = $('.updateEpisodes');
                if (btnUpEpisodeList.length > 0) {
                    btnUpEpisodeList.trigger('click');
                    if ( ! _this._status) {
                        _this.status = true;
                    }
                }
            };
            run();
            this._timer = setInterval(run, (this._interval * 60) * 1000);
        }
        return this;
    }
}