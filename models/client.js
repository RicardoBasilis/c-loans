module.exports = function(sequelize,DataTypes) {
    return sequelize.define('client', {
        clientId: {
            type: DataTypes.INTEGER(11).UNSIGNED,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        firstNames: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        lastNames: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        sexo: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        idCard: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        birthDate: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        cellPhone: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        phoneNumber: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        nacionality: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        homeKind: {
            type: DataTypes.STRING(15),
            allowNull: true
        },
        address: {
            type: DataTypes.STRING(60),
            allowNull: true
        },
        civilState: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        profilePicture:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        workState: {
            type: DataTypes.STRING(20),
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
        comment: 'Información sobre los clientes registrados.\n' +
        'Identificador | Nombres | Apellidos | Sexo | Cedula | Fecha de Nacimiento | Celular | Teléfono | Nacionalidad | Tipo Vivienda ' +
        '| Dirección | Estado Civil | Imagen de Perfil | Estado Laboral | Creado por | En Fecha | Modificado por | En Fecha',
        timestamps: false
    });
};