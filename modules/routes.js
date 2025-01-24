const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data/mydatabase.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the database.');
});

function index(req, res) {
  res.render('index', { petName : "Beyonce" });
}

function login(req, res) {
  res.render('login');
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
                res.redirect('/index')
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
              res.redirect("/index")
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
  req.session.destroy();
    res.redirect('/')
}

function changes(req,res) {
  res.render('changes')
} 

function isAuthenticated(req, res, next) {
  if (req.session.user) next() 
  else res.redirect('/login')   
}
module.exports = {
  index,
  login,
  postLogin,
  logout,
  isAuthenticated,
  changes,
}

