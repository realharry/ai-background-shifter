import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Save, Settings } from 'lucide-react'

interface Settings {
  aiModel: string;
  apiKey: string;
  imageSize: string;
  quality: string;
}

const DEFAULT_SETTINGS: Settings = {
  aiModel: 'dall-e-3',
  apiKey: '',
  imageSize: '1792x1024',
  quality: 'standard'
}

export function OptionsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load settings from Chrome storage
    chrome.storage.sync.get(['settings'], (result) => {
      if (result.settings) {
        setSettings({ ...DEFAULT_SETTINGS, ...result.settings })
      }
    })
  }, [])

  const saveSettings = async () => {
    setIsSaving(true)
    
    try {
      await chrome.storage.sync.set({ settings })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '672px', margin: '0 auto', padding: '32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Settings style={{ height: '32px', width: '32px', color: '#2563eb' }} />
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937' }}>AI Background Shifter Settings</h1>
          </div>
          <p style={{ color: '#6b7280' }}>
            Configure your AI image generation preferences and API settings.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', backgroundColor: 'white', padding: '24px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937' }}>AI Model Settings</h2>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label htmlFor="aiModel" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>
                  AI Model
                </label>
                <select
                  id="aiModel"
                  value={settings.aiModel}
                  onChange={(e) => updateSetting('aiModel', e.target.value)}
                  style={{ width: '100%', height: '40px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', padding: '8px 12px', fontSize: '14px' }}
                >
                  <option value="dall-e-3">DALL-E 3 (OpenAI)</option>
                  <option value="dall-e-2">DALL-E 2 (OpenAI)</option>
                  <option value="stable-diffusion">Stable Diffusion</option>
                  <option value="midjourney">Midjourney</option>
                </select>
              </div>

              <div>
                <label htmlFor="apiKey" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>
                  API Key
                </label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={settings.apiKey}
                  onChange={(e) => updateSetting('apiKey', e.target.value)}
                />
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Your API key is stored locally and never shared.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label htmlFor="imageSize" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>
                    Image Size
                  </label>
                  <select
                    id="imageSize"
                    value={settings.imageSize}
                    onChange={(e) => updateSetting('imageSize', e.target.value)}
                    style={{ width: '100%', height: '40px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', padding: '8px 12px', fontSize: '14px' }}
                  >
                    <option value="1024x1024">1024x1024 (Square)</option>
                    <option value="1792x1024">1792x1024 (Landscape)</option>
                    <option value="1024x1792">1024x1792 (Portrait)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quality" style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>
                    Quality
                  </label>
                  <select
                    id="quality"
                    value={settings.quality}
                    onChange={(e) => updateSetting('quality', e.target.value)}
                    style={{ width: '100%', height: '40px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', padding: '8px 12px', fontSize: '14px' }}
                  >
                    <option value="standard">Standard</option>
                    <option value="hd">HD (Higher Quality)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {saved && (
                  <span style={{ color: '#16a34a' }}>Settings saved successfully!</span>
                )}
              </div>
              <Button onClick={saveSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Save className="mr-2 h-4 w-4 animate-pulse" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
          <h3 style={{ fontWeight: '500', color: '#1f2937', marginBottom: '8px' }}>How to get API Keys:</h3>
          <ul style={{ fontSize: '14px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>• <strong>OpenAI (DALL-E):</strong> Visit platform.openai.com and create an API key</li>
            <li>• <strong>Stable Diffusion:</strong> Use services like Stability AI or Hugging Face</li>
            <li>• <strong>Other services:</strong> Check their respective documentation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}