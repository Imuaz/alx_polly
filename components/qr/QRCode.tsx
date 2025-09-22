"use client"

import React, { useRef } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Button } from "@/components/ui/button"

interface QRCodeProps {
  value: string
  size?: number
  className?: string
  fileName?: string
}

export function QRCode({ value, size = 160, className, fileName = "qr-code.png" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = fileName
    link.click()
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-center p-3 bg-white rounded-md border">
        <QRCodeCanvas value={value} size={size} includeMargin={true} ref={canvasRef as any} />
      </div>
      <div className="mt-2 flex justify-center">
        <Button variant="outline" size="sm" onClick={handleDownload}>Download QR</Button>
      </div>
    </div>
  )
}


