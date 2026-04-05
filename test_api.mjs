import axios from 'axios';

const BASE_URL = 'http://localhost:8081/api';

async function test() {
    try {
        // Register a user
        const username = "testuser" + Date.now();
        const regRes = await axios.post(`${BASE_URL}/auth/register`, { username, email: username+"@test.com", password: "password" });
        const token = regRes.data.token;
        console.log("Registered. Token received.");

        // Create board
        const boardRes = await axios.post(`${BASE_URL}/board`, { name: "Test Board", description: "test" }, { headers: { Authorization: `Bearer ${token}` } });
        const boardId = boardRes.data.id;
        console.log("Board created:", boardId);

        // Create task
        const taskPayload = {
            id: new Date().toISOString(),
            boardId: boardId,
            title: "first task",
            description: "this is the first task",
            status: "To Do",
            assignee: "mahin",
            dueDate: "2026-03-27",
            tags: [],
            team: "Engineering",
            priority: "medium"
        };
        console.log("Sending task payload...");

        const taskRes = await axios.post(`${BASE_URL}/tasks`, taskPayload, { headers: { Authorization: `Bearer ${token}` } });
        console.log("Task created successfully:", taskRes.data);
    } catch (err) {
        if (err.response) {
            console.error("API Error Response:", err.response.status, err.response.data, err.response.statusText);
        } else {
            console.error("Error:", err.message);
        }
    }
}
test();
