import React from 'react';
import DayPicker, { DateUtils } from 'react-day-picker';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { formatDate, parseDate, getFormattedDate } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import './style.scss';
const FORMAT = 'MM/dd/yyyy';
class DateRangeFilter extends React.Component {
  static defaultProps = {
    numberOfMonths: 2
  };

  static isInvalidDate(val) {
    return parseDate(val, FORMAT) === undefined;
  }

  keyPress(e) {
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
      focused: false,
      from: this.props?.defaultFromDate || undefined,
      to: this.props?.defaultToDate || undefined,
      defaultRange: true,
      valFrom: formatDate(this.props?.defaultFromDate, FORMAT) || undefined,
      valTo: formatDate(this.props?.defaultToDate, FORMAT) || undefined,
      invalidFromDate: false,
      invalidToDate: false,
      invalidRange: false,
      initialMonth: this.props?.defaultToDate || new Date()
    };
  }

  componentWillMount() {
    const { flagSetFilterOnMount, onChange, filterFormat } = this.props;
    if (flagSetFilterOnMount) {
      const { from, to } = this.state;
      const startDate =
        from !== undefined ? formatDate(from, filterFormat) : from;
      const endDate = to !== undefined ? formatDate(to, filterFormat) : to;
      onChange(startDate, endDate);
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.closeOnclickOutsideCalender);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.filterRange !== prevProps?.filterRange) {
      this.setState({
        ...this.state,
        valFrom: formatDate(this.props.filterRange.from, FORMAT),
        valTo: formatDate(this.props.filterRange.to, FORMAT)
      });
    }
  }

  onChangeToDate(e) {
    const val = e.target.value;

    if (!DateRangeFilter.isInvalidDate(val)) {
      const startDate = new Date(formatDate(new Date(val), FORMAT));
      this.props.onChange(this.props.filterRange.from, startDate);
    }
    this.setState({
      ...this.state,
      valTo: val
    });
  }

  onChangeFromDate(e) {
    const val = e.target.value;

    if (!DateRangeFilter.isInvalidDate(val) && this.props.onChange) {
      const startDate = new Date(formatDate(new Date(val), FORMAT));
      this.props.onChange(startDate, this.props.filterRange.to);
    }
    let startDate = new Date(val);
    let endDate = new Date(this.state.valTo);
    this.setState({
      ...this.state,
      valFrom: val,
      invalidRange: startDate.getTime() > endDate.getTime()
    });
  }

  onChange() {
    const { onChange, filterFormat } = this.props;
    const { from, to } = this.state;
    const startDate =
      from !== undefined ? formatDate(from, filterFormat) : from;
    const endDate = to !== undefined ? formatDate(to, filterFormat) : to;
    this.setState(
      previousState => ({
        ...previousState,
        show: false
      }),
      () => {
        if (onChange) onChange(startDate, endDate);
      }
    );
  }

  closeOnclickOutsideCalender = event => {
    if (
      this.wrapperRef &&
      this.wrapperRef.current &&
      !this.wrapperRef.current.contains(event.target)
    ) {
      this.setState({
        show: false,
        focused: false
      });
    }
  };

  handleShow(flag) {
    let lastDate = new Date(
      this.props.filterRange.from.getFullYear(),
      this.props.filterRange.from.getMonth() + 1,
      0
    );

    if (!this.state.show && this.props.fetchDeployments) {
      this.props.fetchDeployments(
        this.props.valFrom || this.props.filterRange.from,
        lastDate
      );
    }

    this.setState(
      previousState => ({
        ...previousState,
        focused: flag ? this.state.focused : false,
        show: flag
      }),
      () => {
        document.addEventListener(
          'mousedown',
          this.closeOnclickOutsideCalender
        );
      }
    );
  }

  handleDayClick(day) {
    const range = DateUtils.addDayToRange(day, this.state);
    const { from, to } = range;
    if (from && to) {
      this.setState({
        from,
        to,
        defaultRange: false,
        valFrom: formatDate(from, FORMAT),
        valTo: formatDate(to, FORMAT),
        focused: true
      });
    }
  }

  handleResetClick(type) {
    const { onChange, filterFormat } = this.props;
    const { from, to } = this.state;
    const startDate =
      type !== 'from' && from !== undefined
        ? formatDate(from, filterFormat)
        : '';
    const endDate =
      type !== 'to' && to !== undefined ? formatDate(to, filterFormat) : to;
    this.setState({
      ...this.state,
      from: type === 'from' ? '' : from,
      to: type === 'to' ? '' : to
    });
    onChange(startDate, endDate);
  }

  handleCancel() {
    const cancelDate = this.getInitialState();
    this.setState({
      show: false,
      ...cancelDate
    });
  }

  renderDay = day => {
    const { deploymentsData } = this.props;
    const date = day.getDate();
    const dateValue = getFormattedDate(new Date(day), 'yyyy-MM-dd');
    let filteredData = deploymentsData
      ? deploymentsData.filter(item => item?.requestedDate === dateValue)
      : [];
    const count =
      (filteredData.length && filteredData[0]?.deploymentCount) || 0;
    return (
      <div className={count ? '' : deploymentsData && 'grayed-out-date'}>
        <div className={deploymentsData && 'day-number'}>{date}</div>
        {count ? <p className={'deployment-label'}>{count}</p> : ''}
      </div>
    );
  };

  onMonthChange = nextMonth => {
    let lastDate = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth() + 1,
      0
    );
    if (this.props.fetchDeployments) {
      this.props.fetchDeployments(nextMonth, lastDate);
    }
  };

  onFocus = e => {
    this.setState({ ...this.state, focused: true });
  };

  onBlurHandler = e => {
    this.setState({ ...this.state, focused: false });
  };

  onClearHandler = e => {
    this.setState({ ...this.state, valFrom: new Date(), valTo: new Date() });
  };

  render() {
    const { isLoading, hideDateLabel } = this.props;
    const {
      valFrom,
      valTo,
      from,
      to,
      show,
      invalidFromDate,
      invalidToDate
    } = this.state;
    const modifiers = { start: from, end: to };

    return (
      <div className="selectable-range" ref={this.wrapperRef}>
        <div className="date-field-wrapper">
          <div
            className="dateWrapper"
            onClick={this.handleShow.bind(this, true)}
          >
            {!hideDateLabel && <div className="range-label">Start Date</div>}
            <div className="fromDate">
              <input
                type="text"
                value={
                  this.state.focused
                    ? valFrom
                    : formatDate(this.props.filterRange.from, FORMAT)
                }
                name="startDate"
                id="fromDateInput"
                list="fromDateInput"
                placeholder="mm/dd/yyyy"
                onChange={this.onChangeFromDate}
                onFocus={this.onFocus}
                onBlur={this.onBlurHandler}
                onKeyPress={this.keyPress}
                maxLength={10}
                className={classnames('dateInput', {
                  invalidDate: invalidFromDate
                })}
              />
            </div>
            <div className="icon">
              <i onClick={this.handleShow.bind(this, true)}>
                <img
                  className="searchicon"
                  alt=""
                  src="/static/ic_date_range_18px.png"
                />
              </i>
            </div>
          </div>
          <div
            className="dateWrapper"
            onClick={this.handleShow.bind(this, true)}
          >
            <div className="toDate">
              {!hideDateLabel && <div className="range-label">End Date</div>}
              <input
                type="text"
                value={
                  this.state.focused
                    ? valTo
                    : formatDate(this.props.filterRange.to, FORMAT)
                }
                name="startDate"
                id="toDateInput"
                list="toDateInput"
                placeholder="mm/dd/yyyy"
                onChange={this.onChangeToDate}
                onFocus={this.onFocus}
                onBlur={this.onBlurHandler}
                onKeyPress={this.keyPress}
                maxLength={10}
                className={classnames('dateInput', {
                  invalidDate: invalidToDate
                })}
              />
            </div>
            <div className="icon">
              <i onClick={this.handleShow.bind(this, true)}>
                <img
                  className="searchicon"
                  alt=""
                  src="/static/ic_date_range_18px.png"
                />
              </i>
            </div>
          </div>
        </div>
        {this.state.invalidRange ? (
          <div className="date-calendar-error">Invalid date range.</div>
        ) : (
          ''
        )}
        {show && (
          <div className="date-calendar">
            {isLoading ? <LoadingSpinner inline /> : ''}
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
              <button
                disabled={invalidFromDate || invalidToDate}
                className={classnames(
                  {
                    disabled: invalidFromDate || invalidToDate
                  },
                  'calender-ok-btn'
                )}
                type="button"
                onClick={this.onChange}
              >
                Done
              </button>
              <button
                className="calender-cancel-btn"
                type="button"
                onClick={this.onClearHandler}
              >
                Clear
              </button>
            </div>
            <DayPicker
              className="Selectable"
              onBlur={this.onBlurHandler}
              selectedDays={[
                new Date(valFrom),
                { from: new Date(valFrom), to: new Date(valTo) }
              ]}
              modifiers={modifiers}
              onDayClick={this.handleDayClick}
              month={new Date(this.props?.filterRange.from)}
              renderDay={this.renderDay}
              onMonthChange={this.onMonthChange}
            />
          </div>
        )}
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
  flagSetFilterOnMount: PropTypes.bool
};

DateRangeFilter.defaultProps = {
  numberOfMonths: 1,
  defaultFromDate: undefined,
  defaultToDate: undefined,
  filterFormat: 'yyyy-MM-dd',
  flagSetFilterOnMount: false
};

export default DateRangeFilter;
