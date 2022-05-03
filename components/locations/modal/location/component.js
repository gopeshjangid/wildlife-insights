import React, { Fragment, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import ReactModal from 'react-modal';
import { useQuery, useMutation } from 'react-apollo-hooks';
import { useDebouncedCallback } from 'utils/hooks';

import { getCountriesOptions, getCountryFromIso } from 'utils/country-codes';
import { exists, translateText } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';
import T from 'components/transifex/translate';
import MapNoSSR from 'components/map-no-ssr';
import { Form, Text, TextArea } from 'components/form';
import Select from 'components/form/select';

import { requiredValidation, coordinateValidation, latLongKeyPress } from 'components/form/validations';
import createLocationQuery from 'components/upload/createLocation.graphql';
import countryQuery from 'components/upload/form/location-create-field/country.graphql';
import { getFormInitialValues } from './helpers';

import getLocationQuery from './location.graphql';
import updateLocationQuery from './update-location.graphql';
import './style.scss';

const LocationModal = ({
  id,
  projectId,
  open,
  onClose,
  canEdit,
  onSaved,
  isCreating,
}) => {
  const map = useRef(null);
  const [location, setLocation] = useState(null);
  const [countryStatus, setCountryStatus] = useState(false);

  const COUNTRY_FETCH_DEBOUNCE_DELAY = 1000;

  const { data, error, loading } = useQuery(getLocationQuery, {
    variables: { projectId, id },
    skip: !exists(id) || isCreating,
  });

  const [
    mutate,
    { data: mutationData, loading: mutationLoading, error: mutationError },
  ] = useMutation(!isCreating ? updateLocationQuery : createLocationQuery, {
    refetchQueries: () => ['getLocations', 'getLocation'],
  });


  const [getCountryCode] = useMutation(countryQuery);

  const updateCountryData = (formState, formApi) => {
    if (!formState.touched.country) {
      const { values } = formState;
      const updateLattitude = !exists(coordinateValidation(values.latitudeStr, 'latitude')) && !Number.isNaN(values.latitudeStr) ? +values.latitudeStr : null;
      const updateLongitude = !exists(coordinateValidation(values.longitudeStr, 'longitude')) && !Number.isNaN(values.longitudeStr) ? +values.longitudeStr : null;

      if (updateLattitude && updateLongitude) {
        setCountryStatus(true);
        getCountryCode({ variables: { latitude: updateLattitude, longitude: updateLongitude } })
          .then((res) => {
            const iso = res?.data?.reverseGeocodeCountryFromCoordinates?.countryCodeISO3166Alpha3;
            if (iso && !formState?.touched?.country) {
              formApi.setValues({
                ...formState.values,
                country: {
                  label: getCountryFromIso(iso),
                  value: iso,
                },
              });
            }
            setCountryStatus(false);
          });
      }
    }
  };

  const setDebouncedCountryName = useDebouncedCallback(
    updateCountryData,
    COUNTRY_FETCH_DEBOUNCE_DELAY
  );

  const onSubmit = (values) => {
    const integerLattitude = exists(values.latitudeStr) && !Number.isNaN(+values.latitudeStr) ? values.latitudeStr : null;
    const integerLongitude = exists(values.longitudeStr) && !Number.isNaN(+values.longitudeStr) ? values.longitudeStr : null;
    const body = {
      ...omit(values, ['id', '__typename', 'latitude', 'longitude']),
      latitudeStr: integerLattitude.toString(),
      longitudeStr: integerLongitude.toString(),
      country: values.country.value,
    };
    if (isCreating) {
      body.geodeticDatum = 'WGS84';
      body.fieldNumber = '1';
    }
    mutate({ variables: { projectId, id, body } })
      .then((respCreateLocation) => {
        if (!respCreateLocation.errors) {
          onSaved(respCreateLocation);
        }
      });
  };

  useEffect(() => {
    if (!error && !loading && data?.getLocation) {
      setLocation(data.getLocation);
    }
  }, [data, loading, error, setLocation]);

  useEffect(() => {
    if (map?.current && location && exists(location.latitude) && exists(location.longitude)) {
      map.current.panTo({ lat: location.latitude, lng: location.longitude });
    }
  }, [location]);

  const onChangeCountry = (formState) => {
    const tmpFormState = formState;
    tmpFormState.touched.country = formState?.values?.country?.value !== undefined;
    setCountryStatus(false);
  };
  const mutationErrorMsg = mutationError?.graphQLErrors?.[0]?.message ? mutationError.graphQLErrors[0].message : 'Please try again in a few minutes';
  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      className="c-location-modal"
      contentLabel={translateText('Location form')}
    >
      {loading && !location && (
        <div className="content-panel">
          <div className="text-center">
            <LoadingSpinner inline />
          </div>
        </div>
      )}
      {(!!location || isCreating) && (
        <Form onSubmit={onSubmit} initialValues={getFormInitialValues(location)} noValidate>
          {({ formState, formApi }) => (
            <Fragment>
              <div className="content-panel">
                {mutationError && (
                  <div className="alert alert-danger" role="alert">
                    {isCreating ? <T text={`Unable to create the location. ${mutationErrorMsg}`} />
                      : <T text={`Unable to update the location. ${mutationErrorMsg}`} />
                    }
                  </div>
                )}
                {mutationData && (
                  <div className="alert alert-info" role="alert">
                    {isCreating ? <T text="The location has been created." />
                      : <T text="The location has been updated." />
                    }
                  </div>
                )}
                {error && (
                  <div className="content-panel">
                    <div className="alert alert-danger" role="alert">
                      <T text="Unable to load the location. Please try again in a few minutes." />
                    </div>
                  </div>
                )}
                <div className="form-row">
                  <div className="col-sm-12 col-md-12">
                    <div className="form-group">
                      <label htmlFor="location-name">
                        <T text="Location name" /> <span className="required-icon">*</span>:
                      </label>
                      <Text
                        type="text"
                        field="placename"
                        id="location-name"
                        className="form-control"
                        required
                        maxLength="255"
                        validate={requiredValidation}
                        disabled={!isCreating && !canEdit}
                      />
                    </div>
                  </div>
                  {location
                    && (
                      <div className="col-sm-12 col-md-12">
                        <div className="form-group">
                          <label htmlFor="location-id">
                            <T text="ID" />:
                          </label>
                          <Text
                            type="text"
                            field="id"
                            id="location-id"
                            className="form-control"
                            disabled
                          />
                        </div>
                      </div>
                    )
                  }
                </div>
                <div className="form-row">
                  <div className="col-sm-12 col-md-4">
                    <div className="form-group">
                      <label htmlFor="location-latitude">
                        <T text="Latitude" /> <span className="required-icon">*</span>:
                      </label>
                      <Text
                        type="text"
                        step="any"
                        field="latitudeStr"
                        id="location-latitude"
                        className="form-control"
                        placeholder="0.0000"
                        onValueChange={value => setDebouncedCountryName(formState, formApi)}
                        onKeyPress={latLongKeyPress}
                        required
                        validate={value => requiredValidation(value) || coordinateValidation(value, 'latitude')}
                        disabled={!isCreating && !canEdit}
                      />
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-4">
                    <div className="form-group">
                      <label htmlFor="location-longitude">
                        <T text="Longitude" /> <span className="required-icon">*</span>:
                      </label>
                      <Text
                        type="text"
                        step="any"
                        field="longitudeStr"
                        id="location-longitude"
                        className="form-control"
                        placeholder="0.0000"
                        onValueChange={value => setDebouncedCountryName(formState, formApi)}
                        onKeyPress={latLongKeyPress}
                        required
                        validate={value => requiredValidation(value) || coordinateValidation(value, 'longitude')}
                        disabled={!isCreating && !canEdit}
                      />
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-4">
                    <div className="form-group">
                      <label htmlFor="location-country">
                        <T text="Country" /> <span className="required-icon">*</span>:
                      </label>
                      <Select
                        id="location-country"
                        field="country"
                        options={getCountriesOptions()}
                        placeholder={translateText('Select a country')}
                        validate={requiredValidation}
                        aria-describedby="upload-image-location-country-help"
                        disabled={!isCreating && !canEdit}
                        onChange={() => onChangeCountry(formState)}
                        required
                      />
                      {countryStatus && (
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
                </div>

                <div>
                  <div className="form-row">
                    <div className="col-sm-12">
                      <div className="form-group">
                        <label htmlFor="location-remarks">
                          <T text="Remarks" />:
                        </label>
                        <TextArea
                          field="remarks"
                          id="location-remarks"
                          className="form-control"
                          disabled={!isCreating && !canEdit}
                        />
                      </div>
                    </div>
                  </div>
                  {location
                    && (
                      <div className="map-container">
                        <MapNoSSR ref={map}>
                          {({ HTMLMarker }) => {
                            if (exists(formState.values.latitudeStr) && exists(formState.values.longitudeStr)) {
                              // on location update or map interaction using mouse, react 
                              // google map is rendering marker at previous/first location 
                              // point, even though the component tree is rerendered. 
                              // using key props on <HTMLMarker/> to fix this.
                              return (
                                <HTMLMarker
                                  position={{
                                    lat: +formState.values.latitudeStr,
                                    lng: +formState.values.longitudeStr,
                                  }}
                                  key={`${formState.values.latitudeStr}-${formState.values.longitudeStr}`}
                                />
                              );
                            }

                            return null;
                          }}
                        </MapNoSSR>
                      </div>)
                  }
                </div>
              </div>
              <div className="actions-panel">
                <button
                  type="button"
                  className="btn btn-secondary btn-alt"
                  onClick={onClose}
                >
                  {translateText(canEdit ? 'Cancel' : 'Close')}
                </button>
                {canEdit && (
                  <button
                    type="submit"
                    className="btn btn-primary btn-alt"
                    disabled={mutationLoading}
                  >
                    {
                      mutationLoading ? translateText(isCreating ? 'Creating...' : 'Updating...')
                        : translateText(isCreating ? 'Create' : 'Save changes')
                    }
                  </button>
                )}
              </div>
            </Fragment>
          )}
        </Form>
      )}
    </ReactModal>
  );
};

LocationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  id: PropTypes.number,
  projectId: PropTypes.number.isRequired,
  onClose: PropTypes.func,
  canEdit: PropTypes.bool.isRequired,
  onSaved: PropTypes.func,
  isCreating: PropTypes.bool.isRequired,
};

LocationModal.defaultProps = {
  id: null,
  onClose: () => { },
  onSaved: () => { },
};

export default LocationModal;
