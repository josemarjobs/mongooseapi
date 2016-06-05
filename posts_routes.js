
module.exports = function (app, Post) {

  app.get('/posts', (req, res, next) => {
    Post.staticMethod().then( s => res.send(s))
    // Post.find({}, {}, {limit: 100, sort: {_id: -1}})
    // .then(posts => res.json(posts))
    // .catch(next)
  })

  app.get('/posts/:id', (req, res, next) => {
    Post.findById(req.params.id).populate('author').exec()
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
}
