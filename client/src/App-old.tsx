import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/header";
import AuthForm from "./auth/auth-page";
import StopwordPage from "./stopword/stopword-page";
import { AuthProvider } from "./auth/auth-provider";
import StopwordMapper from "./stopword/stopwords-mapper";
import UploadDataset from "./dataset/upload-dataset-page";
import DatasetSelector from "./dataset/data-selector";
import DatasetAnalysisPage from "./dataset/dataset-analytics-page";
import DatasetVisualizationPage from "./dataset/dataset-visualization-page";
import AdminPanelPage from "./user/admin-panel-page";
import MLConfigPage from "./ml-config/ml-config-page";
import { useContext } from "react";
import { AuthContext } from "./auth/auth-provider";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authContext = useContext(AuthContext);
  
  if (!authContext?.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const authContext = useContext(AuthContext);
  
  if (authContext?.isAuthenticated) {
    return <Navigate to="/analytics" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Статичний Header завжди видно */}
        <Header />

        {/* Динамічний контент */}
        <Routes>
          <Route path="/" element={<AuthRoute><AuthForm/></AuthRoute>} />
          <Route path="/stopwords" element={<ProtectedRoute><StopwordMapper/></ProtectedRoute>} />
          <Route path="/dataset-upload" element={<ProtectedRoute><UploadDataset/></ProtectedRoute>}/>
          <Route path="/analytics" element={<ProtectedRoute><DatasetAnalysisPage/></ProtectedRoute>}/>
          <Route path="/visualization" element={<ProtectedRoute><DatasetVisualizationPage/></ProtectedRoute>}/>
          <Route path="/admin" element={<ProtectedRoute><AdminPanelPage/></ProtectedRoute>}/>
          <Route path="/ml-config" element={<ProtectedRoute><MLConfigPage/></ProtectedRoute>}/>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
