// const { Router } = require('express');  sem o sucrase instalado
import { Router } from 'express';
import UserController from './app/controllers/UserController';

const routes = new Router();

routes.post('/users', UserController.store);

// module.exports = routes;
export default routes;
