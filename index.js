import { port } from './src/utils/environment.js';
import logger from './src/utils/logging.js';
import { app } from './src/utils/web.js';


app.listen(port, () => logger.info(`Server running on port http://localhost:${port}`));
