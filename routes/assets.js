import Router from 'express-promise-router'
import { query } from '../db.js'

const router = new Router()

router.post('/scan/:id', async (req, res) => {
    console.log('scanning')
    // sanity check
    if (req.params.id != req.body.identifier) {
        console.error('identifier does not match')
        res.status(500).send({ error: 'identifier does not match' })
        return
    }
    const id = req.params.id
    const asset = getAssetByBarcode(id)
    if (asset === null){
        console.error('Could not find asset with this barcode/qr/rfid')
        throw new Error('Could not find asset with this barcode/qr/rfid');
    }
    
    const location_id = null

    const insertScanEventSqlString = `INSERT INTO scan_events
  (asset_id, user_id, location_id, wifi_ap)
  VALUES($1, $2, $3, $4);`
    const { rows } = await query(insertScanEventSqlString, [
        asset.asset_id,
        req.body.user_id,
        location_id, //do some work to get this
        req.body.wifi_ap
    ])
    res.send(rows[0])
})


// Function to get asset by barcode
async function getAssetByBarcode(barcode) {
    const getAssetByBarcodeSqlString = `
        SELECT * FROM assets WHERE barcode = $1
    `
    try {
        const { rows } = await query(getAssetByBarcodeSqlString, [barcode])
        if (rows.length === 0) {
            return null; // Asset not found
        } else {
            return rows[0]; // Return the found asset
        }
    } catch (error) {
        console.error('Error fetching asset by barcode:', error)
        throw new Error('Internal server error');
    }
}

export default router