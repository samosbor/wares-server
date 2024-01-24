import Router from 'express-promise-router'
import db from '../db.js'

const router = new Router()

export default router

router.post('/scan/:id', async (req, res) => {
    const id = req.params
    const insertScanEventSqlString = `INSERT INTO scan_events
  (asset_id, user_id, location_id, wifi_ap)
  VALUES($1, $2, $3, $4);`
    const { rows } = await db.query(
        insertScanEventSqlString[(id, req.body.user_id, req.body.location_id, req.body.wifi_ap)]
    )
    res.send(rows[0])
})
