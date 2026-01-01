import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Oficio, Ciudad } from '../types'

export function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [oficios, setOficios] = useState<Oficio[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  
  const [form, setForm] = useState({
    dni: '',
    descripcion: '',
    telefono: '',
    instagram: '',
    email_contacto: '',
    oficiosSeleccionados: [] as string[],
    ciudadesSeleccionadas: [] as string[]
  })

  useEffect(() => {
    async function fetchData() {
      const [oficiosRes, ciudadesRes] = await Promise.all([
        supabase.from('oficios').select('*').order('nombre'),
        supabase.from('ciudades').select('*').order('nombre')
      ])
      if (oficiosRes.data) setOficios(oficiosRes.data)
      if (ciudadesRes.data) setCiudades(ciudadesRes.data)
    }
    fetchData()
  }, [])

  const toggleOficio = (id: string) => {
    setForm(f => ({
      ...f,
      oficiosSeleccionados: f.oficiosSeleccionados.includes(id)
        ? f.oficiosSeleccionados.filter(o => o !== id)
        : [...f.oficiosSeleccionados, id]
    }))
  }

  const toggleCiudad = (id: string) => {
    setForm(f => ({
      ...f,
      ciudadesSeleccionadas: f.ciudadesSeleccionadas.includes(id)
        ? f.ciudadesSeleccionadas.filter(c => c !== id)
        : [...f.ciudadesSeleccionadas, id]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    if (form.oficiosSeleccionados.length === 0) {
      setError('Seleccioná al menos un oficio')
      return
    }
    if (form.ciudadesSeleccionadas.length === 0) {
      setError('Seleccioná al menos una ciudad')
      return
    }

    setLoading(true)
    setError('')

    const { error: oficialError } = await supabase
      .from('oficiales')
      .update({
        dni: form.dni,
        descripcion: form.descripcion,
        instagram: form.instagram,
        email_contacto: form.email_contacto
      })
      .eq('id', user.id)

    if (oficialError) {
      setError(oficialError.message)
      setLoading(false)
      return
    }

    if (form.telefono) {
      await supabase
        .from('profiles')
        .update({ telefono: form.telefono })
        .eq('id', user.id)
    }

    const oficiosInsert = form.oficiosSeleccionados.map(oficio_id => ({
      oficial_id: user.id,
      oficio_id
    }))
    await supabase.from('oficial_oficios').insert(oficiosInsert)

    const ciudadesInsert = form.ciudadesSeleccionadas.map(ciudad_id => ({
      oficial_id: user.id,
      ciudad_id
    }))
    await supabase.from('oficial_ciudades').insert(ciudadesInsert)

    navigate('/')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Completá tu perfil</h1>
      <p className="text-gray-600 mb-8">Esta información será visible para quienes busquen tus servicios</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="DNI (sin puntos)"
            value={form.dni}
            onChange={e => setForm({ ...form, dni: e.target.value })}
            required
            className="px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={e => setForm({ ...form, telefono: e.target.value })}
            className="px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Instagram (sin @)"
            value={form.instagram}
            onChange={e => setForm({ ...form, instagram: e.target.value })}
            className="px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email de contacto"
            value={form.email_contacto}
            onChange={e => setForm({ ...form, email_contacto: e.target.value })}
            className="px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <textarea
          placeholder="Describí tu experiencia y servicios..."
          value={form.descripcion}
          onChange={e => setForm({ ...form, descripcion: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
        />

        <div>
          <h3 className="font-medium mb-3">¿Qué oficios realizás?</h3>
          <div className="flex flex-wrap gap-2">
            {oficios.map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => toggleOficio(o.id)}
                className={`px-4 py-2 rounded-full border transition ${
                  form.oficiosSeleccionados.includes(o.id)
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {o.nombre}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">¿En qué ciudades trabajás?</h3>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {ciudades.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleCiudad(c.id)}
                className={`px-4 py-2 rounded-full border transition ${
                  form.ciudadesSeleccionadas.includes(c.id)
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Completar perfil'}
        </button>
      </form>
    </div>
  )
}