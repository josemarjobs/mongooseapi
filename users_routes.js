module.exports = function (app, User) {
  app.post('/users', (req, res) => {
    var user = new User(req.body)
    user.save()
    .then(result => res.status(201).send(result))
    .catch(error => res.status(400).send(error))
  })

  app.get('/users', (req, res) => {
    User.find({})
    .then(users => res.send(users))
    .catch(error => res.status(400).send(error))
  })
}
