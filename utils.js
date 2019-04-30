const authorization = require('auth-header');

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
};

const reshape = (movie, userId) => {
    const {_id, votes, list, id, title, year, poster, updatedDate} = movie;
    return {
        _id, list, id, title, year, poster, updatedDate,
        numVotes: votes.length,
        userHasAlreadyVoted: userId && votes.includes(userId)
    };
};

const getUserId = (authHeader) => {
    console.log('***AUTH***', typeof authHeader);
    console.log(authHeader);
    var auth = authorization.parse(authHeader);
    return Buffer(auth.token, 'base64').toString().replace(':', '');
}

module.exports = {categorize, reshape, getUserId};