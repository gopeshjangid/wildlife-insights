import { connect } from 'react-redux';

import Component from './component';

const mapStateToProps = ({
  imageGrid,
  user: {
    data: { useCommonNames },
  },
}) => ({
  projectType: imageGrid.projectType,
  useCommonNames: !!useCommonNames,
});

export default connect(mapStateToProps)(Component);
