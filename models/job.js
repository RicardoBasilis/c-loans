module.exports = function(sequelize,DataTypes) {
    return sequelize.define('job', {
        jobId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        workName: {
            type: DataTypes.STRING(30),
            allowNull: true,
        },
        workIncome: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false
        },
        position: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        workAdress: {
            type: DataTypes.STRING(60),
            allowNull: true
        },
        timeWorking: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        phoneNumber: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        clientId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false
        },
        createdBy: {
            type: DataTypes.STRING(25),
            allowNull: false
        },
        creationDate: {
            type: DataTypes.STRING(25),
            allowNull: false
        },
        modifiedBy: {
            type: DataTypes.STRING(25),
            allowNull: false
        },
        modificationDate: {
            type: DataTypes.STRING(25),
            allowNull: false
        }
    }, {
        comment: 'Información sobre los empleos registrados.\n' +
        'Identificador | Nombre de la Empresa | Ingreso | Posición | Dirección | Tiempo Laborando | Teléfono | Id Cliente | Creado por | En Fecha | Modificado por | En Fecha',
        timestamps: false
    });
};