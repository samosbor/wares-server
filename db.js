import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})

const query = (text, params) => pool.query(text, params)

export { query }
