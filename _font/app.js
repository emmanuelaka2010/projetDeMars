// Modules
require('babel-register')

const bodyParser = require('body-parser')
const express = require('express')
const morgan = require('morgan')('dev')
const mysql = require('promise-mysql')
const expressValidator = require('express-validator')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session);
const config = require('../assets/config')
const twig = require('twig')
const axios = require('axios')
const bcrypt = require('bcrypt')

//Les variables globales

const app = express()
const port = 8081
const fetch = axios.create({
    baseURL: 'http://localhost:3000/api/v1/'
  });

// middlewares

app.use(morgan)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(express.static('public'));
var options  = {
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
};
var sessionStore = new MySQLStore(options);
app.use(session({
    secret: 'oiugiydtxfcykt',
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    // cookie: { secure: true }
  }));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
})

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done) {
        console.log(email);
        console.log(password)
        // Connexion
        mysql.createConnection({
            host: config.db.host,
            database: config.db.database,
            user: config.db.user,
            password: config.db.password,
        }).then((db) => {
            db.query('SELECT password FROM users WHERE email = ?',[email],(err, results, fields)=>{
                if(err) {done(err)};
                if([results].lenght == 0) {
                    done(null, false);
                }
                const hash = results[0].password.toString();
                if(hash == password) {
                    console.log('yes')
                    
                        return done(null, {user_id: results[0].id});
                        console.log(user_id);
                    } else {
                        console.log('no')
                        return done(null, false)
                }
            })    
        })
    }
  ));

// Routes
    // page d'acceuil
app.get('/', (req, res)=>{
    console.log(req.user);
    console.log(req.isAuthenticated())
    res.redirect('/index')
    })

    app.get('/logout', (req, res)=>{
        req.logout();
        req.session.destroy();
        res.redirect('/index')
    }); 

    // page d'accueil
    app.get('/index', (req, res)=>{
        res.render('index.twig'), {
            title: 'Bienvenue !'
        }
    });
    // page d'inscription
app.get('/inscription', (req, res)=>{
    res.render('inscription.twig'), {
        title: 'inscription'
    }
});
    // page de profil

    app.get('/profile', authentificationMiddileware(), (req, res, next)=> {
        res.render('profile.twig'), {
            title: 'Profil'
        }
    })
   // page de connexion
   app.get('/login', (req, res)=>{
    res.render('login.twig'), {
        title: 'Connectez-vous'
    }
});
app.post('/login', (req, res, next)=> {
    passport.authenticate('local', { 
        successRedirect: '/index',
         failureRedirect: '/login'
        })(req, res, next);
});
    // envoi des données du formulaire à la base de données
    // inscription
app.post('/register', (req, res)=>{

        const lastName = req.body.lastName
        const firstName = req.body.firstName
        const email = req.body.email
        const numero = req.body.numero
        const password = req.body.password
mysql.createConnection({
    host: config.db.host,
    database: config.db.database,
    user: config.db.user,
    password: config.db.password,
}).then((db) => {
    db.query('INSERT INTO users(lastName, firstName, email, numero, password) VALUES (?,?,?,?,?)',[lastName, firstName, email, numero, password], (error, result)=>{
        if(error) throw error;
        db.query('SELECT LAST_INSERT_ID() as user_id', (error, results, fields)=>{
            if(error) throw error;

            const user_id = results[0];
            console.log(user_id);
            req.login(user_id, (err)=> {
                res.redirect('/index')
            })
        });
    })
    console.log('Connected.')
})
    
});
    // Envoi la date et l'heure de la reservation dans la base de donnée
app.post('/reservation', (req, res)=>{
   
    const date = req.body.date
    const time = req.body.time
    
console.log(req.body.date);
console.log(req.body.time);
mysql.createConnection({
host: config.db.host,
database: config.db.database,
user: config.db.user,
password: config.db.password,
}).then((db) => {
db.query('INSERT INTO reservation(resLe, date, time) VALUES (NOW(),?,?)',[date, time], (error, result)=>{
    if(error) throw error;

            res.redirect('/index')
        })
    });
});
// modification du mot de passe
app.post('/modification', (req, res)=>{

const password = req.body.password
    
console.log(req.body.password);
mysql.createConnection({
host: config.db.host,
database: config.db.database,
user: config.db.user,
password: config.db.password,
}).then((db) => {
db.query('UPDATE `users` SET password = ? WHERE id= ?',[password], (error, result)=>{
    if(error) throw error;

            res.redirect('/index')
        })
})
});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
});
 

app.listen(port, ()=> console.log('started on port ' + port))

// fonctions

function authentificationMiddileware() {
    return (req, res, next)=> {
        console.log('req.session.passport.users: ${JSON.stringify(req.session.passport)}');
        if(req.isAuthenticated()) return next();
        res.redirect('/login')
    }
}