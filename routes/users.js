import Router from 'express-promise-router'
import db from '../db.js'

const router = new Router()

export default router

router.get('/:id', async (req, res) => {
    const { id } = req.params
    const { rows } = await db.query('SELECT * FROM users WHERE user_id = $1', [id])
    res.send(rows[0])
})
