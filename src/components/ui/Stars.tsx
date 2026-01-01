interface StarsProps {
    rating: number
    max?: number
    size?: 'sm' | 'md' | 'lg'
    interactive?: boolean
    onChange?: (rating: number) => void
  }
  
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }
  
  export function Stars({ rating, max = 5, size = 'md', interactive = false, onChange }: StarsProps) {
    const stars = []
  
    for (let i = 1; i <= max; i++) {
      const filled = i <= Math.floor(rating)
      const half = !filled && i === Math.ceil(rating) && rating % 1 >= 0.5
  
      stars.push(
        <span
          key={i}
          onClick={() => interactive && onChange?.(i)}
          className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''} ${sizes[size]}`}
        >
          {filled ? (
            <span className="text-yellow-400">★</span>
          ) : half ? (
            <span className="text-yellow-400">★</span>
          ) : (
            <span className="text-gray-300">★</span>
          )}
        </span>
      )
    }
  
    return <span className="inline-flex gap-0.5">{stars}</span>
  }