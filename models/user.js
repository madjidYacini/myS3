import { Model } from "sequelize";
const MIN_PASSWORD_LENGHT = 7;
import bcrypt from "bcrypt";

export default class User extends Model {
  static init(sequelize, DataTypes) {
    return super.init(
      {
        uuid: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isEmail: true
          },
          unique: {
            args: true,
            msg: "email address already in use"
          }
        },
        nickname: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: {
            args: true,
            msg: "nickname already in use"
          }
        },
        password: {
          type: DataTypes.VIRTUAL,
          validate: {
            isLongEnough(val) {
              if (val.lenght < MIN_PASSWORD_LENGHT) {
                throw new Error("Password too short");
              }
            }
          }
        },
        password_confirmation: {
          type: DataTypes.VIRTUAL,
          validate: {
            isEqual(val) {
              if (this.password !== val) {
                throw new Error("Password are not equal");
              }
            }
          }
        },
        password_digest: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            notEmpty: true
          }
        }
      },
      {
        sequelize,
        hooks: {
          async beforeValidate(user, options) {
            if (user.isNewRecord) {
              const SALT_ROUD = 10;
              const hash = await bcrypt.hash(user.password, SALT_ROUD);
              if (hash === null) {
                throw new Error("Can not hash password");
              }
              user.password_digest = hash;
            }
          },
          async beforeSave(user, options) {
            if (user.changed("password")) {
              if (user.password !== user.password_confirmation) {
                throw new Error("Password conf doesn't match");
              }
              const SALT_ROUNDS = 10;
              let hash = await bcrypt.hash(user.password, SALT_ROUNDS);
              if (!hash) {
                throw new Error("can't hash password");
              }
              user.password_digest = hash;
            }
          }
        }
      }
    );
  }

  async checkPassword(password) {
    return await bcrypt.compare(password, this.password_digest);
  }
  toJSON() {
    const obj = Object.assign({}, this.get());
    delete obj.password_digest;
    return obj;
  }
}
