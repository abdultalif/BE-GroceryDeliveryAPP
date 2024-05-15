import express from 'express';
import router from './src/router/api.js';
import cors from 'cors';
import { errorMiddleware } from './src/middleware/error-middleware.js';
import dotenv from 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import swaggerUi from 'swagger-ui-express';

const app = express();
const port = process.env.PORT

const swaggerDocs = JSON.parse(readFileSync(resolve('./docs/swagger.json'), 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(router);
app.use(errorMiddleware)

app.listen(port, () => console.log(`Server running on port http://localhost:${port}`));
