// adding async because monggose return a promse
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const Task = require('../models/task')

// @desc Respond with a List of users
// @route GET /api/user
const getUser = asyncHandler(async (req, res) => {
    const query = req.query;
    let users
    let where, select, options = {}
    if (Object.keys(query).length !== 0) {
        if ('where' in query) {
            where = JSON.parse(query.where)
            console.log(where)
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
        users = count ? await User.find( where, select, options ).countDocuments()
                      : await User.find( where, select, options );

    } else {
        users = await User.find()
        if(!users) {
            res.status(400)
            throw new Error('Cannot find Users')
        }      
    }
    res.status(200).json(
        {
            message: "OK",
            data:users
        })
})

// @desc Create a new user. Respond with details of new user
// @route POST /api/user
const setUser = asyncHandler(async (req, res) => {
    // console.log(req.body.test)
    const { name, email } = req.body
    if (!name || !email) {
        res.status(400)
        throw new Error('Please add all user field')
    }
    // Check if user exists
    const userExists =  await User.findOne({email})
    if(userExists) {
        res.status(400)
        throw new Error('User already esists')
    }
    // create user
    const user = await User.create({
        name,
        email
    })
    // check if user created
    if(user) {
        res.status(201).json({
            message: "OK",
            data : {
                _id: user.id,
                name: user.name,
                email: user.email,
                pendingTasks: user.pendingTasks
            }
        })
    } else {
        res.status(400)
        throw new Error('INvalid user data')
    }

    
})


// @desc Respond with details of specified user or 404 error
// @route POST /api/user:id
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if(!user) {
        res.status(400)
        throw new Error('User not find')
    }
    res.status(200).json({
        message: "OK",
        data: user
    })
})


async function updateUserByIdQuery(name, user) {
    if (name !== user.name && user.pendingTasks != 0) {
        // need to update the task assignedUserName field
        const pendingTask = user.pendingTasks
        console.log(pendingTask)
        for (let i = 0; i < pendingTask.length; i++) {
            // const task = await Task.findById(userId)
            const updateTask = await Task.findByIdAndUpdate(
                pendingTask[i], 
                {
                    assignedUser: user.id,
                    assignedUserName: name
                }, 
                {new: true}
            )
        }
    }
    // return is the value that it found (before update)
}

// @desc Replace entire user with supplied user or 404 error
// @route PUT /api/user:id
const updateUserById = asyncHandler(async (req, res) => {
    // req.params.id from url
    const user = await User.findById(req.params.id)
    const { name, email} = req.body
    const query = req.query;
    console.log(query)
    if (query === null || Object.keys(query).length === 0) {
            // Check if user exists
        const emailExists =  await User.findOne({email})
        if(email !==user.email && emailExists) {
            res.status(400)
            throw new Error('This email already esists, cannot update')
        }
        if(!user) {
            res.status(400)
            throw new Error('User not find')
        }
        updateUserByIdQuery(name, user)
        const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: false})
        
        res.status(200).json({
            "message": "ok",
            "data": updateUser
        })
    }
})

// @desc Delete specified user or 404 error
// @route DELETE /api/user:id
const deleteUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (!user) {
        res.status(400)
        throw new Error('User not find')
    }
    // before delete user, we need to first change the task's assign status for the task that
    // is not finished assignedUser = "" assignedUserName = "unassigned"
    deleteUserByIdNoQuery(user)
    res.status(200).json(req.params.id)

})

async function deleteUserByIdNoQuery(user) {
    // before delete user, we need to first change the task's assign status for the task that
    // is not finished assignedUser = "" assignedUserName = "unassigned"
    if (user.pendingTasks !== null || user.pendingTasks.length !== 0) {
        for (let i = 0; i < user.pendingTasks.length; i++) {
            const updateTask = await Task.findByIdAndUpdate(
                user.pendingTasks[i], 
                {
                    assignedUser: "",
                    assignedUserName: "unassigned"
                }, 
                {new: true}
            )
        }    
    }
    await user.remove()
}

module.exports = {
    getUser,
    setUser,
    getUserById,
    updateUserById,
    deleteUserById
}