const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const helmet = require('helmet');
const KnexSessionStore = require('connect-session-knex')(session);

const Users = require('./users/users-model.js');
const restricted = require('./auth/restricted-middleware.js');
const knexConnection = require('./data/db-config.js');

const server = express();

const sessionConfig = {
  name: 'starFox',
  secret: process.env.COOKIE_SECRET || 'I cant let you see that, starFox',
  cookie: {
    maxAge: 1000 * 60,
    secure: process.env.COOKIE_SECURE || false, //make this true in production
    httpOnly: true,
  },
  resave: false,
  saveUninitialized: false, //illegal to automatically set cookies
  store: new KnexSessionStore({
    knex: knexConnection,
    createtable: true,
    clearInterval: 1000 * 60 * 60,
  }),
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.get('/', (req, res) => {
  res.send("We have lift off");
});

server.post('/api/register', (req, res) => {
  let user = req.body;

  const hash = bcrypt.hashSync(user.password);
  user.password = hash;

  Users.add(user)
    .then(user => {
      res.status(201).json(user);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password }= req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        req.session.loggedIn = true;
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'You shall not PASS!!!' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.get('/api/users', restricted, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.status(200).json({ adios: 'muchacho' });
  });
});

module.exports = server;