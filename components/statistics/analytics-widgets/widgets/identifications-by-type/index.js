import { connect } from 'react-redux';

import Component from './component';
import {
  setWildlifeImagesCountLoading,
  setWildlifeImagesCount,
  setWildlifeImagesCountErr
} from '../../actions';

const mapStateToProps = ({ imageGrid: { projectType } }) => ({
  projectType
});

const mapDispatchToProps = {
  setWildlifeImagesCountLoading,
  setWildlifeImagesCount,
  setWildlifeImagesCountErr
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
