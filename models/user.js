module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        firstName: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: { 
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, {});
    
    User.associate = function(models) {
        User.hasMany(models.ApiKey, { foreignKey: 'userId', as: 'apiKeys' });
    };

    return User;
};