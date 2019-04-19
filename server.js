const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const PORT = 4000;
const {mongoURI} = require('./config/keys');
const router = require('./router');

app.use(cors());
app.use(bodyParser.json());
app.use('/movies/', router);

mongoose.connect(mongoURI, {useNewUrlParser: true});
const {connection} = mongoose;

connection.once('open', function() {
    console.log('MongoDB database connection established successfully');
});

app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});