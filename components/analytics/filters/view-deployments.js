import React, { useState } from 'react';
import ReactModal from 'react-modal';
import { connect } from 'react-redux';
import { translateText } from 'utils/functions';
import * as actions from '../actions';
//import DeploymentQuery from '../../deployments/list/deployments.graphql';
import T from 'components/transifex/translate';
import './style.scss';

const ViewDeployments = ({ setOpen, open, ...props }) => {
  return (
    <ReactModal
      isOpen={open}
      onRequestClose={() => setOpen(false)}
      className="c-deployment-modal"
      contentLabel={translateText('Camera deployment form')}
    >
      <div className="content-panel">
        <div className="form-row">
          <div className="col-sm-12 col-md-12">
            <div className="form-group">
              <div className="preset-name">
                <T text="Camera deployments over time" />{' '}
                <div className="icon icon-box">
                  <a className="close-icon" onClick={() => setOpen(false)}>
                    <img
                      className="close-image"
                      alt=""
                      src="/static/ic_close_14px.png"
                    />
                  </a>
                </div>
              </div>
              <p className="subtitle m-0">
                Visualize all of the camera deployments in this project by time.
                Hover over a bar to view information about that deployment.
              </p>
              <button
                type="button"
                aria-label={translateText(`Learn more about this graph`)}
                className="btn btn-link m-0 p-0"
              >
                {translateText(`Learn more about this graph`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ReactModal>
  );
};

const mapDispatchToProps = dispatch => ({
  saveFilter: data => {
    dispatch(actions.setFilters(data));
  }
});

const mapStateToProps = state => ({
  ...state?.analytics
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(ViewDeployments));
