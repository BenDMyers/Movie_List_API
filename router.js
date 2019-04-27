const router = require('express').Router();
const axios = require('axios');
const uuid = require('uuid/v4');

const {tmdbKey} = require('./config/keys');
const {categorize} = require('./utils');
const Movie = require('./models/movie.model');

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

/***** VOTES *****/
// VOTE FOR A MOVIE
router.route('/:movie/votes').post((req, res) => {
    let userId = req.body.uuid;
    Movie.findByIdAndUpdate(req.params.movie, {$addToSet: {votes: userId}}, {new: false}, (err, movie) => {
        if (!movie) {
            res.status(404).send("Movie not found");
        } else {
            movie.save().then(movie => {
                if(movie.votes.includes(userId)) {
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

// REMOVE VOTE FOR A MOVIE
router.route('/:movie/votes').delete((req, res) => {
    let userId = req.body.uuid;
    Movie.findByIdAndUpdate(req.params.movie, {$pull: {votes: userId}}, {new: false}, (err, movie) => {
        if (!movie) {
            res.status(404).send("Movie not found");
        } else {
            movie.save().then(oldMovie => {
                console.log(movie, oldMovie);
                if(!oldMovie.votes.includes(userId)) {
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