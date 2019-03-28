require('babel-register')
const mysql = require('promise-mysql')
const bodyParser = require('body-parser')
const express = require('express')
const expressvalidator = require('express-validator')
const morgan = require('morgan')('dev')
const cookieParser = require('cookie-parser');
const config = require('./assets/config')
const path = require('path')

mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password
}).then((db) => {

    console.log('Connected.')

    const app = express()

    let MembersRouter = express.Router()
    let Members = require('./assets/classes/users-class')(db, config)
    console.log(__dirname);
    // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');
    // app.use(express.static(path.join(__dirname, 'public')));
    app.use(morgan)
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use('/static', express.static(path.join(__dirname, 'public')));

    app.use(config.rootAPI+'members', MembersRouter)

    app.listen(config.port, () => console.log('Started on port '+config.port))

}).catch((err) => {
    console.log('Error during database connection')
    console.log(err.message)
})