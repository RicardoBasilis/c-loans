const dbm = require('../models/dbManager');

exports.currentAlerts = function (request,response) {
    let date = new Date();
    let dateTime = date.getFullYear()+'-'+('0'+(date.getMonth()+1)).slice(-2)+'-'+('0'+date.getDate()).slice(-2);

    let data = [];

    dbm.models.Loan.findAll({
        include: [{
            model: dbm.models.Client,
            attributes: ['clientId','firstNames','lastNames']
        }]
    }).then(results=>{
        results.forEach(function (row) {
            let nextDate = reFormat(row.nextPayment), message = '';
            if (nextDate<dateTime){
                message = row.client.firstNames+' '+row.client.lastNames  + '. El cliente debió pagar el: '+reFormat(nextDate)+'.'
                    + ' Fecha Actual: '+reFormat(dateTime)+'.';
                data.push(message);
            }
        });
        response.status(200).json({data:data});
    }).catch(error=>{
        response.status(500).send(error);
    })
};

function reFormat(date) {
    let next = date.split('-');
    next = next[2]+'-'+next[1]+'-'+next[0];
    return next;
}