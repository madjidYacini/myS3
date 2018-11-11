import { Model } from "sequelize";

export default class Blob extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: {
            args: true,
            msg: "bucket already in use"
          }
        },
        path: {
          type: DataTypes.STRING,
          allowNull: false
        },
        size: {
          type: DataTypes.INTEGER,
          allowNull: false
        }
      },
      {
        sequelize
      }
    );
  }
}
