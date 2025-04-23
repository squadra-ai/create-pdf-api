import { init, createPDF } from './pdf';
import express from 'express'
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env['PORT'] || 3000;
const app = express();
app.use(express.json());
app.post('/', createPDF);
init().then(() => {
  console.log('PDF generator initialized');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});