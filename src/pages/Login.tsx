import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center mb-8">Ingresar</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p className="text-center text-gray-600">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="text-blue-600 hover:underline">
            Registrate
          </Link>
        </p>
      </form>
    </div>
  )
}