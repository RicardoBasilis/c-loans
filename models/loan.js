module.exports = function(sequelize,DataTypes) {
    return sequelize.define('loan', {
        loanId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        clientLoan: {
            type: DataTypes.FLOAT(11).UNSIGNED,
            allowNull: false,
        },
        interest: {
            type: DataTypes.FLOAT(11).UNSIGNED,
            allowNull: false
        },
        dues: {
            type: DataTypes.INTEGER(4).UNSIGNED,
            allowNull: false
        },
        amort: {
            type: DataTypes.INTEGER(1),
            allowNull: false
        },
        modal: {
            type: DataTypes.INTEGER(1),
            allowNull: false
        },
        loanDebt: {
            type: DataTypes.FLOAT(11),
            allowNull: false,
        },
        loanDate: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        nextPayment: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        comment: {
            type: DataTypes.STRING(150),
            allowNull: true
        },
        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
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
        comment: 'Información sobre los préstamos registrados.\n' +
        'Identificador | Monto a Prestar | Interés | Cantidad de Cuotas | Amortización | Modalidad de Pago | Fecha | Deuda Restante | Fecha de Próximo Pago | Comentario | Id Cliente | Creado por | En Fecha | Modificado por | En Fecha',
        timestamps: false
    });
};