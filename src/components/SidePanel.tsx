import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Loader2, RefreshCw, Check, X } from 'lucide-react'

interface BackgroundInfo {
  hasOriginal: boolean;
  currentImage: string | null;
}

// Mock chrome API for testing
const mockChrome = {
  runtime: {
    sendMessage: (message: any, callback?: (response: any) => void) => {
      console.log('Mock sendMessage:', message);
      if (callback) {
        setTimeout(() => {
          if (message.action === 'generateImage') {
            callback({ success: true, imageUrl: 'https://picsum.photos/800/600?random=' + Date.now() });
          } else {
            callback({ success: true });
          }
        }, 1000);
      }
    },
    openOptionsPage: () => {
      console.log('Mock openOptionsPage');
    }
  }
};

const chromeAPI = (window as any).chrome || mockChrome;

export function SidePanel() {
  const [prompt, setPrompt] = useState('')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backgroundInfo, setBackgroundInfo] = useState<BackgroundInfo>({ hasOriginal: false, currentImage: null })

  useEffect(() => {
    // Get current background info
    try {
      chromeAPI.runtime.sendMessage({ action: 'getBackgroundInfo' }, (response: any) => {
        if (response && response.success !== false) {
          setBackgroundInfo(response)
        }
      })
    } catch (err) {
      console.log('Chrome runtime not available, using mock data');
    }
  }, [])

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      chromeAPI.runtime.sendMessage({
        action: 'generateImage',
        prompt: prompt.trim()
      }, (response: any) => {
        if (response && response.success) {
          setGeneratedImage(response.imageUrl)
        } else {
          setError(response?.error || 'Failed to generate image')
        }
        setIsGenerating(false)
      })
    } catch (err) {
      setError('Failed to generate image')
      setIsGenerating(false)
    }
  }

  const applyBackground = () => {
    if (!generatedImage) return

    try {
      chromeAPI.runtime.sendMessage({
        action: 'changeBackground',
        imageUrl: generatedImage
      }, (response: any) => {
        if (response && response.success !== false) {
          setBackgroundInfo(prev => ({ ...prev, currentImage: generatedImage, hasOriginal: true }))
          setGeneratedImage(null)
        } else {
          setError(response?.error || 'Failed to apply background')
        }
      })
    } catch (err) {
      setError('Failed to apply background')
    }
  }

  const restoreBackground = () => {
    try {
      chromeAPI.runtime.sendMessage({ action: 'restoreBackground' }, (response: any) => {
        if (response && response.success !== false) {
          setBackgroundInfo(prev => ({ ...prev, currentImage: null }))
        } else {
          setError(response?.error || 'Failed to restore background')
        }
      })
    } catch (err) {
      setError('Failed to restore background')
    }
  }

  const retryGeneration = () => {
    setGeneratedImage(null)
    generateImage()
  }

  return (
    <div style={{ width: '320px', height: '100vh', backgroundColor: 'white', padding: '16px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>AI Background Shifter</h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Generate AI backgrounds for this webpage
        </p>
      </div>

      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label htmlFor="prompt" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>
            Describe your background
          </label>
          <Textarea
            id="prompt"
            placeholder="e.g., A serene mountain landscape at sunset with purple clouds..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ minHeight: '100px' }}
          />
        </div>

        <Button 
          onClick={generateImage} 
          disabled={isGenerating || !prompt.trim()}
          style={{ width: '100%' }}
        >
          {isGenerating ? (
            <>
              <Loader2 style={{ marginRight: '8px', height: '16px', width: '16px', animation: 'spin 1s linear infinite' }} />
              Generating...
            </>
          ) : (
            'Generate Background'
          )}
        </Button>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px' }}>
            <p style={{ fontSize: '14px', color: '#dc2626' }}>{error}</p>
          </div>
        )}

        {generatedImage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <img
                src={generatedImage}
                alt="Generated background"
                style={{ width: '100%', height: '128px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #d1d5db' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button onClick={applyBackground} style={{ flex: '1' }}>
                <Check style={{ marginRight: '8px', height: '16px', width: '16px' }} />
                Apply
              </Button>
              <Button onClick={retryGeneration} variant="outline" style={{ flex: '1' }}>
                <RefreshCw style={{ marginRight: '8px', height: '16px', width: '16px' }} />
                Retry
              </Button>
            </div>
          </div>
        )}

        {backgroundInfo.currentImage && (
          <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Current background applied</p>
            <Button onClick={restoreBackground} variant="outline" style={{ width: '100%' }}>
              <X style={{ marginRight: '8px', height: '16px', width: '16px' }} />
              Restore Original
            </Button>
          </div>
        )}
      </div>

      <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb', marginTop: 'auto' }}>
        <Button
          variant="ghost"
          style={{ width: '100%', fontSize: '12px' }}
          onClick={() => chromeAPI.runtime.openOptionsPage()}
        >
          Settings
        </Button>
      </div>
    </div>
  )
}