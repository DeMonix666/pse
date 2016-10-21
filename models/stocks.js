'use strict';


const Lib        = require('../lib/lib.js');
const ModelError = require('./modelerror.js');

const Stocks = module.exports = {};

Stocks.get = function*(id) {
    const [stocks] = yield global.db.query('SELECT * FROM stocks WHERE stock_id = ?', id);
    const stock = stocks[0];
    return stock;
};

Stocks.getByCode = function*(code) {
    const [stocks] = yield global.db.query('SELECT * FROM stocks WHERE stock_code = ?', code);
    const stock = stocks[0];
    return stock;
};

Stocks.getAll = function*(order) {
    order = order || '';

    let sql = `SELECT * FROM stocks `;
        sql += order;

    const [stocks] = yield global.db.query(sql);
    return stocks;
};

Stocks.insert = function*(values) {
    console.log(values);
    try {
        const [result] = yield global.db.query('INSERT INTO stocks SET ?', values);
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
                Lib.logException('Stocks.insert', e);
                throw ModelError(500, e.message); // Internal Server Error
        }
    }
};

Stocks.getAdvances = function*() {
    
    let sql = `SELECT * FROM stocks
        WHERE percent_change > 0
        ORDER BY percent_change DESC, stock_name, stock_code`;

    const [result] = yield global.db.query(sql);
    return result;
};

Stocks.getDeclines = function*() {
    
    let sql = `SELECT * FROM stocks
        WHERE percent_change < 0
        ORDER BY percent_change ASC, stock_name, stock_code`;

    const [result] = yield global.db.query(sql);
    return result;
};

Stocks.update = function*(id, values) {
    try {

        yield global.db.query('UPDATE stocks SET ? WHERE stock_id = ?', [values, id]);
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
                Lib.logException('Stocks.update', e);
                throw ModelError(500, e.message); // Internal Server Error
        }
    }
};