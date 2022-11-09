var { getUser, setUser, getUserById, updateUserById, deleteUserById } = require('../controllers/userController')
// var secrets = require('../config/secrets');

module.exports = function (router) {

    router.route('/').get(getUser).post(setUser)
    router.route('/:id').get(getUserById).delete(deleteUserById).put(updateUserById)
    return router;
}


// // Respond with a List of users
// router.get('/', getUser)

// // Create a new user. Respond with details of new user
// router.post('/', setUser)


// // Respond with details of specified user or 404 error
// router.get('/:id', getUserById)

// // Replace entire user with supplied user or 404 error
// router.put('/:id', updateUserById)

// // Delete specified user or 404 error
// router.delete('/:id', deleteUserById)

