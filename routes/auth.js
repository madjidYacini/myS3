import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/user";
import Mailer from "../lib/mail";
import instance from "../functions/FileSystem";

const api = Router();

api.post("/register", async (req, res) => {
  const { nickname, email, password, password_confirmation } = req.body;
  try {
    const user = new User({
      nickname,
      email,
      password,
      password_confirmation
    });
    await user.save();
    Mailer.send(
      user.email,
      "Welcome",
      `Hello ${user.nickname}`,
      `<h1>Hello ${user.nickname}</h1>`
    );

    const payload = { uuid: user.uuid, nickname, email };
    const token = jwt.sign(payload, process.env.JWT_ENCRYPTION);
    res.status(201).json({ data: { user }, meta: { token } });
    instance.addUserWorkspace(user.uuid);
  } catch (err) {
    res.status(400).json({ err });
  }
});

api.post("/login", (req, res) => {
  passport.authenticate("local", { session: false }, (err, user, message) => {
    if (err) {
      res.status(400).json({ err });
    }

    const { uuid, nickname, email } = user.toJSON();
    const payload = { uuid: user.uuid, nickname, email };
    const token = jwt.sign(payload, process.env.JWT_ENCRYPTION);
    res
      .status(200)
      .json({ data: { user: { uuid, nickname, email } }, meta: { token } });
  })(req, res);
});

export default api;
