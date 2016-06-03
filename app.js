var express = require('express');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var app = express();

var dbUri = 'mongodb://localhost:27017/api';
// var dbConnection = mongoose.createConnection(dbUri);
mongoose.connect(dbUri)

var postSchema = new mongoose.Schema({
  title: String,
  text: String
})
var Post = mongoose.model('Post', postSchema, 'posts');

app.get('/', (req, res) => {
  res.send('ok')
})

app.get('/posts', (req, res, next) => {
  Post.find({})
  .then(posts => res.json(posts))
  .catch(next)
})

var server = require('http').createServer(app);
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
})
