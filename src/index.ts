import { Base, MediaType, Obj } from "./Base";
import { Media } from "./Media";
import { Show, Images, Platforms, Showrunner } from "./Show";
import { Season } from "./Season";
import { Similar } from "./Similar";

'use strict';

/**
 * Remplit l'objet avec les données fournit en paramètre
 * @param  {Obj} data Les données provenant de l'API
 * @returns {Show}
 * @override
 */
 Show.prototype.fill = function(data: Obj): Show {
    this.aliases = data.aliases;
    this.creation = data.creation;
    this.country = data.country;
    this.images = null;
    if (data.images !== undefined && data.images != null) {
        this.images = new Images(data.images);
    }
    this.nbEpisodes = parseInt(data.episodes, 10);
    this.network = data.network;
    this.next_trailer = data.next_trailer;
    this.next_trailer_host = data.next_trailer_host;
    this.rating = data.rating;
    this.platforms = null;
    if (data.platforms !== undefined && data.platforms != null) {
        this.platforms = new Platforms(data.platforms);
    }
    if (this.id == null && this.seasons == null) {
        this.seasons = new Array();
        for (let s = 0; s < data.seasons_details.length; s++) {
            this.seasons.push(new Season(data.seasons_details[s], this));
        }
    }
    this.showrunner = null;
    if (data.showrunner !== undefined && data.showrunner != null) {
        this.showrunner = new Showrunner(data.showrunner);
    }
    this.social_links = data.social_links;
    this.status = data.status;
    this.thetvdb_id = parseInt(data.thetvdb_id, 10);
    this.pictures = null;
    this.mediaType = {singular: MediaType.show, plural: 'shows', className: Show};
    Media.prototype.fill.call(this, data);
    return this.save();
};

/**
 * Retourne les similars associés au media
 * @return {Promise<Media>}
 */
Media.prototype.fetchSimilars = function(): Promise<Media> {
    const _this = this;
    this.similars = [];
    return new Promise((resolve, reject) => {
        Base.callApi('GET', this.mediaType.plural, 'similars', {id: this.id, details: true}, true)
        .then(data => {
            if (data.similars) {
                for (let s = 0; s < data.similars.length; s++) {
                    _this.similars.push(new Similar(data.similars[s][_this.mediaType.singular], _this.mediaType));
                }
            }
            _this.save();
            resolve(_this);
        }, err => {
            reject(err);
        });
    });
};