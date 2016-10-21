'use strict';


const Lib        = require('../lib/lib.js');
const ModelError = require('./modelerror.js');

const Watchlists = module.exports = {};

Watchlists.get = function*(id) {
    let sql = `SELECT a.*, b.stock_code, b.stock_name, b.price, b.percent_change, b.as_of, a.target_buy / b.price AS diff,
        CASE
            WHEN b.price <= a.target_buy THEN
                0
            WHEN b.price >= a.target_sell THEN
                2
            ELSE
                1
        END AS status,
        (10000 / a.target_buy) * (a.target_sell - a.target_buy) AS estimate
        FROM watchlist AS a JOIN stocks AS b ON b.stock_id = a.stock_id
        WHERE watchlist_id = ?`;

    const [watchlists] = yield global.db.query(sql, id);
    const watchlist = watchlists[0];
    return watchlist;
};

Watchlists.insert = function*(values) {
    try {
    	if (values.target_buy == null || values.target_sell == null || values.stock_id == null) {
	        throw ModelError(403, 'Stock, buy or sell must be supplied');
	    }

        const [result] = yield global.db.query('INSERT INTO watchlist SET ?', values);
        console.log(result.insertId);
        return result.insertId;

    } catch (e) {
        switch (e.code) {
            case 'ER_BAD_NULL_ERROR':
            case 'ER_NO_REFERENCED_ROW_2':
            case 'ER_NO_DEFAULT_FOR_FIELD':
                throw ModelError(403, e.message); // Forbidden
            case 'ER_DUP_ENTRY':
                throw ModelError(409, e.message); // Conflict
            default:
                Lib.logException('Watchlists.insert', e);
                throw ModelError(500, e.message); // Internal Server Error
        }
    }
};

Watchlists.update = function*(id, values) {
    try {
    	if (values.target_buy == null || values.target_sell == null || values.stock_id == null) {
	        throw ModelError(403, 'Stock, buy or sell must be supplied');
	    }

        yield global.db.query('UPDATE watchlist SET ? WHERE watchlist_id = ?', [values, id]);
        return id;

    } catch (e) {
        switch (e.code) {
            case 'ER_BAD_NULL_ERROR':
            case 'ER_NO_REFERENCED_ROW_2':
            case 'ER_NO_DEFAULT_FOR_FIELD':
                throw ModelError(403, e.message); // Forbidden
            case 'ER_DUP_ENTRY':
                throw ModelError(409, e.message); // Conflict
            default:
                Lib.logException('Watchlists.insert', e);
                throw ModelError(500, e.message); // Internal Server Error
        }
    }
};

Watchlists.delete = function*(id) {
    try {

        yield global.db.query('DELETE FROM watchlist WHERE watchlist_id = ?', id);

    } catch (e) {
        switch (e.code) {
            case 'ER_ROW_IS_REFERENCED_': // trailing underscore?
            case 'ER_ROW_IS_REFERENCED_2':
                throw ModelError(403, 'Forbidden'); // Forbidden
            default:
                Lib.logException('Watchlists.delete', e);
                throw ModelError(500, e.message); // Internal Server Error
        }
    }
};

Watchlists.getAll = function*()
{
    /* get watchlist */
    let sql = `SELECT a.*, b.stock_code, b.stock_name, b.price, b.percent_change, b.as_of, a.target_buy / b.price AS diff,
        CASE
            WHEN b.price <= a.target_buy THEN
                0
            WHEN b.price >= a.target_sell THEN
                2
            ELSE
                1
        END AS status,
        (10000 / a.target_buy) * (a.target_sell - a.target_buy) AS estimate
        FROM watchlist AS a JOIN stocks AS b ON b.stock_id = a.stock_id
        WHERE b.companyID <> 0 AND b.securityID <> 0
        ORDER BY favorite DESC, status ASC, as_of DESC, b.percent_change DESC, diff DESC, estimate DESC`;

    const[watchlists] = yield global.db.query(sql);
    return watchlists;
}