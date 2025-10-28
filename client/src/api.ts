import axios from 'axios';

// Створюємо інстанс axios з базовою URL-адресою сервера
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Додаємо інтерсептор для автоматичного додавання токена до запитів
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Отримуємо токен з localStorage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Додаємо токен в заголовок Authorization
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // Якщо сервер повертає 401 помилку, перенаправляємо на сторінку login
      localStorage.removeItem('token');  // Очищаємо токен з localStorage
      window.location.href = '/login?error=unauthorized';  // Перенаправляємо на сторінку входу з повідомленням
    }
    return Promise.reject(error);
  }
);

// Експортуємо цей інстанс для використання в інших файлах
export default api;