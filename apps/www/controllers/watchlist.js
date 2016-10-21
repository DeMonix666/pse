'use strict';

const Stocks = require('../../../models/stocks.js');
const WatchlistsModel = require('../../../models/watchlists.js');

const watchlist = module.exports = {};

watchlist.index = function*() {
    try {
        var stocks = yield WatchlistsModel.getAll();

        const context = {
            content : yield this.renderView('views/watchlist/list', {
                stocks : stocks
            }),
            page : 'watchlist'

        };

        yield this.render('views/index', context);

    } catch (e) {
        this.throw(e);
    }
};

watchlist.add = function*() {
    let sql = 'SELECT stock_id, stock_code, stock_name FROM stocks';

    try {
        const [stocks] = yield this.db.query({ sql: sql, namedPlaceholders: true }, this.query);

        const context = {
            content : yield this.renderView('views/watchlist/form', {
                stocks : stocks,
                stock : this.flash.formdata || {}
            })
        };

        yield this.render('views/index', context);

    } catch (e) {
        this.throw(e);
    }
};

watchlist.edit = function*() {
    let stock = yield WatchlistsModel.get(this.params.id);
    if (!stock) {
        this.throw(404, 'Watchlist not found');
    }

    try {
        let sql = 'SELECT stock_id, stock_code, stock_name FROM stocks';
        const [stocks] = yield this.db.query({ sql: sql, namedPlaceholders: true }, this.query);

        const context = {
            content : yield this.renderView('views/watchlist/form', {
                stocks : stocks,
                stock : stock,
                watchlist_id : this.params.id
            })
        };

        yield this.render('views/index', context);

    } catch (e) {
        this.throw(e);
    }
};

watchlist.delete = function*() {
    let stock = yield WatchlistsModel.get(this.params.id);
    if (!stock) {
        this.throw(404, 'Watchlist not found');
    }

    try {
        const context = {
            content : yield this.renderView('views/watchlist/delete', {
                stock : stock,
                watchlist_id : this.params.id
            })
        };

        yield this.render('views/index', context);

    } catch (e) {
        this.throw(e);
    }
};

watchlist.processDelete = function*() {
    let stock = yield WatchlistsModel.get(this.params.id);
    if (!stock) {
        this.throw(404, 'Watchlist not found');
    }

    try {
        yield WatchlistsModel.delete(this.params.id);

        this.redirect('/watchlist');
    } catch (e) {
        this.throw(e);
    }
};

watchlist.processUpdate = function*() {
    try {
        /* Default user id is 1 */
        const user_id = 1;
        var method = 'insert';

        this.request.body.user_id = user_id;
        this.request.body.pse_link = this.request.body.pse_link || '';

        /* check if has watchlist_id */
        if (this.params.id) {
            let watchlist = yield WatchlistsModel.get(this.params.id);
            
            if (watchlist) {
                method = 'update';
            }
        }

        if (method == 'update') {
            console.log(this.params.id);
            var id = yield WatchlistsModel.update(this.params.id, this.request.body);
        } else {
            var id = yield WatchlistsModel.insert(this.request.body);
        }

        console.log(method + ' ' + id);

        this.set('X-Insert-Id', id); // for integration tests

        // return to list of members
        this.redirect('/watchlist');

    } catch (e) {
        // stay on same page to report error (with current filled fields)
        this.flash = { formdata: this.request.body, _error: e.message };
        this.redirect(this.url);
    }


};

watchlist.updateWatchlist = function*(next, message)
{
    try {
        var stocks = yield WatchlistsModel.getAll();

        var content = yield this.renderView('views/watchlist/list', {
            stocks : stocks
        });

    } catch (e) {
        var content = 'error ';
    }

    console.log('Watchlist updated');

    this.emit('update-watchlist-handler', {
        message: 'Reloaded ' + new Date() + content
    });
};