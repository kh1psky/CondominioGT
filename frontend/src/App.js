import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layouts
import MainLayout from './components/Layout/MainLayout';
import AuthLayout from './components/Layout/AuthLayout';

// Páginas públicas
import Login from './pages/Auth/Login';
import RecuperarSenha from './pages/Auth/RecuperarSenha';
import RedefinirSenha from './pages/Auth/RedefinirSenha';
import Registrar from './pages/Auth/Registrar';

// Páginas protegidas
import Dashboard from './pages/Dashboard';
import Perfil from './pages/Perfil';

// Páginas de Condomínio
import Condominios from './pages/Condominio/Condominios';
import DetalhesCondominio from './pages/Condominio/DetalhesCondominio';
import NovoCondominio from './pages/Condominio/NovoCondominio';
import EditarCondominio from './pages/Condominio/EditarCondominio';

// Páginas de Inventário
import Inventario from './pages/Inventario/Inventario';

// Páginas 404
import NotFound from './pages/NotFound';

// Rota protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Login />} />
        <Route path="login" element={<Login />} />
        <Route path="registrar" element={<Registrar />} />
        <Route path="recuperar-senha" element={<RecuperarSenha />} />
        <Route path="redefinir-senha" element={<RedefinirSenha />} />
      </Route>

      {/* Rotas Protegidas */}
      <Route path="/app" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="perfil" element={<Perfil />} />
        
        {/* Rotas de Condomínio */}
        <Route path="condominios" element={<Condominios />} />
        <Route path="condominios/novo" element={<NovoCondominio />} />
        <Route path="condominios/:id" element={<DetalhesCondominio />} />
        <Route path="condominios/:id/editar" element={<EditarCondominio />} />
        
        {/* Rotas de Inventário */}
        <Route path="inventario" element={<Inventario />} />
      </Route>

      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;