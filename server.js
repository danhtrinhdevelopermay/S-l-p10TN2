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
  connectionString: 'postgresql://postgres:password@helium/heliumdb?sslmode=disable'
});

app.post('/api/submit', async (req, res) => {
  try {
    const { name, birthDate, favoriteAnimal, selectedImage } = req.body;
    
    const result = await pool.query(
      'INSERT INTO submissions (name, birth_date, favorite_animal, selected_image) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, birthDate, favoriteAnimal, selectedImage]
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
    const result = await pool.query('SELECT * FROM submissions ORDER BY created_at DESC');
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
    
    let csv = 'ID,Tên,Ngày sinh,Con vật yêu thích,Ảnh chọn,Ngày gửi\n';
    result.rows.forEach(row => {
      csv += `${row.id},"${row.name}",${row.birth_date},"${row.favorite_animal}",${row.selected_image},${row.created_at}\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=submissions.csv');
    res.send('\uFEFF' + csv);
  } catch (error) {
    console.error('Error exporting submissions:', error);
    res.status(500).json({ success: false, error: 'Failed to export submissions' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
