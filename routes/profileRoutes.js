const dbm = require('../models/dbManager');
const fs = require('fs');

//Encriptar la contraseña
const saltRounds = 10;
let bcrypt = require('bcrypt');
let hashIt = function(password){
    return new Promise(function (resolve,reject){
        bcrypt.hash(password,saltRounds,function(error,hash){
            if (!error){
                resolve(hash);
            }else {
                reject(error);
            }
        });
    });
};

exports.profile = function (request,response) {
    let profile = {}, data = {};
    profile.title = 'Mi Usuario';
    profile.action = 'ACTUALIZAR';

    dbm.models.User.find({
        where: {
            username: request.user.username
        }
    }).then(result=>{
       data.userId = result.userId;
       data.username = result.username;
       data.firstName = result.firstName;
       data.secondName = result.secondName;
       data.lastName = result.lastName;
       data.surName = result.surName;
       data.email = result.email;
       data.phoneNumber = result.phoneNumber;
       response.render('profileTemplate',{profile:profile, data:data});
    });
};
exports.updateDetails = function (request,response) {
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    if (request.file){
        dbm.models.User.update({
            username: request.body.username,
            firstName: request.body.firstName,
            secondName: checkValue(request.body.secondName),
            lastName: request.body.lastName,
            surName: request.body.surName,
            email: checkValue(request.body.email),
            phoneNumber: request.body.phoneNumber,
            profilePicture: profilePicture(request.file),
            modifiedBy: request.user.username,
            modificationDate: dateTime
        },{
            where: {
                userId: request.params.userId
            }
        }).then(function () {
            let profile = {}, data = {};
            profile.title = 'Mi Usuario';
            profile.action = 'ACTUALIZAR';

            dbm.models.User.findById(request.params.userId).then(result=>{
                data.userId = result.userId;
                data.username = result.username;
                data.firstName = result.firstName;
                data.secondName = result.secondName;
                data.lastName = result.lastName;
                data.surName = result.surName;
                data.email = result.email;
                data.phoneNumber = result.phoneNumber;
                response.redirect('/rutas/usuarios');
            });
        }).catch(error=>{
            console.log(error);
        });
    }else{
        dbm.models.User.update({
            username: request.body.username,
            firstName: request.body.firstName,
            secondName: request.body.secondName,
            lastName: request.body.lastName,
            surName: request.body.surName,
            email: request.body.email,
            phoneNumber: request.body.phoneNumber,
            modifiedBy: request.user.username,
            modificationDate: dateTime
        },{
            where: {
                userId: request.params.userId
            }
        }).then(function () {
            let profile = {}, data = {};
            profile.title = 'Mi Usuario';
            profile.action = 'ACTUALIZAR';

            dbm.models.User.findById(request.params.userId).then(result=>{
                data.userId = result.userId;
                data.username = result.username;
                data.firstName = result.firstName;
                data.secondName = result.secondName;
                data.lastName = result.lastName;
                data.surName = result.surName;
                data.email = result.email;
                data.phoneNumber = result.phoneNumber;
                response.redirect('/rutas/usuarios');
            });
        }).catch(error=>{
            console.log(error);
        });
    }

};
exports.updatePassword = function (request,res) {
    let date = new Date(), oldpass = null;
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    dbm.models.User.find({
        attributes: ['password'],
        where: {
            userId: request.params.userId
        }
    }).then(result=>{
       oldpass = result.password.toString();
       bcrypt.compare(request.body.oldPass,oldpass,function (error,response) {
          if (response===true){
              if (request.body.newPass===request.body.reNewPass){
                  hashIt(request.body.newPass).then(function (hashed) {
                      dbm.models.User.update({
                          password: hashed,
                          modifiedBy: request.user.username,
                          modificationDate: dateTime
                      },{
                          where: {
                              userId: request.params.userId
                          }
                      }).then(function () {
                          res.redirect('/rutas/usuarios');
                      });
                  });
              }else{
                  res.status(403).send('La nueva contraseña no coincide.');
              }
          }else{
              res.status(403).send('La contraseña antigua no es correcta.');
          }
       });
    });
};

function checkValue(value) {
    if (value!=='undefined' && value!==null){
        return value.toString();
    }
    return null;
}
function profilePicture(request) {
    let pictureName = null;
    if (request){
        pictureName = request.originalname;
    }else{
        pictureName = 'profile128.png';
    }
    return pictureName.toString();
}