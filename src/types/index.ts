export type Role = 'demandante' | 'oficial'

export interface Profile {
  id: string
  role: Role
  nombre: string
  apellido: string
  telefono?: string
  foto_url?: string
  ciudad_id?: string
  created_at: string
}

export interface Oficial {
  id: string
  dni?: string
  dni_verificado: boolean
  descripcion?: string
  instagram?: string
  email_contacto?: string
  activo: boolean
}

export interface Oficio {
  id: string
  nombre: string
  slug: string
  icono?: string
}

export interface Ciudad {
  id: string
  nombre: string
  departamento?: string
}

export interface Review {
  id: string
  oficial_id: string
  autor_id: string
  rating: number
  comentario?: string
  created_at: string
}

export interface OficialConDatos extends Oficial {
  profile: Profile
  oficios: Oficio[]
  ciudades: Ciudad[]
  rating_promedio?: number
  total_reviews?: number
}