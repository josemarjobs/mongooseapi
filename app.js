var express = require('express');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');

var app = express();

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

var dbUri = 'mongodb://localhost:27017/api';
var dbConnection = mongoose.createConnection(dbUri);

var postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    match: /^([\w ,.!?]{1,100})$/
  },
  text: {type: String, required: true, max: 2000},
  viewCounter: Number,
  published: Boolean,
  createdAd: {
    type: Date,
    default: Date.now(),
    required: true
  },
  updatedAd: {
    type: Date,
    default: Date.now(),
    required: true
  }
})
var Post = dbConnection.model('Post', postSchema, 'posts');

app.get('/', (req, res) => {
  res.send('ok')
})

app.get('/posts', (req, res, next) => {
  Post.find({})
  .then(posts => res.json(posts))
  .catch(next)
})

app.post('/posts', (req, res, next) => {
  var post = new Post(req.body)
  post.validate()
  .then(() => post.save())
  .then((results) => res.send(results))
  .catch(error => res.status(400).send(error))
})

app.use(errorHandler());

var server = require('http').createServer(app);
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
})
