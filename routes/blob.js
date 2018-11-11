import { Router } from "express";
import Blob from "../models/blob";
import Bucket from "../models/bucket";
import multer from "multer";
import { pick } from "lodash";
import path from "path";
import mime from "mime-types";
import fs from "fs";
const api = Router({ mergeParams: true });
import instance from "../functions/FileSystem";
const WORKSPACE_DIR = "/opt/Workspace/MyS3";

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let { uuid, id } = req.params;
    const bucket = await Bucket.findOne({
      attributes: ["name"],
      where: { id, user_uuid: uuid }
    });
    await cb(null, path.join(WORKSPACE_DIR, uuid, bucket.name));
  },
  filename: async (req, file, cb) => {
    await cb(null, file.originalname);
  }
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});

api.post("/", upload.single("blob"), async (req, res) => {
  try {
    let name = req.file.filename;
    let path = req.file.path;
    let size = req.file.size;
    let id = req.params.id;
    const blob = new Blob({ name, path, size, bucket_id: id });
    await blob.save();
    res.status(201).json({
      data: `Blob ${blob.name} has been successfully created`,
      meta: { status: 201 }
    });
  } catch (err) {
    res.status(400).json({ err });
  }
});

api.delete("/:b_id", async (req, res) => {
  try {
    const { uuid, id, b_id } = req.params;
    const bucket = await Bucket.findOne({
      attributes: ["name"],
      where: { id, user_uuid: uuid }
    });
    const blob = await Blob.findOne({
      attributes: ["name"],
      where: {
        id: b_id,
        bucket_id: id
      }
    });
    if (blob) {
      instance.removeBlob(uuid, bucket.name, blob.name);
      await Blob.destroy({ where: { id: b_id } });
      res.status(204).end();
    } else {
      res
        .status(400)
        .json({ message: "blob doesn't exist", meta: { status: 201 } });
    }
  } catch (err) {
    res.status(400).json({ err });
  }
});

api.put("/:b_id", async (req, res) => {
  const { uuid, id, b_id } = req.params;
  try {
    const bucket = await Bucket.findOne({
      attributes: ["name"],
      where: { id, user_uuid: uuid }
    });
    const blob = await Blob.findOne({
      attributes: ["name", "id"],
      where: {
        id: b_id,
        bucket_id: id
      }
    });

    if (blob) {
      if (req.body.name !== "") {
        let nameFile = req.body.name + path.extname(blob.name);
        instance.changeNameBlob(uuid, bucket.name, blob.name, nameFile);
        await blob.update({ name: nameFile });
        res.status(204).send();
      } else {
        await blob.update({ name: blob.name });
        res.status(204).send();
      }
    }
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});
api.get("/get/:b_id", async (req, res) => {
  try {
    const { uuid, id, b_id } = req.params;
    const bucket = await Bucket.findOne({
      attributes: ["name"],
      where: { id, user_uuid: uuid }
    });

    const blob = await Blob.findOne({
      attributes: ["name"],
      where: {
        id: b_id,
        bucket_id: id
      }
    });
    let tmpPathFile = instance.retrieveBlob(uuid, bucket.name, blob.name);
    if (tmpPathFile) {
      let type = mime.lookup(tmpPathFile);
      res.writeHead(200, { "Content-Type": type });
      let content = fs.readFileSync(tmpPathFile);
      res.end(content);
    } else {
      res.status(400).json({ res: "file doesn't exist" });
    }
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

api.get("/duplicate/:b_id", async (req, res) => {
  try {
    const { uuid, id, b_id } = req.params;
    const bucket = await Bucket.findOne({
      attributes: ["name"],
      where: { id, user_uuid: uuid }
    });

    const blob = await Blob.findOne({
      attributes: ["name"],
      where: {
        id: b_id,
        bucket_id: id
      }
    });
    let ret = instance.duplicateBlob(uuid, bucket.name, blob.name);
    if (ret) {
      res.status(200).json({ message: "file duplicated" });
    } else {
      res.status(500).json({ message: "server Error" });
    }
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});

api.get("/meta/:b_id", async (req, res) => {
  const { uuid, id, b_id } = req.params;
  try {
    const bucket = await Bucket.findOne({
      attributes: ["name"],
      where: { id, user_uuid: uuid }
    });
    const blob = await Blob.findOne({
      attributes: ["id", "path", "size"],
      where: {
        id: b_id,
        bucket_id: id
      }
    });
    if (blob) {
      res.status(200).json({ data: { blob } });
    }
  } catch (err) {
    res.status(400).json({ err: err.message });
  }
});
export default api;
