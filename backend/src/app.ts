import Fastify from 'fastify'

const app = Fastify({ logger: true })

app.get('/health', () => {
  return { status: 'ok' }
})

export default app
