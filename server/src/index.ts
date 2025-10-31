import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database';
import { authRouter } from './auth';
import { dataRouter } from './data';
import { usersRouter } from './users';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/data', dataRouter);
app.use('/api/users', usersRouter);

app.get('/', (req, res) => {
  res.send('Finaura Backend is running!');
});

initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});