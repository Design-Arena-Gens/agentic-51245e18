'use client'

import { useState, useEffect } from 'react'
import TradingDashboard from '@/components/TradingDashboard'
import ConfigurationPanel from '@/components/ConfigurationPanel'

export default function Home() {
  const [isConfigured, setIsConfigured] = useState(false)
  const [config, setConfig] = useState({
    geminiApiKey: '',
    mt5Server: '',
    mt5Login: '',
    mt5Password: '',
  })

  useEffect(() => {
    const savedConfig = localStorage.getItem('tradingBotConfig')
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      setConfig(parsed)
      setIsConfigured(true)
    }
  }, [])

  const handleConfigSave = (newConfig: typeof config) => {
    setConfig(newConfig)
    localStorage.setItem('tradingBotConfig', JSON.stringify(newConfig))
    setIsConfigured(true)
  }

  const handleReconfigure = () => {
    setIsConfigured(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            AI Forex Trading Bot
          </h1>
          <p className="text-gray-300">
            Powered by Gemini AI & MetaTrader 5
          </p>
        </header>

        {!isConfigured ? (
          <ConfigurationPanel onSave={handleConfigSave} initialConfig={config} />
        ) : (
          <TradingDashboard config={config} onReconfigure={handleReconfigure} />
        )}
      </div>
    </main>
  )
}
