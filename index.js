import express from 'express';
import { readFile, writeFile } from "fs/promises";

import userRouter from './routes/user.routes.js';
import itemRouter from './routes/items.routes.js';
import salesRouter from './routes/sales.routes.js';

const app = express();

const port = 3001;

app.use(express.json());

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.use('/user', userRouter);
app.use('/item', itemRouter);
app.use('/sale', salesRouter);
