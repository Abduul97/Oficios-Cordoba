import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { AvatarUpload } from '../components/ui/AvatarUpload'
import type { Oficio, Ciudad } from '../types'

export function MiPerfil() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [oficios, setOficios] = useState<Oficio[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    dni: '',
    descripcion: '',
    instagram: '',
    email_contacto: '',
    oficiosSeleccionados: [] as string[],
    ciudadesSeleccionadas: [] as string[]
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (profile?.role !== 'oficial') {
      navigate('/')
      return
    }

    const fetchData = async () => {
      const [oficiosRes, ciudadesRes, oficialRes, oficialOficiosRes, oficialCiudadesRes] = await Promise.all([
        supabase.from('oficios').select('*').order('nombre'),
        supabase.from('ciudades').select('*').order('nombre'),
        supabase.from('oficiales').select('*').eq('id', user.id).single(),
        supabase.from('oficial_oficios').select('oficio_id').eq('oficial_id', user.id),
        supabase.from('oficial_ciudades').select('ciudad_id').eq('oficial_id', user.id)
      ])

      if (oficiosRes.data) setOficios(oficiosRes.data)
      if (ciudadesRes.data) setCiudades(ciudadesRes.data)

      setFotoUrl(profile.foto_url || null)

      setForm({
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        telefono: profile.telefono || '',
        dni: oficialRes.data?.dni || '',
        descripcion: oficialRes.data?.descripcion || '',
        instagram: oficialRes.data?.instagram || '',
        email_contacto: oficialRes.data?.email_contacto || '',
        oficiosSeleccionados: oficialOficiosRes.data?.map(o => o.oficio_id) || [],
        ciudadesSeleccionadas: oficialCiudadesRes.data?.map(c => c.ciudad_id) || []
      })

      setLoading(false)
    }

    fetchData()
  }, [user, profile, navigate])

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

    setSaving(true)
    setError('')
    setSuccess('')

    await supabase
      .from('profiles')
      .update({
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono
      })
      .eq('id', user.id)

    await supabase
      .from('oficiales')
      .update({
        dni: form.dni,
        descripcion: form.descripcion,
        instagram: form.instagram,
        email_contacto: form.email_contacto
      })
      .eq('id', user.id)

    await supabase.from('oficial_oficios').delete().eq('oficial_id', user.id)
    await supabase.from('oficial_oficios').insert(
      form.oficiosSeleccionados.map(oficio_id => ({ oficial_id: user.id, oficio_id }))
    )

    await supabase.from('oficial_ciudades').delete().eq('oficial_id', user.id)
    await supabase.from('oficial_ciudades').insert(
      form.ciudadesSeleccionadas.map(ciudad_id => ({ oficial_id: user.id, ciudad_id }))
    )

    setSuccess('Perfil actualizado')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Mi perfil</h1>
      <p className="text-gray-600 mb-8">Editá tu información pública</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AvatarUpload
          userId={user!.id}
          currentUrl={fotoUrl}
          onUpload={setFotoUrl}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            required
            className="px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Apellido"
            value={form.apellido}
            onChange={e => setForm({ ...form, apellido: e.target.value })}
            required
            className="px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
          />
        </div>

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
        {success && <p className="text-green-600 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}