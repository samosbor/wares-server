import users from './users.js'
import assets from './assets.js'

const mountRoutes = (app) => {
    app.use('/users', users)
    app.use('/assets', assets)
    console.log(assets)
    // etc..
}

export default mountRoutes
