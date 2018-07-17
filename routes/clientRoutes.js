const dbm = require('../models/dbManager');
const path = require('path');
// const fs = require('fs');
let parentDir = path.join(__dirname+'../../');

exports.clientPage = function (request,response) {
    response.sendFile(parentDir+'/clients.html');
};
exports.clientList = function (request,response){
    let data = [], columns = [["Id Cliente"],["Imagen de Perfil"],["Nombres"],["Apellidos"],["Sexo"],["Cédula"],["Fecha Nacimiento"],["Celular"],["Télefono"],
        ["Nacionalidad"],["Vivienda"],["Dirección"],["Estado Civil"],["Estado Laboral"],["Creado por"],["Fecha de Creación"],["Modificado por"],
        ["Fecha de Modificación"],["Préstamos"],["Más Detalles"],["Modificar"],["Eliminar"]];

    dbm.models.Client.findAll().then(results=>{
        results.forEach(function (row) {
            let clientData = [];
            let phoneNumber = ['(' + row.cellPhone.substr(0, 3) + ') ' + row.cellPhone.substr(3, 3) + '-' + row.cellPhone.substr(6),
                '(' + row.phoneNumber.substr(0, 3) + ') ' + row.phoneNumber.substr(3, 3) + '-' + row.phoneNumber.substr(6)];
            clientData.push(row.clientId,row.profilePicture,row.firstNames,row.lastNames,row.sexo,row.idCard,row.birthDate,phoneNumber[0],phoneNumber[1],
                row.nacionality,row.homeKind,row.address,row.civilState,row.workState,row.createdBy,row.creationDate,row.modifiedBy,row.modificationDate);
            data.push(clientData);
        });
    }).then(function () {
        response.status(200).json({columns: columns, data: data});
    }).catch(error=>{
         response.status(404).send('Recurso no encontrado'+error);
    })
};
exports.clientTemplate = function (request,response) {
    let client = {};
    client.title = 'Nuevo Cliente';
    client.pfp = '/images/profile128.png';
    client.action = 'CREAR';
    client.form = '/rutas/clientes';
    response.render('clientTemplate',{client:client});
};
exports.clientDetails = function (request,response) {
    let client = {}, job = {}, reference = {};

    let promise = Promise.resolve(
        dbm.models.Client.findById(request.params.clientId).then(result=>{
            let array = result.creationDate.split(' '), array2 = result.modificationDate.split(' ');
            client = result;
            client.creationDate = reFormat(array[0])+' '+array[1];
            client.modificationDate = reFormat(array2[0])+' '+array2[1];
        })
    );

    let promise2 = Promise.resolve(
        dbm.models.Job.find({
            where: {
                clientId: request.params.clientId
            }
        }).then(result=>{
            job = result;
            job.workIncome = formt(result.workIncome);
        })
    );

    let promise3 = Promise.resolve(
        dbm.models.Reference.find({
            where: {
                clientId: request.params.clientId
            }
        }).then(result=>{
            reference = result;
        })
    );

    Promise.all([promise,promise2,promise3]).then(function () {
        response.render('clientDetails',{client:client,job:job,reference:reference});
    }).catch(error=>{
        response.status(500).send(error);
    });
};
exports.clientToUpdate = function (request,response) {
    let clientObj = {}, jobObj = {}, referenceObj = {}, client = {};
    client.form = '/rutas/clientes/actualizarCliente/'+request.params.clientId;
    client.action = 'ACTUALIZAR';

    let clientPromise = Promise.resolve(
        dbm.models.Client.findById(request.params.clientId).then(result=>{
            clientObj.clientId = result.clientId;
            clientObj.firstNames = result.firstNames;
            clientObj.lastNames = result.lastNames;
            clientObj.sexo = result.sexo;
            client.pfp = '/images/'+result.profilePicture;
            clientObj.idCard = checkValue(result.idCard);
            clientObj.birthDate = checkValue(result.birthDate);
            clientObj.cellPhone = checkValue(result.cellPhone);
            clientObj.phoneNumber = checkValue(result.phoneNumber);
            clientObj.nacionality = checkValue(result.nacionality);
            clientObj.homeKind = checkValue(result.homeKind);
            clientObj.address = checkValue(result.address);
            clientObj.civilState = checkValue(result.civilState);
            clientObj.workState = checkValue(result.workState);
            client.title = result.firstNames.split(' ')[0]+' '+result.lastNames.split(' ')[0];
        })
    );

    let jobPromise = Promise.resolve(
        dbm.models.Job.find({
            where: {
                clientId: request.params.clientId
            }
        }).then(result=>{
            jobObj.jobId = result.jobId;
            jobObj.workName = checkValue(result.workName);
            jobObj.workIncome = result.workIncome;
            jobObj.position = checkValue(result.position);
            jobObj.workAdress = checkValue(result.workAdress);
            jobObj.timeWorking = checkValue(result.timeWorking);
            jobObj.phoneNumber = checkValue(result.phoneNumber);
        })
    );

    let referencePromise = Promise.resolve(
        dbm.models.Reference.find({
            where: {
                clientId: request.params.clientId
            }
        }).then(result=>{
            referenceObj.referenceId = result.referenceId;
            referenceObj.reference = checkValue(result.reference);
            referenceObj.phoneNumber = checkValue(result.phoneNumber);
        })
    );

    Promise.all([clientPromise,jobPromise,referencePromise]).then(function () {
        response.render('clientTemplate',{client:client, clientObj:clientObj, jobObj: jobObj, referenceObj: referenceObj});
    }).catch(error=>{
       response.status(500).send(error);
    });
};
exports.newClient = function (request,response) {
    superFuncion(request).then(function () {
        response.redirect('/rutas/clientes');
    }).catch(error=>{
        response.status(500).send(error);
    });
};
exports.updateClient = function (request,response) {
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    let clientPromise = Promise.resolve(
        dbm.models.Client.update({
            firstNames: request.body.nombres,
            lastNames: request.body.apellidos,
            sexo: request.body.sexo,
            idCard: request.body.cedula,
            birthDate: request.body.fechaNacim,
            cellPhone: request.body.celular,
            phoneNumber: request.body.telefono,
            nacionality: request.body.nacionalidad,
            homeKind: request.body.vivienda,
            address: request.body.direccion,
            civilState: request.body.estadoCivil,
            profilePicture: profilePicture(request.file,request.body),
            workState: request.body.empleo,
            modifiedBy: request.user.username,
            modificationDate: dateTime
        },{
            where: {
                clientId: request.params.clientId
            }
        })
    );

    let jobPromise = Promise.resolve(
        dbm.models.Job.update({
            workName: request.body.nombreTrabajo,
            workIncome: request.body.trabajoIngreso,
            position: request.body.trabajoPosicion,
            workAdress: request.body.trabajoDireccion,
            timeWorking: request.body.tiempoLaborando,
            phoneNumber: request.body.trabajoTelefono,
            modifiedBy: request.user.username,
            modificationDate: dateTime
        },{
            where: {
                clientId: request.params.clientId
            }
        })
    );

    let referencePromise = Promise.resolve(
        dbm.models.Reference.update({
            reference: request.body.referencia,
            phoneNumber: request.body.telefonoReferencia,
            modifiedBy: request.user.username,
            modificationDate: dateTime
        },{
            where: {
                clientId: request.params.clientId
            }
        })
    );

    Promise.all([clientPromise,jobPromise,referencePromise]).then(function () {
        response.redirect('/rutas/clientes');
    }).catch(error=>{
       response.status(500).send(error);
    });

};
exports.deleteClient = function (request,response) {
    dbm.models.Client.destroy({
        where: {
            clientId: request.params.clientId
        }
    }).then(function () {
        response.status(200).send('Cliente eliminado.');
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
        return value;
    }
    return null;
}
function profilePicture(requestf,requestb) {
    if (requestf){
        return requestf.originalname;
    }else{
        dbm.models.Client.findById(requestb.clientId).then(result=>{
            return result.profilePicture;
        })
    }
}
function reFormat(date) {
    let next = date.split('-');
    next = ('0'+next[2]).slice(-2)+'-'+('0'+next[1]).slice(-2)+'-'+next[0];
    return next;
}
function formt(num) {
    let formateado = parseFloat(num);
    formateado = '$'+formateado.toLocaleString('en', {maximumFractionDigits : 2, minimumFractionDigits: 2});
    return formateado;
}

function createClient(request) {
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    return dbm.models.Client.create({
        firstNames: request.body.nombres,
        lastNames: request.body.apellidos,
        sexo: request.body.sexo,
        idCard: request.body.cedula,
        birthDate: request.body.fechaNacim,
        cellPhone: request.body.celular,
        phoneNumber: request.body.telefono,
        nacionality: request.body.nacionalidad,
        homeKind: request.body.vivienda,
        address: request.body.direccion,
        civilState: request.body.estadoCivil,
        profilePicture: currentPicture(request.file),
        workState: request.body.empleo,
        createdBy: request.user.username,
        creationDate: dateTime,
        modifiedBy: request.user.username,
        modificationDate: dateTime
    });

}
function createJob(request,client) {
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    dbm.models.Job.create({
        workName: request.body.nombreTrabajo,
        workIncome: request.body.trabajoIngreso,
        position: request.body.trabajoPosicion,
        workAdress: request.body.trabajoDireccion,
        timeWorking: request.body.tiempoLaborando,
        phoneNumber: request.body.trabajoTelefono,
        clientId: client.clientId,
        createdBy: request.user.username,
        creationDate: dateTime,
        modifiedBy: request.user.username,
        modificationDate: dateTime
    });
}
function createReference(request,client) {
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    dbm.models.Reference.create({
        reference: request.body.referencia,
        phoneNumber: request.body.telefonoReferencia,
        clientId: client.clientId,
        createdBy: request.user.username,
        creationDate: dateTime,
        modifiedBy: request.user.username,
        modificationDate: dateTime
    });
}

async function superFuncion(request) {
    try {
        const client = await createClient(request);
        const job = await createJob(request,client);
        const referencias = await createReference(request,client);
    } catch(error) {
        console.log(error);
    }
}