import { useState } from 'react'

export default function DatePicker({ value, onChange }) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date())

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleSelectDay = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = selected.toISOString().split('T')[0]
    onChange(dateString)
    setShowCalendar(false)
  }

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value)
    setCurrentMonth(new Date(year, currentMonth.getMonth()))
  }

  const handleMonthChange = (e) => {
    const month = parseInt(e.target.value)
    setCurrentMonth(new Date(currentMonth.getFullYear(), month))
  }

  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
  
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  
  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
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

  const currentYear = currentMonth.getFullYear()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i)

  return (
    <div className="date-picker-container">
      <div className="date-picker-input" onClick={() => setShowCalendar(!showCalendar)}>
        <span>{formatDate(value)}</span>
        <span className="calendar-icon">📅</span>
      </div>

      {showCalendar && (
        <div className="date-picker-calendar">
          <div className="calendar-header">
            <select value={currentMonth.getFullYear()} onChange={handleYearChange} className="year-select">
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <select value={currentMonth.getMonth()} onChange={handleMonthChange} className="month-select">
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          <div className="calendar-nav">
            <button onClick={handlePrevMonth} className="nav-btn">‹</button>
            <span className="current-month">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button onClick={handleNextMonth} className="nav-btn">›</button>
          </div>

          <div className="calendar-weekdays">
            {dayNames.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-days">
            {days.map((day, index) => (
              <div key={index}>
                {day ? (
                  <button
                    className={`day-btn ${value === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().split('T')[0] ? 'selected' : ''}`}
                    onClick={() => handleSelectDay(day)}
                  >
                    {day}
                  </button>
                ) : (
                  <div className="empty-day"></div>
                )}
              </div>
            ))}
          </div>

          <button className="close-calendar" onClick={() => setShowCalendar(false)}>Đóng</button>
        </div>
      )}
    </div>
  )
}
