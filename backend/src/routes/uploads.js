import { Router } from 'express';
import { authGuard } from '../middleware/auth.js';
import { saveToGridFS, getFileStream, deleteFile, upload } from '../services/storage.js';

const router = Router();

router.use(authGuard);

const maxCount = 5;
router.post('/fabric', upload.array('images', maxCount), async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ error: 'No images uploaded' });
  }
  try {
    const ids = [];
    for (const f of req.files) {
      const id = await saveToGridFS(f.buffer, {
        tailorId: req.user._id.toString(),
        mimetype: f.mimetype,
      });
      ids.push(id);
    }
    res.json({ ids });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.get('/fabric/:fileId', (req, res) => {
  try {
    const stream = getFileStream(req.params.fileId);
    stream.on('error', () => res.status(404).send('Not found'));
    stream.pipe(res);
  } catch {
    res.status(404).send('Not found');
  }
});

router.delete('/fabric/:fileId', async (req, res) => {
  try {
    await deleteFile(req.params.fileId);
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
