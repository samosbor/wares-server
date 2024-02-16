import express from 'express'
import mountRoutes from './routes/index.js'
import cors from 'cors'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())
mountRoutes(app)

// log all routes available to the console
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(r.route.path)
    }
})

app.listen(port, () => {
    console.log(`Wares It At server listening on port ${port}`)
})
