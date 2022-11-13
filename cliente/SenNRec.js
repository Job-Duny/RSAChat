import bigInt from 'big-integer';
import RSA from './rsa.js';

const keys = RSA.generate(1024);

const enc = (mess) => {

    // code n encrypt message

    const encoded_message = RSA.encode(mess); // se sustitullle x mess 
    console.log("Encoded: ",encoded_message);
    const encrypted_message = RSA.encrypt(encoded_message, keys.e, keys.n);
    console.log("Encrypted: ",encrypted_message);

    return encrypted_message;
}

const dec = (data) => {

    // decrypt and decode message

    console.log(data.msgEnc);
    const decrypted_message = RSA.decrypt(bigInt(data.msgEnc), keys.d, keys.n);

    console.log('keys:');
    console.log(keys.n.toString());
    console.log(keys.e.toString());
    console.log(keys.d.toString());


    console.log("Decripted: ", decrypted_message);
    const decoded_message = RSA.decode(decrypted_message);
    console.log("Decoded: ", decoded_message);

    return decoded_message;
}

const socket = io();
const chatMain = document.getElementById('groupMain');
const user = document.getElementById('user');
const message = document.getElementById('mess');
const notif = document.getElementById('notif');
const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(user.value && message.value){
        console.log(message.value);
        console.log(message.value.length);
        if(message.value.length < 76){
            const msgEnc = enc(message.value);
            socket.emit('chat-message', {message: { msgEnc, d: keys.d, n: keys.n }, user: user.value});
            user.disabled = true;

            const li = document.createElement('li');
            li.cllassName = 'sent-me';
            li.innerHTML = `<strong>Me</strong>: ${dec({msgEnc, d: keys.d, n: keys.n})}`;
            chatMain.appendChild(li);
            message.value = '';
        }else{
            notif.innerHTML = 'Message too long'
        } 
    }else{
        notif.innerHTML = 'Please fill all fields'
    }
});

user.addEventListener('input', (e) => {
    if (user.value) {
        message.disabled = false;
    } else {
        message.disabled = true;
    }
});

message.addEventListener('keydown', () => {
    socket.emit('typing', user.value);
});

socket.on('chat-message', (data) => {
    const li = document.createElement('li');
    console.log(data);
    const decMess = dec(data.message);
    li.innerHTML = `<strong>${data.user}</strong>: ${decMess}`;
    chatMain.appendChild(li);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('user-disconnected', (data) => {
    const li = document.createElement('li');
    li.className = 'notif';
    li.innerHTML = `<strong>${data.user}</strong> disconnected`;
    chatMain.appendChild(li);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('user-connected', (data) => {
    const li = document.createElement('li');
    li.className = 'notif';
    li.innerHTML = `<strong>${data.user}</strong> connected`;
    chatMain.appendChild(li);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on('typing', (data) => {
    notif.innerHTML = `<strong>${data}</strong> is typing...`;
    setTimeout(() => {
        notif.innerHTML = '';
    }, 1000);
});