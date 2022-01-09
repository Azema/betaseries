import { Base, MediaType } from "./Base";

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
    total: number;
    mean: number;
    user: number;
    _parent: Base;

    constructor(data: any, parent: Base) {
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
    public createPopupForVote(cb: Function = Base.noop): void {
        if (Base.debug) console.log('objNote createPopupForVote');
        // La popup et ses éléments
        const _this = this,
              $popup = jQuery('#popin-dialog'),
              $contentHtmlElement = $popup.find(".popin-content-html"),
              $contentReact = $popup.find('.popin-content-reactmodule'),
              $title = $contentHtmlElement.find(".title"),
              $text = $popup.find("p"),
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
        $text.find('.star-svg').mouseenter((e: JQuery.MouseEnterEvent) => {
            const note:number = parseInt($(e.currentTarget).data('number'), 10);
            updateStars(e, note);
        });
        $text.find('.star-svg').mouseleave((e: JQuery.MouseLeaveEvent) => {
            updateStars(e, _this.user);
        });
        $text.find('.star-svg').click((e: JQuery.ClickEvent) => {
            const note:number = parseInt(jQuery(e.currentTarget).data('number'), 10),
                  $stars = jQuery(e.currentTarget).parent().find('.star-svg');
            // On supprime les events
            $stars.off('mouseenter').off('mouseleave');
            _this._parent.addVote(note)
                .then((result: boolean) => {
                    hidePopup();
                    if (result) {
                        // TODO: Mettre à jour la note du média
                        _this._parent.changeTitleNote(true);
                        if (cb) cb.call(_this);
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
     * Met à jour l'affichage de la note
     */
    public updateStars(elt: JQuery<HTMLElement> = null): void {
        elt = elt || jQuery('.blockInformations__metadatas .js-render-stars');
        const $stars: JQuery<HTMLElement> = elt.find('.star-svg use');
        let className: string;
        for (let s = 0; s < 5; s++) {
            className = (this.mean <= s) ? StarTypes.EMPTY : (this.mean < s + 1) ? StarTypes.HALF : StarTypes.FULL;
            $($stars.get(s)).attr('xlink:href', `#icon-star-${className}`);
        }
    }
    /**
     * Retourne la template pour l'affichage d'une note sous forme d'étoiles
     * @param   {number} [note=0] - La note à afficher
     * @param   {string} [color] - La couleur des étoiles
     * @returns {string}
     */
    public static renderStars(note: number = 0, color: string = ''): string {
        let typeSvg: string,
            template: string = '';
        Array.from({
            length: 5
        }, (_index: number, number: number) => {
            typeSvg = note <= number ? 'empty' : (note < number + 1) ? 'half' : 'full';
            template += `
                <svg viewBox="0 0 100 100" class="star-svg">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink"
                        xlink:href="#icon-star${color}-${typeSvg}">
                    </use>
                </svg>
            `;
        });
        return template;
    }
}