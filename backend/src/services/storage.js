import mongoose from 'mongoose';
import multer from 'multer';
import { GridFSBucket } from 'mongodb';

let gfsBucket;

export function getBucket() {
  if (!gfsBucket) {
    gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  }
  return gfsBucket;
}

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowed = /image\/(jpeg|jpg|png|webp|heic)/.test(file.mimetype);
    if (allowed) cb(null, true);
    else cb(new Error('Only images (jpeg, png, webp, heic) allowed'));
  },
});

export function saveToGridFS(buffer, metadata) {
  return new Promise((resolve, reject) => {
    const bucket = getBucket();
    const filename = `fabric-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const writeStream = bucket.openUploadStreamWithId(
      new mongoose.Types.ObjectId(),
      filename,
      { metadata }
    );
    writeStream.on('finish', () => resolve(writeStream.id));
    writeStream.on('error', reject);
    writeStream.end(buffer);
  });
}

export function getFileStream(fileId) {
  const bucket = getBucket();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
}

export function deleteFile(fileId) {
  const bucket = getBucket();
  return bucket.delete(new mongoose.Types.ObjectId(fileId));
}
