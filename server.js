// server.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const Sequelize = require('sequelize');
const path = require('path');
const morgan = require('morgan');

const app = express();
const port = 3000;

app.use(morgan('combined'));

// Configuración de Sequelize y SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:'
});

// Definición del modelo de Usuario
const User = sequelize.define('user', {
    username: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

// Definición del modelo de Mensaje
const Message = sequelize.define('message', {
    content: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

// Definición de las asociaciones
User.hasMany(Message, { foreignKey: 'userId' });
Message.belongsTo(User, { foreignKey: 'userId' });

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.get('/', async (req, res) => {
    if (req.session.user) {
        const messages = await Message.findAll({ include: User });
        let messageList = messages.map(msg => `<p><strong>${msg.user.username}:</strong> ${msg.content}</p>`).join('');
        res.send(`
            <h1>Hola, ${req.session.user.username}</h1>
            <form action="/message" method="post">
                <textarea name="content" placeholder="Escribe tu mensaje" required></textarea>
                <button type="submit">Enviar</button>
            </form>
            <form action="/logout" method="post">
                <button type="submit">Cerrar sesión</button>
            </form>
            <h2>Mensajes:</h2>
            ${messageList}
        `);
    } else {
        res.send('Por favor, inicia sesión o regístrate.');
    }
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        await User.create({ username, password });
        res.redirect('/login');
    } catch (error) {
        res.send('Error al registrar usuario.');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username, password } });
    if (user) {
        req.session.user = user;
        res.redirect('/');
    } else {
        res.send('Usuario o contraseña incorrectos.');
    }
});

app.post('/message', async (req, res) => {
    if (req.session.user) {
        const { content } = req.body;
        await Message.create({ content, userId: req.session.user.id });
        res.redirect('/');
    } else {
        res.send('Por favor, inicia sesión.');
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error al cerrar sesión.');
        }
        res.redirect('/');
    });
});

// Sincronización de la base de datos y arranque del servidor
sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Servidor escuchando en http://localhost:${port}`);
    });
});

//getgetgotgotloot@!