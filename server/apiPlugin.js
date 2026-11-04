import { app } from './index.js'

/**
 * Vite plugin to attach the AdPilot AI backend express app to Vite's dev server
 */
export default function adPilotApiPlugin() {
  return {
    name: 'adpilot-api-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.startsWith('/api')) {
          app(req, res, next)
        } else {
          next()
        }
      })
    }
  }
}
