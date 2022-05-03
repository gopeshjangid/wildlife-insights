import React, { useState } from 'react';
import './style.scss';

import { translateText } from 'utils/functions';
import T from 'components/transifex/translate';
import ReactModal from 'react-modal';
import { Form, Text } from 'components/form';

const Analyses = ({ setStep, saveAnalyses, setGenerateAnalyses, open }) => {
  const [analyses, setAnalyses] = useState('');
  const report_page_step = 4;
  const onSubmit = () => {
    saveAnalyses(analyses);
    if (analyses) {
      setGenerateAnalyses(false);
      setStep(report_page_step);
    }
  };

  return (
    <div className="analyses-container">
      <ReactModal
        isOpen={open}
        onRequestClose={() => setGenerateAnalyses(false)}
        className="c-deployment-modal analyses-modal"
        contentLabel={translateText('Camera deployment form')}
      >
        <Form onSubmit={onSubmit} noValidate>
          <div className="content-panel">
            <div className="form-row">
              <div className="col-sm-12 col-md-12">
                <div className="form-group">
                  <div className="analyses-name">
                    <T text="Name your Analyses" />{' '}
                    <div className="icon icon-box">
                      <a
                        className="close-icon"
                        onClick={() => setGenerateAnalyses(false)}
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
                    placeholder="Untitled Analysis"
                    value={analyses}
                    onChange={e => setAnalyses(e.target.value)}
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
                  <button
                    onClick={onSubmit}
                    type="submit"
                    className="btn btn-primary"
                  >
                    Generate Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Form>
      </ReactModal>

      <div className="analyses-heading">
        <div className="alert alert-danger" role="alert">
          <T text="The Occupancy and Wildlife index analytics are not available for the selected dataset. Go back to the previous step if you’d like to change your selections." />
        </div>
      </div>
      <div className="analyses-list">
        <h6 className="analyses-list-title">Species Analytics</h6>
        <div className="content-list">
          <div className="analyses-checkbox">
            <div className="checkbox-form">
              <input type="checkbox" className={'grid-checkbox'} />
              <label></label>
            </div>
          </div>
          <div className="analyses-description">
            <span>Detection Rate</span>
            <p className="details">
              Detection rates are the number of independent observations for a
              species (number of sequences of images separated by 1, 2, 30 or 60
              min) divided by the number of active trap-days in each month
              within the date range selected. Detection rates are calculated by
              deployment and also as overall monthly detection rates (pooling
              data across deployments) for a defined date range.
            </p>
          </div>
        </div>
        <div className="content-list">
          <div className="analyses-checkbox">
            <div className="checkbox-form">
              <input type="checkbox" className={'grid-checkbox'} />
              <label></label>
            </div>
          </div>
          <div className="analyses-description">
            <span>Occupancy</span>
            <p className="details">
              For a given species, occupancy estimates the proportion of
              deployments that are occupied by that species (plus/minus error
              estimates) while accounting for imperfect detection.
            </p>
          </div>
        </div>
        <div className="content-list">
          <div className="analyses-checkbox">
            <div className="checkbox-form">
              <input type="checkbox" className={'grid-checkbox'} />
              <label></label>
            </div>
          </div>
          <div className="analyses-description">
            <span>Activity</span>
            <p className="details">
              An indicator of when a certain species is active (single-species
              activity patterns) or how the activity of two different species
              overlap. It is calculated by plotting the number of independent
              observations of that species (number of sequences of images
              separated 1, 2, 30 or 60 mins apart) as a function of time of
              day/night.
            </p>
          </div>
        </div>
      </div>
      <div className="analyses-list">
        <h6 className="analyses-list-title">COMMUNITY ANALYTICS</h6>
        <div className="content-list">
          <div className="analyses-checkbox">
            <div className="checkbox-form">
              <input type="checkbox" className={'grid-checkbox'} />
              <label></label>
            </div>
          </div>
          <div className="analyses-description">
            <span>Detection Rate</span>
            <p className="details">
              Overall detection rates for each species (number of independent
              events pooled accross all deployments divided by the number of
              active trap-days) within the selected date range.
            </p>
          </div>
        </div>
        <div className="content-list">
          <div className="analyses-checkbox">
            <div className="checkbox-form">
              <input type="checkbox" className={'grid-checkbox'} />
              <label></label>
            </div>
          </div>
          <div className="analyses-description">
            <span>Occupancy</span>
            <p className="details">
              For a given set of species, this plot shows the expected occupancy
              of each species (plus/minus error estimates) ordered from highest
              to lowest occupancy within the date range selected.
            </p>
          </div>
        </div>
        <div className="content-list">
          <div className="analyses-checkbox">
            <div className="checkbox-form">
              <input type="checkbox" className={'grid-checkbox'} />
              <label></label>
            </div>
          </div>
          <div className="analyses-description">
            <span>Species Richness</span>
            <p className="details">
              Species richness provides the community size, both at the location
              and study area level, based on observed and unobserved species in
              the region derived from results from a community occupancy model
              (see Occupancy).
            </p>
          </div>
        </div>
        <div className="content-list">
          <div className="analyses-checkbox">
            <div className="checkbox-form">
              <input type="checkbox" className={'grid-checkbox'} />
              <label></label>
            </div>
          </div>
          <div className="analyses-description">
            <span>Wildlife Picture Index (WPI)</span>
            <p className="details">
              The Wildlife Picture Index is the geometric mean of the occupancy
              of all species within a sampling period (date range) relative to
              the occuppancy on the first sampling period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyses;
