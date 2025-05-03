
import { cn } from "@/lib/utils"
import { useState } from "react"

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  className?: string
  placeholder?: string
}

export function OptimizedImage({ 
  src, 
  alt, 
  className,
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'%3E%3C/svg%3E",
  ...props 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "transition-opacity duration-300",
        isLoading ? "opacity-0" : "opacity-100",
        className
      )}
      onLoad={() => setIsLoading(false)}
      loading="lazy"
      {...props}
    />
  )
}
