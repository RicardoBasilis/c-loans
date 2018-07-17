const dbm = require('../models/dbManager');
const path = require('path');
let parentDir = path.join(__dirname+'../../');

const writtenNumber = require('written-number');
writtenNumber.defaults.lang = 'es';

exports.mainGraphM = function (request,response) {
    let graphData = defaultsMonth();

    let paymentsQuery = 'select sum(payments.interest) as interes, sum(payments.capital) as capital, sum((payments.interest+payments.capital)) ' +
        'as total, monthname(payments.paymentDate) as mes from payments group by mes ORDER BY payments.paymentDate;';

    let loansQuery = 'select sum(clientLoan) as total, monthname(loanDate) as date from loans group by month(loans.loanDate) ORDER BY loans.loanDate;';

    dbm.sequelize.query(loansQuery).spread((results,metadata)=>{
        results.forEach(function (row,index) {
            graphData.forEach(function (row2,index2) {
                if (graphData[index2][0]===dictionary(row.date)){
                    graphData[index2][4] = row.total;
                }
            });
        });
    }).then(function () {
        dbm.sequelize.query(paymentsQuery).spread((results,metadata)=>{
            results.forEach(function (row,index) {
                graphData.forEach(function (row2,index2) {
                    if (graphData[index2][0]===dictionary(row.mes)){
                        graphData[index2][1] = row.interes;
                        graphData[index2][2] = row.capital;
                        graphData[index2][3] = row.total;
                    }
                });
            });
            response.status(200).json({data:graphData});
        })
    }).catch(error=>{
        response.status(500).send(error);
    });
};
exports.mainGraphY = function (request,response) {
    let graphData = [];

    let paymentsQuery = 'select sum(p.interest) as interest, sum(p.capital) as capital, sum((p.interest+p.capital)) as total, year(p.paymentDate) as year\n' +
        'from payments as p\n' +
        'GROUP BY year\n' +
        'ORDER BY p.paymentDate asc;';

    let loansQuery = 'select sum(clientLoan) as monto, year(loanDate) as year\n' +
        'from loans\n' +
        'GROUP BY year\n' +
        'ORDER BY loanDate asc;';

    dbm.sequelize.query(paymentsQuery).spread((results,metadata)=>{
        results.forEach(function (row) {
            let innerArray = [], defVal = 0;
            innerArray.push(row.year.toString(),row.interest,row.capital,row.total,defVal);
            graphData.push(innerArray)
        });
    }).then(function () {
        dbm.sequelize.query(loansQuery).spread((results,metadata)=>{
            results.forEach(function (row,index) {
                if (graphData[index][0]===row.year.toString()){
                    graphData[index][4] = row.monto;
                }
            });
            response.status(200).json({data:graphData});
        })
    }).catch(error=>{
        response.status(500).send(error);
    });
};
exports.receiptDetails = function (request,response) {
    let client = {}, payment = {}, user = {};
    let date = new Date();
    let dateTime = ('0'+date.getDate()).slice(-2)+'-'+('0'+(date.getMonth()+1)).slice(-2)+'-'+date.getFullYear();

    dbm.models.User.find({
        where: {
            username: request.user.username
        }
    }).then(result=>{
        user.fullName = result.firstName+' '+result.lastName;
    });

    dbm.models.Payment.find({
        include: [{
            model: dbm.models.Loan,
            attributes: ['loanId','dues','loanDebt'],
            include: [{
                model: dbm.models.Client,
                attributes: ['firstNames','lastNames']
            }],
            where: {
                loanId: request.params.loanId
            }
        }]
    },{
        where: {
            paymentId: request.params.paymentId
        }
    }).then(result=>{
        client.fullName = result.loan.client.firstNames + ' ' + result.loan.client.lastNames;
        payment.no = result.loan.loanId + ' - ' + result.paymentId;
        payment.date = dateTime;
        payment.text = writtenNumber(Math.floor(result.capital + result.interest + result.delay)).toString().toUpperCase();
        payment.total = formt(Math.floor(result.capital + result.interest + result.delay));
        payment.dues = request.body[1];
        payment.cuota = request.body[1]+'/'+result.loan.dues;
        payment.monto = formt(result.capital+result.interest);
        payment.delay = formt(result.delay);
        payment.debt = formt(result.loan.loanDebt);
        payment.paymentMethod = result.paymentMethod;

        response.render('receipt',{client:client,user:user,payment:payment});
    }).catch(error=>{
        console.log(error);
    });
};

