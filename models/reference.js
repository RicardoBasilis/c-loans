module.exports = function(sequelize,DataTypes) {
    return sequelize.define('reference', {
        referenceId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        reference: {
            type: DataTypes.STRING(60),
            allowNull: true,
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
        comment: 'Información sobre las referencias registradas.\n' +
        'Identificador | Nombre del Garante | Teléfono | Id Cliente | Creado por | En Fecha | Modificado por | En Fecha',
        timestamps: false
    });
};