import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import { Layout } from 'antd';

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout style={{ minHeight: '100vh' }}>
          <Header />
          <Layout.Content style={{ flex: 1 }}>
      <Routes>
              <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/chat" />} />
              <Route path="*" element={<NotFound />} />
      </Routes>
          </Layout.Content>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;