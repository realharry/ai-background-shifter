import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Loader2, RefreshCw, Check, X } from 'lucide-react'

interface BackgroundInfo {
  hasOriginal: boolean;
  currentImage: string | null;
}

export function SidePanel() {
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backgroundInfo, setBackgroundInfo] = useState<BackgroundInfo>({ hasOriginal: false, currentImage: null })

  useEffect(() => {
    // Get current background info
    chrome.runtime.sendMessage({ action: 'getBackgroundInfo' }, (response) => {
      if (response && response.success !== false) {
        setBackgroundInfo(response)
      }
    })
  }, [])

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateImage',
        prompt: prompt.trim()
      })

      if (response.success) {
        setGeneratedImage(response.imageUrl)
      } else {
        setError(response.error || 'Failed to generate image')
      }
    } catch {
      setError('Failed to generate image')
    } finally {
      setIsGenerating(false)
    }
  }

  const applyBackground = () => {
    if (!generatedImage) return

    chrome.runtime.sendMessage({
      action: 'changeBackground',
      imageUrl: generatedImage
    }, (response) => {
      if (response && response.success !== false) {
        setBackgroundInfo(prev => ({ ...prev, currentImage: generatedImage, hasOriginal: true }))
        setGeneratedImage(null)
      } else {
        setError(response?.error || 'Failed to apply background')
      }
    })
  }

  const restoreBackground = () => {
    chrome.runtime.sendMessage({ action: 'restoreBackground' }, (response) => {
      if (response && response.success !== false) {
        setBackgroundInfo(prev => ({ ...prev, currentImage: null }))
      } else {
        setError(response?.error || 'Failed to restore background')
      }
    })
  }

  const retryGeneration = () => {
    setGeneratedImage(null)
    generateImage()
  }

  return (
    <div className="w-80 h-screen bg-white p-4 flex flex-col">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800 mb-2">AI Background Shifter</h1>
        <p className="text-sm text-gray-600">
          Generate AI backgrounds for this webpage
        </p>
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-800 mb-2">
            Describe your background
          </label>
          <Textarea
            id="prompt"
            placeholder="e.g., A serene mountain landscape at sunset with purple clouds..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button 
          onClick={generateImage} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Background'
          )}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {generatedImage && (
          <div className="space-y-3">
            <div className="relative">
              <img
                src={generatedImage}
                alt="Generated background"
                className="w-full h-32 object-cover rounded-md border"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={applyBackground} className="flex-1">
                <Check className="mr-2 h-4 w-4" />
                Apply
              </Button>
              <Button onClick={retryGeneration} variant="outline" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        )}

        {backgroundInfo.currentImage && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Current background applied</p>
            <Button onClick={restoreBackground} variant="outline" className="w-full">
              <X className="mr-2 h-4 w-4" />
              Restore Original
            </Button>
          </div>
        )}
      </div>

      <div className="pt-4 border-t mt-auto">
        <Button
          variant="ghost"
          className="w-full text-xs"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          Settings
        </Button>
      </div>
    </div>
  )
}