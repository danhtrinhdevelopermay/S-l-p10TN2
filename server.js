import express from 'express';
import pg from 'pg';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, stt, name FROM students ORDER BY stt');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch students' });
  }
});

app.post('/api/submit', async (req, res) => {
  try {
    const { studentId, birthDate, favoriteAnimal, selectedImage } = req.body;
    console.log('Received submit:', { studentId, birthDate, favoriteAnimal, selectedImage });
    
    const parsedStudentId = parseInt(studentId, 10);
    if (isNaN(parsedStudentId)) {
      return res.status(400).json({ success: false, error: 'Invalid studentId' });
    }
    
    const result = await pool.query(
      'INSERT INTO submissions (student_id, birth_date, favorite_animal, selected_image) VALUES ($1, $2, $3, $4) RETURNING *',
      [parsedStudentId, birthDate, favoriteAnimal, selectedImage]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error saving submission:', error);
    res.status(500).json({ success: false, error: 'Failed to save submission' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect password' });
  }
});

app.get('/api/admin/submissions', async (req, res) => {
  const { password } = req.query;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  try {
    const result = await pool.query(`
      SELECT s.*, st.stt, st.name 
      FROM submissions s 
      LEFT JOIN students st ON s.student_id = st.id 
      ORDER BY st.stt NULLS LAST, s.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
  }
});

app.get('/api/admin/export', async (req, res) => {
  const { password } = req.query;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  try {
    const result = await pool.query('SELECT * FROM submissions ORDER BY created_at DESC');
    
    let csv = 'STT,Tên,Ngày sinh,Con vật yêu thích,Ảnh chọn,Ngày gửi\n';
    for (const row of result.rows) {
      const studentRes = await pool.query('SELECT stt, name FROM students WHERE id = $1', [row.student_id]);
      const student = studentRes.rows[0];
      if (student) {
        csv += `${student.stt},"${student.name}",${row.birth_date},"${row.favorite_animal}",${row.selected_image},${row.created_at}\n`;
      }
    }
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=submissions.csv');
    res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('Error exporting submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to export submissions' });
  }
});

// Add cache-busting headers for images
app.use((req, res, next) => {
  if (req.path.includes('/images/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
