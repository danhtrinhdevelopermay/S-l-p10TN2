import { useState } from 'react'

export default function ColorPicker({ value, onChange }) {
  const colors = [
    { name: 'Vàng', code: '#FFD700' },
    { name: 'Nâu', code: '#A0522D' },
    { name: 'Xanh lá', code: '#228B22' },
    { name: 'Xanh dương', code: '#0066CC' },
    { name: 'Tím', code: '#800080' },
    { name: 'Hồng', code: '#FF69B4' },
    { name: 'Trắng', code: '#F5F5F5' }
  ]

  return (
    <div className="color-picker-container">
      <div className="color-grid">
        {colors.map((color) => (
          <div
            key={color.code}
            className={`color-option ${value === color.code ? 'selected' : ''}`}
            onClick={() => onChange(color.code)}
            title={color.name}
          >
            <div 
              className="color-box"
              style={{ 
                backgroundColor: color.code,
                border: color.code === '#F5F5F5' ? '2px solid #ddd' : 'none'
              }}
            ></div>
            <span className="color-name">{color.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
