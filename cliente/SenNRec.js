const keys = RSA.generate(512);

        const enc = (msg) => {
        const encoded_message = RSA.encode(msg);
        console.log("Encoded message:", encoded_message);
        const encrypted_message = RSA.encrypt(encoded_message, keys.n, keys.e);
        console.log("Encrypted message:", encrypted_message);
        return encrypted_message;
        };

        const dec = (data) => {
        console.log("Encrypted message:", data.msgEnc);
        const decrypted_message = RSA.decrypt(
            bigInt(data.msgEnc),
            data.d,
            data.n
        );

        console.log("Keys");
        console.log("n:", keys.n.toString());
        console.log("d:", keys.d.toString());
        console.log("e:", keys.e.toString());
        console.log("Decrypted message:", decrypted_message);
        const decoded_message = RSA.decode(decrypted_message);
        console.log("Decoded message:", decoded_message.toString());
        return decoded_message.toString();
        };

        const socket = io();
        const chatMain = document.getElementById("chatMain");
        const username = document.getElementById("username");
        const message = document.getElementById("message");
        const notification = document.getElementById("notification");
        const form = document.querySelector("form");

        form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (username.value && message.value ) {
            console.log(message.value)
            console.log(message.value.length)
            if(message.value.length<76){
            const msgEnc = enc(message.value);
            socket.emit("chat-message", {
                username: username.value,
                message: { msgEnc, d: keys.d, n: keys.n },
            });
            username.disabled = true;
            const li = document.createElement("li");
            li.className = "me";
            li.innerHTML = `<strong>Me</strong>: ${dec({
                msgEnc,
                d: keys.d,
                n: keys.n,
            })}`;
            chatMain.appendChild(li);
            window.scrollTo(0, document.body.scrollHeight);
            message.value = "";
            }else{
            alert("Message lenght must be less than 76 char")
            }
        } else {
            alert("Username and message are required");
        }
        });

        username.addEventListener("input", (e) => {
        if (username.value) {
            message.disabled = false;
        } else {
            message.disabled = true;
        }
        });

        message.addEventListener("input", () => {
        socket.emit("typing", username.value);
        });

        socket.on("chat-message", (data) => {
        const li = document.createElement("li");
        li.className = "entry";
        console.log(data);
        const decMsg = dec(data.message);
        li.innerHTML = `<strong>${data.username}</strong>: ${decMsg}`;
        chatMain.appendChild(li);
        window.scrollTo(0, document.body.scrollHeight);
        });
        socket.on("user-disconnected", (data) => {
        const li = document.createElement("li");
        li.className = "notify";
        li.innerHTML = `<strong>${data}</strong>`;
        chatMain.appendChild(li);
        window.scrollTo(0, document.body.scrollHeight);
        });
        socket.on("user-connected", (data) => {
        const li = document.createElement("li");
        li.className = "notify";
        li.innerHTML = `<strong>${data}</strong>`;
        chatMain.appendChild(li);
        window.scrollTo(0, document.body.scrollHeight);
        });
        socket.on("typing", (data) => {
        notification.innerHTML = `<strong>${data}</strong> is typing...`;
        setTimeout(() => {
            notification.innerHTML = "";
        }, 2000);
        });