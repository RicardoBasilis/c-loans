module.exports = function(sequelize, DataTypes) {
    return sequelize.define('users_roles', {
        userId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        roleId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            primaryKey: true
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
        comment: 'Relación entre los usuarios y roles.\n' +
        'Identificador de Usuario | Identificador de Rol | Creado por | En Fecha | Modificado por | En Fecha',
        timestamps: false,
        freezeTableName: true,
        underscored: true
    });
};