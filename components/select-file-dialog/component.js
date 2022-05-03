import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import { parseImage } from 'lib/imageFiles';
import config from 'components/images/dropzone/contants';

const dropzoneRef = React.createRef();

class SelectFileDialog extends PureComponent {
  static propTypes = {
    triggerOpen: PropTypes.bool,
    closeSelectFileDialog: PropTypes.func,
    userSelectFileDialog: PropTypes.func,
  };

  static defaultProps = {
    triggerOpen: false,
    closeSelectFileDialog: () => null,
    userSelectFileDialog: () => null,
  };

  componentDidMount() {
    this.openDialog();
  }

  componentDidUpdate() {
    const { triggerOpen } = this.props;
    if (triggerOpen) this.openDialog();
  }

  onDrop = (nextFiles) => {
    if (nextFiles && nextFiles.length === 0) {
      this.closeDialog();
    }
  };

  onDropAccepted = (nextFiles) => {
    const { userSelectFileDialog } = this.props;
    userSelectFileDialog({ files: nextFiles.map(parseImage) });
  };

  onDropRejected = () => {
    const { displayError } = this.props;

    displayError({
      title: 'Unable to process the files',
      message: 'Some of selected files are not supported or bigger than 20MB.',
    });
  };

  closeDialog = () => {
    const { closeSelectFileDialog } = this.props;
    closeSelectFileDialog();
  };

  openDialog = () => {
    const { triggerOpen } = this.props;

    if (triggerOpen) {
      dropzoneRef.current.open();
      this.closeDialog();
    }
  };

  render() {
    return (
      <Dropzone
        ref={dropzoneRef}
        {...config}
        onDrop={this.onDrop}
        onDropAccepted={this.onDropAccepted}
        onDropRejected={this.onDropRejected}
        disableClick
        style={{ display: 'none' }}
      />
    );
  }
}

export default SelectFileDialog;
