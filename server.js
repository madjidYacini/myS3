import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import passport from "passport";
import { mLog } from "./lib/utils";
import { db as database } from "./models";
import routes from "./routes";
import "./middlewares/passport";

dotenv.config();
const port = parseInt(process.argv[2], 10) || process.env.PORT;

const app = express();

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const start = async () => {
  try {
    await database.authenticate();
    if (process.env.APP === "development") {
      database.sync({ force: false });
    }

    app.use("/api", routes);

    app.listen(port, err => {
      if (err) {
        throw err;
      } else {
        // mLog(`server is running on port: ${port}`, "cyan");
        console.log(`server is running on port: ${port}`);
      }
    });
  } catch (e) {
    throw e;
  }
};

start();
