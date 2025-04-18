var express = require('express')
var router = express.Router()
var usersModel = require('../../model/Model_Users')

// Route untuk menampilkan halaman register (GET)
router.get('/', (req, res) => {
    res.render('register', { 
        title: 'Register',
        errorMessage: req.query.error,
        successMessage: req.query.success
    });
});

// Route untuk register API dan web form (POST)
router.post('/', async (req, res) => {
    const { username, password, email } = req.body;
    
    // Cek apakah request berasal dari Postman/API client
    const isApiRequest = req.get('User-Agent')?.includes('Postman') || 
                        req.get('Accept')?.includes('application/json') ||
                        req.xhr;
    
    // Validasi input
    if (!username) {
        if (isApiRequest) {
            return res.status(400).json({ message: 'Username harus di isi' });
        } else {
            return res.render('register', { 
                title: 'Register',
                errorMessage: 'Username harus di isi'
            });
        }
    } else if (!password) {
        if (isApiRequest) {
            return res.status(400).json({ message: 'Password harus di isi' });
        } else {
            return res.render('register', { 
                title: 'Register',
                errorMessage: 'Password harus di isi'
            });
        }
    }

    try {
        const existingUser = await usersModel.getByUsername(username);
        if (existingUser) {
            if (isApiRequest) {
                return res.status(400).json({ message: 'Username sudah digunakan' });
            } else {
                return res.render('register', { 
                    title: 'Register',
                    errorMessage: 'Username sudah digunakan'
                });
            }
        }

        await usersModel.registerUser(username, password);
        
        if (isApiRequest) {
            // API response
            return res.status(201).json({ 
                status: true,
                message: 'Register berhasil' 
            });
        } else {
            // Web form response
            return res.redirect('/login?success=Pendaftaran berhasil, silakan login');
        }
    } catch (error) {
        if (isApiRequest) {
            // API response
            return res.status(500).json({ 
                status: false,
                message: error.message 
            });
        } else {
            // Web form response
            return res.render('register', { 
                title: 'Register',
                errorMessage: error.message || 'Terjadi kesalahan saat mendaftar'
            });
        }
    }
});

module.exports = router