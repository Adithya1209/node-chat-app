const socket = io()

//elements

const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-loc')
const $messages = document.querySelector('#messages')

//templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//Options

const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix:true})

const autoscroll = () =>{
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    console.log(newMessageHeight)

    //Visible height

    const visibleHeight = $messages.offsetHeight

    //Height of message container

    const containerHeight = $messages.scrollHeight

    //How far have I scrolled

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight<=scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
        

    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html =Mustache.render(sidebarTemplate,{
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})

socket.on('locationMessage',(url)=>{
    console.log(url)
    const html = Mustache.render(locationTemplate,{
        username : url.username,
        url : url.url,
        createdAt : moment(url.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    
    //disable

    const message = e.target.elements.message.value
    socket.emit('sendMessage',message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        //enable
        

        if(error){
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

document.querySelector('#send-loc').addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!')
    }

    //disable
    $locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        const data = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }
        //console.log(data)
        $locationButton.removeAttribute('disabled')
        socket.emit('sendLocation',data,()=>{
            console.log('Location shared!')
        })
    })
})

socket.emit('join',{ username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})