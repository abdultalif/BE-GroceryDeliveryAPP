import { app } from './src/app/web.js';
import dotenv from 'dotenv/config';
const port = process.env.PORT


app.listen(port, () => console.log(`Server running on port http://localhost:${port}`));
