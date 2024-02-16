import express from 'express'
import mountRoutes from './routes/index.js'
import cors from 'cors'

const app = express()
const port = 3000
app.use(cors)
app.use(express.json())
mountRoutes(app)

app.listen(port, () => {
    console.log(`Wares It At server listening on port ${port}`)
})
