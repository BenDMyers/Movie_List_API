const categorize = (megalist) => {
    return megalist.reduce((lists, movie) => {
        if(lists[movie.list]) {
            let newList = [...lists[movie.list], movie];
            let newLists = {...lists, [movie.list]: newList};
            return newLists;
        } else {
            return {...lists, [movie.list]: [movie]};
        }
    }, {});
}

module.exports = {categorize};