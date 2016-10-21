'use strict';

const router = require('koa-router')(); 

const site = require('../controllers/site.js');

router.get('/', site.home);
router.get('/declines', site.declines);
router.get('/advances', site.advances);
router.get('/activities', site.activities);
router.get('/socket.io', site.home);

module.exports = router.middleware();
