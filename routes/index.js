import { Router } from "express";
import users from "./user";
import bucket from "./bucket";
import auth from "./auth";
import passport from "passport";
import blob from "./blob";
import multer from "multer";
import instance from "../functions/FileSystem";
const api = Router();

api.get("/", (req, res) => {
  res.json({ hello: "express.island" });
});

api.use("/users", passport.authenticate("jwt", { session: false }), users);
api.use("/auth", auth);
api.use(
  "/users/:uuid/buckets",
  passport.authenticate("jwt", { session: false }),
  bucket
);
api.use(
  "/users/:uuid/buckets/:id/blobs",
  passport.authenticate("jwt", { session: false }),
  blob
);

export default api;
