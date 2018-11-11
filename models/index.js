import Sequelize, { Op } from "sequelize";
import User from "./user";
import dotenv from "dotenv";
import Bucket from "./bucket";
import Blob from "./blob";

dotenv.config();

export const db = new Sequelize(process.env.DATABSE_URL, {
  operatorsAliases: Op,
  define: {
    underscored: true
  }
});

User.init(db, Sequelize);
Bucket.init(db, Sequelize);
Blob.init(db, Sequelize);

// RELATION USER ---> BUCKET
User.hasMany(Bucket);
Bucket.belongsTo(User, { constraints: false });

// RELATION BUCKET ---> BLOB
Bucket.hasMany(Blob);
Blob.belongsTo(Bucket, { constraints: false });
