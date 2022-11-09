// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    description: String,
    deadline: {
        type: Date,
        required:[true, 'Please add a date']
    },
    completed: {
        type: Boolean,
        default: false
    },
    assignedUser: {
        type: String,
        default: ""
    },
    assignedUserName: {
        type: String,
        default: "unassigned"
    },
    dateCreated: {
        type: String,
        default: Date.now()
    }
});

// Export the Mongoose model
module.exports = mongoose.model('Task', TaskSchema);
