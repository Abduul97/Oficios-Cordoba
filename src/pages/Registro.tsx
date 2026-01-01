import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Role } from '../types'

export function Registro() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    role: 'demandante' as Role
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        nombre: form.nombre,
        apellido: form.apellido,
        role: form.role
      })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      if (form.role === 'oficial') {
        await supabase.from('oficiales').insert({ id: authData.user.id })
      }

      navigate(form.role === 'oficial' ? '/onboarding' : '/')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-center mb-8">Crear cuenta</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, role: 'demandante' })}
            className={`flex-1 py-3 rounded-lg border-2 transition ${
              form.role === 'demandante'
                ? 'border-blue-600 bg-blue-50 text-blue-600'
                : 'border-gray-200'
            }`}
          >
            Busco servicios
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, role: 'oficial' })}
            className={`flex-1 py-3 rounded-lg border-2 transition ${
              form.role === 'oficial'
                ? 'border-blue-600 bg-blue-50 text-blue-600'
                : 'border-gray-200'
            }`}
          >
            Ofrezco servicios
          </button>
        </div>

        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
        />

        <input
          type="text"
          placeholder="Apellido"
          value={form.apellido}
          onChange={e => setForm({ ...form, apellido: e.target.value })}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
        />

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
          minLength={6}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  )
}