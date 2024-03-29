import Router from 'express-promise-router'
import { query } from '../db.js'
import bwipjs from 'bwip-js'
import archiver from 'archiver'
import fs from 'fs'

const router = new Router()

router.get('/all', async (req, res) => {
    //get all the rows from the assets_extended postgres view
    const { rows } = await query('SELECT * FROM assets_extended')
    res.send(rows)
})

// post endpoint to print barcodes with bwip-js
router.get('/print', async (req, res) => {
    let tmpfilename = `/tmp/${(new Date().toJSON().slice(0,10))}_barcodes.zip`
    const output = fs.createWriteStream(tmpfilename)
    const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    })

    archive.pipe(output)
    for (const barcode of req.query.assets.split(',')) {
        await bwipjs
            .toBuffer({
                bcid: 'code128', // Barcode type
                text: barcode, // Text to encode
                scale: 3, // 3x scaling factor
                height: 10, // Bar height, in millimeters
                includetext: true, // Show human-readable text
                textxalign: 'center' // Always good to set this
            })
            .then((png) => {
                archive.append(png, { name: barcode + '.png' })
            })
            .catch((err) => {
                console.error(err)
            })
    }
    archive.finalize()
    output.on('close', () => {
        res.download(tmpfilename)
    })
})

export default router
