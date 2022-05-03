import { connect } from 'react-redux';

import { setEditingState } from '../../actions';
import { aggregateIdentifiedObjects } from '../../helpers';
import Component from './component';

const mapStateToProps = ({ identify }) => {
  const dataFileId = Object.keys(identify.identificationsPerPhoto)[0];

  // in api response, indentifiedObjects inside identificationOutput are flattened (each with count 1),
  // first aggregate the indentifiedObjects and update the count of indentifiedObjects accordingly
  const aggregatedIdentifications = aggregateIdentifiedObjects(identify.identificationsPerPhoto[dataFileId]);

  return {
    identifications: aggregatedIdentifications
  };
};

const mapDispatchToProps = dispatch => ({
  onClickCancelHistory: () => dispatch(setEditingState()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Component);
