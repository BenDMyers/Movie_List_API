const router = require('express').Router();
const Movie = require('./models/movie.model');
const axios = require('axios');

const {tmdbKey} = require('./config/keys');
const {categorize} = require('./utils');

// GET ALL MOVIES
router.route('/').get((req, res) => {
    Movie.find(function(err, movies) {
        if (err) {console.log(err);}
        else {
            let categorized = categorize(movies);
            res.json(categorized);
        }
    });
});

// GET ONE MOVIE
router.route('/:id').get((req, res) => {
    const {id} = req.params;
    Movie.findById(id, function(err, movie) {res.json(movie);});
});

// ADD A MOVIE
router.route('/').post((req, res) => {
    const {id} = req.body;
    axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbKey}`)
        .then(movieData => {
            const {title, release_date, poster_path} = movieData.data;
            const movieBody = {
                id,
                title,
                year: release_date.split('-')[0],
                poster: poster_path
            };
            let movie = new Movie(movieBody);
            movie.save()
                .then(movie => {
                    res.status(200).json({'movie': 'movie added successfully'});
                })
                .catch(err => {
                    res.status(400).send('adding new movie failed');
                });
        })
        .catch(err => res.status(400).send(err));
});

// UPDATE A MOVIE
router.route('/:id').post((req, res) => {
    Movie.findByIdAndUpdate(req.params.id, req.body, {new: true}, (err, movie) => {
        if (!movie) {
            res.status(404).send("data is not found");
        }
        else {
            movie.save().then(movie => {
                res.status(200).send('Movie updated!');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
        }
    });
});

// REMOVE A MOVIE
router.route('/:id').delete((req, res) => {
    Movie.findByIdAndRemove(req.params.id, (err, movie) => {
        if (!movie)
            res.status(404).send("data is not found");
        else {
            res.status(200).send('Movie updated!');
        }
    });
});

/***** VOTES *****/
// VOTE FOR A MOVIE
router.route('/:movie/votes/:uuid').post((req, res) => {
    Movie.findByIdAndUpdate(req.params.movie, {$addToSet: {votes: req.params.uuid}}, {new: false}, (err, movie) => {
        if (!movie) {
            res.status(404).send("Movie not found");
        }
        else {
            movie.save().then(movie => {
                if(movie.votes.includes(req.params.uuid)) {
                    res.status(409).send('User has already voted for this movie.')
                } else {
                    res.status(200).send('Movie updated.');
                }
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
        }
    });
});

// UNVOTE FOR A MOVIE
router.route('/:movie/votes/:uuid').delete((req, res) => {
    Movie.findByIdAndUpdate(req.params.movie, {$pull: {votes: req.params.uuid}}, {new: false}, (err, movie) => {
        if (!movie) {
            res.status(404).send("Movie not found");
        }
        else {
            movie.save().then(oldMovie => {
                console.log(req.params.uuid, '\n', oldMovie, '\n', movie)
                if(!oldMovie.votes.includes(req.params.uuid)) {
                    res.status(404).send('User has not voted for this movie.')
                } else {
                    res.status(200).send('Movie updated.');
                }
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
        }
    });
});

module.exports = router;