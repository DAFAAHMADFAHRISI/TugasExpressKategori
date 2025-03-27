const connection = require('../config/databases');

class Model_Produk {
    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM produk ORDER BY id DESC',
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async store(data) {
        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO produk SET ?',
                data,
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async getById(id) {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM produk WHERE id = ?',
                [id],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async update(id, data) {
        return new Promise((resolve, reject) => {
            connection.query(
                'UPDATE produk SET ? WHERE id = ?',
                [data, id],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            connection.query(
                'DELETE FROM produk WHERE id = ?',
                [id],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }
}

module.exports = Model_Produk;
