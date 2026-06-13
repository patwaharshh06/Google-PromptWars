import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { handler as analyzeHandler } from './netlify/functions/analyze'

export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, process.cwd(), '')
  
  // Set the environment variable for the local functions process context
  const geminiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY
  if (geminiKey) {
    process.env.GEMINI_API_KEY = geminiKey
  }

  return {
    plugins: [
      react(),
      {
        name: 'netlify-functions-dev',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url && req.url.startsWith('/api/analyze') && req.method === 'POST') {
              let body = ''
              req.on('data', (chunk) => {
                body += chunk
              })
              req.on('end', async () => {
                try {
                  const event = {
                    httpMethod: 'POST',
                    body: body,
                    headers: req.headers,
                  }
                  
                  const result = await analyzeHandler(event)
                  
                  res.writeHead(result.statusCode, result.headers)
                  res.end(result.body)
                } catch (err) {
                  console.error('Error in Vite dev proxy for Netlify function:', err)
                  res.writeHead(500, { 'Content-Type': 'application/json' })
                  res.end(JSON.stringify({ error: 'Internal Server Error in development handler.' }))
                }
              })
            } else {
              next()
            }
          })
        }
      }
    ],
    base: "./",
  }
})
