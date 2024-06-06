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

    const location_id = await getLatestLocationByAssetId(asset.asset_id)
    var user_id = req.body.user_id
    if (user_id == '') {
        await getUserByEmail(req.body.email).then((user) => {
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

// get an asset_extended by asset_id
router.get('/:id', async (req, res) => {
    const id = req.params.id
    const getAssetExtendedSqlString = `
    SELECT a.*
    FROM assets_extended a
    WHERE a.asset_id = $1;
    `
    const { rows } = await query(getAssetExtendedSqlString, [id])
    if (rows.length === 0) {
        console.error('Could not find asset with this id')
        throw new Error('Could not find asset with this id')
    } else {
        res.send(rows[0]) // Return the found asset
    }
})

router.get('/:id/history', async (req, res) => {
    const id = req.params.id
    const getAssetHistorySqlString = `
    SELECT * FROM scan_history WHERE asset_id = $1
    `
    const { rows } = await query(getAssetHistorySqlString, [id])
    res.send(rows)
})

// Put endpoint to update scan event
router.put('/scan/:id', async (req, res) => {
    const id = req.params.id
    const location_id = await getLocationIDByRoomNumber(req.body.room_number)

    const updateScanEventSqlString = `
    UPDATE scan_events
    SET location_id = $1
    WHERE scan_id = $2
    RETURNING scan_id;
    `
    const { rows } = await query(updateScanEventSqlString, [location_id, id])
    const scan_id = rows[0].scan_id
    await updateAssetById(req.body.asset_id, req.body)
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
    console.log(reqbody)
    console.log(asset_id)
    const { rows } = await query(updateAssetSqlString, [
        reqbody.name,
        reqbody.current_value,
        reqbody.purchase_date,
        reqbody.notes,
        asset_id
    ])
    console.log(rows)
    return rows[0].asset_id
}

// Function to get asset by barcode
async function getAssetByBarcode(barcode) {
    const getAssetByBarcodeSqlString = `
    SELECT a.*, at2.barcode
    FROM assets a
    INNER JOIN asset_tags at2 ON a.asset_id = at2.asset_id
    WHERE at2.barcode = $1;
    `
    const { rows } = await query(getAssetByBarcodeSqlString, [barcode])
    if (rows.length === 0) {
        console.error('Could not find asset with this barcode/qr/rfid')
        throw new Error('Could not find asset with this barcode/qr/rfid')
    } else {
        return rows[0] // Return the found asset
    }
}

// Funtion to get user by email
async function getUserByEmail(email) {
    const getUserByEmailSqlString = `
        SELECT * FROM users WHERE email = $1
    `
    const { rows } = await query(getUserByEmailSqlString, [email])
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
    SELECT * from asset_scans WHERE scan_id = $1
    `
    const { rows } = await query(getScanDataByIdSqlString, [scan_id])
    if (rows.length === 0) {
        console.error('Could not find scan data for this scan')
        throw new Error('Could not find scan data for this scan')
    } else {
        return rows[0] // Return the found scan data
    }
}

// Function to get location by room_number
async function getLocationIDByRoomNumber(room_number) {
    const getLocationByRoomNumberSqlString = `
    SELECT * FROM locations WHERE room_number = $1
    `
    const { rows } = await query(getLocationByRoomNumberSqlString, [room_number])
    if (rows.length === 0) {
        console.error('Could not find location by room_number')
        throw new Error('Could not find location by room_number')
    } else {
        return rows[0].location_id // Return the found location
    }
}

// Function to get latest location by asset_id
async function getLatestLocationByAssetId(asset_id) {
    const getLatestLocationByAssetIdSqlString = `
    SELECT location_id FROM scan_events WHERE asset_id = $1 AND location_id NOTNULL ORDER BY scan_id DESC LIMIT 1
    `
    const { rows } = await query(getLatestLocationByAssetIdSqlString, [asset_id])
    if (rows.length === 0) {
        return null
    } else {
        return parseInt(rows[0].location_id) // Return the found location
    }
}

export default router
