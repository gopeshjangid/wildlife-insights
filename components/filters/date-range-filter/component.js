/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import PropTypes from 'prop-types';
import { formatDate, parseDate } from 'utils/functions';
import classnames from 'classnames';
import './style.scss';

export const FORMAT = 'MM/dd/yyyy';

class DateRangeFilter extends React.Component {
  static defaultProps = {
    numberOfMonths: 2,
  };

  static isInvalidDate(val) {
    return parseDate(val, FORMAT) === undefined;
  }

  static keyPress(e) {
    if (e.charCode < 47 || e.charCode > 57) {
      e.preventDefault();
      return false;
    }
    return true;
  }

  constructor(props) {
    super(props);
    this.handleDayClick = this.handleDayClick.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.onChange = this.onChange.bind(this);
    this.state = this.getInitialState();
    this.handleCancel = this.handleCancel.bind(this);
    this.wrapperRef = React.createRef();
    this.onChangeFromDate = this.onChangeFromDate.bind(this);
    this.onChangeToDate = this.onChangeToDate.bind(this);
  }

  getInitialState() {
    return {
      from: this.props?.defaultFromDate || undefined,
      to: this.props?.defaultToDate || undefined,
      defaultRange: true,
      valFrom: formatDate(this.props?.defaultFromDate, FORMAT) || undefined,
      valTo: formatDate(this.props?.defaultToDate, FORMAT) || undefined,
      invalidFromDate: false,
      invalidToDate: false,
      initialMonth: this.props?.defaultToDate || new Date(),
    };
  }

  componentWillMount() {
    const { flagSetFilterOnMount, onChange, filterFormat } = this.props;
    if (flagSetFilterOnMount) {
      const { from, to } = this.state;
      const startDate = from !== undefined ? formatDate(from, filterFormat) : from;
      const endDate = to !== undefined ? formatDate(to, filterFormat) : to;
      onChange(startDate, endDate);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.closeOnclickOutsideCalender);
  }

  onChangeToDate(e) {
    const val = e.target.value;
    const { valFrom, from } = this.state;
    let invalidToDate = true;
    let { to } = this.state;
    const newDate = new Date(val);
    const tmpFromDate = new Date(formatDate(new Date(valFrom), FORMAT));
    let newFromDate = from;
    let { initialMonth } = this.state;
    if (!DateRangeFilter.isInvalidDate(val) && newDate >= tmpFromDate) {
      to = newDate;
      invalidToDate = false;
      initialMonth = newDate;
      if (from === undefined) {
        newFromDate = new Date(valFrom);
      }
    } else {
      to = undefined;
    }
    const invalidFromDate = tmpFromDate > newDate;
    this.setState({ valTo: val, to, invalidToDate, invalidFromDate, from: newFromDate, defaultRange: false, initialMonth });
  }

  onChangeFromDate(e) {
    const val = e.target.value;
    let { from } = this.state;
    const { valTo, to } = this.state;
    let { initialMonth } = this.state;
    let invalidFromDate = true;
    const newDate = new Date(val);
    const tmpToDate = new Date(formatDate(new Date(valTo), FORMAT));
    let newToDate = to;
    if (!DateRangeFilter.isInvalidDate(val) && newDate <= tmpToDate) {
      from = newDate;
      invalidFromDate = false;
      if (to === undefined) {
        newToDate = new Date(valTo);
      }
    } else {
      from = undefined;
    }
    if (!DateRangeFilter.isInvalidDate(valTo)) {
      initialMonth = new Date(valTo);
    }
    const invalidToDate = tmpToDate < newDate;
    this.setState({ valFrom: val, from, invalidFromDate, invalidToDate, to: newToDate, defaultRange: false, initialMonth });
  }

  onChange() {
    const { onChange, filterFormat } = this.props;
    const { from, to } = this.state;
    const startDate = from !== undefined ? formatDate(from, filterFormat) : from;
    const endDate = to !== undefined ? formatDate(to, filterFormat) : to;
    this.setState(previousState => ({
      ...previousState,
      show: false,
    }), () => {
      onChange(startDate, endDate);
    });
  }

  closeOnclickOutsideCalender = (event) => {
    if (this.wrapperRef && this.wrapperRef.current
      && !this.wrapperRef.current.contains(event.target)) {
      this.setState({
        show: false
      });
    }
  }

