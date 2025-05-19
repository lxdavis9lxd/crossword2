module.exports = (sequelize, DataTypes) => {
  const Achievement = sequelize.define('Achievement', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'CSS class for the achievement icon'
    },
    criteria: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'JSON criteria for awarding this achievement'
    }
  }, {
    timestamps: true
  });

  Achievement.associate = (models) => {
    Achievement.belongsToMany(models.User, { 
      through: 'UserAchievements',
      as: 'achievedBy',
      foreignKey: 'achievementId' 
    });
  };
  
  return Achievement;
};
