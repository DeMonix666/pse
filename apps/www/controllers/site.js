'use strict';

const koa = require('koa.io');

const app = koa();
const dateFormat = require('dateformat');

const StockModel = require('../../../models/stocks.js');

const site = module.exports = {};

site.home = function*() {
    
    /*  
    let sql = 'SELECT * FROM stocks';

    if (this.querystring) {
        const filter = Object
            .keys(this.query)
            .map(function(q) { 
                return q + ' = :' + q; 
            })
            .join(' AND ');

        sql += ' WHERE '+filter;
    }
    sql +=  ' ORDER BY stock_name, stock_code';
    */

    try {
        var stocks = yield StockModel.getAll(`ORDER BY stock_name, stock_code`);

        const context = {
            content : yield this.renderView('views/stocks-list', {
                stocks : stocks
            }),
            page : 'stocks'
        };

        yield this.render('views/index', context);

    } catch (e) {
        this.throw(e);
    }
};

site.declines = function*() {
    /* get stocks */
    try {
        var stocks = yield StockModel.getDeclines();

        const context = {
            content : yield this.renderView('views/stocks-list', {
                stocks : stocks
            }),
            page : 'declines'
        };

        yield this.render('views/index', context);

    } catch (e) {
        this.throw(e);
    }
};

site.advances = function*() {
    /* get stocks */
    try {
        var stocks = yield StockModel.getAdvances();

        const context = {
            content : yield this.renderView('views/stocks-list', {
                stocks : stocks
            }),
            page : 'advances'
        };

        yield this.render('views/index', context);

    } catch (e) {
        this.throw(e);
    }
};

site.activities = function*() {
    try {
        var stocks = yield StockModel.getAll(`ORDER BY percent_change DESC, stock_name, stock_code`);

        const context = {
            content : yield this.renderView('views/stocks-list', {
                stocks : stocks
            }),
            page : 'activities'
        };

        yield this.render('views/index', context);

    } catch (e) {
        this.throw(e);
    }
};


/**
 *IO auto update area 
 */
site.updateStocks = function*(next, message)
{
    try {
        var stocks = yield StockModel.getAll(`ORDER BY stock_name, stock_code`);

        var content = yield this.renderView('views/stocks-list', {
            stocks : stocks
        });

    } catch (e) {
        var content = 'error ';
    }

    console.log('Stocks updated');

    this.emit('update-stocks-handler', {
        message: 'Reloaded' + new Date() + content
    });
};

site.updateAdvances = function*(next, message)
{
    try {
        var stocks = yield StockModel.getAdvances();

        var content = yield this.renderView('views/stocks-list', {
            stocks : stocks
        });

    } catch (e) {
        var content = 'error ';
    }

    console.log('Advances updated');

    this.emit('update-advances-handler', {
        message: 'Reloaded' + new Date() + content
    });
};

site.updateDeclines = function*() {
    try {
        var stocks = yield StockModel.getDeclines();

        var content = yield this.renderView('views/stocks-list', {
            stocks : stocks
        });

    } catch (e) {
        var content = 'error';
    }

    console.log('Declines updated');

    this.emit('update-declines-handler', {
        message: 'Reloaded' + new Date() + content
    });
};

site.updateActivities = function*() {
    try {
        var stocks = yield StockModel.getAll(`ORDER BY percent_change DESC, stock_name, stock_code`);

        var content = yield this.renderView('views/stocks-list', {
            stocks : stocks
        });

    } catch (e) {
        var content = 'error';
    }

    console.log('Activities updated');

    this.emit('update-activities-handler', {
        message: 'Reloaded' + new Date() + content
    });
};