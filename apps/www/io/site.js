'use strict';

const koa = require('koa.io');

const app = koa();

const site = require('../controllers/site.js');
const watchlist = require('../controllers/watchlist.js');
const portfolio = require('../controllers/portfolio.js');

app.io.route('update-stocks', site.updateStocks);
app.io.route('update-watchlist', watchlist.updateWatchlist);
app.io.route('update-portfolio', portfolio.updatePortfolio);
app.io.route('update-advances', site.updateAdvances);
app.io.route('update-declines', site.updateDeclines);
app.io.route('update-activities', site.updateActivities);
