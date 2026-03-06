"use client"

import { useCallback, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface ImageDropzoneProps {
  onImageSelect: (file: File, base64: string) => void
  accept?: string
  label?: string
  loading?: boolean
  preview?: string | null
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function ImageDropzone({
  onImageSelect,
  accept = "image/jpeg,image/png,image/webp",
  label = "Upload an image",
  loading = false,
  preview = null,
}: ImageDropzoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      setError(null)

      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be under 10MB")
        return
      }

      const acceptedTypes = accept.split(",").map((t) => t.trim())
      if (!acceptedTypes.includes(file.type)) {
        setError("Unsupported file type")
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1]
        onImageSelect(file, base64)
      }
      reader.readAsDataURL(file)
    },
    [accept, onImageSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          loading && "pointer-events-none opacity-60"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {preview ? (
          <div className="flex flex-col items-center gap-3">
            <img
              src={`data:image/jpeg;base64,${preview}`}
              alt="Preview"
              className="max-h-48 rounded-lg object-contain"
            />
            <p className="text-sm text-muted-foreground">
              Click or drag to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Drag & drop or click to browse
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
