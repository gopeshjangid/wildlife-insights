import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import Component from './component';
import getInitiativesQuery from './query.graphql';

const mapStateToProps = state => ({ initiativeId: +state.routes.query.initiativeId });

export default compose(connect(mapStateToProps), graphql(getInitiativesQuery))(Component);
