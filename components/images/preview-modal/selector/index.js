import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import { setSelectedImageIndex } from '../../grid/actions';
import Component from './component';

const mapStateToProps = ({ imageGrid, identify, routes: { query } }, { imageGroups }) => ({
  images: exists(imageGrid.selectedImageGroupIndex) && imageGroups.length
    ? imageGroups[imageGrid.selectedImageGroupIndex]
    : [],
  selectedImageIndex: imageGrid.selectedImageIndex,
  identify,
  isSequenceProject: imageGrid.projectType === 'sequence',
  tab: query.tab
});

const mapDispatchToProps = dispatch => ({
  setSelectedImageIndex: index => dispatch(setSelectedImageIndex(index))
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
