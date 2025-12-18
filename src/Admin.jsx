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

  const getImagePath = (imageName) => {
    return `/images/${imageName}.jpg`
  }

  const downloadImage = async (sub, index) => {
    const canvas = document.createElement('canvas')
    const img = new Image()
    
    img.crossOrigin = 'anonymous'
    img.src = getImagePath(sub.selected_image)
    
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw image
      ctx.drawImage(img, 0, 0)
      
      // Add semi-transparent dark overlay at bottom
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.fillRect(0, canvas.height - 150, canvas.width, 150)
      
      // Add text
      ctx.fillStyle = '#FFFFFF'
      ctx.font = 'bold 48px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(sub.name, 30, canvas.height - 80)
      
      ctx.font = '36px Arial'
      ctx.fillText(`STT: ${index + 1}`, 30, canvas.height - 25)
      
      // Download
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/jpeg', 0.9)
      link.download = `${sub.name}_STT${index + 1}.jpg`
      link.click()
    }
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
        <div className="submissions-gallery">
          {submissions.map((sub, index) => (
            <div key={sub.id} className="submission-card">
              <div className="image-overlay-container">
                <img src={getImagePath(sub.selected_image)} alt={`Ảnh của ${sub.name}`} className="gallery-image" />
                <div className="overlay-text">
                  <h3>{sub.name}</h3>
                  <p><strong>STT:</strong> {index + 1}</p>
                  <p><strong>Ngày sinh:</strong> {formatDate(sub.birth_date)}</p>
                  <p><strong>Con vật yêu thích:</strong> {sub.favorite_animal}</p>
                  <p><strong>Ngày gửi:</strong> {formatDate(sub.created_at)}</p>
                </div>
              </div>
              <button className="btn-download" onClick={() => downloadImage(sub, index)}>
                ⬇ Tải ảnh
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
