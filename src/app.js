// SEM O SUCRASE
// const express = require('express');
// const routes = require('./routes');

import express from 'express';
import path from 'path';
import routes from './routes';
// não é necessário o index.js
import './database';

class App {
  // constructor sempre será chamado ao se instanciar a classe
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }
}

// module.exports = new App().server;  sem sucrase
export default new App().server;
