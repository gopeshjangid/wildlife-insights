import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';

import { refetchGetDataFiles } from 'lib/initApollo';
import {
  displaySuccess,
  displayWarning,
  displayError,
} from 'components/notifications/actions';
import { setSelectedImageGroups } from 'components/images/grid/actions';
import createBulkIdentification from './create-bulk-identification.graphql';
import createSequenceBulkIdentification from './create-sequence-bulk-identification.graphql';
import Component from './component';

const mapStateToProps = ({ imageGrid, routes: { query } }, { imageGroups }) => ({
  isBurstModeActive: imageGrid.filters.timeStep > 0,
  selectedImageGroups: imageGroups.filter((_, index) => (
    imageGrid.selectedImageGroups.indexOf(index) !== -1
  )),
  organizationId: query.organizationId,
  initiativeId: query.initiativeId,
  projectId: query.projectId,
  tab: query.tab,
  isSequenceProject: imageGrid.projectType === 'sequence',
  // for selecting most recent taxonomy ids 
  // for a project in taxonomy dropdown
  idForTaxonomyLookup: query.projectId ? +query.projectId : null,
});

const mapDispatchToProps = dispatch => ({
  setSelectedImageGroups: selectedImageGroups => dispatch(
    setSelectedImageGroups(selectedImageGroups)
  ),
  displaySuccess: notification => dispatch(displaySuccess(notification)),
  displayWarning: notification => dispatch(displayWarning(notification)),
  displayError: notification => dispatch(displayError(notification)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(createBulkIdentification, {
    name: 'createBulkIdentification',
    // @ts-ignore
    options: {
      // Needs to be a function because of a bug of apollo-client:
      // https://github.com/apollographql/apollo-client/issues/3540#issuecomment-441288962
      // @ts-ignore
      refetchQueries: refetchGetDataFiles
    }
  }),
  graphql(createSequenceBulkIdentification, {
    name: 'createSequenceBulkIdentification',
    // @ts-ignore
    options: {
      // Needs to be a function because of a bug of apollo-client:
      // https://github.com/apollographql/apollo-client/issues/3540#issuecomment-441288962
      // @ts-ignore
      refetchQueries: refetchGetDataFiles
    }
  })
)(Component);
