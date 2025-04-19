var express = require('express')
var router = express.Router()
var usersModel = require('../../model/Model_Users')
const rateLimit = require('express-rate-limit')


const loginLimiter = rateLimit({
    windowMs: 7 * 60 * 1000, 
    max: 3, 
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: false,
        message: "Terlalu banyak percobaan login gagal. Silakan coba lagi setelah 7 menit."
    },
    skipSuccessfulRequests: true 
})


// github

// Route untuk menampilkan halaman login (GET)
router.get('/', (req, res) => {
    res.render('login', { 
        title: 'Login',
        errorMessage: req.query.error,
        successMessage: req.query.success
    });
});

// Route untuk login API dan web form (POST)
router.post('/', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    
    // Cek apakah request berasal dari Postman/API client
    const isApiRequest = req.get('User-Agent')?.includes('Postman') || 
                        req.get('Accept')?.includes('application/json') ||
                        req.xhr;
    
    // Validasi input
    if (!username) {
        if (isApiRequest) {
            return res.status(400).json({ message: 'Username harus di isi' });
        } else {
            return res.render('login', { 
                title: 'Login',
                errorMessage: 'Username harus di isi'
            });
        }
    } else if (!password) {
        if (isApiRequest) {
            return res.status(400).json({ message: 'Password harus di isi' });
        } else {
            return res.render('login', { 
                title: 'Login',
                errorMessage: 'Password harus di isi'
            });
        }
    }

    try {
        const result = await usersModel.login(username, password);
        
        if (isApiRequest) {
            // API response
            return res.json({ 
                status: true, 
                message: 'Login berhasil', 
                data: result 
            });
        } else {
            // Web form response
            req.session.user = { username, isLoggedIn: true };
            return res.redirect('/?success=Login berhasil');
        }
    } catch (error) {
        if (isApiRequest) {
            // API response
            return res.status(error.status || 500).json({ 
                status: false, 
                message: error.message || 'Terjadi kesalahan pada server'
            });
        } else {
            // Web form response
            return res.render('login', { 
                title: 'Login',
                errorMessage: error.message || 'Username atau password salah'
            });
        }
    }
});

module.exports = router