import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateTimePicker = ({ selected, onChange, disabled, minDate, placeholderText }) => {
  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      dateFormat="MMMM d, yyyy h:mm aa"
      minDate={minDate || new Date()}
      disabled={disabled}
      placeholderText={placeholderText || "Select date and time..."}
      className="input datetime-picker"
      calendarClassName="datetime-calendar"
      wrapperClassName="datetime-wrapper"
    />
  );
};

export default DateTimePicker;
