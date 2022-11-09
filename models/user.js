// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    pendingTasks: {
        type: [String]
    },
    dateCreated: {
        type: String,
        default: Date.now()
    }
});

// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);
