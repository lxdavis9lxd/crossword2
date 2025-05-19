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
    puzzleData: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: true
  });
  
  return Puzzle;
};
