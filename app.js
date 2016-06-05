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

var Schema = mongoose.Schema
var postSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    match: /^([\w ,.!?]{1,100})$/,
    set: function(value) {
      return value.toUpperCase();
    },
    get: function(value) {
      return value.toLowerCase();
    }
  },
  text: {type: String, required: true, max: 2000},
  followers: [Schema.Types.ObjectId],
  meta: Schema.Types.Mixed,
  comments: [{
    text: {type: String, trim: true, max: 1000},
    author: {
      id: {type: Schema.Types.ObjectId, ref: 'User'},
      name: String,
      role: {
        type: String,
        enum: ['user', 'admin', 'staff']
      }
    }
  }],
  viewCounter: {
    type: Number,
    validate: {
      validator: function(value) {
        if (value < 0) {return false}
        return true;
      },
      message: '{VALUE} is not greater than 0'
    }
  },
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

postSchema.virtual('hasComments').get(function() {
  return this.comments.length > 0
})

var Post = dbConnection.model('Post', postSchema, 'posts');

app.get('/', (req, res) => {
  res.send('ok')
})

app.get('/posts', (req, res, next) => {
  Post.find({}, {id: true, title: true}, {limit: 100, sort: {_id: -1}})
  .then(posts => res.json(posts))
  .catch(next)
})

app.get('/posts/:id', (req, res, next) => {
  Post.findById(req.params.id)
  .then(post => {
    if (!post) {
      res.sendStatus(404)
      return;
    }
    res.send(post.toJSON({virtuals: true}))
  })
  .catch(err => res.status(400).send(err))
})

app.post('/posts', (req, res) => {
  var post = new Post(req.body)
  post.validate()
  .then(() => post.save())
  .then((results) => res.send(results))
  .catch(error => res.status(400).send(error))
})

app.put('/posts/:id', (req, res) => {
  Post.findById(req.params.id)
  .then(post => {
    if (!post) { res.sendStatus(404); return; }
    post.set(req.body)
    return post.save()
  })
  .then(result => res.send(result))
  .catch(err => res.status(400).send(err))
})

app.delete('/posts/:id', (req, res, next) => {
  Post.remove({_id: req.params.id})
  .then(result => res.send(result))
  .catch(err => res.status(400).send(err))
})
app.use(errorHandler());

var server = require('http').createServer(app);
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
})
