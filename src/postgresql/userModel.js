const { pool } = require('../config/postgres');

const createUser = async (email, password) => {
  const query = `
    INSERT INTO users (email, password)
    VALUES ($1, $2)
    RETURNING id, email, created_at
  `;
  const { rows } = await pool.query(query, [email, password]);
  return rows[0];
};

const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

const findUserById = async (id) => {
  const { rows } = await pool.query('SELECT id, email, created_at FROM users WHERE id = $1', [id]);
  return rows[0];
};

module.exports = {createUser, findUserByEmail, findUserById};