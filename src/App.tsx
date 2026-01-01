import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Registro } from './pages/Registro'
import { Login } from './pages/Login'
import { Onboarding } from './pages/Onboarding'
import { Buscar } from './pages/Buscar'
import { PerfilOficial } from './pages/PerfilOficial'
import { MiPerfil } from './pages/MiPerfil'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/buscar" element={<Buscar />} />
            <Route path="/oficial/:id" element={<PerfilOficial />} />
            <Route path="/mi-perfil" element={<MiPerfil />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}