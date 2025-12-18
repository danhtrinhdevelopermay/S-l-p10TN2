import { useState } from 'react'

export default function DatePicker({ value, onChange }) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date())

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateToString = (year, month, day) => {
    return `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
  }

  const handleSelectDay = (day) => {
    const dateString = formatDateToString(currentDate.getFullYear(), currentDate.getMonth(), day)
    onChange(dateString)
    setShowCalendar(false)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value)
    setCurrentDate(new Date(year, currentDate.getMonth()))
  }

  const handleMonthChange = (e) => {
    const month = parseInt(e.target.value)
    setCurrentDate(new Date(currentDate.getFullYear(), month))
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const days = []
  
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Chọn ngày sinh'
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
  }

  const currentYear = currentDate.getFullYear()
  const years = Array.from({ length: 120 }, (_, i) => currentYear - 100 + i)

  return (
    <div className="date-picker-wrapper">
      <div className="date-picker-input-box" onClick={() => setShowCalendar(!showCalendar)}>
        <input type="text" readOnly value={formatDate(value)} placeholder="DD/MM/YYYY" />
        <svg className="calendar-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>

      {showCalendar && (
        <>
          <div className="calendar-backdrop" onClick={() => setShowCalendar(false)}></div>
          <div className="calendar-popup">
            <div className="calendar-content">
            <div className="calendar-controls">
              <select className="year-input" value={currentDate.getFullYear()} onChange={handleYearChange}>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select className="month-input" value={currentDate.getMonth()} onChange={handleMonthChange}>
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>

            <div className="calendar-header">
              <button className="prev-btn" onClick={handlePrevMonth}>❮</button>
              <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
              <button className="next-btn" onClick={handleNextMonth}>❯</button>
            </div>

            <div className="calendar-grid">
              <div className="weekdays">
                {dayNames.map(day => (
                  <div key={day} className="weekday-label">{day}</div>
                ))}
              </div>
              <div className="days-grid">
                {days.map((day, index) => (
                  <div key={index}>
                    {day ? (
                      <button
                        className={`day-cell ${value === formatDateToString(currentDate.getFullYear(), currentDate.getMonth(), day) ? 'active' : ''}`}
                        onClick={() => handleSelectDay(day)}
                      >
                        {day}
                      </button>
                    ) : (
                      <div className="day-empty"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button className="close-btn" onClick={() => setShowCalendar(false)}>Xong</button>
          </div>
        </div>
        </>
      )}
    </div>
  )
}
