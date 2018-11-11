import { Router } from "express";
import User from "../models/user";
import { pick } from "lodash";

const api = Router();

api.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ data: { users }, meta: {} });
  } catch (err) {
    res
      .status(400)
      .json({ err: `could not connect to database, err: ${err.message}` });
  }
});

api.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({ user });
  } catch (err) {
    res
      .status(400)
      .json({ err: `could not connect to database, err: ${err.message}` });
  }
});
api.put("/:id", async (req, res) => {
  try {
    const user = await User.findOne({ where: { uuid: req.params.id } });
    if (user) {
      const fields = pick(req.body, [
        "nickname",
        "email",
        "password",
        "password_confirmation"
      ]);

      await user.update(fields);
      res.status(204).send();
    }
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

api.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await User.destroy({
        where: {
          uuid: req.params.id
        }
      });
      res.status(204).send();
    }
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

export default api;
