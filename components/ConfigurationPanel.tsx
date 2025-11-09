'use client'

import { useState } from 'react'

interface ConfigurationPanelProps {
  onSave: (config: {
    geminiApiKey: string
    mt5Server: string
    mt5Login: string
    mt5Password: string
  }) => void
  initialConfig: {
    geminiApiKey: string
    mt5Server: string
    mt5Login: string
    mt5Password: string
  }
}

export default function ConfigurationPanel({ onSave, initialConfig }: ConfigurationPanelProps) {
  const [config, setConfig] = useState(initialConfig)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(config)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
      <h2 className="text-3xl font-bold text-white mb-6">Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white mb-2 font-semibold">
            Gemini API Key
          </label>
          <input
            type="password"
            value={config.geminiApiKey}
            onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your Gemini API key"
            required
          />
          <p className="text-gray-300 text-sm mt-1">
            Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline">Google AI Studio</a>
          </p>
        </div>

        <div>
          <label className="block text-white mb-2 font-semibold">
            MT5 Server
          </label>
          <input
            type="text"
            value={config.mt5Server}
            onChange={(e) => setConfig({ ...config, mt5Server: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., MetaQuotes-Demo"
            required
          />
        </div>

        <div>
          <label className="block text-white mb-2 font-semibold">
            MT5 Login
          </label>
          <input
            type="text"
            value={config.mt5Login}
            onChange={(e) => setConfig({ ...config, mt5Login: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your MT5 account number"
            required
          />
        </div>

        <div>
          <label className="block text-white mb-2 font-semibold">
            MT5 Password
          </label>
          <input
            type="password"
            value={config.mt5Password}
            onChange={(e) => setConfig({ ...config, mt5Password: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your MT5 password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
        >
          Start Trading Bot
        </button>
      </form>
    </div>
  )
}
