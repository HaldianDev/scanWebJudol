import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import scanRouter from './routes/scan.js'; // Pastikan path benar

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

app.use(cors());

// Melayani file statis dari direktori 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Tambahkan prefix /api/scan untuk router
app.use('/api/scan', scanRouter);

// Jalankan server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
