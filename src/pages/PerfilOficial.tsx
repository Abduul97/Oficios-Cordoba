import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Stars } from '../components/ui/Stars'
import type { Oficio, Ciudad } from '../types'

interface OficialDetalle {
  id: string
  dni_verificado: boolean
  descripcion: string | null
  instagram: string | null
  email_contacto: string | null
  profile: {
    nombre: string
    apellido: string
    telefono: string | null
    foto_url: string | null
  }
  oficios: { oficio: Oficio }[]
  ciudades: { ciudad: Ciudad }[]
}

interface Review {
  id: string
  rating: number
  comentario: string | null
  created_at: string
  autor: { nombre: string; apellido: string }
}

export function PerfilOficial() {
  const { id } = useParams()
  const { user, profile: userProfile } = useAuth()
  const [oficial, setOficial] = useState<OficialDetalle | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [ratingPromedio, setRatingPromedio] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [showForm, setShowForm] = useState(false)
  const [newRating, setNewRating] = useState(0)
  const [newComentario, setNewComentario] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canReview = user && userProfile?.role === 'demandante' && id !== user.id

  useEffect(() => {
    async function fetchOficial() {
      const { data } = await supabase
        .from('oficiales')
        .select(`
          id,
          dni_verificado,
          descripcion,
          instagram,
          email_contacto,
          profiles!inner(nombre, apellido, telefono, foto_url),
          oficial_oficios(oficios(*)),
          oficial_ciudades(ciudades(*))
        `)
        .eq('id', id)
        .eq('activo', true)
        .single()

      if (data) {
        const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
        const oficiosList = (data.oficial_oficios || []).map((o: unknown) => {
          const oficio = (o as { oficios: Oficio }).oficios
          return { oficio }
        })
        const ciudadesList = (data.oficial_ciudades || []).map((c: unknown) => {
          const ciudad = (c as { ciudades: Ciudad }).ciudades
          return { ciudad }
        })

        setOficial({
          id: data.id,
          dni_verificado: data.dni_verificado,
          descripcion: data.descripcion,
          instagram: data.instagram,
          email_contacto: data.email_contacto,
          profile,
          oficios: oficiosList,
          ciudades: ciudadesList
        })
      }
      
      setLoading(false)
    }

    async function fetchReviews() {
      const { data } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comentario,
          created_at,
          autor:profiles!inner(nombre, apellido)
        `)
        .eq('oficial_id', id)
        .order('created_at', { ascending: false })

      if (data) {
        const formatted = data.map((r: unknown) => {
          const review = r as { id: string; rating: number; comentario: string | null; created_at: string; autor: { nombre: string; apellido: string } | { nombre: string; apellido: string }[] }
          return {
            ...review,
            autor: Array.isArray(review.autor) ? review.autor[0] : review.autor
          }
        })
        setReviews(formatted)
        
        if (formatted.length > 0) {
          const avg = formatted.reduce((sum, r) => sum + r.rating, 0) / formatted.length
          setRatingPromedio(Math.round(avg * 10) / 10)
        }
      }
    }
    
    if (id) {
      fetchOficial()
      fetchReviews()
    }
  }, [id])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || newRating === 0) return

    setSubmitting(true)

    const { error } = await supabase.from('reviews').insert({
      oficial_id: id,
      autor_id: user.id,
      rating: newRating,
      comentario: newComentario || null
    })

    if (!error) {
      setShowForm(false)
      setNewRating(0)
      setNewComentario('')
      
      const { data } = await supabase
        .from('reviews')
        .select(`id, rating, comentario, created_at, autor:profiles!inner(nombre, apellido)`)
        .eq('oficial_id', id)
        .order('created_at', { ascending: false })

      if (data) {
        const formatted = data.map((r: unknown) => {
          const review = r as { id: string; rating: number; comentario: string | null; created_at: string; autor: { nombre: string; apellido: string } | { nombre: string; apellido: string }[] }
          return {
            ...review,
            autor: Array.isArray(review.autor) ? review.autor[0] : review.autor
          }
        })
        setReviews(formatted)
        if (formatted.length > 0) {
          const avg = formatted.reduce((sum, r) => sum + r.rating, 0) / formatted.length
          setRatingPromedio(Math.round(avg * 10) / 10)
        }
      }
    }

    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  if (!oficial) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-gray-500">Profesional no encontrado</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-medium flex-shrink-0">
            {oficial.profile.foto_url ? (
              <img 
                src={oficial.profile.foto_url} 
                alt="" 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              oficial.profile.nombre[0] + oficial.profile.apellido[0]
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {oficial.profile.nombre} {oficial.profile.apellido}
              </h1>
              {oficial.dni_verificado && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  Verificado
                </span>
              )}
            </div>

            {ratingPromedio && (
              <div className="flex items-center gap-2 mt-1">
                <Stars rating={ratingPromedio} size="sm" />
                <span className="text-sm text-gray-600">
                  {ratingPromedio} ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
                </span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              {oficial.oficios.map(({ oficio }) => (
                <span 
                  key={oficio.id}
                  className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-full"
                >
                  {oficio.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>

        {oficial.descripcion && (
          <div className="mb-6">
            <h2 className="font-medium mb-2">Sobre mí</h2>
            <p className="text-gray-600">{oficial.descripcion}</p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="font-medium mb-2">Zonas de trabajo</h2>
          <p className="text-gray-600">
            {oficial.ciudades.map(({ ciudad }) => ciudad.nombre).join(', ')}
          </p>
        </div>

        <div className="border-t pt-6">
          <h2 className="font-medium mb-4">Contacto</h2>
          <div className="flex flex-wrap gap-3">
            {oficial.profile.telefono && (
              <a
                href={`tel:${oficial.profile.telefono}`}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Llamar
              </a>
            )}
            
            {oficial.profile.telefono && (
              <a
                href={`https://wa.me/54${oficial.profile.telefono.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                WhatsApp
              </a>
            )}
            
            {oficial.email_contacto && (
              <a
                href={`mailto:${oficial.email_contacto}`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Email
              </a>
            )}
            
            {oficial.instagram && (
              <a
                href={`https://instagram.com/${oficial.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Instagram
              </a>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">Reseñas</h2>
            {canReview && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Escribir reseña
              </button>
            )}
          </div>

          {showForm && (
            <form onSubmit={handleSubmitReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Tu calificación</p>
                <Stars rating={newRating} size="lg" interactive onChange={setNewRating} />
              </div>
              <textarea
                placeholder="Contá tu experiencia (opcional)"
                value={newComentario}
                onChange={e => setNewComentario(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none mb-3"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting || newRating === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Enviar reseña'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">Aún no hay reseñas</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Stars rating={review.rating} size="sm" />
                    <span className="text-sm font-medium">
                      {review.autor.nombre} {review.autor.apellido}
                    </span>
                  </div>
                  {review.comentario && (
                    <p className="text-gray-600 text-sm">{review.comentario}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.created_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}