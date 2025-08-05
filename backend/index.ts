import { PORT } from './config/env.js';
import express from 'express';

const app = express();

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});