exports.paymentPage = function(request,response){
    response.sendFile(parentDir + '/pagos.html')
};
exports.nextPayments = function (request,response) {
    let data = [], columns = [["Cliente"],["Atrasos"],["Modal"],["Próximo Pago"]];

    dbm.models.Loan.findAll({
        include: [{
            model: dbm.models.Client,
            attributes: ["firstNames","lastNames"]
        }]
    }).then(results=>{
        results.forEach(function (row) {
            let paymentData = [];
            let clientInfo = row.client.firstNames+' '+row.client.lastNames+"<br />"+'Deuda actual: '+formt(row.loanDebt)+' / atrasos: '+dateDiff(reFormat(row.nextPayment),row.modal);
            paymentData.push(clientInfo,dateDiff(reFormat(row.nextPayment),row.modal),row.modal,row.nextPayment);
            data.push(paymentData);
        });
        response.status(200).json({columns: columns, data: data});
    }).catch(error=>{
        response.status(500).send(error);
    });
};
exports.paymentList = function(request,response){
    let data = [], columns = [["Cliente"],["Fecha"],["Capital"],["Interés"],["Mora"],["Descuento"],["Total Pago"],["Forma Pago"],["Creado Por"],["Estado"]];

    dbm.models.Payment.findAll({
        include: [{
            model: dbm.models.Loan,
            attributes: ['loanId','status'],
            include: [{
                model: dbm.models.Client,
                attributes: ['clientId','firstNames','lastNames']
            }]
        }]
    }).then(results=>{
        results.forEach(function (row) {
            let paymentData = [], client = row.loan.client.firstNames+' '+row.loan.client.lastNames;
            let total = parseFloat(row.capital)+parseFloat(row.interest)+parseFloat(row.discount);
            paymentData.push(client,reFormat(row.paymentDate),formt(row.capital),formt(row.interest),formt(row.delay),formt(row.discount),formt(total),row.paymentMethod.split(' ')[0],row.createdBy,row.loan.status);
            data.push(paymentData);
        });
        response.status(200).json({columns: columns, data: data})
    }).catch(error=>{
        response.status(404).send('Recurso no encontrado.' +error);
    });
};
exports.paymentTemplate = function(request,response){
    let clientObj = {}, loanObj = {}, data = null;

    dbm.models.Loan.find({
        include: {
            model: dbm.models.Client,
            attributes: ['clientId','firstNames','lastNames','profilePicture'],
            where: {
                clientId: request.params.clientId
            }
        },
        where: {
            loanId: request.params.loanId
        }
    }).then(result=>{
        data = processor(result);
        clientObj.clientId = result.client.clientId;
        clientObj.fullName = result.client.firstNames + ' ' + result.client.lastNames;
        clientObj.profilePicture = '/images/'+result.client.profilePicture;

        loanObj.loanId = result.loanId;
        loanObj.trueLoan = result.clientLoan;
        loanObj.monto = formt(result.clientLoan);
        loanObj.cDate = reFormat(result.loanDate);
        loanObj.interest = result.interest+' %';
        loanObj.dues = result.dues;
        loanObj.amort = checkAmort(result.amort);
        loanObj.modal = checkModal(result.modal);
        loanObj.montoRest = formt(result.loanDebt);
        loanObj.nextDate = result.nextPayment;
        loanObj.comment = result.comment;

        loanObj.trueStatus = result.status;
        loanObj.status = result.status != 'Activo' ? 'disabled' : '';
        loanObj.hidden = result.status != 'Activo' ? "display: none" : '';
        response.render('paymentTemplate',{clientObj:clientObj,loanObj:loanObj,data:data});
    }).catch(error=>{
        response.status(500).send(error)
    });
};
exports.paymentDetails = function(request,response){
    let acc = 0, ogLoan = 0, data = [], columns = [["Id Pago"],["Cuota"],["Fecha"],["Capital"],["Interés"],["Mora"],["Descuento"],["Pago Total"],["Capital Restante"],["Creado Por"],["Eliminar"],["Imprimir"]];

    dbm.models.Payment.findAll({
        include: [{
            model: dbm.models.Loan,
            attributes: ['clientLoan']
        }],
        where: {
            loanId: request.params.loanId
        }
    }).then(results=>{
        let i = 1;
        if (results.length>0){
            ogLoan = results[0].loan.clientLoan;
            results.forEach(function (row) {
                let paymentData = [], total = row.capital+row.interest+row.discount;
                acc += row.capital+row.discount;
                paymentData.push(row.paymentId,i,reFormat(row.paymentDate),formt(row.capital),formt(row.interest),formt(row.delay),formt(row.discount),formt(total),remainingDebt(ogLoan,acc),row.createdBy,'N/A');
                data.push(paymentData);
                i++;
            });
        }
        response.status(200).json({columns:columns,data:data});
    }).catch(error=>{
        response.status(500).send(error)
    });

};
exports.newPayment = function(request,response){
    let obj = request.body, paymentObj = {}, cap = 0, int = null;
    paymentObj.mora = parseFloat(obj.mora).toFixed(2);
    paymentObj.descuento = parseFloat(obj.descuento).toFixed(2);
    paymentObj.interes = parseFloat(obj.interes).toFixed(2);

    if (parseFloat(obj.total)>=parseFloat(obj.interes)){
        cap = ((parseFloat(obj.total)+parseFloat(obj.descuento))-parseFloat(obj.interes))-parseFloat(obj.mora);
        paymentObj.capital = cap.toFixed(2)
    }else if(parseFloat(obj.total)>0){
        paymentObj.capital = cap.toFixed(2);
        int = parseFloat(obj.total);
        paymentObj.interes = int.toFixed(2);
    }else{
        response.status(200).json({message:'El Pago debe ser mayor de RD $0.00'});
    }

    superFuncion(obj,paymentObj,request).then(function () {
        response.status(200).json({message:'Pago realizado exitosamente.'});
    }).catch(error=>{
        response.status(500).send(error);
    })

};
exports.deletePayment = function (request,response) {
    regresar(request.body,request).then(function () {
        response.status(200).json('Pago Eliminado');
    }).catch(error=>{
       response.status(500).send(error);
    });
};
exports.cancelLoan= function (request,response) {
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    dbm.models.Loan.update({
        status: 'Cancelado',
        modifiedBy: request.user.username,
        modificationDate: dateTime
    },{
        where: {
            loanId: request.params.loanId
        }
    }).then(function () {
        response.status(200).json({message:'/rutas/prestamos'});
    }).catch(error=>{
        response.status(500).send('El recurso no fue eliminado. '+error);
    });
};
exports.deleteLoan = function(request,response){
    dbm.models.Loan.destroy({
        where: {
            loanId: request.params.loanId
        }
    }).then(function () {
        response.status(200).json({message:'/rutas/prestamos'});
    }).catch(error=>{
        response.status(500).send('El recurso no fue eliminado. '+error);
    });
};

