module.exports = (sequelize, DataTypes) => {
  const Puzzle = sequelize.define('Puzzle', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    level: {
      type: DataTypes.STRING,
      allowNull: false
    },
    puzzleData: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: true
  });

  // Define associations if needed
  Puzzle.associate = function(models) {
    // example: Puzzle.belongsTo(models.User);
  };

  return Puzzle;
};
