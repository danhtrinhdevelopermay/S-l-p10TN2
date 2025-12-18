import { useState, useEffect, useRef } from 'react'

export default function Admin() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [textSettings, setTextSettings] = useState({
    offsetX: -120,
    offsetY: 150,
    nameFontSize: 32,
    sttFontSize: 32
  })
  const canvasRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('textSettings')
    if (saved) {
      setTextSettings(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (showSettings && canvasRef.current && submissions.length > 0) {
      drawPreview()
    }
  }, [textSettings, showSettings, submissions])

  const drawPreview = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const previewImg = new Image()
    previewImg.crossOrigin = 'anonymous'
    previewImg.src = `/images/${submissions[0].selected_image}.jpg`
    
    previewImg.onload = () => {
      const ctx = canvas.getContext('2d')
      const maxWidth = 500
      const scale = maxWidth / previewImg.width
      canvas.width = previewImg.width * scale
      canvas.height = previewImg.height * scale

      ctx.scale(scale, scale)
      ctx.drawImage(previewImg, 0, 0)

      const textX = previewImg.width + textSettings.offsetX
      const textY = textSettings.offsetY

      // Draw name
      ctx.fillStyle = '#000000'
      ctx.font = `bold ${textSettings.nameFontSize}px Arial`
      ctx.textAlign = 'right'
      ctx.fillText('Danh Trình', textX, textY)

      // Draw STT
      ctx.font = `bold ${textSettings.sttFontSize}px Arial`
      ctx.fillText(`STT: ${submissions[0].stt}`, textX, textY + 50)
    }
  }

  const saveSettings = () => {
    localStorage.setItem('textSettings', JSON.stringify(textSettings))
    alert('Cài đặt đã được lưu!')
  }

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

  const downloadImage = async (sub) => {
    try {
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
        
        // Add text on image (using saved settings)
        const textX = img.width + textSettings.offsetX
        const textY = textSettings.offsetY
        
        // Draw name
        ctx.fillStyle = '#000000'
        ctx.font = `bold ${textSettings.nameFontSize}px Arial`
        ctx.textAlign = 'right'
        
        const name = sub.name || 'Unknown'
        const words = name.split(' ')
        let line1 = '', line2 = ''
        
        if (words.length > 2) {
          line1 = words.slice(0, Math.ceil(words.length / 2)).join(' ')
          line2 = words.slice(Math.ceil(words.length / 2)).join(' ')
        } else {
          line1 = name
        }
        
        ctx.fillText(line1, textX, textY)
        if (line2) {
          ctx.fillText(line2, textX, textY + (textSettings.nameFontSize * 1.2))
          ctx.font = `bold ${textSettings.sttFontSize}px Arial`
          ctx.fillText(`STT: ${sub.stt || '?'}`, textX, textY + (textSettings.nameFontSize * 2.4))
        } else {
          ctx.font = `bold ${textSettings.sttFontSize}px Arial`
          ctx.fillText(`STT: ${sub.stt || '?'}`, textX, textY + (textSettings.nameFontSize * 1.2))
        }
        
        // Download
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/jpeg', 0.9)
        link.download = `${name}_STT${sub.stt || 'unknown'}.jpg`
        link.click()
      }
      
      img.onerror = () => {
        alert('Lỗi tải ảnh. Vui lòng thử lại.')
      }
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Lỗi tải ảnh: ' + error.message)
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
          <button className="btn-settings" onClick={() => setShowSettings(!showSettings)}>
            ⚙ Cài đặt
          </button>
          <button className="btn-export" onClick={handleExport}>
            Xuất CSV
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <h3>Cài đặt vị trí chữ - Xem trước ảnh bên dưới</h3>
          
          <div className="preview-container">
            <canvas ref={canvasRef} className="preview-canvas"></canvas>
          </div>

          <div className="settings-grid">
            <div className="settings-group">
              <label>Vị trí ngang (X):</label>
              <input 
                type="number" 
                value={textSettings.offsetX}
                onChange={(e) => setTextSettings({...textSettings, offsetX: parseInt(e.target.value) || 0})}
                className="number-input"
              />
            </div>
            <div className="settings-group">
              <label>Vị trí dọc (Y):</label>
              <input 
                type="number" 
                value={textSettings.offsetY}
                onChange={(e) => setTextSettings({...textSettings, offsetY: parseInt(e.target.value) || 0})}
                className="number-input"
              />
            </div>
            <div className="settings-group">
              <label>Kích thước chữ - Tên (px):</label>
              <input 
                type="number" 
                value={textSettings.nameFontSize}
                onChange={(e) => setTextSettings({...textSettings, nameFontSize: parseInt(e.target.value) || 1})}
                className="number-input"
              />
            </div>
            <div className="settings-group">
              <label>Kích thước chữ - STT (px):</label>
              <input 
                type="number" 
                value={textSettings.sttFontSize}
                onChange={(e) => setTextSettings({...textSettings, sttFontSize: parseInt(e.target.value) || 1})}
                className="number-input"
              />
            </div>
          </div>

          <button className="btn-save-settings" onClick={saveSettings}>
            💾 Lưu cài đặt
          </button>
        </div>
      )}

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
                  <p><strong>STT:</strong> {sub.stt}</p>
                  <p><strong>Ngày sinh:</strong> {formatDate(sub.birth_date)}</p>
                  <p><strong>Con vật yêu thích:</strong> {sub.favorite_animal}</p>
                  <p><strong>Ngày gửi:</strong> {formatDate(sub.created_at)}</p>
                </div>
              </div>
              <button className="btn-download" onClick={() => downloadImage(sub)}>
                ⬇ Tải ảnh
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
