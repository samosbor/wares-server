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
  VALUES($1, $2, $3, $4)
  RETURNING scan_id;`
    const { rows } = await query(insertScanEventSqlString, [
        asset.asset_id,
        user_id,
        location_id, //do some work to get this
        req.body.wifi_ap
    ])
    console.log(rows)
    const scan_id = rows[0].scan_id
    // send back the scan and asset data
    const scanData = await getScanDataById(scan_id)
    res.send(scanData)
})

// Put endpoint to update scan event
router.put('/scan/:id', async (req, res) => {
    const id = req.params.id
    const updateScanEventSqlString = `
    UPDATE scan_events
    SET location_id = $1
    WHERE scan_id = $2
    RETURNING scan_id;
    `
    const { rows } = await query(updateScanEventSqlString, [req.body.location_id, id])
    const scan_id = rows[0].scan_id
    updateAssetById(req.body.asset_id, req.body)
    const scanData = await getScanDataById(scan_id)
    res.send(scanData)
})

// Function to update asset by id
async function updateAssetById(asset_id, reqbody) {
    const updateAssetSqlString = `
    UPDATE assets
    SET name = $1, current_value = $2, purchase_date = $3, notes = $4
    WHERE asset_id = $5
    RETURNING asset_id;
    `
    const { rows } = await query(updateAssetSqlString, [
        reqbody.name,
        reqbody.current_value,
        reqbody.purchase_date,
        reqbody.notes,
        asset_id
    ])
    return rows[0].asset_id
}

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

// Function to get all joined scan event and asset data by scan_id
async function getScanDataById(scan_id) {
    const getScanDataByIdSqlString = `
    SELECT se.scan_id, l.building_name, l.room_number, p.provider_name, a."name", a.current_value, a.purchase_date, a.barcode, a.notes, a.asset_id 
    FROM scan_events se
            left JOIN assets a ON se.asset_id = a.asset_id
            left JOIN locations l  ON se.location_id = l.location_id
            left JOIN providers p ON a.provider_id = p.provider_id
            WHERE se.scan_id = $1
    `
    const { rows } = await query(getScanDataByIdSqlString, [scan_id])
    if (rows.length === 0) {
        console.error('Could not find scan data for this scan')
        throw new Error('Could not find scan data for this scan')
    } else {
        return rows[0] // Return the found scan data
    }
}

export default router
