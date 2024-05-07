import Router from 'express-promise-router'
import { query } from '../db.js'

const router = new Router()

router.get('/:id', async (req, res) => {
    console.log('getting user')
    const { id } = req.params
    const { rows } = await query('SELECT * FROM users WHERE user_id = $1', [id])
    res.send(rows[0])
})

// /admin route to get all users with admin role
router.get('/admin', async (req, res) => {
    const { rows } = await query('SELECT * FROM users WHERE role = $1', ['admin'])
    res.send(rows)
})

// route to create user with fields google_user_id, google_email, role
router.post('/', async (req, res) => {
    const { google_user_id, google_email, role } = req.body
    await query('INSERT INTO users (google_user_id, google_email, role) VALUES ($1, $2, $3)', [google_user_id, google_email, role])
    res.send('User created')
})


// route to update user's role
router.put('/:id', async (req, res) => {
    const { id } = req.params
    const { role } = req.body
    await query('UPDATE users SET role = $1 WHERE user_id = $2', [role, id])
    res.send('User updated')
})


export default router
