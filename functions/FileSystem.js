import fs from "fs";
import path from "path";
import multer from "multer";
import mime from "mime-types";
const WORKSPACE_DIR = "/opt/Workspace/MyS3";
const DUPLICATE_FILE = ".copy.$NB";
class Filesystem {
  constructor() {
    if (!Filesystem.instance) {
      this.initialize();
    }
  }
  initialize() {}
  addUserWorkspace(user) {
    let tmpDir = path.join(WORKSPACE_DIR, user);
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }
  }
  createBucket(user, workspace) {
    try {
      let tmpDir = path.join(WORKSPACE_DIR, user, workspace);
      console.log(tmpDir);

      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
        return true;
      }
      return false;
    } catch (er) {
      throw new Error(err);
    }
  }
  removeBucket(user, bucketName) {
    try {
      let tmpDir = path.join(WORKSPACE_DIR, user, bucketName);
      if (fs.existsSync(tmpDir)) {
        fs.rmdirSync(tmpDir);
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  createBlob(user, bucketName, blobName) {}
  removeBlob(user, bucketName, blobName) {
    try {
      let tmpPathFile = path.join(WORKSPACE_DIR, user, bucketName, blobName);

      if (fs.existsSync(tmpPathFile)) {
        fs.unlinkSync(tmpPathFile);
      }
    } catch (err) {
      throw new Error(err);
    }
  }
  retrieveBlob(user, bucketName, blobName) {
    try {
      let tmpPathFile = path.join(WORKSPACE_DIR, user, bucketName, blobName);

      if (!fs.existsSync(tmpPathFile)) {
        return null;
      }
      return tmpPathFile;
    } catch (err) {
      throw new Error(err);
    }
  }
  changeNameBlob(user, bucketName, blobName, newName) {
    try {
      let oldPathFile = path.join(WORKSPACE_DIR, user, bucketName, blobName);
      let newPathFile = path.join(WORKSPACE_DIR, user, bucketName, newName);
      if (fs.existsSync(oldPathFile)) {
        fs.renameSync(oldPathFile, newPathFile);
      }
    } catch (err) {
      throw new Error(err);
    }
  }
  duplicateBlob(user, bucketName, blobName) {
    try {
      let tmpPathFile = path.join(WORKSPACE_DIR, user, bucketName, blobName);
      var fileDupName = [
        blobName.slice(0, blobName.indexOf(".")),
        DUPLICATE_FILE,
        blobName.slice(blobName.indexOf("."))
      ].join("");
      let newFileDuplicate = path.join(
        WORKSPACE_DIR,
        user,
        bucketName,
        fileDupName
      );
      fs.createReadStream(tmpPathFile).pipe(
        fs.createWriteStream(newFileDuplicate)
      );
      if (fs.existsSync(newFileDuplicate)) {
        return true;
      }
      return false;
    } catch (err) {
      throw new Error(err);
    }
  }
}
const instance = new Filesystem();
Object.freeze(instance);
export default instance;
