const sqlite3 = require('sqlite3').verbose();
const FBJS_URL = 'https://formbar.yorktechapps.com';
const THIS_URL = 'http://localhost:3000/';
const jwt = require('jsonwebtoken');

const db = new sqlite3.Database('./data/database.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the database.');
});

function index(req, res) {
  res.render('index', { user: req.session.user });
}
function chat(req, res, next) {
  isAuthenticated(req, res, () => {
    res.render('chat', { user: req.session.user });
  });
}

function login(req, res) {
  res.render('login');
}

function loginFormbar(req, res) {
  console.log(req.query.token)
  if (req.query.token) {
    let tokenData = jwt.decode(req.query.token)
    req.session.token = tokenData
    req.session.user = tokenData.username
    res.redirect('/')
  } else {
    res.redirect(`${FBJS_URL}/oauth?redirectURL=${THIS_URL}`)
  }
}

function postLogin(req, res) {
  const crypto = require('crypto');
  if (req.body.user && req.body.pass) { //If there's a username and password
    const { username } = req.body.user
    db.get('SELECT * FROM users WHERE username=?;', req.body.user, (err, row) => {
      if (err) {
        console.error(err);
        res.send("There wan an error:\n" + err)
      } else if (!row) {
        //create new salt for this user
        const salt = crypto.randomBytes(16).toString('hex')

        //use salt to "hash" password
        crypto.pbkdf2(req.body.pass, salt, 1000, 64, 'sha512', (err, derivedKey) => {
          if (err) {
            res.setDefaultEncoding("Error hashing password: " + err)
          } else {
            const hashedPassword = derivedKey.toString('hex')
            db.run('INSERT INTO users (username, password, salt) VALUES (?, ?, ?);', [req.body.user, hashedPassword, salt], (err) => {
              if (err) {
                res.send("Database errpr:\n" + err)
              } else {
                res.redirect('/chat')

              }
            })
          }
        })

      } else {
        //Compare stored password with provided password
        crypto.pbkdf2(req.body.pass, row.salt, 1000, 64, 'sha512', (err, derivedKey) => {
          if (err) {
            res.send("Error hashing password: " + err)
          } else {
            const hashedPassword = derivedKey.toString('hex')

            if (row.password === hashedPassword) {
              req.session.user = req.body.user
              res.redirect("/chat")
            } else {
              res.send("Incorrect Password")
            }
          }
        })
      }

    })
  } else {
    res.send("You need a username and password");
  }
}

function logout(req, res) {
  res.render('logout');
}


function isAuthenticated(req, res, next) {
  if (req.session.user) next() 
  else res.redirect('/login')   
}
module.exports = {
  index,
  chat,
  login,
  loginFormbar,
  postLogin,
  logout,
  isAuthenticated
}

