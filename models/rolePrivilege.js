module.exports = function(sequelize,DataTypes){
    return sequelize.define('roles_privileges',{
        roleId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            primaryKey: true
        },
        privilegeId: {
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
    },{
        comment: 'Relación entre los roles y privilegios.\n' +
        'Identificador de Rol | Identificador de Privilegio | Creado por | En Fecha | Modificado por | En Fecha',
        timestamps: false,
        freezeTableName: true,
        underscored: true
    });
};
