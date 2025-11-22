const User = require('./User');
const RefreshToken = require('./RefreshToken');

// Define associations
RefreshToken.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

User.hasMany(RefreshToken, {
  foreignKey: 'user_id',
  as: 'refreshTokens',
});

module.exports = {
  User,
  RefreshToken,
};


