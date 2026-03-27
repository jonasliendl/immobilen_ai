import 'dotenv/config'
import app from './app'

const PORT = Number(process.env.PORT) || 3001
const HOST = process.env.HOST ?? 'localhost'

app.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    app.log.error(err)
    throw err
  }
})