function findBank(obj) {
    return dbm.models.Bank.findById(obj.banco);
}
function createPayment(bank,obj,paymentObj,request) {
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    let bankName = bank === null ? ' ' : ' - A través de: ' + bank.bankName;

    dbm.models.Payment.create({
        capital: paymentObj.capital,
        interest: paymentObj.interes,
        delay: paymentObj.mora,
        discount: paymentObj.descuento,
        paymentDate: obj.fechaPago,
        paymentMethod: obj.formaPago + bankName,
        checkDepNumber: obj.numero !== '' ? parseInt(obj.numero) : null,
        paymentNote: obj.nota,
        loanId: obj.prestamoId,
        createdBy: request.user.username,
        creationDate: dateTime,
        modifiedBy: request.user.username,
        modificationDate: dateTime,
    })
}
function updateLoan(obj,paymentObj) {
    let date = new Date(), oldData = [null,null];
    let dateTime = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

    let promise = Promise.resolve(
        dbm.models.Loan.findById(obj.prestamoId).then(result => {
            let arrange = result.nextPayment.split('-');
            oldData[0] = result.loanDebt;
            oldData[1] = arrange[2]+'-'+arrange[1]+'-'+arrange[0];
        }).catch(error=>{
            console.log(error);
        })
    );

    promise.then(function () {
        dbm.models.Loan.update({
            loanDebt: parseFloat(oldData[0])-parseFloat(paymentObj.capital).toFixed(2)-parseFloat(paymentObj.descuento).toFixed(2),
            nextPayment: addDays(oldData[1], parseInt(obj.dias)),
            status: parseFloat(oldData[0])-parseFloat(paymentObj.capital).toFixed(2) > 1 ? 'Activo' : 'Finalizado',
            modifiedBy: 'sistema',
            modificationDate: dateTime
        }, {
            where: {
                loanId: obj.prestamoId
            }
        })
    }).catch(error=>{
        console.log(error);
    });
}
async function superFuncion(obj,paymentObj,request) {
    try {
        const bank = await findBank(obj);
        const pago = await createPayment(bank,obj,paymentObj,request);
        const prestamo = await updateLoan(obj,paymentObj);
    } catch(error) {
        return error;
    }
}
function rollBackLoan(array,request) {
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    dbm.models.Loan.update({
        loanDebt: (deFormt(array[8])+deFormt(array[3])+deFormt(array[6])).toFixed(2),
        nextPayment: removeDays(reFormat(array[12]),checkModal(array[11])),
        status: 'Activo',
        modifiedBy: request.user.username,
        modificationDate: dateTime
    },{
        where: {
            loanId: array[10]
        }
    })
}
function removePayment(array){
    dbm.models.Payment.destroy({
        where:{
            paymentId: array[0]
        }
    }).then(function () {
       dbm.models.Loan.update({
           status: 'Activo',
       },{
           where: {
               loanId: parseInt(array[10])
           }
       })
    });
}
async function regresar(array,request) {
    try {
        const rollback = await rollBackLoan(array,request);
        const remove = await removePayment(array);
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
        case 'Diario':
            value = 1;
            break;
        case 'Semanal':
            value = 7;
            break;
        case 'Quincenal':
            value = 15;
            break;
        case 'Mensual':
            value = 30;
            break;
        default:
            break;
    }
    return value
}
function checkAmort(amort) {
    let value = null;
    switch (parseInt(amort)){
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
    }else {
        result.setDate(result.getDate() + days);
    }
    return ('0'+result.getUTCDate()).slice(-2)+'-'+('0'+(result.getUTCMonth()+1)).slice(-2)+'-'+result.getUTCFullYear();
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
function processor(object) {
    let data = {}, int = object.interest/100;
    data.id = object.loanId;

    if (object.amort===1){
        data.interes = object.loanDebt*int;
        data.pago = (object.clientLoan*(int*((1+int)**object.dues)))/(((1+int)**object.dues)-1);
    }else if(object.amort===2){
        data.interes = object.loanDebt*int;
        data.pago = (object.clientLoan/object.dues)+(object.loanDebt*int);
    }else{
        data.interes = object.clientLoan*int;
        data.pago = (object.clientLoan*int)+(object.clientLoan/object.dues);
    }
    data.amort = object.amort;
    data.modal = object.modal;
    return data;
}
function remainingDebt(ogLoan,total) {
    return formt(ogLoan-total);
}

function removeDays(date, days) {
    let result = new Date(date);
    if (days===30){
        result.setMonth(result.getMonth() - 1);
    }else {
        result.setDate(result.getDate() - days);
    }
    return ('0'+result.getUTCDate()).slice(-2)+'-'+('0'+(result.getUTCMonth()+1)).slice(-2)+'-'+result.getUTCFullYear();
}
function deFormt(num){
    let val = '';
    num = num.split('');
    num.forEach(function (char) {
        if (char!=='$' && char!==','){
            val += char.toString();
        }
    });
    return parseFloat(val);
}

function dateDiff(lastDate,modal) {
    let today = new Date(), lastD = new Date(lastDate);
    if (lastD<today){
        let subtraction = Math.abs(today-lastD) + modal*86400000, days = 0;
        while (subtraction>86400000){
            days++;
            subtraction-=86400000;
        }

        if(modal===1){
            return days;
        }
        return Math.floor(days/modal);
    }
    return 0;
}

const monthDictionary = {
    'January': 'Enero',
    'February': 'Febrero',
    'March': 'Marzo',
    'April': 'Abril',
    'May': 'Mayo',
    'June': 'Junio',
    'July': 'Julio',
    'August': 'Agosto',
    'September': 'Septiembre',
    'October': 'Octubre',
    'November': 'Noviembre',
    'December': 'Diciembre'
};
function dictionary(mes) {
    let trans = '';
    Object.keys(monthDictionary).forEach(function (key) {
        if (key===mes){
            trans = monthDictionary[key];
            return trans;
        }
    });
    return trans;
};
function defaultsMonth() {
    let trans = [];
    Object.keys(monthDictionary).forEach(function (key) {
        let innerArray = [monthDictionary[key],0,0,0,0];
        trans.push(innerArray);
    });
    return trans;
};