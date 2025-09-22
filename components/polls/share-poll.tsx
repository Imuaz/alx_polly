"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Share2, Copy, Check, Twitter, Facebook, Linkedin } from "lucide-react"
import { Poll } from "@/lib/types/poll"
import { QRCode } from "@/components/qr/QRCode"

interface SharePollProps {
  poll: Poll
}

export function SharePoll({ poll }: SharePollProps) {
  const [copied, setCopied] = useState(false)
  const pollUrl = `${window.location.origin}/polls/${poll.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleShare = (platform: string) => {
    const text = `Check out this poll: "${poll.title}" and vote!`
    let url = ""
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pollUrl)}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pollUrl)}`
        break
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pollUrl)}`
        break
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Poll
        </CardTitle>
        <CardDescription>
          Share this poll with others to get more votes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Direct Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Poll Link</label>
          <div className="flex gap-2">
            <Input value={pollUrl} readOnly className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          {copied && (
            <p className="text-sm text-green-600">Link copied to clipboard!</p>
          )}
        </div>

        {/* Social Media Sharing */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Share on Social Media</label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
              className="flex-1"
            >
              <Twitter className="h-4 w-4 mr-2" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('facebook')}
              className="flex-1"
            >
              <Facebook className="h-4 w-4 mr-2" />
              Facebook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('linkedin')}
              className="flex-1"
            >
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
          </div>
        </div>

        {/* QR Code */}
        <div className="space-y-2">
          <label className="text-sm font-medium">QR Code</label>
          <QRCode value={pollUrl} className="p-2" fileName={`poll-${poll.id}-qr.png`} />
        </div>

        {/* Share Stats */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Shares today</span>
            <Badge variant="secondary">12</Badge>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Total shares</span>
            <Badge variant="secondary">156</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
