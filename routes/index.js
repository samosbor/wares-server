import users from './users.js'
import items from './items.js'

const mountRoutes = (app) => {
    app.use('/users', users)
    app.use('/items', items)
    // etc..
}

export default mountRoutes
