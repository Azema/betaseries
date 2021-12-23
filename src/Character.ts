export class Character {
    constructor(data: any) {
        this.actor = data.actor || '';
        this.picture = data.picture || '';
        this.name = data.name || '';
        this.guest = data.guest || false;
        this.id = (data.id !== undefined) ? parseInt(data.id, 10) : 0;
        this.description = data.description || null;
        this.role = data.role || '';
        this.show_id = (data.show_id !== undefined) ? parseInt(data.show_id, 10) : 0;
        this.movie_id = (data.movie_id !== undefined) ? parseInt(data.movie_id, 10) : 0;
    }
    actor: string;
    description: string;
    guest: boolean;
    id: number;
    name: string;
    picture: string;
    role: string;
    show_id: number;
    movie_id: number;
}