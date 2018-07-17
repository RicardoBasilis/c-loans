const dbm = require('../models/dbManager');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const path = require('path');
let parentDir = path.join(__dirname+'../../');

exports.rpPage = function (request,response) {
    response.sendFile(parentDir+'/rolesPrivileges.html');
};
exports.rpList = function (request,response) {
    let data = [], columns = [["Id"],["Descripción"],["Creado por"],["Fecha de Creación"],["Modificado por"],["Fecha de Modificación"],["Modificar"],["Eliminar"]];
    dbm.models.Role.findAll({
        where: {
            roleId: {
                [Op.ne]: 1
            }
        }
    }).then(results=>{
        results.forEach(function (row) {
            let roleData = [];
            roleData.push(row.roleId,row.description,row.createdBy,dateFormat(row.creationDate.split(' ')[0]),row.modifiedBy,dateFormat(row.modificationDate.split(' ')[0]));
            data.push(roleData);
        })
    }).then(function () {
        response.status(200).json({columns: columns, data: data})
    }).catch(error=>{
        response.status(500).send('Recurso no encontrado. '+error);
    })
};
exports.newRole = function (request,response) {
    let date = new Date(), roleObj = {};
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
    let privilegeArray = request.body['permiso[]'];

    let promise = Promise.resolve(
        dbm.models.Role.findOrCreate({
            where: {
                description: request.body.roleName
            },
            defaults:{
                description: request.body.roleName,
                createdBy: request.user.username,
                creationDate: dateTime,
                modifiedBy: request.user.username,
                modificationDate: dateTime
            }
        }).spread((role,created)=>{
            roleObj.roleId = role.roleId;
            roleObj.created = created;
        })
    );

    promise.then(function () {
        if (typeof privilegeArray !== 'undefined'){
            if (privilegeArray.length===1){
                dbm.models.RolePrivilege.create({
                    roleId: roleObj.roleId,
                    privilegeId: parseInt(privilegeArray),
                    createdBy: request.user.username,
                    creationDate: dateTime,
                    modifiedBy: request.user.username,
                    modificationDate: dateTime
                });
            }else if(privilegeArray.length>1){
                privilegeArray.forEach(function (privilege) {
                    dbm.models.RolePrivilege.create({
                        roleId: roleObj.roleId,
                        privilegeId: parseInt(privilege),
                        createdBy: request.user.username,
                        creationDate: dateTime,
                        modifiedBy: request.user.username,
                        modificationDate: dateTime
                    });
                });
            }
        }
    }).then(function () {
        if (roleObj.created===false){
            response.status(409).send('El nombre del Rol debe ser único.')
        }else{
            response.redirect('/rutas/roles');
        }
    });

    promise.catch(error=>{
       response.status(500).send(error);
    });
};
exports.roleToUpdate = function (request,response) {
    let roleName = null, privileges = [];
    dbm.models.RolePrivilege.findAll({
        include: [{
            model: dbm.models.Role,
            attributes: ['roleId','description'],
            where: {
                roleId: request.params.roleId
            }
        }],
        attributes: ['privilegeId']
    }).then(results=>{
        results.forEach(function (row) {
            roleName = row.role.description;
            privileges.push(row.privilegeId);
        });
        response.status(200).json({roleName:roleName, data:privileges});
    }).catch(error=>{
        response.status(500).send(error);
    })
};
exports.roleDetails = function (request,response) {

};
exports.updateRole = function (request,response) {
    let date = new Date(), oldRole = {};
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
    let privilegeArray = request.body['permiso[]'];

    let promise = Promise.resolve(
        dbm.models.RolePrivilege.find({
            where: {
                roleId: request.params.roleId
            }
        }).then(result=>{
            if (result===null){
                oldRole.createdBy = request.user.username;
                oldRole.creationDate = dateTime;
            }else{
                oldRole.createdBy = result.createdBy;
                oldRole.creationDate = result.creationDate;
            }
        })
    );

    let promise2 = Promise.resolve(
        dbm.models.Role.update({
            description: request.body.roleName,
            modifiedBy: request.user.username,
            modificationDate: dateTime
        },{
            where:{
                roleId: request.params.roleId
            }
        })
    );

    let promise3 = Promise.resolve(
        dbm.models.RolePrivilege.destroy({
            where: {
                roleId: request.params.roleId
            }
        })
    );

    Promise.all([promise,promise2,promise3]).then(function () {
        if (typeof privilegeArray !== 'undefined'){
            if (privilegeArray.length===1){
                dbm.models.RolePrivilege.create({
                    roleId: request.params.roleId,
                    privilegeId: parseInt(privilegeArray),
                    createdBy: oldRole.createdBy,
                    creationDate: oldRole.creationDate,
                    modifiedBy: request.user.username,
                    modificationDate: dateTime
                });
            }else if(privilegeArray.length>1){
                privilegeArray.forEach(function (privilege) {
                    dbm.models.RolePrivilege.create({
                        roleId: request.params.roleId,
                        privilegeId: parseInt(privilege),
                        createdBy: oldRole.createdBy,
                        creationDate: oldRole.creationDate,
                        modifiedBy: request.user.username,
                        modificationDate: dateTime
                    });
                });
            }else{

            }
        }
    }).then(function () {
        response.redirect('/rutas/roles');
    }).catch(error=>{
        response.status(500).send(error);
    });
};
exports.deleteRole = function (request,response) {
    dbm.models.Role.destroy({
        where: {
            roleId: request.params.roleId
        }
    }).then(function () {
        response.status(200).send('Rol eliminado.');
    }).catch(error=>{
        response.status(500).send('El recurso no fue eliminado. '+error);
    });
};

function dateFormat(fecha){
    let date = new Date(fecha);
    return ('0'+date.getDate()).slice(-2)+'-'+('0'+(date.getMonth()+1)).slice(-2)+'-'+date.getFullYear();
}