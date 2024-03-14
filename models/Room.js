const mongoose = require('mongoose')
const Schema = mongoose.Schema

const roomSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

const Room = new mongoose.model('Room', roomSchema)

module.exports = Room