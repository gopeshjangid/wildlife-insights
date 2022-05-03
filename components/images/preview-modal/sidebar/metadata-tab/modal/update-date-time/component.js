import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import { useMutation } from 'react-apollo-hooks';
import classnames from 'classnames';

import { refetchGetDataFiles } from 'lib/initApollo';
import { translateText, parseDate, getGraphQLErrorMessage } from 'utils/functions';
import T from 'components/transifex/translate';
import { Form, Text } from 'components/form';
import { numberKeyPress } from 'components/form/validations';
import { getFormInitialValues, serializeBody } from './helpers';
import updateDateTimeQuery from './update-datafile-time.graphql';
import './style.scss';

export const FORMAT = 'MM/dd/yyyy';

const UpdateDateTimeModal = ({
  id,
  open,
  onClose,
  originalDateTaken,
  deploymentId,
  projectId,
}) => {
  const [
    mutate,
    { data: mutationData, loading: mutationLoading, error: mutationError },
  ] = useMutation(updateDateTimeQuery, {
    // @ts-ignore
    refetchQueries: refetchGetDataFiles,
  });

  const [isValidDate, setIsValidDate] = useState(null);
  const [isValidTime, setIsValidTime] = useState(true);
  const isInvalidTime = (hour, minute, second, hourformat) => {
    const tmpHourformat = hourformat.toLowerCase();
    if (hour < 0 || hour > 11 || minute < 0 || minute > 59
      || second < 0 || second > 59
      || hour.length < 2 || minute.length < 2 || second.length < 2 || (tmpHourformat !== 'am' && tmpHourformat !== 'pm')) {
      return true;
    }
    return false;
  };

  const isInvalidDate = (dateVal) => {
    return parseDate(dateVal, FORMAT) === undefined;
  };

  const onSubmit = (values) => {
    const body = serializeBody(values);
    mutate({ variables: { id, deploymentId, projectId, body } });
  };

  useEffect(() => {
    const dateVal = originalDateTaken.split(' ')[0];
    const flag = isInvalidDate(dateVal);
    setIsValidDate(isInvalidDate(!flag));
  }, [originalDateTaken]);

  const onValueChange = (formState) => {
    const { year, month, day } = formState.values;
    const dateVal = `${month}/${day}/${year}`;
    const flag = isInvalidDate(dateVal);
    setIsValidDate(!flag);
  };

  const onTimeChange = (formState, formApi) => {
    const { hour, minute, second, hourformat } = formState.values;
    const flag = isInvalidTime(hour, minute, second, hourformat);
    formApi.setValues({
      ...formState.values,
      hourformat: hourformat.toUpperCase(),
    });
    setIsValidTime(!flag);
  };

  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      className="c-update-datetime-modal"
      contentLabel={translateText('Batch edit deployment date and time Date Time')}
    >
      {true && (
        <Form
          onSubmit={!mutationLoading && onSubmit}
          initialValues={getFormInitialValues(originalDateTaken)}
          noValidate
        >
          {({ formState, formApi }) => (
            <Fragment>
              <div className="content-panel">
                {mutationError && (
                  <div className="alert alert-danger" role="alert">
                    {<T text={getGraphQLErrorMessage(mutationError)} />
                    }
                  </div>
                )}
                {mutationData && (
                  <div className="alert alert-info" role="alert">
                    {<T text="Date/Time has been updated." />
                    }
                  </div>
                )}
                <h2>Batch edit deployment date and time</h2>
                <p>
                  Edit the date and time for all images within the same deployment. Set the date and time of the selected image using the fields below.
                  The date and time for all images in this deployment will be shifted proportionally.
                </p>
                <div className="form-row form-panel">
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label htmlFor="year">
                        <T text="Year" />
                      </label>
                      <Text
                        type="text"
                        field="year"
                        id="year"
                        className={classnames('year', { invalidDateTime: !isValidDate || !isValidTime })}
                        onKeyPress={numberKeyPress}
                        maxLength={4}
                        onValueChange={() => onValueChange(formState)}
                        placeholder="YYYY"
                      />
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label htmlFor="month">
                        <T text="Month" />
                      </label>
                      <Text
                        type="text"
                        field="month"
                        id="month"
                        className={classnames({ invalidDateTime: !isValidDate || !isValidTime })}
                        onKeyPress={numberKeyPress}
                        maxLength={2}
                        onValueChange={() => onValueChange(formState)}
                        placeholder="MM"
                      />
                    </div>
                  </div>
                  <div className="col-sm-2">
                    <div className="form-group">
                      <label htmlFor="day">
                        <T text="Day" />
                      </label>
                      <Text
                        type="text"
                        field="day"
                        id="day"
                        className={classnames({ invalidDateTime: !isValidDate || !isValidTime })}
                        onKeyPress={numberKeyPress}
                        maxLength={2}
                        placeholder="DD"
                      />
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <div className="form-group">
                      <label htmlFor="time">
                        <T text="Time" />
                      </label>
                      <div className="d-flex">
                        <div>
                          <Text
                            type="text"
                            field="hour"
                            id="hour"
                            className={classnames('time', { invalidDateTime: !isValidDate || !isValidTime })}
                            onKeyPress={numberKeyPress}
                            maxLength={2}
                            onValueChange={() => onTimeChange(formState, formApi)}
                            placeholder="HH"
                          />
                        </div>
                        <div className="time-separator">
                          :
                        </div>
                        <div>
                          <Text
                            type="text"
                            field="minute"
                            id="minute"
                            className={classnames('time', { invalidDateTime: !isValidDate || !isValidTime })}
                            onKeyPress={numberKeyPress}
                            onValueChange={() => onTimeChange(formState, formApi)}
                            maxLength={2}
                            placeholder="MM"
                          />
                        </div>
                        <div>
                          <Text
                            type="text"
                            field="second"
                            id="second"
                            className={classnames('time second', { invalidDateTime: !isValidDate || !isValidTime })}
                            onKeyPress={numberKeyPress}
                            onValueChange={() => onTimeChange(formState, formApi)}
                            maxLength={2}
                            placeholder="SS"
                          />
                        </div>
                        <div>
                          <Text
                            type="text"
                            field="hourformat"
                            id="hourformat"
                            className={classnames('hourformat', { invalidDateTime: !isValidDate || !isValidTime })}
                            onValueChange={() => onTimeChange(formState, formApi)}
                            maxLength={2}
                            placeholder="AM"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="actions-panel">
                <button
                  type="button"
                  className="btn btn-secondary btn-alt"
                  onClick={onClose}
                >
                  {translateText('Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-alt"
                  disabled={mutationLoading || !isValidDate || !isValidTime}
                >
                  {
                    mutationLoading ? translateText('Updating...')
                      : translateText('Save changes')
                  }
                </button>
              </div>
            </Fragment>
          )}
        </Form>
      )}
    </ReactModal>
  );
};

UpdateDateTimeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  originalDateTaken: PropTypes.string.isRequired,
  deploymentId: PropTypes.number.isRequired,
  projectId: PropTypes.number.isRequired,
};

export default UpdateDateTimeModal;
