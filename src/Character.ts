export class Character {
    /**
     * @type {string} Nom de l'acteur/actrice
     */
    actor: string;
    /**
     * @type {string} Description du rôle
     */
    description: string;
    /**
     * @type {boolean} Invité ?
     */
    guest: boolean;
    /**
     * @type {number} Identifiant de l'acteur
     */
    id: number;
    /**
     * @type {string} Nom du personnage
     */
    name: string;
    /**
     * @type {string} URL de l'image du personnage
     */
    picture: string;
    /**
     * @type {string} Type de rôle du personnage dans le média
     */
    role: string;
    /**
     * @type {number} Identifiant de la série
     */
    show_id: number;
    /**
     * @type {number} Identifiant du film
     */
    movie_id: number;

    constructor(data: any) {
        this.actor = data.actor || '';
        this.picture = data.picture || '';
        this.name = data.name || '';
        this.guest = !!data.guest || false;
        this.id = (data.id !== undefined) ? parseInt(data.id, 10) : 0;
        this.description = data.description || '';
        this.role = data.role || '';
        this.show_id = (data.show_id !== undefined) ? parseInt(data.show_id, 10) : 0;
        this.movie_id = (data.movie_id !== undefined) ? parseInt(data.movie_id, 10) : 0;
    }
}