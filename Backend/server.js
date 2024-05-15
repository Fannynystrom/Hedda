import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import multerS3 from 'multer-s3';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const pictureSchema = new mongoose.Schema({
  month: String,
  uri: String,
});

const Picture = mongoose.model('Picture', pictureSchema);

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString());
    },
  }),
});

app.post('/upload', upload.single('image'), (req, res) => {
  const newPicture = new Picture({
    month: req.body.month,
    uri: req.file.location,
  });

  newPicture.save()
    .then(() => res.send('Image uploaded successfully'))
    .catch((err) => res.status(500).send(err));
});

app.get('/pictures', (req, res) => {
  Picture.find()
    .then((pictures) => res.json(pictures))
    .catch((err) => res.status(500).send(err));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
