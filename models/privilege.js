module.exports = function(sequelize,DataTypes){
    return sequelize.define('privilege',{
        privilegeId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            primaryKey: true
        },
        description: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true
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
        comment: 'Información sobre los privilegios existentes.\n' +
        'Identificador | Descripción | Creado por | En Fecha | Modificado por | En Fecha',
        timestamps: false
    });
};