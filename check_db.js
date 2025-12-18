import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'psql 'postgresql://neondb_owner:npg_YC9ny1UrXjoZ@ep-broad-dawn-a1w7u6e6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require''
});

async function checkDB() {
  try {
    // Check if tables exist
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Existing tables:', res.rows.map(r => r.table_name));
    
    // Create tables if they don't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        stt INT UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        student_id INT,
        birth_date DATE,
        favorite_animal VARCHAR(255),
        selected_image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(student_id) REFERENCES students(id)
      )
    `);
    
    console.log('Tables created/verified');
    
    // Check student count
    const students = await pool.query('SELECT COUNT(*) FROM students');
    console.log('Student count:', students.rows[0].count);
    
    await pool.end();
  } catch (error) {
    console.error('DB Error:', error.message);
    process.exit(1);
  }
}

checkDB();
