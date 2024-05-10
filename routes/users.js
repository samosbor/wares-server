import Router from 'express-promise-router'
import { query } from '../db.js'

const router = new Router()

router.get('/:id', async (req, res) => {
    const { id } = req.params
    const { rows } = await query('SELECT * FROM users WHERE user_id = $1', [id])
    res.send(rows[0])
})

// route to get user by email
router.get('/email/:email', async (req, res) => {
    const { email } = req.params
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email])
    // if there are no rows, add the user to the database
    if (rows.length === 0) {
        await query('INSERT INTO users (email, role) VALUES ($1, $2)', [email, 'user'])
        const { rows } = await query('SELECT * FROM users WHERE email = $1', [email])
        res.send(rows[0])
        return
    }


    res.send(rows[0])
})

// /admin route to get all users with admin role
router.get('/admin', async (req, res) => {
    const { rows } = await query('SELECT * FROM users WHERE role = $1', ['admin'])
    res.send(rows)
})

// route to create user with fields email, role
router.post('/', async (req, res) => {
    const { email, role } = req.body
    await query('INSERT INTO users (email, role) VALUES ($1, $2)', [email, role])
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
