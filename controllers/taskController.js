// adding async because monggose return a promse
const asyncHandler = require('express-async-handler')
const Task = require('../models/task')
const User = require('../models/user')
// console.log(Task)
// @desc Respond with a List of Tasks
// @route GET /api/Task
const getTask = asyncHandler(async (req, res) => {
    const query = req.query;
    let where, select, options = {};
    let tasks
    if (Object.keys(query).length !== 0) {
        if ('where' in query) {
            where = JSON.parse(query.where)
        }
        if ('select' in query) {
            select = JSON.parse(query.select)
        }
        let count = query.count? true : false;

        if (query.sort) {
            options.sort = JSON.parse(query.sort);
        }

        if (query.skip) {
            options.skip = JSON.parse(query.skip);
        }

        if (query.limit) {
            options.limit = JSON.parse(query.limit);
        }            
        // passing options 
        // await MyModel.find({ name: /john/i }, null, { skip: 10 }).exec();
        tasks = count ? await Task.find( where, select, options ).countDocuments()
                      : await Task.find( where, select, options );
    } else {
        console.log("b")
        tasks = await Task.find()
        if(!tasks) {
            res.status(400)
            throw new Error('Cannot find Users')
        }      
    }
    res.status(200).json({
        message: "OK",
        data:tasks
    })
})

// @desc Create a new Task. Respond with details of new Task
// @route POST /api/Task
const setTask = asyncHandler(async (req, res) => {
    // console.log(req.body.test)
    const { name, deadline } = req.body

    if (!name || !deadline) {
        res.status(400)
        throw new Error('Please add all task field')
    }

    // create Task
    const task = await Task.create({
        name,
        deadline
    })

    // check if Task created
    if(task) {
        res.status(201).json({
            message:"OK",
            data:{
                _id: task.id,
                name: task.name,
                deadline: task.deadline
            }
        })
    } else {
        res.status(400)
        throw new Error('INvalid Task data')
    }
})


// @desc Respond with details of specified Task or 404 error
// @route POST /api/Task:id
const getTaskById = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
    if(!task) {
        res.status(400)
        throw new Error('Task not find')
    }
    res.status(200).json({
        message: "OK",
        data:task
    })
})

// @desc Replace entire Task with supplied Task or 404 error
// @route PUT /api/Task:id
const updateTaskById = asyncHandler(async (req, res) => {
    // req.params.id from url
    const taskId = req.params.id
    const task = await Task.findById(taskId)
    const userId  = task.assignedUser
    var updateTaskVal = req.body 

    // cannot find task
    if(!task) {
        res.status(400)
        throw new Error('Task not find')
    }

    // 1. assign UN-completed task to another user
    if ('assignedUser' in req.body ) {
        const {assignedUser} = req.body
        // add task to new assignedUser
        const newUser = await User.findById(assignedUser)
        const assignedUserName = newUser.name
        // if newAssignmen user doesn't exist
        if (!newUser) {
            res.status(400)
            throw new Error('Task cannot assigned to these user, check if it is exist')
        }

        var pendingTask = newUser.pendingTasks
        // update user appendingTasks
        if (!pendingTask.includes(taskId) && (task.completed === false || ('completed' in req.body && req.body.completed === false))) {        
            pendingTask.push(taskId)
            await User.findByIdAndUpdate(
                newUser.id.toString(), 
                {
                    pendingTasks: pendingTask
                },
                {new: false}
            )
            updateTaskVal.assignedUserName = assignedUserName
            // delete old task in old pendingTask
            updateRelatedFieldInUser(userId, taskId)
        } else {
            res.status(400)
            throw new Error('Task assigned to the same user again')
        }
    }

    // 2. turn a UN-completed task into complete
    if ('completed' in req.body && task.completed == false) {
        const {completed} = req.body
        if (completed == true) {
            updateRelatedFieldInUser(userId, taskId)
        }
    }

    // return is the value that it found (before update)
    const updateTask = await Task.findByIdAndUpdate(req.params.id, updateTaskVal, {new: true})

    res.status(200).json({
        "message" : "ok",
        "data":updateTask
    })
})

// @desc Delete specified Task or 404 error
// @route DELETE /api/Task:id
const deleteTaskById = asyncHandler(async (req, res) => {
    const task = await Task.findById(req.params.id)
    const userId = task.assignedUser
    
    if (!task) {
        res.status(400)
        throw new Error('Task not find')
    }

    // also need to delete the task id in the pendingTask list
    if (userId !== "") {
        updateRelatedFieldInUser(userId, req.params.id)
    }
    await task.remove()
    res.status(200).json(req.params.id)
})
// delete the pendingTask in user
async function updateRelatedFieldInUser(userId, taskId) {
    const user = await User.findById(userId)
    var filtered = user.pendingTasks.filter(function(value, index, err){
        return value != taskId
    })

    await User.findByIdAndUpdate(
        userId, 
        {
            pendingTasks:filtered
        }, 
        {new: false}
    )
}

module.exports = {
    getTask,
    setTask,
    getTaskById,
    updateTaskById,
    deleteTaskById
}