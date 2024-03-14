const express = require('express')
const router = express.Router()

const User = require('../models/User')
const Room = require('../models/Room')

router.get("/", async (req, res, next) => {
    const rooms = await Room.find()
    res.status(200).json(rooms)
})

router.post('/create', async (req, res, next) => {
    const { email, room } = req.body;
    const user = await User.findOne({ email: email })
    const db_room = await Room.create({ name: room, userId: user._id })
    res.status(200).json({ 'room': db_room })
})

module.exports = router