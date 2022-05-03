import React, { Fragment, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';

import { useDebouncedCallback } from 'utils/hooks';
import { exists, translateText } from 'utils/functions';
import T from 'components/transifex/translate';
import { getCountriesOptions, getCountryFromIso } from 'utils/country-codes';
import Text from 'components/form/text';
import { Select } from 'components/form';
import {
  requiredValidation,
  coordinateValidation,
  latLongKeyPress,
} from 'components/form/validations';
import LoadingSpinner from 'components/loading-spinner';

import countryQuery from './country.graphql';

const COUNTRY_FETCH_DEBOUNCE_DELAY = 1000;

const LocationCreateField = ({ formState, formApi, onChange }) => {
  const [debouncedLatitude, setLatitude] = useState(
    formState.values.locationLatitude
  );
  const [debouncedLongitude, setLongitude] = useState(
    formState.values.locationLongitude
  );

  const setDebouncedLatitude = useDebouncedCallback(
    setLatitude,
    COUNTRY_FETCH_DEBOUNCE_DELAY
  );
  const setDebouncedLongitude = useDebouncedCallback(
    setLongitude,
    COUNTRY_FETCH_DEBOUNCE_DELAY
  );

  useEffect(() => {
    setDebouncedLatitude(formState.values.locationLatitude);
  }, [setDebouncedLatitude, formState.values.locationLatitude]);

  useEffect(() => {
    setDebouncedLongitude(formState.values.locationLongitude);
  }, [setDebouncedLongitude, formState.values.locationLongitude]);

  const isvalidCoordinates = useMemo(
    () => exists(debouncedLatitude)
      && exists(debouncedLongitude)
      && !exists(coordinateValidation(debouncedLatitude, 'latitude'))
      && !exists(coordinateValidation(debouncedLongitude, 'longitude')),
    [debouncedLatitude, debouncedLongitude]
  );

  const countryTouched = formState.touched.locationCountry
    && exists(formState.values.locationCountry);

  const { data, loading } = useQuery(countryQuery, {
    skip: !isvalidCoordinates || countryTouched,
    variables: {
      latitude: +debouncedLatitude,
      longitude: +debouncedLongitude,
    },
  });

  useEffect(() => {
    const iso = data?.reverseGeocodeCountryFromCoordinates?.countryCodeISO3166Alpha3;

    if (!loading && iso && !countryTouched) {
      formApi.setValues({
        ...formState.values,
        locationCountry: {
          label: getCountryFromIso(iso),
          value: iso,
        },
      });
    }
  }, [loading, data, formState, formApi, countryTouched]);

  const onChangeCountry = () => {
    const tmpFormState = formState;
    tmpFormState.touched.locationCountry = formState?.values?.locationCountry?.value !== undefined;
  };

  return (
    <Fragment>
      <div className="form-row">
        <div className="col-sm-4">
          <div className="form-group">
            <label htmlFor="upload-location-latitude">
              <T text="Latitude" /> <span className="required-icon">*</span>:
            </label>
            <Text
              type="text"
              id="upload-location-latitude"
              className="form-control"
              field="locationLatitude"
              placeholder="0.0000"
              onKeyPress={latLongKeyPress}
              required
              validate={value => requiredValidation(value) || coordinateValidation(value, 'latitude')}
              onValueChange={value => onChange(value)}
            />
          </div>
        </div>
        <div className="col-sm-4">
          <div className="form-group">
            <label htmlFor="upload-location-longitude">
              <T text="Longitude" /> <span className="required-icon">*</span>:
            </label>
            <Text
              type="text"
              id="upload-location-longitude"
              className="form-control"
              field="locationLongitude"
              placeholder="0.0000"
              onKeyPress={latLongKeyPress}
              required
              validate={value => requiredValidation(value) || coordinateValidation(value, 'longitude')}
              onValueChange={value => onChange('locationLongitude', value)}
            />
          </div>
        </div>
        <div className="col-sm-4">
          <label htmlFor="upload-image-location-country">
            <T text="Country" /> <span className="required-icon">*</span>:
          </label>
          <Select
            id="upload-image-location-country"
            field="locationCountry"
            options={getCountriesOptions()}
            placeholder={translateText('Select a country')}
            required
            validate={requiredValidation}
            onChange={onChangeCountry}
            aria-describedby="upload-image-location-country-help"
          />
          {loading && (
            <small
              id="upload-image-location-country-help"
              className="form-text text-muted"
            >
              <LoadingSpinner transparent inline mini />{' '}
              <T text="This will be auto-completed." />
            </small>
          )}
        </div>
      </div>
      <div className="form-row">
        <div className="col-sm-12">
          <div className="form-group">
            <label htmlFor="upload-image-location-name">
              <T text="Location" /> <span className="required-icon">*</span>:
            </label>
            <Text
              type="text"
              field="locationName"
              id="upload-image-location-name"
              placeholder={translateText('Type a name')}
              required
              validate={requiredValidation}
              onValueChange={value => onChange('locationName', value)}
            />
          </div>
        </div>
      </div>
    </Fragment>
  );
};

LocationCreateField.propTypes = {
  formState: PropTypes.objectOf(PropTypes.any).isRequired,
  formApi: PropTypes.objectOf(PropTypes.any).isRequired,
  onChange: PropTypes.func,
};

LocationCreateField.defaultProps = {
  onChange: () => undefined,
};

export default LocationCreateField;
