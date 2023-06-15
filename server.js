const express = require('express');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());
// app.use(cors({
//   origin: ["http://localhost:3000", "https://mern-image-app.onrender.com"],
// }));
// app.use(express.static(path.join(__dirname, '../client/build')));
// app.get('*', function(req, res){
//   res.sendFile(path.join(__dirname, "../client/build/index.html"));
// });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'uploads'),
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  const upload = multer({ storage });
  
  
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Set up the database
mongoose.connect('mongodb+srv://tirthofficials:RUp1IgU7FGkb7UvR@cluster0.1qnflav.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define the image schema and model
const imageSchema = new mongoose.Schema({
  filename: String,
  path: String,
});
const Image = mongoose.model('Image', imageSchema);

// Handle image upload
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const { filename, path } = req.file;

  try {
    const image = new Image({ filename, path });
    await image.save();
    res.json({ message: 'Image uploaded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Fetch all uploaded images
app.get('/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Delete an image by ID
app.delete('/images/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Image.findByIdAndDelete(id);
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

