import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { map, includes } from 'lodash';
import ReactModal from 'react-modal';
import { useMutation } from 'react-apollo-hooks';
import { Link } from 'lib/routes';
import T from 'components/transifex/translate';
import { Form, TextArea, Select } from 'components/form';
import {
  requiredValidation,
} from 'components/form/validations';
import LoadingSpinner from 'components/loading-spinner';
import { translateText, getGraphQLErrorMessage } from 'utils/functions';
import publicDownloadQuery from './download.graphql';
import './style.scss';

const INTENDED_USE_OPTIONS = [
  { label: 'Data exploration', value: 'Data exploration' },
  { label: 'Data analysis', value: 'Data analysis' },
  { label: 'Education/assignment', value: 'Education/assignment' },
  { label: 'Other', value: 'Other' },
];

const EXPECTED_PRODUCT_OPTIONS = [
  { label: 'Report', value: 'Report' },
  { label: 'Scientific manuscript', value: 'Scientific manuscript' },
  { label: 'Data visualization', value: 'Data visualization' },
  { label: 'Statistical model', value: 'Statistical model' },
  { label: 'AI model', value: 'AI model' },
  { label: 'None', value: 'None' },
  { label: 'Other', value: 'Other' },
];

const DownloadRequestModal = ({
  open,
  onClose,
  email,
  filters,
}) => {
  const [state, setState] = useState({
    showForm: true,
    confirmRequest: false,
    formData: {},
    linkSent: false,
    downloadErr: false,
  });

  const [
    mutate,
    { data: mutationData, loading: mutationLoading, error: mutationError },
  ] = useMutation(publicDownloadQuery);

  const onSubmit = (values) => {
    setState({
      ...state,
      showForm: false,
      confirmRequest: true,
      formData: values,
      downloadErr: false,
    });
  };

  const fnRequestDownload = () => {
    const { formData } = state;
    const downloadReqData = { additionalInformation: formData?.additionalInformation };
    if (formData?.expectedProducts) {
      downloadReqData.expectedProducts = map(formData.expectedProducts, 'value');
    }
    if (formData?.intendedUseOfData) {
      downloadReqData.intendedUseOfData = map(formData.intendedUseOfData, 'value');
    }
    mutate({ variables: { filters, publicDownloadRequest: downloadReqData } });
  };

  const getHeading = () => {
    const { confirmRequest, showForm, linkSent } = state;
    let heading = '';
    if (showForm) {
      heading = 'Download data';
    } else if (confirmRequest) {
      heading = 'Confirm your request';
    } else if (linkSent) {
      heading = 'Download data link sent';
    }
    return heading;
  };

  useEffect(() => {
    if (!mutationLoading && !mutationError && mutationData) {
      setState({
        ...state,
        linkSent: true,
        showForm: false,
        confirmRequest: false,
      });
    }
  }, [mutationData, mutationLoading, mutationError]);

  const { confirmRequest, showForm, linkSent } = state;
  return (
    <ReactModal
      isOpen={open}
      onRequestClose={onClose}
      className="c-download-request-modal"
      contentLabel={translateText('Download request')}
    >
      <div className="content-panel">
        <div className="d-flex justify-content-between">
          <div className="download-head">
            {getHeading()}
          </div>
          <button type="button" className="pointer" onClick={onClose}>
            <img
              className="close-image"
              alt=""
              src="/static/ic_close_14px.png"
            />
          </button>
        </div>
        <div className="signin-form row text-left">
          <div className="col col-md-12">
            <div className="auth-page-form">
              {mutationError
              && (
                <div className="alert alert-danger" role="alert">
                  {translateText(getGraphQLErrorMessage(mutationError))}
                </div>
              )}
              {linkSent
                && (
                  <p className="link-sent">
                    <img src="/static/ic_check_circle_24px.png" alt="" />A link to download your data has been sent to {email}
                  </p>
                )
              }
              {confirmRequest
                && (
                  <div>
                    <p>
                      Requests for large download files may take several hours to process. Are you sure you want to continue with your request?
                    </p>
                    <div className="download-head">Data download request processing</div>
                    <p>
                      Once your request has finished processing, a link to download the data will be sent to {email}.
                      <br /><br />
                      <i><b>IMPORTANT:</b> The download file requested may include sequence detections, image detections, obscured locations, and/or
                      data that has not been reviewed. If these data will be used for analysis or publication, we recommend reading more about
                      Wildlife Insights’ <a href="https://www.wildlifeinsights.org/sensitive-species">approach to sensitive species data</a>
                      &nbsp;and <a href="https://www.wildlifeinsights.org/get-started/data-download/public">data review processes</a> before proceeding.</i>
                    </p>
                    <div className="form-actions">
                      {
                        mutationLoading
                          ? (
                            <div className="spinner">
                              <LoadingSpinner inline />
                            </div>
                          )
                          : (
                            <button type="button" className="btn btn-primary" disabled={mutationLoading} onClick={fnRequestDownload}>
                              Request download
                            </button>
                          )
                      }
                    </div>
                  </div>
                )
              }
              {showForm
                && (
                <Form
                  onSubmit={values => onSubmit(values)}
                  noValidate
                  method="post"
                >
                  <div className="form-group">
                    <label htmlFor="download-intended-use">
                      <span>Intended use</span> <span className="required-icon">*</span>
                    </label>
                    <Select
                      isMulti
                      type="text"
                      field="intendedUseOfData"
                      id="download-intended-use"
                      placeholder={translateText('Select intended use')}
                      isClearable
                      options={INTENDED_USE_OPTIONS}
                      aria-describedby="download-intended-use-help"
                      required
                      validate={requiredValidation}
                    />
                    <small
                      id="download-intended-use-help"
                      className="form-text text-muted"
                    >
                      <T text="Select the primary motivation for downloading these data." />
                    </small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="download-product">
                      <span>Expected products</span> <span className="required-icon">*</span>
                    </label>
                    <Select
                      isMulti
                      type="text"
                      field="expectedProducts"
                      id="download-product"
                      placeholder={translateText('Select product')}
                      isClearable
                      options={EXPECTED_PRODUCT_OPTIONS}
                      aria-describedby="download-product-help"
                      required
                      validate={requiredValidation}
                    />
                    <small
                      id="download-product-help"
                      className="form-text text-muted"
                    >
                      <T text="Select the final products you envision generating from these data. Wildlife Insights encourages collaboration with data providers on scientific publications." />
                    </small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="download-description">
                      <T text="Additional information" />
                    </label>
                    <TextArea
                      field="additionalInformation"
                      id="download-description"
                      className="form-control"
                      maxLength="500"
                    />
                  </div>
                  <div>
                    <div className="terms">
                      <Link route="terms">
                        <a target="_blank">Terms of Use</a>
                      </Link>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      Download
                    </button>
                  </div>
                </Form>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </ReactModal>
  );
};

DownloadRequestModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  email: PropTypes.string.isRequired,
  filters: PropTypes.shape({}).isRequired,
};

export default DownloadRequestModal;
