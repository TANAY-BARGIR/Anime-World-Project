const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, // Links to the User who added it
        ref: 'User',
        required: true
    },
    name: String,
    anime: String,
    image: String
});

module.exports = mongoose.model('Favorite', favoriteSchema);