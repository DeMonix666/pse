'use strict';

const router = require('koa-router')(); 

const portfolio = require('../controllers/portfolio.js');

router.get('/portfolio', portfolio.index);
router.get('/portfolio/add', portfolio.add);
router.get('/portfolio/:id', portfolio.edit);
router.get('/portfolio/edit/:id', portfolio.edit);
router.get('/portfolio/delete/:id', portfolio.delete);

router.post('/portfolio/edit/:id', portfolio.processUpdate);
router.post('/portfolio/add', portfolio.processUpdate);
router.post('/portfolio/delete/:id', portfolio.processDelete);

module.exports = router.middleware();
