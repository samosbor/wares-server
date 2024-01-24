import Router from 'express-promise-router'
import { query } from '../db.js'

const router = new Router()

export default router

router.post('/scan/:id', async (req, res) => {
    // sanity check
    if (req.params.id != req.body.asset_id) {
        console.error('asset_id does not match')
        res.status(500).send({ error: 'asset_id does not match' })
        return
    }

    const id = req.params.id
    const insertScanEventSqlString = `INSERT INTO scan_events
  (asset_id, user_id, location_id, wifi_ap)
  VALUES($1, $2, $3, $4);`
    const { rows } = await query(insertScanEventSqlString, [
        id,
        req.body.user_id,
        req.body.location_id,
        req.body.wifi_ap
    ])
    res.send(rows[0])
})
