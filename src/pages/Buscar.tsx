import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Stars } from '../components/ui/Stars'
import type { Oficio, Ciudad } from '../types'

interface OficialResult {
  id: string
  descripcion: string | null
  profile: {
    nombre: string
    apellido: string
    foto_url: string | null
  }
  oficios: { nombre: string; id: string }[]
  ciudades: { nombre: string; id: string }[]
  rating_promedio: number | null
  total_reviews: number
}

export function Buscar() {
  const [searchParams] = useSearchParams()
  const [oficios, setOficios] = useState<Oficio[]>([])
  const [ciudades, setCiudades] = useState<Ciudad[]>([])
  const [resultados, setResultados] = useState<OficialResult[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroOficio, setFiltroOficio] = useState('')
  const [filtroCiudad, setFiltroCiudad] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const [oficiosRes, ciudadesRes] = await Promise.all([
        supabase.from('oficios').select('*').order('nombre'),
        supabase.from('ciudades').select('*').order('nombre')
      ])
      if (oficiosRes.data) {
        setOficios(oficiosRes.data)
        
        const oficioSlug = searchParams.get('oficio')
        if (oficioSlug) {
          const found = oficiosRes.data.find(o => o.slug === oficioSlug)
          if (found) setFiltroOficio(found.id)
        }
      }
      if (ciudadesRes.data) setCiudades(ciudadesRes.data)
    }
    fetchData()
  }, [searchParams])

  useEffect(() => {
    const buscar = async () => {
      setLoading(true)

      let query = supabase
        .from('oficiales')
        .select(`
          id,
          descripcion,
          profiles!inner(nombre, apellido, foto_url),
          oficial_oficios!inner(oficios(*)),
          oficial_ciudades!inner(ciudades(*))
        `)
        .eq('activo', true)

      if (filtroOficio) {
        query = query.eq('oficial_oficios.oficio_id', filtroOficio)
      }

      if (filtroCiudad) {
        query = query.eq('oficial_ciudades.ciudad_id', filtroCiudad)
      }

      const { data } = await query

      const oficialIds = (data || []).map(d => d.id)
      
      let ratingsMap: Record<string, { rating_promedio: number; total_reviews: number }> = {}
      if (oficialIds.length > 0) {
        const { data: ratingsData } = await supabase
          .from('oficial_ratings')
          .select('*')
          .in('oficial_id', oficialIds)
        
        if (ratingsData) {
          ratingsMap = ratingsData.reduce((acc, r) => {
            acc[r.oficial_id] = { rating_promedio: r.rating_promedio, total_reviews: r.total_reviews }
            return acc
          }, {} as Record<string, { rating_promedio: number; total_reviews: number }>)
        }
      }

      const formatted: OficialResult[] = (data || []).map((item) => {
        const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
        const oficiosList = (item.oficial_oficios || []).map((o: unknown) => {
          const oficio = (o as { oficios: Oficio }).oficios
          return { id: oficio.id, nombre: oficio.nombre }
        })
        const ciudadesList = (item.oficial_ciudades || []).map((c: unknown) => {
          const ciudad = (c as { ciudades: Ciudad }).ciudades
          return { id: ciudad.id, nombre: ciudad.nombre }
        })
        const ratings = ratingsMap[item.id] || { rating_promedio: null, total_reviews: 0 }

        return {
          id: item.id,
          descripcion: item.descripcion,
          profile,
          oficios: oficiosList,
          ciudades: ciudadesList,
          rating_promedio: ratings.rating_promedio,
          total_reviews: ratings.total_reviews
        }
      })

      setResultados(formatted)
      setLoading(false)
    }

    buscar()
  }, [filtroOficio, filtroCiudad])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Buscar profesionales</h1>

      <div className="flex gap-4 mb-8">
        <select
          value={filtroOficio}
          onChange={e => setFiltroOficio(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
        >
          <option value="">Todos los oficios</option>
          {oficios.map(o => (
            <option key={o.id} value={o.id}>{o.nombre}</option>
          ))}
        </select>

        <select
          value={filtroCiudad}
          onChange={e => setFiltroCiudad(e.target.value)}
          className="px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-600 focus:outline-none"
        >
          <option value="">Todas las ciudades</option>
          {ciudades.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Buscando...</p>
      ) : resultados.length === 0 ? (
        <p className="text-gray-500">No se encontraron profesionales</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resultados.map(oficial => (
            <Link
              key={oficial.id}
              to={`/oficial/${oficial.id}`}
              className="block p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
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
                <div>
                  <h3 className="font-medium">
                    {oficial.profile.nombre} {oficial.profile.apellido}
                  </h3>
                  {oficial.rating_promedio && (
                    <div className="flex items-center gap-1">
                      <Stars rating={oficial.rating_promedio} size="sm" />
                      <span className="text-xs text-gray-500">
                        ({oficial.total_reviews})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {oficial.oficios.map(oficio => (
                  <span 
                    key={oficio.id}
                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full"
                  >
                    {oficio.nombre}
                  </span>
                ))}
              </div>

              <div className="text-sm text-gray-500">
                {oficial.ciudades.map(c => c.nombre).join(', ')}
              </div>

              {oficial.descripcion && (
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {oficial.descripcion}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}