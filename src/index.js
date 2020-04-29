const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateBanner } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0;

io.on('connection', (socket) => {
    
    socket.on('join', ( options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('banner', generateBanner(`Welcome!! ${user.username}`))
        socket.broadcast.to(user.room).emit('banner', generateBanner(`${user.username} has Joined the chat`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })


    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)


        if(filter.isProfane(message)){
            return callback('profanity')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('disconnect', () => {

        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('banner', generateBanner(`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

        
    })

    socket.on('sendLocation', (loc, callback) => {
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateMessage(user.username,`https://google.com/maps?q=${loc.latitude},${loc.longitude}`))
        callback()
    })

})


server.listen(PORT, () => {
    console.log("Server is running on port",PORT)
})
