const dbm = require('../models/dbManager');
const path = require('path');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
// const fs = require('fs');
let parentDir = path.join(__dirname+'../../');

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

exports.userPage = function (request,response) {
  response.sendFile(parentDir+'/users.html');
};
exports.userList = function (request,response){
  let data = [], columns = [["Id"],[''],["Usuario"],["Correo Electrónico"],["Primer Nombre"],["Segundo Nombre"],["Primer Apellido"],["Segundo Apellido"],["Télefono"],["Imagen de Perfil"],["Id Rol"],["Creado por"],["Fecha de Creación"],["Modificado por"],["Fecha de Modificación"],["Más Detalles"],["Modificar"],["Eliminar"]];
  dbm.models.User.findAll({
      where: {
          userId: {
              [Op.ne]: 1
          }
      }
  }).then(results=>{
    results.forEach(function (row) {
        let userData = [];
        let phoneNumber = '('+row.phoneNumber.substr(0,3)+') '+row.phoneNumber.substr(3,3)+'-'+row.phoneNumber.substr(6);
        userData.push(row.userId,'',row.username,row.email,row.firstName,row.secondName,row.lastName,row.surName,phoneNumber,
            row.profilePicture,row.roleId,row.createdBy,row.creationDate,row.modifiedBy,row.modificationDate);
        data.push(userData);
    })
  }).then(function () {
      response.status(200).json({columns: columns, data: data})
  }).catch(error=>{
      response.status(404).send('Recurso no encontrado.' +error);
  })
};
exports.userTemplate = function (request,response) {
  let user = {};
  user.title = 'Nuevo Usuario';
  user.pfp = '/images/profile256.png';
  user.action = 'CREAR';
  user.form = '/rutas/usuarios';
  response.render('userTemplate',{user:user});
};
exports.userDetails = function (request,response) {
    let user = {};
    dbm.models.User.find({
        include: [{
            model: dbm.models.Role,
            attributes: ['description']
        }],
        where: {
            userId: request.params.userId
        }
    }).then(result=>{
        let array = result.creationDate.split(' '), array2 = result.modificationDate.split(' ');
        user = result;
        user.fullName = result.firstName+' '+result.secondName+' '+result.lastName+' '+result.surName;
        user.pfp = '/images/'+result.profilePicture;
        user.phoneNumber = '('+result.phoneNumber.substr(0,3)+') '+result.phoneNumber.substr(3,3)+'-'+result.phoneNumber.substr(6);
        user.role = result.role.description;
        user.creationDate = reFormat(array[0])+' '+array[1];
        user.modificationDate = reFormat(array2[0])+' '+array2[1];
        response.render('userDetails',{user:user});
    }).catch(error=>{
        response.status(500).send(error);
    });
};
exports.userToUpdate = function (request,response) {
    let userObj = {}, user = {};

    dbm.models.User.findById(request.params.userId).then(result=>{
        userObj.userId = result.userId;
        userObj.username = result.username;
        userObj.email = checkValue(result.email);
        userObj.firstName = result.firstName;
        userObj.secondName = checkValue(result.secondName);
        userObj.lastName = result.lastName;
        userObj.surName = result.surName;
        userObj.phoneNumber = result.phoneNumber;
        user.pfp = checkValue(result.profilePicture);
        userObj.roleId = checkValue(result.roleId);
        user.title = result.firstName+' '+result.lastName;
        user.pfp = '/images/'+checkValue(result.profilePicture);
        user.action = 'ACTUALIZAR';
        user.form = '/rutas/usuarios/actualizarUsuario/'+result.userId;
        user.block = 'readonly';
    }).then(function () {
        response.render('userTemplate',{userObj:userObj, user:user})
    }).catch(error=>{
        response.status(500).send(error);
    })
};
exports.newUser = function (request,response) {
    let date = new Date(), userObj = {};
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    hashIt(request.body.password).then(function (hashed) {
        dbm.models.User.findOrCreate({
            where: {
                username: request.body.username
            },
            defaults: {
                username: request.body.username,
                password: hashed,
                email: checkValue(request.body.email),
                firstName: request.body.firstName,
                secondName: checkValue(request.body.secondName),
                lastName: request.body.lastName,
                surName: request.body.surName,
                phoneNumber: request.body.phoneNumber,
                profilePicture: currentPicture(request.file),
                roleId: role(request.body.userRole),
                createdBy: request.user.username,
                creationDate: dateTime,
                modifiedBy: request.user.username,
                modificationDate: dateTime
            }
        }).spread((user,created)=>{
            userObj.username = user.username;
            userObj.created = created;
        }).then(function () {
            if (userObj.created===false){
                response.status(409).send('El usuario '+userObj.username+' ya existe.');
            }else{
                response.redirect('/rutas/usuarios');
            }
        }).catch(error=>{
            response.status(500).send(error);
        })
    });
};
exports.updateUser = function (request,response) {
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    if (request.body.password!==''){
        hashIt(request.body.password).then(function (hashed) {
            dbm.models.User.update({
                password: hashed,
                email: checkValue(request.body.email),
                firstName: request.body.firstName,
                secondName: checkValue(request.body.secondName),
                lastName: request.body.lastName,
                surName: request.body.surName,
                phoneNumber: request.body.phoneNumber,
                profilePicture: profilePicture(request.file,request.body),
                roleId: role(request.body.userRole),
                modifiedBy: request.user.username,
                modificationDate: dateTime
            },{
                where: {
                    userId: request.params.userId
                }
            }).then(function () {
                response.redirect('/rutas/usuarios');
            }).catch(error=>{
                response.status(500).send(error);
            })
        });
    }else{
        dbm.models.User.update({
            email: checkValue(request.body.email),
            firstName: request.body.firstName,
            secondName: checkValue(request.body.secondName),
            lastName: request.body.lastName,
            surName: request.body.surName,
            phoneNumber: request.body.phoneNumber,
            profilePicture: profilePicture(request.file,request.body),
            roleId: role(request.body.userRole),
            modifiedBy: request.user.username,
            modificationDate: dateTime
        },{
            where: {
                userId: request.params.userId
            }
        }).then(function () {
            response.sendFile(parentDir+'/users.html');
        }).catch(error=>{
            response.status(500).send(error);
        })
    }
};
exports.deleteUser = function (request,response) {
    dbm.models.User.destroy({
        where: {
            userId: request.params.userId
        }
    }).then(function () {
        response.status(200).send('Usuario eliminado.');
    }).catch(error=>{
        response.status(500).send('El recurso no fue eliminado. '+error);
    })
};

function currentPicture(value) {
    if (value){
        return value.originalname.toString();
    }
    return 'profile256.png';
}
function checkValue(value) {
    if (value!=='undefined' && value!==null){
        return value.toString();
    }
    return null;
}
function profilePicture(requestf,requestb) {
    let pictureName = null;
    if (requestf){
        pictureName = requestf.originalname;
        return pictureName;
    }else{
        dbm.models.User.findById(requestb.userId).then(result=>{
            pictureName = result.profilePicture;
            return pictureName;
        })
    }
}
function role(request){
    let roleId = null;
    if (request==='Desconocido'){
        return null;
    }else{
        roleId = parseInt(request.split(' ')[0]);
        return roleId;
    }
}
function reFormat(date) {
    let next = date.split('-');
    next = ('0'+next[2]).slice(-2)+'-'+('0'+next[1]).slice(-2)+'-'+next[0];
    return next;
}
// function deleteOldPicture(userId) {
//     dbm.models.User.findById(userId).then(result=>{
//         fs.unlinkSync('./images/'+result.profilePicture)
//     }).catch(error=>{
//         throw error;
//     })
// };