import { connect } from 'react-redux';

import { openSelectFileDialog } from 'components/select-file-dialog/actions';
import Component from './component';

const mapDispatchToProps = dispatch => ({
  openSelectFileDialog: () => dispatch(openSelectFileDialog(true))
});

export default connect(null, mapDispatchToProps)(Component);
