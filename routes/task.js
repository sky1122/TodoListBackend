var { getTask, setTask, getTaskById, updateTaskById, deleteTaskById } = require('../controllers/taskController')
// var secrets = require('../config/secrets');

module.exports = function (router) {

    router.route('/').get(getTask).post(setTask)
    router.route('/:id').get(getTaskById).delete(deleteTaskById).put(updateTaskById)

    return router;
}
