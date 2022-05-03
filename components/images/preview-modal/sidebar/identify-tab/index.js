import { connect } from 'react-redux';

import { displayError } from 'components/notifications/actions';
import Component from './component';

import * as actions from './actions';
import * as reducers from './reducers';
import initialState from './initial-state';

export { actions, initialState, reducers };

const mapStateToProps = ({ imageGrid, identify }) => ({
  state: identify.state,
  hasIdentifications: !!Object.keys(identify.identificationsPerPhoto).length,
  imageGroupIndex: imageGrid.selectedImageGroupIndex,
  isSequenceProject: imageGrid.projectType === 'sequence'
});

const mapDispatchToProps = (dispatch, { images }) => ({
  fetchIdentifications: () => dispatch(actions.fetchIdentifications(images)),
  displayError: (...params) => dispatch(displayError(...params)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
