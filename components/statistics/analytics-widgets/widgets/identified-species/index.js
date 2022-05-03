import { connect } from 'react-redux';

import Component from './component';
import {
  setNumSpeciesLoading,
  setNumSpeciesCnt,
  setNumSpeciesErr,
  resetAuthStatistics
} from '../../actions';

const mapStateToProps = ({
  imageGrid, summary
}) => ({
  projectType: imageGrid.projectType,
  orgAnalyticType: summary.orgAnalyticType
});

const mapDispatchToProps = {
  setNumSpeciesLoading,
  setNumSpeciesCnt,
  setNumSpeciesErr,
  resetAuthStatistics
};

export default connect(mapStateToProps, mapDispatchToProps)(Component);
