import assets from './assets.js'
import users from './users.js'

// function to mount routes on the app
export default function mountRoutes(app) {
    app.use('/assets', assets)
    app.use('/users', users)
}