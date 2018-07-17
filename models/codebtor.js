module.exports = function(sequelize,DataTypes) {
    return sequelize.define('codebtor', {
        codebtorId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        codebtor: {
            type: DataTypes.STRING(60),
            allowNull: true,
        },
        phoneNumber: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(10),
            allowNull: true
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
        comment: 'Información sobre los codeudores registradas.\n' +
        'Identificador | Nombre del Codeudor | Teléfono | Dirección | Id Préstamo | Creado por | En Fecha | Modificado por | En Fecha',
        timestamps: false
    });
};