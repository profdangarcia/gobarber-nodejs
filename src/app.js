// SEM O SUCRASE
// const express = require('express');
// const routes = require('./routes');
import 'dotenv/config'; // variaveis globais no formato: process.env.<variavel>
import express from 'express';
import path from 'path';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import sentryConfig from './config/sentry';
// express-async-errors precisa vir antes das rotas
import 'express-async-errors';
import routes from './routes';

import './database';

class App {
  // constructor sempre será chamado ao se instanciar a classe
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);
    // foi colocado dentro dos middlewares
    // this.server.use(Sentry.Handlers.requestHandler());

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();
        return res.status(500).json(errors);
      }
      return res.status(500).json({ error: 'internal server error' });
    });
  }
}

// module.exports = new App().server;  sem sucrase
export default new App().server;
