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

var enumRoles = ['user', 'admin', 'staff']
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
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  followers: [Schema.Types.ObjectId],
  meta: Schema.Types.Mixed,
  comments: [{
    text: {type: String, trim: true, max: 1000},
    author: {
      id: {type: Schema.Types.ObjectId, ref: 'User'},
      name: String,
      role: {
        type: String,
        enum: enumRoles
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
  createdAt: {
    type: Date,
    default: Date.now(),
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
    required: true
  },
  photo: Buffer
})

postSchema.virtual('hasComments').get(function() {
  return this.comments.length > 0
})

postSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next();
})

postSchema.pre('validate', function(next) {
  var error = null;
  if(this.isModified('comments') && this.comments.length > 0) {
    this.comments.forEach(function(value, key, list) {
      if (!value.text || !value.author.id) {
        error = new Error("Text and author for a comment must be set.")
      }
    })
  }
  if (error) return next(error)
  next()
})

postSchema.statics.staticMethod = function(callback) {
  console.log("Static method executed");
  if (callback) {
    return callback('Static Method callback')
  }
  return new Promise((resolve, reject) => {
    resolve('Static Method Resolved')
  })
}
postSchema.methods.instanceMethod = function(callback) {
  console.log("Instance Method executed");
  if (callback) {
    return callback('Instance method CALLBACK')
  }
  return new Promise((resolve, reject) => {
    resolve('Instance method RESOLVE')
  })
}
var userSchema = new Schema({
  name: {type: String, required: true},
  role: {type: String, enum: enumRoles}
})

var Post = dbConnection.model('Post', postSchema, 'posts');
var User = dbConnection.model('User', userSchema, 'users');


app.get('/', (req, res) => {
  res.send('ok')
})

require('./posts_routes')(app, Post)
require('./users_routes')(app, User)

app.use(errorHandler());

var server = require('http').createServer(app);
server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
})
