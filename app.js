const customStuff = require('./custom.js');
const express = require('express');
const socketIo = require('socket.io');
const app = express(); app.set('view engine', 'ejs');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const routes = require('./modules/routes');
const socket = require('./modules/socket');
const PORT = 3000;
const server = app.listen(PORT, () => {});
const io  = socketIo(server);

const sessionMiddleware = session({
    store: new SQLiteStore(),
    secret: 'your secret key',
    resave: false,
    saveUninitialized: true,
    cookie: {secure:false} 
});

app.use(sessionMiddleware);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', routes.index);
app.get('/chat', routes.chat);
app.get('/login', routes.login);

exports.index = (req, res) => {
    res.render('index', { title: 'Home' });
};

io.use((socket, next) => { sessionMiddleware(socket.request, {}, next); });
io.on('connection', socket.socketHandler);





