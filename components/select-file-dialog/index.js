import { connect } from 'react-redux';
import { openModal } from 'components/upload/actions';
import { displayError } from 'components/notifications/actions';
import * as actions from './actions';
import * as reducers from './reducers';
import initialState from './initial-state';
import Component from './component';

export { actions, reducers, initialState };

const mapStateToProps = state => ({ triggerOpen: state.selectFileDialog.triggerOpen });

const mapDispatchToProps = dispatch => ({
  closeSelectFileDialog: () => dispatch(actions.closeSelectFileDialog()),
  userSelectFileDialog: data => dispatch(openModal(data)),
  displayError: notification => dispatch(displayError(notification)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
