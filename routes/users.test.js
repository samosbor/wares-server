const request = require('supertest');
const app = require('../server.js');

// Mock the query function from db.js
jest.mock('../db.js', () => ({
  query: jest.fn()
}));

describe('GET /:id', () => {
  it('should return the user with the given id', async () => {
    const mockUser = { user_id: 1, name: 'John Doe' };

    // Mock the query function to return the mockUser
    require('../db').query.mockResolvedValueOnce({ rows: [mockUser] });

    const response = await request(app).get('/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  it('should return 404 if no user is found', async () => {
    // Mock the query function to return an empty array
    require('../db').query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get('/1');

    expect(response.status).toBe(404);
  });
});