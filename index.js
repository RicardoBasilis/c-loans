const dbm = require('./models/dbManager.js');
dbm.defaultTables();

//Requisitos
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const passport = require ('passport');
const LocalStrategy = require ('passport-local').Strategy;
const MySQLStore = require('express-mysql-session')(session);
const options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'adminsql',
    database: 'cprestamos'
};

let bcrypt = require('bcrypt');

// Handlebars
app.engine('hbs',hbs({extname:'hbs', layoutDir:__dirname + '/views/'}));
app.set('views', path.join(__dirname,'views'));
app.set('view engine','hbs');

//Busquedas en directorio
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/fonts', express.static(__dirname + '/fonts'));
app.use('/images', express.static(__dirname + '/images'));

//Parseadores
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json({limit: '1mb'}));
app.use(expressValidator());
app.use(cookieParser());

const sessionStore = new MySQLStore(options);
app.use(session({
    secret: 'plotjdnkohsxqmzp',
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    maxAge: 3600000000
    //cookie: { secure: true }
}));
app.use(passport.initialize());
app.use(passport.session());

//Login del Sitio Web VMS
app.get('/', function(request, response){
    if (request.isAuthenticated()){
        response.redirect('/home');
    }else{
        response.render('loginTemplate', {title: 'Iniciar Sesión'});
    }
});
//Login
app.post('/login',passport.authenticate('local',{
    successRedirect: '/home',
    failureRedirect: '/'
}));
//Página Principal
app.get('/home',authenticationMiddleware(),function(request, response){
    response.sendFile(__dirname+'/home.html');
});
//Logout
app.get('/logout',authenticationMiddleware(),function (request,response) {
    request.session.destroy(function (error) {
        if (error) throw error;
        response.redirect('/');
    });
});
//Active User
app.get('/user',function (request,response) {
    let object = {};

    let promise = Promise.resolve(
      dbm.models.User.find({
          where: {
              username: request.user.username
          }
      }).then(result=>{
          object.username = result.username;
          object.pfp = result.profilePicture;
          object.roleId = result.roleId;
      }).catch(error=>{
          response.status(404).send('Recurso no encontrado. '+error);
      })
    );

    promise.then(function () {
        dbm.models.Role.findById(object.roleId).then(result=>{
            object.role = result.description;
        }).then(function () {
            response.status(200).json({object:object});
        });
    }).catch(error=>{
        response.status(404).send('Recurso no encontrado. '+error);
    });
});
app.get('/error',function (request,response) {
    response.render('error')
});
app.get('/handle',function (req,res) {
    let data = {
        cuota: 8000
    };
    res.render('g',{data: data})
});

//Autenticación General
passport.use(new LocalStrategy(function(username, password, done){
    dbm.models.User.find({
        where: {
            username: username
        }
    }).then(result=>{
        if (!result.username){
            return done(null,false);
        }else{
            const hash = result.password.toString();

            bcrypt.compare(password,hash,function (error,response) {
                if (response===true){
                    return done(null, {username: result.username});
                }else{
                    return done(null, false);
                }
        });
    }}).catch(error=>{
            done(error);
    });
}));
passport.serializeUser(function(user_login, done) {
    done(null, user_login);
});
passport.deserializeUser(function(user_login, done) {
    done(null, user_login);
});
function authenticationMiddleware () {
    return (request, response, next) => {
        if (request.isAuthenticated()) return next();
        response.redirect('/');
    }
}
// function specialAuth () {
//     return (request, response, next) => {
//         let user = request.user.username;
//         dbm.sequelize.query("SELECT users_roles.user_id, users.username, users_roles.role_id, roles.description from users, " +
//             "users_roles, roles where users_roles.user_id = users.user_id and users_roles.role_id = roles.role_id and " +
//             "users.username = '" + user + "' and roles.role_id BETWEEN 0 and 1 limit 1").spread((result, metadata) => {
//             if (result.length > 0) {
//             return next();
//         }else{
//             response.status(403).send('Usted no tiene autorización para continuar, porfavor contacte al administrador.');
//         }
//     });
//     }
// }

const routes = require('./routes/routeController');
app.use('/rutas',authenticationMiddleware(),routes);

server.listen(3000);