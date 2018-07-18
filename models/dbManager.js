//Datos por defecto
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const sequelize = new Sequelize('cprestamos', 'root', 'adminsql', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});
const models = {
    Client: sequelize.import(__dirname + '/client'),
    Job: sequelize.import(__dirname + '/job'),
    Reference: sequelize.import(__dirname + '/reference'),
    Loan: sequelize.import(__dirname + '/loan'),
    Codebtor: sequelize.import(__dirname + '/codebtor'),
    Payment: sequelize.import(__dirname + '/payment'),
    User: sequelize.import(__dirname + '/user'),
    Role: sequelize.import(__dirname + '/role'),
    RolePrivilege: sequelize.import(__dirname + '/rolePrivilege'),
    Privilege: sequelize.import(__dirname + '/privilege'),
    Bank: sequelize.import(__dirname + '/bank')
};

models.Payment.belongsTo(models.Loan,{foreignKey:'loanId', sourceKey:'loanId',onDelete: 'CASCADE'});
models.Codebtor.belongsTo(models.Loan,{foreignKey: 'loanId', sourceKey: 'loanId', onDelete: 'CASCADE'});
models.Loan.belongsTo(models.Client,{foreignKey: 'clientId', sourceKey: 'clientId', onDelete: 'CASCADE'});
models.Job.belongsTo(models.Client,{foreignKey: 'clientId', sourceKey: 'clientId', onDelete: 'CASCADE'});
models.Reference.belongsTo(models.Client,{foreignKey: 'clientId', sourceKey: 'clientId', onDelete: 'CASCADE'});
models.User.belongsTo(models.Role,{foreignKey: 'roleId', sourceKey: 'roleId', onDelete: 'SET NULL'});
models.RolePrivilege.belongsTo(models.Role,{foreignKey: 'roleId', sourceKey: 'roleId', onDelete: 'CASCADE'});
models.RolePrivilege.belongsTo(models.Privilege,{foreignKey: 'privilegeId', sourceKey: 'privilegeId', onDelete: 'RESTRICT'});

//Encriptar la contraseña
const saltRounds = 10;
let bcrypt = require('bcrypt');
let hashed = null;
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

module.exports.defaultTables = function defaultTables() {
    let date = new Date(), total = null;
    let dateTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();

    // force: true will drop the table if it already exists
    sequelize.query('select users.username from users').spread((results, metadata) => {
        total = results;
    }).then(function () {
        if (total.length === 0) {
            sequelize.sync({force: true}).then(function () {
                hashIt('test').then(function (fromResolve) {
                    hashed = fromResolve;
                    //Privilegios por defecto
                    models.Privilege.bulkCreate([
                        {
                            privilegeId: 0,
                            description: 'Visualizar Clientes',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 1,
                            description: 'Visualizar Préstamos',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 2,
                            description: 'Visualizar Pagos',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 3,
                            description: 'Visualizar Usuarios',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 4,
                            description: 'Visualizar Roles',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 5,
                            description: 'Crear Clientes',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 6,
                            description: 'Crear Préstamos',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 7,
                            description: 'Crear Pagos',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 8,
                            description: 'Crear Usuarios',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 9,
                            description: 'Crear Roles',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 10,
                            description: 'Actualizar Clientes',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 11,
                            description: 'Actualizar Préstamos',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 12,
                            description: 'Actualizar Pagos',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 13,
                            description: 'Actualizar Usuarios',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 14,
                            description: 'Actualizar Roles',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 15,
                            description: 'Eliminar Clientes',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 16,
                            description: 'Eliminar Préstamos',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 17,
                            description: 'Eliminar Pagos',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 18,
                            description: 'Eliminar Usuarios',
                            createdBy: 'sistem',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            privilegeId: 19,
                            description: 'Eliminar Roles',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        }
                    ]);
                    //Roles por defecto
                    models.Role.bulkCreate([
                        {
                            description: 'Super Administrador',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        },
                        {
                            description: 'Administrador',
                            createdBy: 'sistema',
                            creationDate: dateTime,
                            modifiedBy: 'sistema',
                            modificationDate: dateTime
                        }
                    ]).catch(function (fromReject) {
                        throw fromReject;
                    }).then(function () {
                        //Super Administrador por defecto
                        models.User.create(
                            {
                                username: 'sistema',
                                password: hashed,
                                email: 'cuevasbencosme@gmail.com',
                                firstName: 'Sistema',
                                secondName: 'Sistema',
                                lastName: 'Sistema',
                                surName: 'Sistema',
                                phoneNumber: '8296903600',
                                profilePicture: 'profile256.png',
                                roleId: 1,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            });
                        //Relaciones Roles & Privilegios por defecto
                        models.RolePrivilege.bulkCreate([
                            {
                                roleId: 1,
                                privilegeId: 0,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 1,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 2,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 3,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 4,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 5,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 6,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 7,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 8,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 9,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 10,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 11,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 12,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 13,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 14,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 15,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 16,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 17,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 18,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 1,
                                privilegeId: 19,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 0,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 1,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 2,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 3,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 4,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 5,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 6,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 7,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 8,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 9,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 10,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 11,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 12,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 13,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 14,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 15,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 16,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 17,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 18,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            },
                            {
                                roleId: 2,
                                privilegeId: 19,
                                createdBy: 'sistema',
                                creationDate: dateTime,
                                modifiedBy: 'sistema',
                                modificationDate: dateTime
                            }
                        ]);
                    });
                });
            });
        }
    });
};

module.exports.models = models;
module.exports.Op = Op;
module.exports.sequelize = sequelize;


