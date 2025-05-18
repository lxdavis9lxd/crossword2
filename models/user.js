module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    progress: {
      type: DataTypes.TEXT, // Stored as JSON string
      allowNull: true,
      defaultValue: '{}',
      get() {
        const rawValue = this.getDataValue('progress');
        if (rawValue) {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return {};
          }
        }
        return {};
      },
      set(value) {
        let valueToStore = value;
        if (typeof value === 'object') {
          valueToStore = JSON.stringify(value);
        }
        this.setDataValue('progress', valueToStore);
      }
    }
  }, {
    timestamps: true
  });

  return User;
};
