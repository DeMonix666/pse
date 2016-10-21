'use strict';

const router = require('koa-router')(); 

const watchlist = require('../controllers/watchlist.js');

router.get('/watchlist', watchlist.index);
router.get('/watchlist/add', watchlist.add);
router.get('/watchlist/:id', watchlist.edit);
router.get('/watchlist/edit/:id', watchlist.edit);
router.get('/watchlist/delete/:id', watchlist.delete);


router.post('/watchlist/edit/:id', watchlist.processUpdate);
router.post('/watchlist/add', watchlist.processUpdate);
router.post('/watchlist/delete/:id', watchlist.processDelete);

module.exports = router.middleware();
