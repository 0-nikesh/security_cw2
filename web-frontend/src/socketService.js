// // socketService.js
// import { io } from "socket.io-client";

// const userId = JSON.parse(localStorage.getItem('user'))._id; // Assuming user info is stored in localStorage
// const socket = io('http://localhost:3000', { query: { userId } })
// socket.on("connect", () => {
//     //console.log(`Connected with socket ID: ${socket.id}`);
// });



// export default socket;


// socketService.js
import { io } from "socket.io-client";

let userId = null;
const storedUser = localStorage.getItem('user');

if (storedUser) {
    try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser._id) {
            userId = parsedUser._id;
        } else {
            console.error("User object does not contain _id:", parsedUser);
        }
    } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
    }
} else {
    console.error("No user data found in localStorage.");
}

const socket = io('http://localhost:3000', { query: { userId } });

socket.on("connect", () => {
    //console.log(`Connected with socket ID: ${socket.id}`);
});

export default socket;
