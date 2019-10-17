// const { Router } = require('express');  sem o sucrase instalado
import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// middleware global para todas as rotas subsequentes
routes.use(authMiddleware);
routes.put('/users', UserController.update);

// a requisição será enviada no campo file
routes.post('/files', upload.single('file'), (req, res) => {
  return res.json({ ok: true });
});

// module.exports = routes;
export default routes;
