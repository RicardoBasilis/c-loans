const dbm = require('../models/dbManager');
const path = require('path');
let parentDir = path.join(__dirname+'../../');

exports.loanPage = function (request,response) {
    response.sendFile(parentDir+'/prestamos.html');
};
exports.loanList = function(request,response){
    let data = [], columns = [["Id Prestamo"],["Id Cliente"],["Cliente"],["Fecha Préstamo"],["Amortización"],["Capital Inicial"],["Capital Pendiente"],["Interés"],["Cuotas"],["Pagos"],["Próximo Pago"],["Estado"]];
    dbm.models.Loan.findAll({
        include: [{
            model: dbm.models.Client,
            attributes: ['clientId','firstNames','lastNames']
        }]
    }).then(results=>{
       results.forEach(function (row) {
           let loanData = [];
           loanData.push(row.loanId,row.client.clientId,row.client.firstNames+' '+row.client.lastNames,reFormat(row.loanDate),checkAmort(row.amort),formt(row.clientLoan),formt(row.loanDebt),row.interest+'%',row.dues,checkModal(row.modal),row.nextPayment,row.status);
           data.push(loanData);
       });
       response.status(200).json({columns: columns, data: data})
    }).catch(error=>{
        response.status(404).send('Recurso no encontrado.' +error);
    });
};
exports.loanTemplate = function(request,response){
    let loan = {};
    loan.title = 'Nuevo Préstamo';
    loan.action = 'CREAR';
    loan.form = '/rutas/prestamos';
    response.render('loanTemplate',{loan:loan});
};
exports.loanData = function (request,response) {
    let loanData = {};

    dbm.models.Loan.findById(request.params.loanId).then(result=>{
        loanData.loanId = result.loanId;
        loanData.clientLoan = result.clientLoan;
        loanData.interest = (result.interest/100);
        loanData.dues = result.dues;
        loanData.amort = result.amort;
        loanData.modal = result.modal;
        loanData.date = result.loanDate;
        loanData.loanDebt = result.loanDebt;
        loanData.nextPayment = result.nextPayment;
        loanData.clientId = result.clientId;
        loanData.comment = result.comment;
        response.status(200).json({loanData:loanData});
    }).catch(error=>{
        response.status(500).send(error)
    })
};
exports.loanDetails = function(request,response){
    let loan = {}, debtor = {}, client = {};

    dbm.models.Codebtor.find({
        include: [{
            model: dbm.models.Loan,
            include: [{
                model: dbm.models.Client,
                attributes: ['firstNames','lastNames']
            }]
        }],
        where: {
            loanId: request.params.loanId
        }
    }).then(result=>{
        let array = result.loan.creationDate.split(' '), array2 = result.loan.modificationDate.split(' ');

        debtor.codebtor = result.codebtor;
        debtor.phoneNumber = result.phoneNumber;
        debtor.address = result.address;

        loan.title = 'ID Préstamo: #'+result.loan.loanId;
        loan.amort = checkAmort(result.loan.amort);
        loan.clientLoan = formt(result.loan.clientLoan);
        loan.interest = result.loan.interest+' %';
        loan.dues = result.loan.dues;
        loan.modal = checkModal(result.loan.modal);
        loan.comment = result.loan.comment;
        loan.date = reFormat(result.loan.loanDate);
        loan.createdBy = result.loan.createdBy;
        loan.creationDate = reArrange(array[0])+' '+array[1];
        loan.modifiedBy = result.loan.modifiedBy;
        loan.modificationDate = reArrange(array2[0])+' '+array2[1];

        client.fullName = result.loan.client.firstNames+' '+result.loan.client.lastNames;

        response.render('loanDetails',{loan:loan,debtor:debtor,client:client});
    }).catch(error=>{
        response.status(500).send(error);
    })
};
exports.loanToUpdate = function(request,response){
    let loanObj = {}, debtorObj = {}, loan = {};

    let promise = Promise.resolve(
        dbm.models.Loan.findById(request.params.loanId).then(result=>{
            loanObj.loanId = result.loanId;
            loanObj.clientLoan = result.clientLoan;
            loanObj.interest = result.interest;
            loanObj.dues = result.dues;
            loanObj.amort = result.amort;
            loanObj.modal = result.modal;
            loanObj.date = result.loanDate;
            loanObj.clientId = result.clientId;
            loanObj.comment = result.comment;
            loan.title = 'Modificar Préstamo';
            loan.action = 'ACTUALIZAR';
            loan.form = '/rutas/prestamos/actualizarPrestamo/'+result.loanId;
        })
    );

    let promise2 = Promise.resolve(
        dbm.models.Codebtor.find({
            where:{
                loanId: request.params.loanId
            }
        }).then(result=>{
            debtorObj.codebtor = checkValue(result.codebtor);
            debtorObj.phoneNumber = checkValue(result.phoneNumber);
            debtorObj.address = checkValue(result.address);
        })
    );

    Promise.all([promise,promise2]).then(function () {
        response.render('loanTemplate',{loanObj:loanObj, debtorObj:debtorObj, loan:loan})
    }).catch(error=>{
        response.status(500).send(error);
    })
};
exports.loanAmort = function (request,response) {
    let data = [], columns = [["Fecha"],["Balance"],["Abono Capital"],["Interés"],["Pago"]], totals = [0,0];
    dbm.models.Loan.findById(request.params.loanId).then(result=>{
        let loan = parseFloat(result.clientLoan), interest = parseFloat(result.interest)/100, dues = parseInt(result.dues), amort = parseInt(result.amort), modal = parseInt(result.modal), date = reFormat(result.loanDate);
        let abono = loan/dues;
        if (amort===1){
            let a = (loan*(interest*((1+interest)**dues)))/(((1+interest)**dues)-1);
            for (let i=1;i<=dues;i++){
                date = addDays(reFormat(date),modal);
                data.push([date,formt(loan),formt(a-interest*loan),formt(interest*loan),formt(a)]);
                totals[0] += (interest*loan);
                totals[1] += a;
                loan -= (a-interest*loan);
            }
        }else if(amort===2){
            for (let i=1;i<=dues;i++){
                date = addDays(reFormat(date),modal);
                data.push([date,formt(loan),formt(abono),formt(interest*loan),formt(abono+(interest*loan))]);
                totals[0] += (interest*loan);
                totals[1] += (abono+(interest*loan));
                loan -= abono;
            }
        }else{
            let int = loan*interest;
            for (let i=1;i<=dues;i++){
                date = addDays(reFormat(date),modal);
                data.push([date,formt(loan),formt(abono),formt(int),formt(abono+int)]);
                totals[0] += int;
                totals[1] += (abono+int);
                loan -= abono;
            }
        }
        totals[0] = formt(totals[0]);
        totals[1] = formt(totals[1]);
        response.status(200).json({columns:columns,data:data,totals:totals});
    }).catch(error=>{
        response.status(500).send(error)
    })
};
exports.indLoanPage = function (request,response) {
    let client = {};
    dbm.models.Client.findById(request.params.clientId).then(result=>{
        client.Name = result.firstNames + ' ' + result.lastNames;
        response.render('prestamosCliente',{client:client});
    }).catch(error=>{
        response.status(500).send(error)
    });
};
exports.indLoanDetails = function (request,response){
    let data = [], columns = [["Id Prestamo"],["Id Cliente"],["Fecha Préstamo"],["Amortización"],["Capital Inicial"],["Capital Pendiente"],["Interés"],["Cuotas"],["Pagos"],["Próximo Pago"],["Estado"]];
    dbm.models.Loan.findAll({
        include: [{
            model: dbm.models.Client,
            attributes: ['clientId']
        }],
        where: {
            clientId: request.params.clientId
        }
    }).then(results=>{
        results.forEach(function (row) {
            let loanData = [];
            loanData.push(row.loanId,row.client.clientId,reFormat(row.loanDate),checkAmort(row.amort),formt(row.clientLoan),formt(row.loanDebt),row.interest+'%',row.dues,checkModal(row.modal),row.nextPayment,row.status);
            data.push(loanData);
        });
        response.status(200).json({columns: columns, data: data})
    }).catch(error=>{
        response.status(404).send('Recurso no encontrado.' +error);
    });
};
exports.newLoan = function(request,response){
    superFuncion(request).then(function (error) {
        if(error){
            response.status(500).send('El cliente de dicho préstamo NO existe.');
        }else{
            response.redirect('/rutas/prestamos');
        }
    }).catch(error=>{
        response.status(500).send(error);
    });
};
exports.updateLoan = function(request,response){
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    let loanPromise = Promise.resolve(
        dbm.models.Loan.update({
            clientLoan: request.body.monto,
            interest: request.body.interes,
            dues: parseInt(request.body.cuotas),
            amort: parseInt(request.body.amortizacion),
            modal: parseInt(request.body.modalidad),
            loanDate: request.body.fecha,
            loanDebt: parseInt(request.body.monto),
            nextPayment: addDays(request.body.fecha,parseInt(request.body.modalidad)),
            status: parseInt(request.body.monto) > 1 ? 'Activo' : 'Finalizado',
            comment: request.body.comentario,
            clientId: request.body.cliente.split(' ')[0],
            modifiedBy: request.user.username,
            modificationDate: dateTime
        },{
            where: {
                loanId: request.params.loanId
            }
        })
    );

    let codebtorPromise = Promise.resolve(
        dbm.models.Codebtor.update({
            codebtor: request.body.codeudor,
            phoneNumber: request.body.telefonoCodeudor,
            address: request.body.direccionCodeudor,
            modifiedBy: request.user.username,
            modificationDate: dateTime
        },{
            where: {
                loanId: request.params.loanId
            }
        })
    );

    Promise.all([loanPromise,codebtorPromise]).then(function () {
        response.redirect('/rutas/prestamos');
    }).catch(error=>{
        response.status(500).send('El cliente al que esta prestando NO existe.');
    })

};
exports.deleteLoan = function(request,response){
    dbm.models.Loan.destroy({
        where: {
            loanId: request.params.loanId
        }
    }).then(function () {
        response.status(200).send('Préstamo cancelado.');
    }).catch(error=>{
        response.status(500).send('El recurso no fue eliminado. '+error);
    })
};

