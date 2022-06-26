import { Base } from "./Base";
import { Media } from "./Media";
import { Similar } from "./Similar";

'use strict';

/**
 * Retourne les similars associés au media
 * @return {Promise<Media>}
 */
Media.prototype.fetchSimilars = function(): Promise<Media> {
    const self = this;
    this.similars = [];
    return new Promise((resolve, reject) => {
        Base.callApi('GET', this.mediaType.plural, 'similars', {id: this.id, details: true}, true)
        .then(data => {
            if (data.similars) {
                for (let s = 0; s < data.similars.length; s++) {
                    self.similars.push(new Similar(data.similars[s][self.mediaType.singular], self.mediaType));
                }
            }
            self.save();
            resolve(self);
        }, err => {
            reject(err);
        });
    });
};