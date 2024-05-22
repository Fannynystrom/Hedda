import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const pictureSchema = new mongoose.Schema({
  month: String,
  uri: String,
});

const Picture = mongoose.model('Picture', pictureSchema);

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to get pictures
app.get('/pictures', (req, res) => {
  Picture.find()
    .then((pictures) => res.json(pictures))
    .catch((err) => res.status(500).send(err));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
