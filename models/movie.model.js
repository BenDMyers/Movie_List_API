const mongoose = require('mongoose');
const {Schema} = mongoose;

const Movie = new Schema({
    id: String,
    title: String,
    year: String,
    poster: String,
    recommendedDate: {type: Date, default: Date.now},
    updatedDate: {type: Date, default: Date.now},
    votes: [String],
    list: {type: String, default: 'recommended'}
});

module.exports = mongoose.model('Movie', Movie);