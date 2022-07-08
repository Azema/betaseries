import { Base, UsBetaSeries } from "./Base";
import { CacheUS } from "./Cache";
import { Character, Person, personMedia } from "./Character";
import { CommentBS } from "./Comment";
import { CommentsBS } from "./Comments";
import { Episode } from "./Episode";
import { Media, MediaBase } from "./Media";
import { Member, OptionsMember, Stats } from "./Member";
import { Movie } from "./Movie";
import { Note } from "./Note";
import { NotificationBS, NotificationList, NotifPayload } from "./Notification";
import { RenderHtml } from "./RenderHtml";
import { ParamsSearchMovies, ParamsSearchShows, Search } from "./Search";
import { Season } from "./Season";
import { Images, Picture, Platform, PlatformList, Platforms, Show, Showrunner } from "./Show";
import { Similar } from "./Similar";
import { Subtitle } from "./Subtitle";
import { UpdateAuto } from "./UpdateAuto";
import { Next, User } from "./User";

'use strict';

/**
 * Retourne les similars associés au media
 * @return {Promise<Media>}
 */
Media.prototype.fetchSimilars = function(): Promise<Media> {
    const self = this;
    if (this.__fetches.similars) return this.__fetches.similars;
    this.similars = [];
    this.__fetches.similars = new Promise((resolve, reject) => {
        UsBetaSeries.callApi('GET', this.mediaType.plural, 'similars', {id: this.id, details: true}, true)
        .then(data => {
            if (data.similars) {
                for (let s = 0; s < data.similars.length; s++) {
                    self.similars.push(new Similar(data.similars[s][self.mediaType.singular], self.mediaType));
                }
            }
            self.save();
            resolve(self);
            delete self.__fetches.similars;
        }, err => {
            reject(err);
            delete self.__fetches.similars;
        });
    });
    return this.__fetches.similars;
};
/**
 * bsModule contient la correspondance entre les noms de classe et l'objet Function\
 * Cela sert aux méthodes getInstance et checkClassname
 * @static
 * @type {Record<string, any>}
 */
UsBetaSeries.bsModule = {
    "Base": Base,
    "CacheUS": CacheUS,
    "Character": Character,
    "CommentBS": CommentBS,
    "CommentsBS": CommentsBS,
    "Episode": Episode,
    "Images": Images,
    "Media": Media,
    "MediaBase": MediaBase,
    "Member": Member,
    "Movie": Movie,
    "Next": Next,
    "Note": Note,
    "NotificationBS": NotificationBS,
    "NotificationList": NotificationList,
    "NotifPayload": NotifPayload,
    "Options": OptionsMember,
    "Person": Person,
    "PersonMedia": personMedia,
    "Picture": Picture,
    "Platform": Platform,
    "PlatformList": PlatformList,
    "ParamsSearchMovies": ParamsSearchMovies,
    "ParamsSearchShows": ParamsSearchShows,
    "Platforms": Platforms,
    "RenderHtml": RenderHtml,
    "Search": Search,
    "Season": Season,
    "Show": Show,
    "Showrunner": Showrunner,
    "Similar": Similar,
    "Stats": Stats,
    "Subtitle": Subtitle,
    "UpdateAuto": UpdateAuto,
    "User": User
};
/**
 * getInstance - fonction servant à instancier un objet à partir de son nom de classe
 * et de paramètres
 * @static
 * @param   {string} className - Le nom de la classe à instancier
 * @param   {Array} [args = []] - Les paramètres à fournir au constructeur
 * @returns {any} L'objet instancié
 * @throws Error
 */
UsBetaSeries.getInstance = (className: string, ...args: any[]): any => {

    // TODO: Handle Null and invalid className arguments
    if (typeof UsBetaSeries.bsModule[className] !== undefined) {
        return new UsBetaSeries.bsModule[className](args);
    } else {
        throw new Error("Class not found: " + className);
    }
}
/**
 * checkClassname - Fonction servant à vérifier si la classe est connue
 * et peut être instanciée
 * @static
 * @param   {string} className - Le nom de classe à vérifier
 * @returns {boolean}
 */
UsBetaSeries.checkClassname = (className: string): boolean => {
    return typeof UsBetaSeries.bsModule[className] !== undefined;
}