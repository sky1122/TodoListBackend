/*
 * Connect all of your endpoints together here.
 */
const { errorHandler } = require('../middleware/errorMiddleware')
const express = require('express')
const routerUser = express.Router()
const routerTask = express.Router()
module.exports = function (app) {

    // app.use('/api', require('./home.js')(router));
    // app.use('/api/tasks', require('./task.js')(router));
    app.use('/api/users', require('./user.js')(routerUser));
    app.use('/api/tasks', require('./task.js')(routerTask));
    // shoule be under the route
    app.use(errorHandler)
    
};