function checkValue(value) {
    if (value!==null){
        return value.toString();
    }
    return null;
}
function createLoan(request) {
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    return dbm.models.Loan.create({
        clientLoan: request.body.monto,
        interest: request.body.interes,
        dues: parseInt(request.body.cuotas),
        amort: parseInt(request.body.amortizacion),
        modal: parseInt(request.body.modalidad),
        loanDate: request.body.fecha,
        loanDebt: parseInt(request.body.monto),
        nextPayment: addDays(request.body.fecha,parseInt(request.body.modalidad)),
        comment: request.body.comentario,
        status: parseInt(request.body.monto) > 1 ? 'Activo' : 'Finalizado',
        clientId: request.body.cliente.split(' ')[0],
        createdBy: request.user.username,
        creationDate: dateTime,
        modifiedBy: request.user.username,
        modificationDate: dateTime
    });

}
function createCodebtor(request,loan) {
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    dbm.models.Codebtor.create({
        codebtor: request.body.codeudor,
        phoneNumber: request.body.telefonoCodeudor,
        address: request.body.direccionCodeudor,
        loanId: loan.loanId,
        createdBy: request.user.username,
        creationDate: dateTime,
        modifiedBy: request.user.username,
        modificationDate: dateTime
    });
}

async function superFuncion(request) {
    try {
        const loan = await createLoan(request);
        const codebtor = await createCodebtor(request,loan);
    } catch(error) {
        return error;
    }
}

