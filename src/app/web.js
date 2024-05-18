import express from 'express';
import router from '../router/api.js';
import cors from 'cors';
import { errorMiddleware } from '../middleware/error-middleware.js';
// import { readFileSync } from 'fs';
// import path, { resolve } from 'path';
// import swaggerUi from 'swagger-ui-express';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const swaggerDocs = JSON.parse(readFileSync(resolve(__dirname, '../../docs/swagger.json'), 'utf8'));


export const app = express();
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(router);
app.use(errorMiddleware)