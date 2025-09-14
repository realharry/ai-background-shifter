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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">AI Background Shifter Settings</h1>
          </div>
          <p className="text-gray-600">
            Configure your AI image generation preferences and API settings.
          </p>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">AI Model Settings</h2>
            
            <div className="grid gap-4">
              <div>
                <label htmlFor="aiModel" className="block text-sm font-medium text-gray-800 mb-2">
                  AI Model
                </label>
                <select
                  id="aiModel"
                  value={settings.aiModel}
                  onChange={(e) => updateSetting('aiModel', e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <option value="dall-e-3">DALL-E 3 (OpenAI)</option>
                  <option value="dall-e-2">DALL-E 2 (OpenAI)</option>
                  <option value="stable-diffusion">Stable Diffusion</option>
                  <option value="midjourney">Midjourney</option>
                </select>
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-800 mb-2">
                  API Key
                </label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key"
                  value={settings.apiKey}
                  onChange={(e) => updateSetting('apiKey', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your API key is stored locally and never shared.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="imageSize" className="block text-sm font-medium text-gray-800 mb-2">
                    Image Size
                  </label>
                  <select
                    id="imageSize"
                    value={settings.imageSize}
                    onChange={(e) => updateSetting('imageSize', e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <option value="1024x1024">1024x1024 (Square)</option>
                    <option value="1792x1024">1792x1024 (Landscape)</option>
                    <option value="1024x1792">1024x1792 (Portrait)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quality" className="block text-sm font-medium text-gray-800 mb-2">
                    Quality
                  </label>
                  <select
                    id="quality"
                    value={settings.quality}
                    onChange={(e) => updateSetting('quality', e.target.value)}
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <option value="standard">Standard</option>
                    <option value="hd">HD (Higher Quality)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {saved && (
                  <span className="text-green-600">Settings saved successfully!</span>
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

        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">How to get API Keys:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>OpenAI (DALL-E):</strong> Visit platform.openai.com and create an API key</li>
            <li>• <strong>Stable Diffusion:</strong> Use services like Stability AI or Hugging Face</li>
            <li>• <strong>Other services:</strong> Check their respective documentation</li>
          </ul>
        </div>
      </div>
    </div>
  )
}