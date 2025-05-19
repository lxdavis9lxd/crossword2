module.exports = (sequelize, DataTypes) => {
  const Puzzle = sequelize.define('Puzzle', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    level: {
      type: DataTypes.ENUM('easy', 'intermediate', 'advanced'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    difficultyRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 3,
      validate: {
        min: 1,
        max: 5
      },
      comment: 'Difficulty rating from 1 (very easy) to 5 (very hard)'
    },
    puzzleData: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: true
  });
  
  return Puzzle;
};
