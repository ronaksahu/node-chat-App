const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFromInput = document.querySelector('input')
const $messageFromButton = document.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplates = document.querySelector('#message-template').innerHTML
const urlTemplates = document.querySelector('#url-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (messages) => {
    console.log(messages.text)
    const html = Mustache.render(messageTemplates, { 
        username: messages.username,
        message : messages.text,
        createdAt : moment(messages.createdAt).format('h:m a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('locationMessage', (url) => {

    
    const html = Mustache.render(urlTemplates, {
        username: url.username,
        url: url.text,
        createdAt: moment(url.createdAt).format('h:m a') 
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html

})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFromButton.setAttribute('disabled', 'disabled')
    const message = e.target.message.value
    
    socket.emit('sendMessage',message, (error) => {
        
        $messageFromButton.removeAttribute('disabled')
        $messageFromInput.value = ''
        $messageFromInput.focus();


        if(error){
            return console.log(error)
        }

        console.log('Message Delivered')    


    })
})

$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
       return alert("Geo location is not supported by your browser")
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const loc = {
           latitude: position.coords.latitude,
           longitude: position.coords.longitude
        }
        socket.emit('sendLocation',loc, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Message Shared')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})