// import the modules
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express(); app.set('view engine', 'ejs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3');
const port = 3000;

// create a session middleware
const sessionMiddleware = session({
    sttore: new SQLiteStore,
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // sets to true if using  https
})

// use the session middleware
app.use(sessionMiddleware)
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next()
    } else {
        res.redirect('/login')
    };
}

app.get('/', isAuthenticated, (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login')
});

app.post('/login', (req, res) => {
    if (req.body.username) {
        req.session.user = req.body.username;
        res.redirect('/')
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login')
})

app.get('/chat', isAuthenticated, (req, res) => {
    res.render('chat')
});

app.get('/routes', (req, res) => {
    res.render('/routes')
});

app.get('/socket', (req, res) => {
    res.render('/routes')
});
// decrease hunger level by 3 every 2 seconds
let hungerLevel = 100;
const hungerDecrementAmount = 3;
const hungerDecrementInterval = 2000;

app.use(express.static('public'));

app.get('/hunger', (req, res) => {
    res.json({ hunger: hungerLevel });
});

app.post('/feed', (req, res) => {
    hungerLevel = 100;
    res.json({ hunger: hungerLevel });
});

setInterval(() => {
    if (hungerLevel > 0) {
        hungerLevel -= hungerDecrementAmount;
    }
}, hungerDecrementInterval);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log('listening at http://localhost:3000');
});