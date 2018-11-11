import { Router } from "express";
import Bucket from "../models/bucket";
const api = Router();
import instance from "../functions/FileSystem";

api.post("/", async (req, res) => {
  try {
    const { uuid } = req.user;
    const { name } = req.body;
    const bucket = new Bucket({ name, user_uuid: uuid });
    await bucket.save();
    let ret = instance.createBucket(uuid, name);
    if (ret) {
      res.status(200).json({ message: " bucket created" });
    } else {
      res.status(208).json({ error: "file already exists" });
    }
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});
api.delete("/:id", async (req, res) => {
  try {
    const { uuid } = req.user;
    const { id } = req.params;
    const bucket = await Bucket.findOne({
      attributes: ["id", "name"],
      where: { user_uuid: uuid, id }
    });
    if (bucket) {
      instance.removeBucket(uuid, bucket.name);
      await Bucket.destroy({ where: { id: bucket.id } });

      res.status(204).end();
    } else {
      res.status(404).json({ message: "bucket deleted" });
    }
  } catch (err) {
    res.status(400).json({ err: err });
  }
});

api.head("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const bucket = await Bucket.findOne({
      where: {
        id
      }
    });
    if (bucket) {
      res.status(200).send();
    } else {
      res.status(400).send();
    }
  } catch (err) {
    res.status(400).json({ err: err });
  }
});
export default api;
