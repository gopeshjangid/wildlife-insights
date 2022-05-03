import { connect } from 'react-redux';

import Component from './component';

const mapStateToProps = ({ statistics: { authStatistics }}) => ({
  numSpeciesLoading: authStatistics.numSpecies.loading,
  numSpeciesCnt: authStatistics.numSpecies.count,
  numSpeciesErr: authStatistics.numSpecies.error,
  wildlifeImagesCountLoading: authStatistics.wildlifeImagesCount.loading,
  wildlifeImagesCount: authStatistics.wildlifeImagesCount.count,
  wildlifeImagesCountErr: authStatistics.wildlifeImagesCount.error,
});

export default connect(mapStateToProps, null)(Component);
