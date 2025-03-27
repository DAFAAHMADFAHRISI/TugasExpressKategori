var express = require('express')
var router = express.Router()
var usersModel = require('../../model/Model_Users')

router.post('/', async (req, res) => {
    const { username , password } = req.body
    if (!username) {
        return res.status(400).json({ messeage: 'username harus di isi'})
    } else if (!password) {
        return res.status(400).json({ messeage: 'Password harus di isi'})
    }

    try {
        const existingUser = await usersModel.getByUsername(username)

        if (existingUser) {
            res.status(400).json({ messeage: 'Username sudah digunakan'})
        }

        await usersModel.registerUser(username, password)
        res.status(201).json({ messeage: 'Resgistre berhasil'})
    } catch (error) {
        res.status(500).json({ messeage: error.messeage})
    }
})

module.exports = router