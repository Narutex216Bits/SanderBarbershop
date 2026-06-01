import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ListaServicos } from './components/ListaServicos';
import { ListaPacotes } from './components/ListaPacotes';
import { Admin } from './pages/Admin';
import { AdminPacotes } from './pages/AdminPacotes';
import { Agendamento } from './pages/Agendamento';
import { MeusAgendamentos } from './pages/MeusAgendamentos';
import { Toaster } from 'react-hot-toast';
import { AdminConfig } from './pages/AdminConfig';
import { AdminConfigDia } from './pages/AdminConfigDia';
import './styles/global.css';
import './styles/Navbar.css';
import './styles/Home.css';

function Home() {
  const { user, loginComGoogle, logout } = useAuth();

  // Verificar se é admin (apenas este email específico)
  const isAdmin = user?.email === "narutex216bits@gmail.com";

  return (
    <div>
      <nav className="navbar">
        <h2 className="navbar-brand">✂️ Sander Barbershop</h2>

        <div className="navbar-menu">
          {!user ? (
            <button onClick={loginComGoogle} className="btn btn-primary">
              🔐 Entrar com Google
            </button>
          ) : (
            <div className="navbar-user">
              <span>👋 Olá, {user.displayName?.split(' ')[0] || user.email?.split('@')[0]}</span>

              {/* Só admin vê os botões de administração */}
              {isAdmin ? (
                <>
                  <Link to="/admin">
                    <button className="btn btn-success">📋 Serviços</button>
                  </Link>
                  <Link to="/admin/pacotes">
                    <button className="btn btn-warning">📦 Pacotes</button>
                  </Link>
                  <Link to="/admin/config">
                    <button className="btn btn-config">📅 Calendário</button>
                  </Link>
                </>
              ) : (
                /* Cliente comum: vê apenas o botão de Meus Agendamentos */
                <Link to="/meus-agendamentos">
                  <button className="btn btn-info">📋 Meus Agendamentos</button>
                </Link>
              )}

              <button onClick={logout} className="btn btn-danger">
                Sair
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="home-container">
        <h1 className="home-title">✂️ Nossos Serviços</h1>
        <ListaServicos isAdmin={isAdmin} />
        <ListaPacotes />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/pacotes" element={<AdminPacotes />} />
          <Route path="/agendar/:id" element={<Agendamento />} />
          <Route path="/meus-agendamentos" element={<MeusAgendamentos />} />
          <Route path="/admin/config" element={<AdminConfig />} />
          <Route path="/admin/config/dia/:data" element={<AdminConfigDia />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;