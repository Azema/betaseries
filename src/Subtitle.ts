export class Subtitle {
    constructor(data: any) {
        this.id = parseInt(data.id, 10);
        this.language = data.language;
        this.source = data.source;
        this.quality = parseInt(data.quality, 10);
        this.file = data.file;
        this.url = data.url;
        this.date = new Date(data.date);
    }
    
    id: number;
    language: string;
    source: string;
    quality: number;
    file: string;
    url: string;
    date: Date;
}