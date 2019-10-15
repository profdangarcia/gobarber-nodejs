// const { Router } = require('express');  sem o sucrase instalado
import { Router } from 'express';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello Omni' });
});

// module.exports = routes;
export default routes;
