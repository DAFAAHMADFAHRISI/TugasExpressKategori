var express = require('express')
var router = express.Router()
var usersModel = require('../../model/Model_Users')

router.post('/', async (req, res) => {
    const { username, password} = req.body
    if (!username) {
        return res.status(400).json({ message: 'Username harus di isi'})
    } else if (!password) {
        return res.status(400).json({ message: 'Password harus di isi'})
    }

    try {
        const result = await usersModel.login(username, password)
        res.json(result)
    } catch (error) {
        res.status(500).json({ message: error.message})
    }
})

module.exports = router