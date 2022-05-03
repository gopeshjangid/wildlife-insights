import React from 'react';
import Select from 'react-select';
import { translateText } from 'utils/functions';

import T from 'components/transifex/translate';
import ReactModal from 'react-modal';
import { Form, Text } from 'components/form';
import './style.scss';

const DELETE_REASONS = [
  { label: 'Deployment is duplicated', value: 'Deployment is duplicated' },
  {
    label: 'Failed upload/too many images are in an unknown state',
    value: 'Failed upload/too many images are in an unknown state'
  },
  {
    label: 'Images uploaded to the wrong deployment',
    value: 'Images uploaded to the wrong deployment'
  },
  { label: 'Timestamps are incorrect', value: 'Timestamps are incorrect' },
  { label: 'Other', value: 'Other' }
];

const Preset = ({ setOpenPreset, open }) => {
  const onSubmit = () => {};
  return (
    <div className="preset-wrapper">
      <div className="preset-container">
        <Select
          type="text"
          field="requestApprovalMessage"
          id="delete-reason"
          placeholder={translateText('Apply a preset')}
          isClearable
          options={DELETE_REASONS}
          aria-describedby="delete-reason-help"
          classNamePrefix="filter-"
        />
      </div>

      <ReactModal
        isOpen={open}
        onRequestClose={() => setOpenPreset(false)}
        className="c-deployment-modal"
        contentLabel={translateText('Camera deployment form')}
      >
        <Form
          onSubmit={onSubmit}
          // initialValues={getFormInitialValues(deployment, projectData)}
          noValidate
        >
          <div className="content-panel">
            <div className="form-row">
              <div className="col-sm-12 col-md-12">
                <div className="form-group">
                  <div className="preset-name">
                    <T text="Name your preset" />{' '}
                    <div className="icon icon-box">
                      <a
                        className="close-icon"
                        onClick={() => setOpenPreset(false)}
                      >
                        <img
                          className="close-image"
                          alt=""
                          src="/static/ic_close_14px.png"
                        />
                      </a>
                    </div>
                  </div>
                  <Text
                    type="text"
                    field="deploymentName"
                    id="deployment-name"
                    className="form-control preset-input"
                    required
                    placeholder="Untitled preset"
                  />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="col-sm-12 col-md-12">
                <hr />
              </div>
            </div>
            <div className="form-row">
              <div className="col-sm-12 col-md-12">
                <div className="form-group save-btn">
                  <button type="submit" className="btn btn-primary">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </ReactModal>
    </div>
  );
};

export default Preset;
