import React, { Fragment, PureComponent } from 'react';
import { asField } from 'informed';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import isDate from 'date-fns/isDate';

import { exists, parseDate, formatDate } from 'utils/functions';

import './style.scss';

export const FORMAT = 'yyyy-MM-dd';

class DatePicker extends PureComponent {
  constructor(props) {
    super(props);
    const { fieldState } = this.props;
    const { value } = fieldState;
    this.state = { selectedDay: value || '' };
  }

  handleDayChange = (selectedDay) => {
    const { fieldApi, onChange } = this.props;
    const { setValue } = fieldApi;

    const value = exists(selectedDay) ? formatDate(selectedDay, FORMAT) : undefined;
    setValue(value);
    this.setState({ selectedDay });
    if (onChange && typeof onChange === 'function') onChange(value);
  }

  render() {
    const { fieldState, fieldApi } = this.props;
    const { error } = fieldState;
    const { setTouched } = fieldApi;
    const {
      onChange,
      onBlur,
      initialValue,
      forwardedRef,
      required,
      disabled,
      id,
      before,
      after,
      ...rest
    } = this.props;

    const { selectedDay } = this.state;

    /**
      @type {import('react-day-picker/types/common').BeforeAfterModifier}
    */
    const disabledDays = ({});

    if (exists(before)) {
      disabledDays.after = isDate(before) ? before : parseDate(before, FORMAT);
    }

    if (exists(after)) {
      disabledDays.before = isDate(after) ? after : parseDate(after, FORMAT);
    }

    return (
      <Fragment>
        <DayPickerInput
          classNames={{
            container: 'DayPickerInput c-form-datepicker',
            overlayWrapper: 'DayPickerInput-OverlayWrapper',
            overlay: 'DayPickerInput-Overlay',
          }}
          format={FORMAT}
          formatDate={formatDate}
          parseDate={parseDate}
          placeholder={`${formatDate(new Date(), FORMAT)}`}
          value={selectedDay}
          dayPickerProps={{
            disabledDays,
          }}
          onDayChange={this.handleDayChange}
          inputProps={{
            id,
            required,
            disabled,
            className: `form-control ${error ? 'is-invalid' : ''}`,
            onBlur: (e) => {
              setTouched();
              if (onBlur) {
                onBlur(e);
              }
            },
          }}
          {...rest}
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </Fragment>
    );
  }
}

export default asField(DatePicker);
