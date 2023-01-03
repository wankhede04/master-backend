import { Router } from 'express';

import { signin, refresh } from '../controller/auth';

const router = Router();

export default (): Router => router.use([signin(), refresh()]);
