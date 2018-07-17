module.exports = function(sequelize,DataTypes) {
    return sequelize.define('payment', {
        paymentId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        capital: {
            type: DataTypes.FLOAT(11).UNSIGNED,
            allowNull: true,
        },
        interest: {
            type: DataTypes.FLOAT(11),
            allowNull: true,
        },
        delay: {
            type: DataTypes.FLOAT(11).UNSIGNED,
            allowNull: true,
        },
        discount: {
            type: DataTypes.FLOAT(11).UNSIGNED,
            allowNull: true,
        },
        paymentDate: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        paymentMethod: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        checkDepNumber: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: true,
        },
        paymentNote: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        loanId: {
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
        }
    }, {
        comment: 'Información sobre los pagos registrados.\n' +
        'Identificador | Capital | Interés | Mora | Descuento | Modo de Pago | Número de Déposito o Banco | Nota | Id Préstamo | Creado por | En Fecha | Modificado por | En Fecha',
        timestamps: false
    });
};