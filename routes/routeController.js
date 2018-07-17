const express = require('express');
const dbm = require('../models/dbManager.js');
let router = express.Router();
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (request,file,cb) {
        cb(null,'./images/');
    },
    filename: function (request,file,cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({storage:storage});

const clientRoutes = require('./clientRoutes.js');
const userRoutes = require('./userRoutes.js');
const profileRoutes = require('./profileRoutes.js');
const rolesRoutes = require('./rolesRoutes.js');
const loanRoutes = require('./loanRoutes.js');
const bankRoutes = require('./bankRoutes.js');
const paymentRoutes = require('./paymentRoutes.js');
const alertRoutes = require('./alertRoutes.js');

/// Alert Routes ///
router.get('/alertas',alertRoutes.currentAlerts);
router.get('/rec',function (request,response) {
    response.render('receipt')
});
router.post('/pagos/recibos/:loanId/:paymentId',paymentRoutes.receiptDetails);


/// Main Graph ///
router.get('/pagos/ingresos/month',paymentRoutes.mainGraphM);
router.get('/pagos/ingresos/year',paymentRoutes.mainGraphY);

/// Clients Routes ///
router.get('/clientes',checkPrivilege(0),clientRoutes.clientPage);
router.get('/clientes/listado',checkPrivilege(0),clientRoutes.clientList);
router.get('/clientes/nuevoCliente',checkPrivilege(0),clientRoutes.clientTemplate);
router.get('/clientes/:clientId',checkPrivilege(0),clientRoutes.clientDetails);
router.get('/clientes/actualizarCliente/:clientId',checkPrivilege(0),clientRoutes.clientToUpdate);
router.post('/clientes',upload.single('imgInput'),checkPrivilege(5),clientRoutes.newClient);
router.post('/clientes/actualizarCliente/:clientId',checkPrivilege(10),upload.single('imgInput'),clientRoutes.updateClient);
router.delete('/clientes/eliminarCliente/:clientId',checkPrivilege(15),clientRoutes.deleteClient);

/// Loans Routes ///
router.get('/prestamos',checkPrivilege(1),loanRoutes.loanPage);
router.get('/prestamos/listado',checkPrivilege(1),loanRoutes.loanList);
router.get('/prestamos/nuevoPrestamo',checkPrivilege(1),loanRoutes.loanTemplate);
router.get('/prestamos/:loanId',checkPrivilege(1),loanRoutes.loanData);
router.get('/prestamos/detalles/:loanId',checkPrivilege(1),loanRoutes.loanDetails);
router.get('/prestamos/actualizarPrestamo/:loanId',checkPrivilege(1),loanRoutes.loanToUpdate);
router.get('/prestamos/amortizacion/:loanId',checkPrivilege(1),loanRoutes.loanAmort);
router.get('/prestamos/alCliente/:clientId',checkPrivilege(1),loanRoutes.indLoanPage);
router.get('/prestamos/listado/:clientId',checkPrivilege(1),loanRoutes.indLoanDetails);
router.post('/prestamos',checkPrivilege(6),loanRoutes.newLoan);
router.post('/prestamos/actualizarPrestamo/:loanId',checkPrivilege(11),loanRoutes.updateLoan);
router.delete('/prestamos/eliminarPrestamo/:loanId',checkPrivilege(16),loanRoutes.deleteLoan);

/// Payments Routes ///
router.get('/pagos/proximos',paymentRoutes.nextPayments);
router.get('/pagos',checkPrivilege(2),paymentRoutes.paymentPage);
router.get('/pagos/listado',checkPrivilege(2),paymentRoutes.paymentList);
router.get('/pagos/:clientId/:loanId',checkPrivilege(2),paymentRoutes.paymentTemplate);
router.get('/pagos/:loanId',checkPrivilege(2),paymentRoutes.paymentDetails);
router.post('/pagos',checkPrivilege(7),paymentRoutes.newPayment);
router.post('/pagos/eliminarPago/:paymentId',checkPrivilege(12),paymentRoutes.deletePayment);
router.post('/pagos/cancelarPrestamo/:loanId',checkPrivilege(12),paymentRoutes.cancelLoan);
router.delete('/pagos/eliminarPrestamo/:loanId',checkPrivilege(17),paymentRoutes.deleteLoan);

/// Users Routes ///
router.get('/usuarios',checkPrivilege(3),userRoutes.userPage);
router.get('/usuarios/listado',checkPrivilege(3),userRoutes.userList);
router.get('/usuarios/nuevoUsuario',checkPrivilege(3),userRoutes.userTemplate);
router.get('/usuarios/:userId',checkPrivilege(3),userRoutes.userDetails);
router.get('/usuarios/actualizarUsuario/:userId',checkPrivilege(3),userRoutes.userToUpdate);
router.post('/usuarios',checkPrivilege(8),upload.single('pfp'),userRoutes.newUser);
router.post('/usuarios/actualizarUsuario/:userId',checkPrivilege(13),upload.single('pfp'),userRoutes.updateUser);
router.delete('/usuarios/eliminarUsuario/:userId',checkPrivilege(18),userRoutes.deleteUser);

/// Profile Routes ///
router.get('/perfil',profileRoutes.profile);
router.post('/perfil/actualizarDetalles/:userId',upload.single('pfp'), profileRoutes.updateDetails);
router.post('/perfil/actualizarClave/:userId', profileRoutes.updatePassword);

/// Roles Routes ///
router.get('/roles',checkPrivilege(4),rolesRoutes.rpPage);
router.get('/roles/listado',checkPrivilege(4),rolesRoutes.rpList);
router.get('/roles/actualizarRol/:roleId',checkPrivilege(4),rolesRoutes.roleToUpdate);
router.get('/roles/:roleId',checkPrivilege(4),rolesRoutes.roleDetails);
router.post('/roles',checkPrivilege(9),rolesRoutes.newRole);
router.post('/roles/actualizarRol/:roleId',checkPrivilege(14),rolesRoutes.updateRole);
router.delete('/roles/eliminarRol/:roleId',checkPrivilege(19),rolesRoutes.deleteRole);

/// Bank Routes ///
router.get('/bancos',checkPrivilege(2),bankRoutes.bankPage);
router.get('/bancos/listado',checkPrivilege(2),bankRoutes.bankList);
router.post('/bancos',checkPrivilege(7),bankRoutes.newBank);
router.post('/bancos/actualizarBanco/:bankId',checkPrivilege(12),bankRoutes.updateBank);
router.delete('/bancos/eliminarBanco/:bankId',checkPrivilege(17),bankRoutes.deleteBank);


module.exports = router;

/// Validaciones ///
function checkPrivilege(privilegeId) {
    return (request,response,next)=>{
        permiso(privilegeId,request).then(function (losPermisos) {
            let tienePermiso = losPermisos.some(function (value) {
               return value.privilegeId === privilegeId;
            });

            if (tienePermiso){
                return next();
            }else{
                response.status(403).redirect('/error');
                // response.status(403).send('Usted NO tiene permiso para continuar. Contacte al Administrador.');
            }
        }).catch(error=>{
            response.status(500).send(error);
        })
    }
}

function findRole(request) {
    return dbm.models.User.find({
        where: {
            username: request.user.username
        }
    })
}
function findPrivilege(privilegeId,rol){
    return dbm.models.RolePrivilege.findAll({
        where: {
            roleId: rol.roleId
        }
    })
}
async function permiso(privilegeId,request) {
    try{
        const rol = await findRole(request);
        const privilege = await findPrivilege(privilegeId,rol);
        return privilege;
    }catch(error) {
        return error;
    }
}