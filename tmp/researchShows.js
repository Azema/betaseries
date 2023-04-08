let resultShows = [];
let params = new ParamsSearchShows();
let last = false;
params.pays = ['kr'];
params.autres = 'new';
params.limit = 20;

function getIds(shows) {
    let ids = [];
    for (let s = 0; s < shows.length; s++) {
        ids.push(shows[s].id);
    }
    return ids;
}
function search(parameters) {
    Search.searchShows(params).then(result => {
        //resultShows.concat(result);
        let current = params.limit * params.offset;
        if (result && result.total > current) {
            // On relance une recherche
            params.offset = params.offset + 1;
            console.log('params', params);
            search(params);
        } else {
            // Nous sommes arrivé à la fin des résultats
            // il faut récupérer les infos des shows
            last = true;
        }
        if (result && result.shows) {
            let ids = getIds(result.shows);
            // console.log('IDs(%d): ', ids.length, ids);
            Show.fetchMulti(ids).then(shows => {
                //console.log('Shows', shows);
                resultShows = resultShows.concat(shows);
                if (result && result.total > current) {
                    console.log('ResultShows', resultShows);
                }
            });
        }
    });
}
search(params);
(a,b) => { return a.note.mean < b.note.mean ? 1 : a.note.mean > b.note.mean ? -1 : 0; }