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
    const asset = await getAssetByBarcode(id).then((asset) => {
        return asset
    })

    const location_id = null
    var user_id = req.body.user_id
    if (user_id == '') {
        await getUserByEmail(req.body.google_email).then((user) => {
            user_id = user.user_id
        })
    }

    const insertScanEventSqlString = `INSERT INTO scan_events
  (asset_id, user_id, location_id, wifi_ap)
  VALUES($1, $2, $3, $4);`
    const { rows } = await query(insertScanEventSqlString, [
        asset.asset_id,
        user_id,
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
    const { rows } = await query(getAssetByBarcodeSqlString, [barcode])
    if (rows.length === 0) {
        console.error('Could not find asset with this barcode/qr/rfid')
        throw new Error('Could not find asset with this barcode/qr/rfid')
    } else {
        return rows[0] // Return the found asset
    }
}

// Funtion to get user by google_email
async function getUserByEmail(google_email) {
    const getUserByEmailSqlString = `
        SELECT * FROM users WHERE google_email = $1
    `
    const { rows } = await query(getUserByEmailSqlString, [google_email])
    if (rows.length === 0) {
        console.error('Could not find user by email')
        throw new Error('Could not find user by email')
    } else {
        return rows[0] // Return the found user
    }
}

export default router
