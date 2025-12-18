import { useState, useEffect } from 'react'
import DatePicker from './DatePicker'

const STUDENTS = [
  "Trần Văn An",
  "Lê Thị Huỳnh Anh",
  "Nguyễn Ngọc Duyên Anh",
  "Phạm Thế Anh",
  "Phan Thị Khánh Băng",
  "Trần Ngọc Diệu",
  "Nguyễn Khánh Duy",
  "Trần Thị Nhã Đan",
  "Nguyễn Ngọc Huỳnh Giao",
  "Đinh Nguyễn Anh Hào",
  "Võ Đặng Gia Hân",
  "Bùi Minh Hiếu",
  "Phạm Văn Hiếu",
  "Danh Minh Huy",
  "Phan Vũ Huy",
  "Trần Duy Khang",
  "Trần Nguyễn Mỹ Kim",
  "Nguyễn Thị Thùy Linh",
  "Hồ Văn Thanh Lĩnh",
  "Đỗ Tấn Lộc",
  "Tiết Thị Cẩm Ly",
  "Lê Ngọc Ngân",
  "Nguyễn Tỉnh Ngọc",
  "Trần Thị Cẩm Nhung",
  "Trần Nguyên Phú",
  "Phạm Võ Thanh Quỳnh",
  "Vũ Thị Ngọc Thắm",
  "Dương Đức Thiện",
  "Lâm Trường Thịnh",
  "Lê Trường Thịnh",
  "Bùi Minh Thuận",
  "Hồ Thủy Tiên",
  "Trần Thị Nhựt Trang",
  "Hồ Ngọc Trâm",
  "Danh Trình",
  "Trần Thị Ngọc Tuyền",
  "Thân Thái Tường",
  "Lại Cao Trường Vi",
  "Nguyễn Tường Vi",
  "Danh Thị Hồng Vinh",
  "Trần Trúc Vy"
]

export default function App() {
  const [step, setStep] = useState(1)
  const [students, setStudents] = useState([])
  const [formData, setFormData] = useState({
    studentId: '',
    birthDate: '',
    favoriteAnimal: '',
    selectedImage: ''
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch('/api/students')
      .then(r => r.json())
      .then(d => setStudents(d.data || []))
  }, [])

  const handleNameChange = (e) => {
    setFormData({ ...formData, studentId: parseInt(e.target.value) || '' })
  }

  const handleStep1Submit = () => {
    if (formData.studentId) {
      setStep(2)
    } else {
      alert('Vui lòng chọn tên của bạn')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageSelect = (imageName) => {
    setFormData({ ...formData, selectedImage: imageName })
  }

  const handleSubmit = async () => {
    if (!formData.studentId || !formData.birthDate || !formData.favoriteAnimal || !formData.selectedImage) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: parseInt(formData.studentId),
          birthDate: formData.birthDate,
          favoriteAnimal: formData.favoriteAnimal,
          selectedImage: formData.selectedImage
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSubmitted(true)
      } else {
        alert('Có lỗi xảy ra khi gửi dữ liệu')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Có lỗi xảy ra khi gửi dữ liệu')
    }
  }

  const handleReset = () => {
    setStep(1)
    setFormData({
      studentId: '',
      birthDate: '',
      favoriteAnimal: '',
      selectedImage: ''
    })
    setSubmitted(false)
  }

  return (
    <div className="container">
      {step === 1 && !submitted && (
        <div>
          <h1>Chọn Tên Của Bạn</h1>
          <div className="form-group">
            <label htmlFor="name">Danh sách học sinh:</label>
            <select 
              id="name"
              value={formData.studentId} 
              onChange={handleNameChange}
            >
              <option value="">-- Chọn tên --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.stt}. {student.name}
                </option>
              ))}
            </select>
          </div>
          <div className="button-group">
            <button className="btn-next" onClick={handleStep1Submit}>
              Tiếp tục
            </button>
          </div>
        </div>
      )}

      {step === 2 && !submitted && (
        <div>
          <h1>Điền Thông Tin Của Bạn</h1>
          
          <div className="form-group">
            <label>Tên: <strong>{formData.name}</strong></label>
          </div>

          <div className="form-group">
            <label>Ngày sinh:</label>
            <DatePicker 
              value={formData.birthDate}
              onChange={(date) => setFormData({ ...formData, birthDate: date })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="favoriteAnimal">Con vật yêu thích:</label>
            <input 
              id="favoriteAnimal"
              type="text" 
              name="favoriteAnimal"
              placeholder="Nhập tên con vật"
              value={formData.favoriteAnimal}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Chọn một ảnh:</label>
            <div className="image-selection">
              {['image1', 'image2', 'image3', 'image4', 'image5', 'image6'].map((img, idx) => (
                <div 
                  key={img}
                  className={`image-option ${formData.selectedImage === img ? 'selected' : ''}`}
                  onClick={() => handleImageSelect(img)}
                >
                  <img src={`/images/${img}.jpg`} alt={`Ảnh ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="button-group">
            <button className="btn-back" onClick={() => setStep(1)}>
              Quay lại
            </button>
            <button className="btn-next" onClick={handleSubmit}>
              Gửi
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div className="success-message">
          <h2>✓ Gửi thành công!</h2>
          <p>Cảm ơn bạn đã điền thông tin</p>
          <div className="summary">
            <p><strong>Tên:</strong> {formData.name}</p>
            <p><strong>Ngày sinh:</strong> {formData.birthDate}</p>
            <p><strong>Con vật yêu thích:</strong> {formData.favoriteAnimal}</p>
            <p><strong>Ảnh được chọn:</strong> {formData.selectedImage ? `Ảnh ${['image1', 'image2', 'image3', 'image4', 'image5', 'image6'].indexOf(formData.selectedImage) + 1}` : 'Không xác định'}</p>
          </div>
          <div className="button-group">
            <button className="btn-next" onClick={handleReset}>
              Bắt đầu lại
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
