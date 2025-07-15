import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
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
              <Route path="/" element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </Layout.Content>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;