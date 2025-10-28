import { useState, useContext } from "react";
import { TextField, Button, Box, Typography, Link, Alert, CircularProgress, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import authService from "./auth-service";
import { AuthContext } from "./auth-provider";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        const response = await authService.loginUser(form);
        const role = authService.getUserRole();
        if (authContext && role) {
          authContext.login(response.token, role);
        }
        setSuccess(true);
        setTimeout(() => {
          navigate('/analytics'); // Redirect to analytics page after login
        }, 1000);
      } else {
        await authService.register(form);
        setSuccess(true);
        // After registration, switch to login form
        setTimeout(() => {
          setIsLogin(true);
          setForm({ username: "", password: "" });
          setSuccess(false); // Clear success message when switching to login
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Виникла помилка. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 360,
        mx: "auto",
        mt: 8,
        p: 3,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h5" textAlign="center" mb={2}>
        {isLogin ? "Авторизація" : "Реєстрація"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {isLogin ? "✅ Успішний вхід! Перенаправлення..." : "✅ Реєстрація успішна! Тепер увійдіть."}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Нікнейм користувача"
          name="username"
          type="text"
          margin="normal"
          value={form.username}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <TextField
          fullWidth
          label="Пароль"
          name="password"
          type="password"
          margin="normal"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <Button 
          fullWidth 
          variant="contained" 
          sx={{ mt: 2 }} 
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            isLogin ? "Увійти" : "Зареєструватися"
          )}
        </Button>
      </form>
      <Typography textAlign="center" mt={2}>
        {isLogin ? "Немає акаунту?" : "Вже маєш акаунт?"}{" "}
        <Link 
          component="button" 
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setSuccess(false);
          }}
          disabled={loading}
        >
          {isLogin ? "Зареєструйся" : "Увійти"}
        </Link>
      </Typography>
    </Box>
  );
}
