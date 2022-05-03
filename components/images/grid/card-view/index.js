import { connect } from 'react-redux';
import {
  setSelectedImageGroupIndex,
  setSelectedImageGroups,
} from 'components/images/grid/actions';
import Component from './component';

const mapStateToProps = ({ imageGrid }) => ({
  gridType: imageGrid.gridType,
  selectedImageGroups: imageGrid.selectedImageGroups,
  isBurst: imageGrid.filters.timeStep > 0,
  selectedImageGroupIndex: imageGrid.selectedImageGroupIndex,
});

const mapDispatchToProps = { setSelectedImageGroupIndex, setSelectedImageGroups };

export default connect(mapStateToProps, mapDispatchToProps)(Component);
