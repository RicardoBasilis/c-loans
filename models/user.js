module.exports = function(sequelize,DataTypes) {
    return sequelize.define('user', {
        userId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: DataTypes.STRING(25),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(60),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(70),
            allowNull: true,
            unique: true
        },
        firstName: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        secondName: {
            type: DataTypes.STRING(30),
            allowNull: true
        },
        lastName: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        surName: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true
        },
        profilePicture:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        roleId:{
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: true
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
        comment: 'Información sobre los usuarios registrados.\n' +
        'Identificador | Nombre de Usuario | Contraseña | Nombre1 | Nombre2 | Apellido1 | Apellido2 | Celular | Imagen de Perfil | Creado por | En Fecha | Modificado por | En Fecha',
        timestamps: false
    });
};