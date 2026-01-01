import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Oficio } from '../types'

export function Home() {
  const navigate = useNavigate()
  const [oficios, setOficios] = useState<Oficio[]>([])

  useEffect(() => {
    const fetchOficios = async () => {
      const { data } = await supabase
        .from('oficios')
        .select('*')
        .order('nombre')
      if (data) setOficios(data)
    }
    fetchOficios()
  }, [])

  const handleOficioClick = (slug: string) => {
    navigate(`/buscar?oficio=${slug}`)
  }

  return (
    <div className="min-h-[80vh] flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-blue-50 to-white">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
          Encontrá el profesional que necesitás
        </h1>
        <p className="text-lg text-gray-600 text-center mb-8 max-w-xl">
          Electricistas, plomeros, carpinteros y más en Córdoba. Perfiles verificados y con reseñas reales.
        </p>

        <div className="w-full max-w-xl bg-white border border-gray-200 rounded-xl px-5 py-4 text-center text-gray-500 shadow-sm">
          ¿Qué servicio necesitás? Hacé click en un oficio abajo
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Oficios populares</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {oficios.map(oficio => (
            <button
              key={oficio.id}
              onClick={() => handleOficioClick(oficio.slug)}
              className="p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition text-center"
            >
              <span className="text-gray-900 font-medium">{oficio.nombre}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">¿Por qué Oficios Córdoba?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-blue-600 text-xl">✓</span>
              </div>
              <h3 className="font-medium mb-2">Profesionales verificados</h3>
              <p className="text-sm text-gray-600">Verificamos la identidad de cada profesional con su DNI</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-blue-600 text-xl">★</span>
              </div>
              <h3 className="font-medium mb-2">Reseñas reales</h3>
              <p className="text-sm text-gray-600">Opiniones de clientes que ya contrataron el servicio</p>
            </div>
            <div className="bg-white p-6 rounded-xl">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-blue-600 text-xl">📍</span>
              </div>
              <h3 className="font-medium mb-2">Cobertura local</h3>
              <p className="text-sm text-gray-600">Profesionales en toda la provincia de Córdoba</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}