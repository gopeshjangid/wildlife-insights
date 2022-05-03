import { connect } from 'react-redux';

import { setBasicFilters } from 'components/discover/actions';
import Component from './component';

const mapStateToProps = ({ explore }) => ({
    basicFilters: explore.basicFilters
});

const mapDispatchToProps = (dispatch) => ({
    onChangeBasicFilters: (filters) => dispatch(setBasicFilters(filters))
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
