import { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface AvatarUploadProps {
  userId: string
  currentUrl: string | null
  onUpload: (url: string) => void
}

export function AvatarUpload({ userId, currentUrl, onUpload }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}.${fileExt}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName)
      const urlWithCache = `${data.publicUrl}?t=${Date.now()}`
      
      await supabase
        .from('profiles')
        .update({ foto_url: urlWithCache })
        .eq('id', userId)

      onUpload(urlWithCache)
    }

    setUploading(false)
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
        {currentUrl ? (
          <img src={currentUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-2xl">?</span>
        )}
      </div>
      <label className="cursor-pointer">
        <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition">
          {uploading ? 'Subiendo...' : 'Cambiar foto'}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  )
}