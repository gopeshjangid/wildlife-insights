import { connect } from 'react-redux';

import { exists } from 'utils/functions';
import Component from './component';

const mapStateToProps = ({ imageGrid }, { images }) => {
  const image = exists(imageGrid.selectedImageIndex) && images.length
    ? images[imageGrid.selectedImageIndex]
    : null;

  return {
    image,
    projectId: image ? +image.deployment.projectId : null,
    deploymentId: image ? +image.deployment.id : null,
  };
};

export default connect(
  mapStateToProps,
  null
)(Component);
