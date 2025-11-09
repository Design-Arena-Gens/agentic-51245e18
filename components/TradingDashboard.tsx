'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Trade {
  id: string
  pair: string
  type: 'BUY' | 'SELL'
  entryPrice: number
  currentPrice: number
  volume: number
  profit: number
  timestamp: number
  status: 'OPEN' | 'CLOSED'
  aiReasoning: string
}

interface TradingDashboardProps {
  config: {
    geminiApiKey: string
    mt5Server: string
    mt5Login: string
    mt5Password: string
  }
  onReconfigure: () => void
}

export default function TradingDashboard({ config, onReconfigure }: TradingDashboardProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [trades, setTrades] = useState<Trade[]>([])
  const [balance, setBalance] = useState(10000)
  const [totalProfit, setTotalProfit] = useState(0)
  const [equity, setEquity] = useState(10000)
  const [balanceHistory, setBalanceHistory] = useState<Array<{ time: string; balance: number }>>([])
  const [aiAnalysis, setAiAnalysis] = useState<string>('Waiting to start...')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(async () => {
        await runTradingCycle()
      }, 5000) // Run every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, trades])

  const runTradingCycle = async () => {
    try {
      // Call the API to analyze market and make trading decisions
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          currentTrades: trades,
          balance,
        }),
      })

      const data = await response.json()

      if (data.analysis) {
        setAiAnalysis(data.analysis)
      }

      if (data.action === 'OPEN_TRADE' && data.trade) {
        const newTrade: Trade = {
          id: Date.now().toString(),
          pair: data.trade.pair,
          type: data.trade.type,
          entryPrice: data.trade.entryPrice,
          currentPrice: data.trade.entryPrice,
          volume: data.trade.volume,
          profit: 0,
          timestamp: Date.now(),
          status: 'OPEN',
          aiReasoning: data.trade.reasoning,
        }
        setTrades([...trades, newTrade])
      }

      if (data.action === 'CLOSE_TRADE' && data.tradeId) {
        const updatedTrades = trades.map((trade) => {
          if (trade.id === data.tradeId) {
            const closedTrade = { ...trade, status: 'CLOSED' as const }
            const profit = closedTrade.profit
            setBalance((prev) => prev + profit)
            setTotalProfit((prev) => prev + profit)
            return closedTrade
          }
          return trade
        })
        setTrades(updatedTrades)
      }

      // Update current prices and profits for open trades
      const updatedTrades = trades.map((trade) => {
        if (trade.status === 'OPEN') {
          const priceChange = (Math.random() - 0.5) * 0.001 // Simulate price movement
          const newPrice = trade.currentPrice * (1 + priceChange)
          const pips = trade.type === 'BUY'
            ? (newPrice - trade.entryPrice) * 10000
            : (trade.entryPrice - newPrice) * 10000
          const profit = pips * trade.volume * 10 // Simplified profit calculation

          return {
            ...trade,
            currentPrice: newPrice,
            profit,
          }
        }
        return trade
      })
      setTrades(updatedTrades)

      // Update equity
      const openProfit = updatedTrades
        .filter((t) => t.status === 'OPEN')
        .reduce((sum, t) => sum + t.profit, 0)
      setEquity(balance + openProfit)

      // Update balance history
      const now = new Date()
      setBalanceHistory((prev) => [
        ...prev.slice(-20),
        { time: now.toLocaleTimeString(), balance: balance + openProfit },
      ])

      setLastUpdate(new Date())
    } catch (error) {
      console.error('Trading cycle error:', error)
    }
  }

  const toggleBot = () => {
    setIsRunning(!isRunning)
  }

  const openTrades = trades.filter((t) => t.status === 'OPEN')
  const closedTrades = trades.filter((t) => t.status === 'CLOSED')

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Bot Control</h2>
            <p className="text-gray-300">Status: {isRunning ? '🟢 Active' : '🔴 Stopped'}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={toggleBot}
              className={`px-8 py-4 rounded-lg font-bold text-white transition-all transform hover:scale-105 shadow-lg ${
                isRunning
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? 'Stop Bot' : 'Start Bot'}
            </button>
            <button
              onClick={onReconfigure}
              className="px-8 py-4 rounded-lg font-bold text-white bg-gray-600 hover:bg-gray-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 shadow-lg">
          <h3 className="text-white/80 text-sm mb-2">Balance</h3>
          <p className="text-3xl font-bold text-white">${balance.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 shadow-lg">
          <h3 className="text-white/80 text-sm mb-2">Equity</h3>
          <p className="text-3xl font-bold text-white">${equity.toFixed(2)}</p>
        </div>
        <div className={`bg-gradient-to-br ${totalProfit >= 0 ? 'from-green-500 to-green-700' : 'from-red-500 to-red-700'} rounded-xl p-6 shadow-lg`}>
          <h3 className="text-white/80 text-sm mb-2">Total Profit</h3>
          <p className="text-3xl font-bold text-white">${totalProfit.toFixed(2)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl p-6 shadow-lg">
          <h3 className="text-white/80 text-sm mb-2">Open Trades</h3>
          <p className="text-3xl font-bold text-white">{openTrades.length}</p>
        </div>
      </div>

      {/* Balance Chart */}
      {balanceHistory.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Balance History</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="time" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI Analysis */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">AI Analysis</h2>
        <div className="bg-black/30 rounded-lg p-4">
          <p className="text-gray-200 whitespace-pre-wrap">{aiAnalysis}</p>
          <p className="text-gray-400 text-sm mt-2">Last update: {lastUpdate.toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Open Trades */}
      {openTrades.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Open Trades</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4">Pair</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Entry</th>
                  <th className="text-left py-3 px-4">Current</th>
                  <th className="text-left py-3 px-4">Volume</th>
                  <th className="text-left py-3 px-4">Profit</th>
                  <th className="text-left py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {openTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4">{trade.pair}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        trade.type === 'BUY' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{trade.entryPrice.toFixed(5)}</td>
                    <td className="py-3 px-4">{trade.currentPrice.toFixed(5)}</td>
                    <td className="py-3 px-4">{trade.volume}</td>
                    <td className={`py-3 px-4 font-bold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${trade.profit.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-2">
            {openTrades.map((trade) => (
              <div key={`reason-${trade.id}`} className="bg-black/30 rounded-lg p-3">
                <p className="text-gray-300 text-sm">
                  <span className="font-bold text-blue-400">{trade.pair} {trade.type}:</span> {trade.aiReasoning}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trade History */}
      {closedTrades.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Trade History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4">Pair</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Entry</th>
                  <th className="text-left py-3 px-4">Exit</th>
                  <th className="text-left py-3 px-4">Profit</th>
                  <th className="text-left py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {closedTrades.slice(-10).reverse().map((trade) => (
                  <tr key={trade.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="py-3 px-4">{trade.pair}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        trade.type === 'BUY' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{trade.entryPrice.toFixed(5)}</td>
                    <td className="py-3 px-4">{trade.currentPrice.toFixed(5)}</td>
                    <td className={`py-3 px-4 font-bold ${trade.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${trade.profit.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
