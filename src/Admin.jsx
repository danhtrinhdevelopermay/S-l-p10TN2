import { useState, useEffect } from 'react'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsAuthenticated(true)
        fetchSubmissions()
      } else {
        setError('Mật khẩu không đúng')
      }
    } catch (err) {
      setError('Có lỗi xảy ra')
    }
    
    setLoading(false)
  }

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(`/api/admin/submissions?password=${encodeURIComponent(password)}`)
      const data = await response.json()
      
      if (data.success) {
        setSubmissions(data.data)
      }
    } catch (err) {
      console.error('Error fetching submissions:', err)
    }
  }

  const handleExport = () => {
    window.location.href = `/api/admin/export?password=${encodeURIComponent(password)}`
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
    setSubmissions([])
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN')
  }

  if (!isAuthenticated) {
    return (
      <div className="container admin-container">
        <h1>Trang Quản Trị</h1>
        <div className="form-group">
          <label>Nhập mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Mật khẩu"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="button-group">
          <button className="btn-next" onClick={handleLogin} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </div>
        <p className="back-link">
          <a href="/">← Quay về trang chính</a>
        </p>
      </div>
    )
  }

  return (
    <div className="container admin-container admin-wide">
      <div className="admin-header">
        <h1>Danh Sách Thông Tin Học Sinh</h1>
        <div className="admin-actions">
          <button className="btn-export" onClick={handleExport}>
            Xuất CSV
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>

      <p className="submission-count">Tổng số: {submissions.length} phản hồi</p>

      {submissions.length === 0 ? (
        <p className="no-data">Chưa có dữ liệu</p>
      ) : (
        <div className="table-wrapper">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên</th>
                <th>Ngày sinh</th>
                <th>Con vật yêu thích</th>
                <th>Ảnh chọn</th>
                <th>Ngày gửi</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, index) => (
                <tr key={sub.id}>
                  <td>{index + 1}</td>
                  <td>{sub.name}</td>
                  <td>{formatDate(sub.birth_date)}</td>
                  <td>{sub.favorite_animal}</td>
                  <td>Ảnh {sub.selected_image === 'image1' ? '1' : '2'}</td>
                  <td>{formatDate(sub.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
