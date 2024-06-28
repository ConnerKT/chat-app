const socket = new WebSocket('ws://localhost:3001');

function sendMessage(e){
    e.preventDefault();
    const input = document.querySelector('input');
    if(input.value)
        {
            socket.send(input.value);
            input.value = '';
        }
    input.focus();
  
}
document.querySelector('form').addEventListener('submit',sendMessage)

//listen for messages

socket.addEventListener('message', ({data}) => {
    const li = document.createElement('li');
    li.innerText = data;
    document.querySelector('ul').appendChild(li);
});