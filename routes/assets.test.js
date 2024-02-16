const request = require('supertest');
const app = require('../server.js');

describe('POST /scan/:id', () => {
    it('should return 500 if identifier does not match', async () => {
      const response = await request(app)
        .post('/scan/123')
        .send({ identifier: '456' })
  
      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'identifier does not match' })
    })
  
    it('should return 200 and the scan event if asset is found and scan event is inserted', async () => {
      // Mock the getAssetByBarcode function to return a sample asset
      jest.mock('../db.js', () => ({
        query: jest.fn()
          .mockResolvedValueOnce({
            rows: [{ asset_id: 1, barcode: '123' }]
          })
          .mockResolvedValueOnce({
            rows: [{ asset_id: 1, user_id: 1, location_id: null, wifi_ap: 'AP123' }]
          })
      }))
  
      const response = await request(app)
        .post('/scan/123')
        .send({ identifier: '123', user_id: 1, wifi_ap: 'AP123' })
  
      expect(response.status).toBe(200)
      expect(response.body).toEqual({ asset_id: 1, user_id: 1, location_id: null, wifi_ap: 'AP123' })
    })
  
    it('should return 500 if asset is not found', async () => {
      // Mock the getAssetByBarcode function to return null
      jest.mock('../db.js', () => ({
        query: jest.fn().mockResolvedValueOnce({
          rows: []
        })
      }))
  
      const response = await request(app)
        .post('/scan/123')
        .send({ identifier: '123', user_id: 1, wifi_ap: 'AP123' })
  
      expect(response.status).toBe(500)
      expect(response.body).toEqual({ error: 'Could not find asset with this barcode/qr/rfid' })
    })
  })