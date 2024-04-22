import React, { useEffect } from 'react';
import './calender.css';

function Calendar() {
  useEffect(() => {
    const calendarElement = document.getElementById('calendar');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    function getDaysInMonth(month, year) {
      return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(month, year) {
      return new Date(year, month, 1).getDay();
    }

    function createCalendar(month, year) {
      calendarElement.innerHTML = '';

      for (let i = 0; i < 7; i++) {
        const header = document.createElement('div');
        header.className = 'header day';
        header.textContent = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i];
        calendarElement.appendChild(header);
      }

      const firstDayOfMonth = getFirstDayOfMonth(month, year);

      for (let i = 0; i < firstDayOfMonth; i++) {
        const blankCell = document.createElement('div');
        blankCell.className = 'day';
        calendarElement.appendChild(blankCell);
      }

      const daysInMonth = getDaysInMonth(month, year);
      for (let i = 1; i <= daysInMonth; i++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day';
        dayCell.textContent = i;
        calendarElement.appendChild(dayCell);
      }
    }

    createCalendar(currentMonth, currentYear);
  }, []);

  return (
    <div>
      <div className="calendar" id="calendar"></div>
    </div>
  );
}

export default Calendar;