import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import authService from "../auth/auth-service";
import { useContext } from "react";
import { AuthContext } from "../auth/auth-provider";

export default function Header() {
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        authContext?.logout();
        navigate('/');
    };

    const isAdmin = authContext?.userRole === 'admin';
    const isAuthenticated = authContext?.isAuthenticated;

  return (
    <header
      style={{
        background: "#0d6efd",
        color: "white",
        padding: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h1 style={{ cursor: "pointer" }} onClick={() => navigate(isAuthenticated ? '/analytics' : '/')}>
        BotAnalytics
      </h1>
      <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {!isAuthenticated ? (
          <>
            <Link to="/" style={{ color: "white", textDecoration: "none" }}>
              Вхід / Реєстрація
            </Link>
          </>
        ) : (
          <>
            <Link to="/analytics" style={{ color: "white", textDecoration: "none" }}>
              📊 Аналітика
            </Link>
            <Link to="/visualization" style={{ color: "white", textDecoration: "none" }}>
              📈 Візуалізація
            </Link>
            <Link to="/stopwords" style={{ color: "white", textDecoration: "none" }}>
              🔤 Стоп-слова
            </Link>
            <Link to="/dataset-upload" style={{ color: "white", textDecoration: "none" }}>
              📤 Завантажити дані
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>
                  🔧 Адмін-панель
                </Link>
                <Link to="/ml-config" style={{ color: "white", textDecoration: "none" }}>
                  ⚙️ ML-налаштування
                </Link>
              </>
            )}
            <Button type="button" style={{ color: "white", textDecoration: "none" }} onClick={handleLogout}>
              Вийти
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
