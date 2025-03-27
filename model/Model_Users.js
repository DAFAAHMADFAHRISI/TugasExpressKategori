const connection = require('../config/databases')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

class Model_Users {
    static async getAll() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT id, username, created_at FROM users ORDER BY id DESC', (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }

    static async Store(Data) {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO users SET ?', Data, (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }

    static async getId() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT id, username, created_at FROM users WHERE id = ?', (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }

    static async Update(id, Data) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE users SET ? WHERE id = ?', [Data, id], (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }

    static async Delete(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM users WHERE id = ?', [id], (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            })
        })
    }

    static async getByUsername(username) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
                if (err) reject(err)
                else resolve(rows[0])
            })
        })
    }

    static async registerUser(username, password) {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedPassword = await bcrypt.hash(password, 10)
                connection.query(
                    'INSERT INTO users (username, password) VALUES (?, ?)',
                    [username, hashedPassword],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    static async login(username, password) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE username = ?';
            connection.query(sql, [username], async (err, results) => {
                if (err) return reject({ status: 500, message: 'Error pada server', error: err });

                if (results.length === 0) {
                    return reject({ status: 401, message: 'Username tidak ditemukan' });
                }

                const user = results[0];
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return reject({ status: 401, message: 'Password salah' });
                }

                const token = jwt.sign(
                    {
                        id: user.id,
                        username: user.username,
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                resolve({ token });
            });
        });
    }
}

module.exports = Model_Users