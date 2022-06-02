import { Base, EventTypes, MediaType, Obj, Callback } from "./Base";

export interface implAddNote {
    addVote(note: number): Promise<boolean>;
}
enum StarTypes {
    EMPTY = 'empty',
    HALF = 'half',
    FULL = 'full',
    DISABLE = 'disable'
}
export class Note {
    /**
     * Nombre de votes
     * @type {number}
     */
    total: number;
    /**
     * Note moyenne du média
     * @type {number}
     */
    mean: number;
    /**
     * Note du membre connecté
     * @type {number}
     */
    user: number;
    /**
     * Media de référence
     * @type {Base}
     */
    _parent: Base;

    constructor(data: Obj, parent: Base) {
        this.total = parseInt(data.total, 10);
        this.mean = parseFloat(data.mean);
        this.user = parseInt(data.user, 10);
        this._parent = parent;
    }
    /**
     * Retourne la note moyenne sous forme de pourcentage
     * @returns {number} La note sous forme de pourcentage
     */
    public getPercentage(): number {
        return Math.round(((this.mean / 5) * 100) / 10) * 10;
    }
    /**
     * Retourne l'objet Note sous forme de chaine
     * @returns {string}
     */
    public toString(): string {
        const votes = 'vote' + (this.total > 1 ? 's' : ''),
              // On met en forme le nombre de votes
              total = new Intl.NumberFormat('fr-FR', {style: 'decimal', useGrouping: true}).format(this.total),
              // On limite le nombre de chiffre après la virgule
              note = this.mean.toFixed(2);
        let toString = `${total} ${votes} : ${note} / 5`;
        // On ajoute la note du membre connecté, si il a voté
        if (Base.userIdentified() && this.user > 0) {
            toString += `, votre note: ${this.user}`;
        }
        return toString;
    }
    /**
     * Crée une popup avec 5 étoiles pour noter le média
     */
    public createPopupForVote(cb: Callback = Base.noop): void {
        if (Base.debug) console.log('objNote createPopupForVote');
        // La popup et ses éléments
        const self = this,
              $popup = jQuery('#popin-dialog'),
              $contentHtmlElement = $popup.find(".popin-content-html"),
              $contentReact = $popup.find('.popin-content-reactmodule'),
              $closeButtons = $popup.find(".js-close-popupalert"),
              hidePopup = () => {
                  if (Base.debug) console.log('objNote createPopupForVote hidePopup');
                  $popup.attr('aria-hidden', 'true');
                  $contentHtmlElement.find(".button-set").show();
                  $contentHtmlElement.hide();
                  // On désactive les events
                  $text.find('.star-svg').off('mouseenter').off('mouseleave').off('click');
                },
                showPopup = () => {
                    if (Base.debug) console.log('objNote createPopupForVote showPopup');
                    $contentHtmlElement.find(".button-set").hide();
                    $contentHtmlElement.show();
                    $contentReact.hide();
                    $closeButtons.show();
                    $popup.attr('aria-hidden', 'false');
                };
        let $text = $popup.find("p"),
            $title = $contentHtmlElement.find(".title");
        // On vérifie que la popup est masquée
        hidePopup();
        // Ajouter les étoiles
        let template = '<div style="display: flex; justify-content: center; margin-bottom: 15px;"><div role="button" tabindex="0" class="stars btn-reset">',
            className: string;
        for (let i = 1; i <= 5; i++) {
            className = this.user <= i - 1 ? StarTypes.EMPTY : StarTypes.FULL;
            template += `
                <svg viewBox="0 0 100 100" class="star-svg" data-number="${i}" style="width: 30px; height: 30px;">
                    <use xlink:href="#icon-starblue-${className}"></use>
                </svg>`;
        }
        if ($text.length <= 0) {
            $contentHtmlElement.replaceWith(`
                <div class="popin-content-html">
                    <div class="title" id="dialog-title" tabindex="0"></div>
                    <div class="popin-content-ajax">
                        <p></p>
                    </div>
                </div>`);
            $text = $contentHtmlElement.find('p');
            $title = $contentHtmlElement.find(".title");
        }
        // On vide la popup et on ajoute les étoiles
        $text.empty().append(template + '</div></div>');
        let title = 'Noter ';
        switch (this._parent.mediaType.singular) {
            case MediaType.show:
                title += 'la série';
                break;
            case MediaType.movie:
                title += 'le film';
                break;
            case MediaType.episode:
                title += "l'épisode";
                break;
            default:
                break;
        }
        $title.empty().text(title);
        $closeButtons.click(() => {
            hidePopup();
            $popup.removeAttr('data-popin-type');
        });
        // On ajoute les events sur les étoiles
        const updateStars = function(evt: JQuery.MouseEventBase, note: number): void {
            const $stars: JQuery<HTMLElement> = jQuery(evt.currentTarget).parent().find('.star-svg use');
            let className: string;
            for (let s = 0; s < 5; s++) {
                className = (s <= note - 1) ? StarTypes.FULL : StarTypes.EMPTY;
                $($stars.get(s)).attr('xlink:href', `#icon-starblue-${className}`);
            }
        };
        const $stars = $text.find('.star-svg');
        $stars.mouseenter((e: JQuery.MouseEnterEvent) => {
            const note:number = parseInt($(e.currentTarget).data('number'), 10);
            updateStars(e, note);
        });
        $stars.mouseleave((e: JQuery.MouseLeaveEvent) => {
            updateStars(e, self.user);
        });
        $stars.click((e: JQuery.ClickEvent) => {
            const note:number = parseInt(jQuery(e.currentTarget).data('number'), 10),
                  $stars = jQuery(e.currentTarget).parent().find('.star-svg');
            // On supprime les events
            $stars.off('mouseenter').off('mouseleave');
            self._parent.addVote(note)
                .then((result: boolean) => {
                    hidePopup();
                    if (result) {
                        // TODO: Mettre à jour la note du média
                        self._parent.changeTitleNote(true);
                        self._parent._callListeners(EventTypes.NOTE);
                        if (cb) cb.call(self);
                    } else {
                        Base.notification('Erreur Vote', "Une erreur s'est produite durant le vote");
                    }
                })
                .catch(() => hidePopup() );
        });
        // On affiche la popup
        showPopup();
    }
    /**
     * Retourne le type d'étoile en fonction de la note et de l'indice
     * de comparaison
     * @param  {number} note   La note du media
     * @param  {number} indice L'indice de comparaison
     * @return {string}        Le type d'étoile
     */
    public static getTypeSvg(note: number, indice: number): string {
        let typeSvg = StarTypes.EMPTY;
        if (note <= indice) {
            typeSvg = StarTypes.EMPTY;
        } else if (note < indice + 1) {
            if (note > indice + 0.25) {
                typeSvg = StarTypes.HALF;
            } else if (note > indice + 0.75) {
                typeSvg = StarTypes.FULL;
            }
        } else {
            typeSvg = StarTypes.FULL;
        }
        return typeSvg;
    }
    /**
     * Met à jour l'affichage de la note
     */
    public updateStars(elt: JQuery<HTMLElement> = null): void {
        elt = elt || jQuery('.blockInformations__metadatas .js-render-stars');
        let color = '';
        const $stars: JQuery<HTMLElement> = elt.find('.star-svg use');
        const result = $($stars.get(0)).attr('xlink:href').match(/(grey|blue)/);
        if (result) {
            color = result[0];
        }
        let className: string;
        for (let s = 0; s < 5; s++) {
            className = Note.getTypeSvg(this.mean, s);
            // className = (this.mean <= s) ? StarTypes.EMPTY : (this.mean < s + 1) ? (this.mean >= s + 0.5) ? StarTypes.HALF : StarTypes.EMPTY : StarTypes.FULL;
            $($stars.get(s)).attr('xlink:href', `#icon-star${color}-${className}`);
        }
    }
    /**
     * Retourne la template pour l'affichage d'une note sous forme d'étoiles
     * @param   {number} [note=0] - La note à afficher
     * @param   {string} [color] - La couleur des étoiles
     * @returns {string}
     */
    public static renderStars(note = 0, color = ''): string {
        let typeSvg: string,
            template = '';
        if (note == 0) {
            color = 'grey';
        }
        for (let s = 0; s < 5; s++) {
            typeSvg = Note.getTypeSvg(note, s);
            template += `
                <svg viewBox="0 0 100 100" class="star-svg">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink"
                        xlink:href="#icon-star${color}-${typeSvg}">
                    </use>
                </svg>
            `;
        }
        return template;
    }
}