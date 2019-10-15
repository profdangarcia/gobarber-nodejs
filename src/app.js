// SEM O SUCRASE
// const express = require('express');
// const routes = require('./routes');

import express from 'express';
import routes from './routes';

class App {
  // constructor sempre será chamado ao se instanciar a classe
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
  }
}

// module.exports = new App().server;  sem sucrase
export default new App().server;
