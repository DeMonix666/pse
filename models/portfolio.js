'use strict';

const Lib        = require('../lib/lib.js');
const ModelError = require('./modelerror.js');

const Portfolio = module.exports = {};

Portfolio.get = function*(id) {
    const [portfolios] = yield global.db.query(`SELECT a.*, b.stock_code, b.stock_name, b.price AS stock_price, b.percent_change, b.as_of
        FROM portfolio AS a 
        JOIN stocks AS b ON b.stock_id = a.stock_id
        WHERE a.portfolio_id = ?`, id);

    const portfolio = portfolios[0];
    return portfolio;
};

Portfolio.insert = function*(values) {
    try {
    	if (values.shares == null || values.price == null) {
	        throw ModelError(403, 'shares or price must be supplied');
	    }

        const [result] = yield global.db.query('INSERT INTO portfolio SET ?', values);
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
                Lib.logException('Portfolio.insert', e);
                throw ModelError(500, e.message); // Internal Server Error
        }
    }
};

Portfolio.update = function*(id, values) {
    try {
        yield global.db.query('UPDATE portfolio SET ? WHERE portfolio_id = ?', [values, id]);
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
                Lib.logException('Portfolio.insert', e);
                throw ModelError(500, e.message); // Internal Server Error
        }
    }
};

Portfolio.delete = function*(id) {
    try {

        yield global.db.query('DELETE FROM portfolio WHERE portfolio_id = ?', id);

    } catch (e) {
        switch (e.code) {
            case 'ER_ROW_IS_REFERENCED_': // trailing underscore?
            case 'ER_ROW_IS_REFERENCED_2':
                throw ModelError(403, 'Forbidden'); // Forbidden
            default:
                Lib.logException('Portfolio.delete', e);
                throw ModelError(500, e.message); // Internal Server Error
        }
    }
};

Portfolio.getAll = function*(order) 
{
    order = order || '';

    let sql = `
        SELECT 
        a.*, 
        b.stock_code, b.stock_name, b.price AS stock_price, b.percent_change, b.as_of,
        (b.price - a.price) * shares AS loss,
        round(((b.price / a.price) * 100) - 100, 2) AS gainPercent,
        a.price * a.shares AS total,
        (a.price * a.shares) + ((b.price - a.price) * shares) AS balance
        FROM portfolio AS a
        JOIN stocks AS b ON b.stock_id = a.stock_id
    `;

    sql += order;

    const [portfolios] = yield global.db.query(sql);
    return portfolios;
}
