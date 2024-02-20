import Router from 'express'
import { query } from '../db.js'

const router = new Router()

router.get('/:id', async (req, res) => {
    const { id } = req.params
    const { rows } = await query('SELECT * FROM users WHERE user_id = $1', [id])
    res.send(rows[0])
})

export default router