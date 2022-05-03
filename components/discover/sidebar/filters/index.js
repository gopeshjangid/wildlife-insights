import { connect } from 'react-redux';
import { setBasicFilters } from 'components/discover/actions';
import * as actions from './modal/advanced-filters/actions';
import Component from './component';

const mapStateToProps = ({ auth: { authenticated }, user: { data }, advancedFilters, explore }) => ({
  useCommonNames: authenticated ? !!data?.useCommonNames : true,
  advFilters: advancedFilters.filters,
  basicFilters: explore.basicFilters
});

const mapDispatchToProps = dispatch => ({
  setAdvFilters: filters => dispatch(actions.setFilters(filters)),
  onChangeBasicFilters: filters => dispatch(setBasicFilters(filters)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