function checkModal(modal) {
    let value = null;
    switch (modal){
        case 1:
            value = 'Diario';
            break;
        case 7:
            value = 'Semanal';
            break;
        case 15:
            value = 'Quincenal';
            break;
        case 30:
            value = 'Mensual';
            break;
        default:
            break;
    }
    return value
}
function checkAmort(amort) {
    let value = null;
    switch (amort){
        case 1:
            value = 'Cuotas Fijas';
            break;
        case 2:
            value = 'Disminuir Cuotas';
            break;
        case 3:
            value = 'Interés Fijo';
            break;
        default:
            break;
    }
    return value
}
function addDays(date, days) {
    let result = new Date(date);
    if (days===30){
        result.setMonth(result.getMonth() + 1);
    }else{
        result.setDate(result.getDate() + days);
    }
    let next = ('0'+result.getUTCDate()).slice(-2)+'-'+('0'+(result.getUTCMonth()+1)).slice(-2)+'-'+result.getUTCFullYear();
    return next;
}
function reFormat(date) {
    let next = date.split('-');
    next = next[2]+'-'+next[1]+'-'+next[0];
    return next;
}
function formt(num) {
    let formateado = parseFloat(num);
    formateado = '$'+formateado.toLocaleString('en', {maximumFractionDigits : 2, minimumFractionDigits: 2});
    return formateado;
}
function reArrange(date) {
    let next = date.split('-');
    next = ('0'+next[2]).slice(-2)+'-'+('0'+next[1]).slice(-2)+'-'+next[0];
    return next;
}
