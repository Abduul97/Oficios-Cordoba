import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-blue-600">
            Oficios Córdoba
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/buscar" className="text-gray-600 hover:text-gray-900">
              Buscar
            </Link>

            {loading ? null : user ? (
              <>
                {profile?.role === 'oficial' && (
                  <Link to="/mi-perfil" className="text-gray-600 hover:text-gray-900">
                    Mi perfil
                  </Link>
                )}
                <span className="text-sm text-gray-500">
                  {profile?.nombre}
                </span>
                <button
                  onClick={signOut}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  )
}