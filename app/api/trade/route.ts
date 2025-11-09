import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

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

interface MarketData {
  pair: string
  price: number
  change24h: number
  volatility: number
  trend: string
}

// Currency pairs
const CURRENCY_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF',
  'AUD/USD', 'USD/CAD', 'NZD/USD'
]

// Simulate market data
function generateMarketData(): MarketData[] {
  return CURRENCY_PAIRS.map(pair => ({
    pair,
    price: 1.0 + Math.random() * 0.5,
    change24h: (Math.random() - 0.5) * 0.02,
    volatility: Math.random() * 0.01,
    trend: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH'
  }))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { config, currentTrades, balance } = body

    if (!config?.geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is required' },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(config.geminiApiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // Generate market data
    const marketData = generateMarketData()

    // Prepare prompt for Gemini AI
    const prompt = `You are an expert forex trading AI. Analyze the current market conditions and make a trading decision.

Current Market Data:
${JSON.stringify(marketData, null, 2)}

Current Open Trades:
${JSON.stringify(currentTrades.filter((t: Trade) => t.status === 'OPEN'), null, 2)}

Account Balance: $${balance}

Trading Rules:
1. Maximum 3 open trades at a time
2. Risk no more than 2% per trade
3. Use proper risk management and stop losses
4. Focus on high-probability setups
5. Consider trend, volatility, and price action
6. Take profit when target is reached (typically 2-3% gain)
7. Close losing trades early to minimize losses

Your task:
1. Analyze the market data and current positions
2. Decide if you should: OPEN_TRADE, CLOSE_TRADE, or HOLD
3. If opening a trade, specify: pair, type (BUY/SELL), volume (0.1-1.0), entry price, and reasoning
4. If closing a trade, specify: trade ID and reasoning
5. Provide detailed market analysis

Response format (JSON):
{
  "action": "OPEN_TRADE" | "CLOSE_TRADE" | "HOLD",
  "analysis": "Your detailed market analysis...",
  "trade": {
    "pair": "EUR/USD",
    "type": "BUY" | "SELL",
    "volume": 0.5,
    "entryPrice": 1.1234,
    "reasoning": "Why this trade..."
  },
  "tradeId": "id_to_close" (only if CLOSE_TRADE)
}

Respond ONLY with valid JSON, no markdown formatting.`

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Parse AI response
    let aiDecision
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      aiDecision = JSON.parse(cleanText)
    } catch (e) {
      console.error('Failed to parse AI response:', text)
      // Return a default HOLD action with the analysis
      aiDecision = {
        action: 'HOLD',
        analysis: text || 'Analyzing market conditions...'
      }
    }

    return NextResponse.json(aiDecision)

  } catch (error: any) {
    console.error('Trading API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process trading request' },
      { status: 500 }
    )
  }
}
