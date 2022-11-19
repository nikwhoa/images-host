import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import cors from 'cors';

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const PORT = 3002;
app.use('/public', express.static('public'));
app.use(cors());

app.get('/', (req, res) => {
    res.json({ message: 'all is gonna be okay' });
});

app.post('/', upload.single('picture'), async (req, res) => {
    const { buffer, originalname } = req.file;
    // const timestamp = new Date().toISOString();
    const ref = `${new Date().toISOString()}-${originalname}.webp`;
    await sharp(buffer)
        .webp({ quality: 95 })
        .jpeg({ mozjpeg: true })
        .resize(1600)
        .toFile('./public/' + ref);
    const link = `http://images.norenko.net.ua/public/${ref}`;
    return res.json({ message: 'Image has been uploaded', link })
})

app.listen(PORT, () => console.log(`server started on port ${PORT}`));