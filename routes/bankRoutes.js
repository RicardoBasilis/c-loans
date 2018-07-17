const dbm = require('../models/dbManager');
const path = require('path');
let parentDir = path.join(__dirname+'../../');

exports.bankPage = function(request,response){
    response.sendFile(parentDir+'/bancos.html');
};
exports.bankList = function(request,response){
    let data = [], columns = [["Id"],[''],["Banco"],["Creado por"],["Fecha de Creación"],["Modificado por"],["Fecha de Modificación"],['Modificar'],['Eliminar']];
    dbm.models.Bank.findAll().then(results=>{
        results.forEach(function (row) {
            let bankData = [];
            bankData.push(row.bankId,'',row.bankName,row.createdBy,dateFormat(row.creationDate.split(' ')[0]),row.modifiedBy,dateFormat(row.modificationDate.split(' ')[0]));
            data.push(bankData);
        });
        response.status(200).json({columns: columns, data: data})
    }).catch(error=>{
        response.status(500).send('Recurso no encontrado. '+error);
    })
};
exports.newBank = function(request,response){
    let date = new Date(), bankObj = {};
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    dbm.models.Bank.findOrCreate({
        where: {
            bankName: request.body.bankName
        },
        defaults: {
            bankName: request.body.bankName,
            createdBy: request.user.username,
            creationDate: dateTime,
            modifiedBy: request.user.username,
            modificationDate: dateTime
        }
    }).spread((bank,created)=>{
        bankObj.bankId = bank.bankId;
        bankObj.created = created;
    }).then(function () {
        response.redirect('/rutas/bancos');
    }).catch(error=>{
        response.status(500).send(error);
    })
};
exports.updateBank = function(request,response){
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    dbm.models.Bank.update({
        bankName: request.body.bankName,
        modifiedBy: request.user.username,
        modificationDate: dateTime
    },{
        where: {
            bankId: request.params.bankId
        }
    }).then(function () {
        response.redirect('/rutas/bancos');
    }).catch(error=>{
        response.status(500).send(error);
    })
};
exports.deleteBank = function(request,response){
    dbm.models.Bank.destroy({
        where: {
            bankId: request.params.bankId
        }
    }).then(function () {
        response.status(200).send('Banco eliminado.');
    }).catch(error=>{
        response.status(500).send('El recurso no fue eliminado. '+error);
    });
};

function dateFormat(fecha){
    let date = new Date(fecha);
    return ('0'+date.getDate()).slice(-2)+'-'+('0'+(date.getMonth()+1)).slice(-2)+'-'+date.getFullYear();
}
// return ('0'+date.getDate()).slice(-2)+'-'+('0'+(date.getMonth()+1)).slice(-2)+'-'+date.getFullYear()+' '
//     +('0'+date.getHours()).slice(-2)+':'+('0'+date.getMinutes()).slice(-2);