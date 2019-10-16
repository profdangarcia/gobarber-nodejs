// const { Router } = require('express');  sem o sucrase instalado
import { Router } from 'express';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// middleware global para todas as rotas subsequentes
routes.use(authMiddleware);
routes.put('/users', UserController.update);

// module.exports = routes;
export default routes;
