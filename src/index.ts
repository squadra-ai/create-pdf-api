import { createPDF } from './pdf';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 3000;

// Create Bun server
Bun.serve({
  routes: {
    '/': {
      POST: async (req) => {
        const body = await req.json();
        console.log(`${req.method} ${req.url}`, body);
        const res = await createPDF(body);
        console.log(`Status ${res.status} ${res.ok? '' : await res.clone().text()}`);
        return res;
      }
    }
  },
  port: PORT,
});

console.log(`Server running at http://localhost:${PORT}`);