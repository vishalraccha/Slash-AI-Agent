import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: "https://slash-ai-agent-backend.onrender.com",
    headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`
    }
})

export default axiosInstance;
