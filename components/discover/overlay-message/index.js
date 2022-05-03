import { connect } from 'react-redux';
import Component from './component';

const mapStateToProps = ({ explore }) => ({
    basicFilters: explore.basicFilters
});

export default connect(mapStateToProps)(Component);
