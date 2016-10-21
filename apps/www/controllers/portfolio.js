'use strict';

const Stocks = require('../../../models/stocks.js');
const PortfolioModel = require('../../../models/portfolio.js');
const Helper = require('../../../lib/helper.js');

const portfolio = module.exports = {};

portfolio.index = function*() {
	try {
        var stocks = yield PortfolioModel.getAll();

        const context = {
            content : yield this.renderView('views/portfolio/list', {
                stocks : stocks
            }),
            page : 'portfolio'
        };

        yield this.render('views/index', context);

    } catch (e) {
        this.throw(e);
    }
}

portfolio.add = function*() {
    let sql = 'SELECT stock_id, stock_code, stock_name FROM stocks';

    try {
        const [stocks] = yield this.db.query({ sql: sql, namedPlaceholders: true }, this.query);

        const context = {
            content : yield this.renderView('views/portfolio/form', {
                stocks : stocks,
                stock : this.flash.formdata || {}
            })
        };

        yield this.render('views/index', context);

    } catch (e) {
        this.throw(e);
    }
};

portfolio.edit = function*() {
    let stock = yield PortfolioModel.get(this.params.id);
    if (!stock) {
        this.throw(404, 'Portfolio not found');
    }

    try {
        let sql = 'SELECT stock_id, stock_code, stock_name FROM stocks';
        const [stocks] = yield this.db.query({ sql: sql, namedPlaceholders: true }, this.query);

        const context = {
            content : yield this.renderView('views/portfolio/form', {
                stocks : stocks,
                stock : stock,
                portfolio_id : this.params.id
            })
        };

        yield this.render('views/index', context);

    } catch (e) {
        this.throw(e);
    }
};

portfolio.delete = function*() {
    let stock = yield PortfolioModel.get(this.params.id);
    if (!stock) {
        this.throw(404, 'Portfolio not found');
    }

    try {
        const context = {
            content : yield this.renderView('views/portfolio/delete', {
                stock : stock,
                portfolio_id : this.params.id
            })
        };

        yield this.render('views/index', context);

    } catch (e) {
        this.throw(e);
    }
};

portfolio.processDelete = function*() {
    let stock = yield PortfolioModel.get(this.params.id);
    if (!stock) {
        this.throw(404, 'Portfolio not found');
    }

    try {
        yield PortfolioModel.delete(this.params.id);

        this.redirect('/portfolio');
    } catch (e) {
        this.throw(e);
    }
};

portfolio.processUpdate = function*() {
    try {
        /* Default user id is 1 */
        const user_id = 1;
        var method = 'insert';

        this.request.body.user_id = user_id;
        this.request.body.status = 1;
        this.request.body.created_date = Helper.now();

        /* check if has watchlist_id */
        if (this.params.id) {
            let portfolio = yield PortfolioModel.get(this.params.id);
            
            if (portfolio) {
                method = 'update';
            }
        }

        if (method == 'update') {
            console.log(this.params.id);
            var id = yield PortfolioModel.update(this.params.id, this.request.body);
        } else {
            var id = yield PortfolioModel.insert(this.request.body);
        }

        console.log(method + ' ' + id);

        this.set('X-Insert-Id', id); // for integration tests

        // return to list of members
        this.redirect('/portfolio');

    } catch (e) {
        // stay on same page to report error (with current filled fields)
        this.flash = { formdata: this.request.body, _error: e.message };
        this.redirect(this.url);
    }
};

portfolio.updatePortfolio = function*()
{
    try {
        var stocks = yield PortfolioModel.getAll();

        var content = yield this.renderView('views/portfolio/list', {
                stocks : stocks
        });

    } catch (e) {
        var content = 'error';
    }

    console.log('Portfolio updated');

    this.emit('update-portfolio-handler', {
        message: 'Reloaded' + new Date() + content
    });
};
