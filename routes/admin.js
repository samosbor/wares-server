import Router from 'express-promise-router'
import { query } from '../db.js'

const router = new Router()

router.get('/all', async (req, res) => {
    //get all the rows from the assets_extended postgres view
    const { rows } = await query('SELECT * FROM assets_extended')
    res.send(rows)
})

export default router
