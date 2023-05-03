import express from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import cors from 'cors';

const app = express();

// add cors
app.use(cors());

// Define storage for the files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(
            null,
            `${new Date()
                .toLocaleString()
                .replaceAll('/', '.')
                .replaceAll(',', '-')
                .replaceAll(' ', '')}-${file.originalname}`
        );
    },
});

// Create multer object for handling file uploads
const upload = multer({
    storage,
    limits: { fileSize: 100000000 }, // 100MB file size limit
});

// Route for file upload
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded');
    } else {
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${
            req.file.filename
        }`;
        return res.json({ message: 'File has been uploaded', fileUrl });
    }
});

app.post('/', upload.single('picture'), async (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded');
    } else {
        const filePath = `uploads/${req.file.filename}`;
        const filepaath = await optimizeImage(filePath);
        const fileUrl = `${req.protocol}://${req.get('host')}/${filepaath}`;
        return res.json({ message: 'File has been uploaded', fileUrl });
    }
});

async function optimizeImage(filePath) {
    const tempFilePath = `${filePath}-temp`;

    await sharp(filePath)
        .jpeg({ mozjpeg: true })
        .resize(1600)
        .toBuffer()
        .then((data) => sharp(data).webp({ quality: 95 }).toFile(tempFilePath))
        .catch((err) => {
            console.error(err);
            throw err;
        });

    // Delete the original file and return the URL of the optimized image
    fs.unlinkSync(filePath);
    fs.renameSync(tempFilePath, filePath.replace(/\.[^/.]+$/, '.webp'));

    return `${filePath.replace(/\.[^/.]+$/, '.webp')}`;
}

// Serve static files in the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Start the server
const PORT = 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