  handleShow(flag) {
    this.setState(previousState => ({
      ...previousState,
      show: flag,
    }), () => {
      document.addEventListener('mousedown', this.closeOnclickOutsideCalender);
    });
  }

  handleDayClick(day) {
    const range = DateUtils.addDayToRange(day, this.state);
    const { from, to } = range;
    const invalidFromDate = parseDate(from, FORMAT);
    const invalidToDate = parseDate(to, FORMAT);
    this.setState({
      from,
      to,
      defaultRange: false,
      valFrom: formatDate(from, FORMAT),
      valTo: formatDate(to, FORMAT),
      invalidFromDate,
      invalidToDate });
  }

  handleResetClick() {
    const { onChange } = this.props;
    this.setState(this.getInitialState());
    onChange();
  }

  handleCancel() {
    const cancelDate = this.getInitialState()
    this.setState({
      show: false,
      ...cancelDate
    });
  }

  render() {
    const { numberOfMonths } = this.props;
    const {
      valFrom, valTo, from, to, show, defaultRange, invalidFromDate, invalidToDate, initialMonth
    } = this.state;
    const modifiers = { start: from, end: to };
    return (
      <div className="RangeExample" ref={this.wrapperRef}>
        <div className="dateWrapper" onClick={this.handleShow.bind(this, true)}>
          <div className="range-label">Date Range</div>
          <div className="fromDate">
            <input
              type="text"
              value={valFrom}
              name="fromDateInput"
              id="fromDateInput"
              list="fromDateInput"
              placeholder="mm/dd/yyyy"
              onChange={this.onChangeFromDate}
              onKeyPress={DateRangeFilter.keyPress}
              maxLength={10}
              className={classnames('dateInput', { invalidDate: invalidFromDate })}
            />
          </div>
          <div>-</div>
          <div className="toDate">
            <input
              type="text"
              value={valTo}
              name="toDateInput"
              id="toDateInput"
              list="toDateInput"
              placeholder="mm/dd/yyyy"
              onChange={this.onChangeToDate}
              onKeyPress={DateRangeFilter.keyPress}
              maxLength={10}
              className={classnames('dateInput', { invalidDate: invalidToDate })}
            />
          </div>
          <div className="icon">
            {(from || to) && !defaultRange && (
            <button type="button" onClick={this.handleResetClick}>
              <img
                className="close-image"
                alt=""
                src="/static/ic_close_14px.png"
              />
            </button>
            )}
            {((!from && !to) || defaultRange)
          && (
            <button type="button" onClick={this.handleShow.bind(this, true)}>
              <img className="searchicon" alt="" src="/static/ic_date_range_18px.png" />
            </button>
          )
        }
          </div>
        </div>
        {show
          && (
          <div className="date-calendar">
            <div className="closeDayPicker">
              <button type="button" onClick={this.handleShow.bind(this, false)}>
                <img
                  className="close-image"
                  alt=""
                  src="/static/ic_close_14px.png"
                />
              </button>
            </div>
            <div className="DayPickerBottomPane">
              <button disabled={invalidFromDate || invalidToDate} className={classnames({ disabled: invalidFromDate || invalidToDate })} type="button" onClick={this.onChange}>
                OK
              </button>
              <button type="button" onClick={this.handleCancel}>
                Cancel
              </button>
            </div>
            <DayPicker
              className="Selectable"
              numberOfMonths={numberOfMonths}
              selectedDays={[from, { from, to }]}
              modifiers={modifiers}
              onDayClick={this.handleDayClick}
              month={initialMonth}
            />
          </div>
          )
        }
      </div>
    );
  }
}

DateRangeFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  filterFormat: PropTypes.string,
  defaultFromDate: PropTypes.instanceOf(Date),
  defaultToDate: PropTypes.instanceOf(Date),
  numberOfMonths: PropTypes.number,
  flagSetFilterOnMount: PropTypes.bool,
};

DateRangeFilter.defaultProps = {
  numberOfMonths: 1,
  defaultFromDate: undefined,
  defaultToDate: undefined,
  filterFormat: 'yyyy-MM-dd',
  flagSetFilterOnMount: false,
};

export default DateRangeFilter;
