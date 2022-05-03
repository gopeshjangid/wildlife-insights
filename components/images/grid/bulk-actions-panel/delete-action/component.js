import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Mutation } from 'react-apollo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { refetchGetDataFiles } from 'lib/initApollo';
import { translateText } from 'utils/functions';
import T from 'components/transifex/translate';
import Tooltip from 'components/tooltip';
import deleteMutation from './delete-images.graphql';

class BulkDeleteAction extends Component {
  static propTypes = {
    className: PropTypes.string,
    imagesCount: PropTypes.number.isRequired,
    deletableImagesCount: PropTypes.number.isRequired,
    deletableImages: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any))
      .isRequired,
    canDelete: PropTypes.bool.isRequired,
    canDeleteAll: PropTypes.bool.isRequired,
    displayError: PropTypes.func.isRequired,
    setSelectedImageGroups: PropTypes.func.isRequired,
  };

  static defaultProps = {
    className: '',
  };

  state = {
    tooltipOpen: false,
  };

  /**
   * Callback executed when the user clicks the delete button
   * @param {function(any): Promise<any>} deleteDataFiles Mutation function
   */
  onClickDelete(deleteDataFiles) {
    const {
      canDeleteAll,
      deletableImages,
      deletableImagesCount,
      displayError,
      setSelectedImageGroups,
    } = this.props;
    const { tooltipOpen } = this.state;

    const executeDelete = () => deleteDataFiles({
      variables: {
        dataFileIds: deletableImages.map(image => +image.id),
      },
    }).then(
      ({
        data: {
          deleteDataFileList: { count },
        },
      }) => {
        const mutationFailed = count !== deletableImagesCount;

        if (mutationFailed) {
          displayError({
            uid: 'bulk-deletion-error-count',
            title:
              deletableImagesCount > 1
                ? translateText(
                  "{count} of the {deletableImagesCount} photos couldn't be deleted",
                  { count, deletableImagesCount }
                )
                : translateText("The image couldn't be deleted"),
          });
        }

        // We hide the bulk actions panel
        setSelectedImageGroups([]);
      }
    );

    if (!canDeleteAll) {
      if (tooltipOpen) {
        this.closeTooltip();
        executeDelete();
      } else {
        this.openTooltip();
      }
    } else {
      executeDelete();
    }
  }

  getTooltipContent(deleteDataFiles) {
    const { imagesCount, deletableImagesCount, canDelete } = this.props;

    return (
      <div className="text-left">
        <p className="alert alert-warning" role="alert">
          {!canDelete && <T text="The photos can't be deleted." />}
          {canDelete && (
            <T
              text="Only {deletableImagesCount} out of the {imagesCount} photos can be deleted."
              params={{ deletableImagesCount, imagesCount }}
            />
          )}
        </p>
        <p>
          <strong><T text="Why?" /></strong>{' '}
          <T text="Once uploaded, the photos are protected against accidental deletion. If you've recently uploaded some photos by mistake, you have a short period of time to delete them." />
        </p>
        {canDelete && (
          <p className="mt-4 mb-0 d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => this.closeTooltip()}
            >
              <T text="Cancel" />
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => this.onClickDelete(deleteDataFiles)}
            >
              <T text="Delete {deletableImagesCount} photo(s)" params={{ deletableImagesCount }} />
            </button>
          </p>
        )}
      </div>
    );
  }

  openTooltip() {
    this.setState({ tooltipOpen: true });
  }

  closeTooltip() {
    this.setState({ tooltipOpen: false });
  }

  render() {
    const { className, canDelete, displayError } = this.props;
    const { tooltipOpen } = this.state;

    return (
      <Mutation
        mutation={deleteMutation}
        // @ts-ignore
        refetchQueries={refetchGetDataFiles}
      >
        {(deleteDataFiles, { loading, error }) => {
          if (error) {
            displayError({
              uid: 'bulk-deletion-error',
              title: translateText('Unable to delete the photo(s)'),
              message: translateText('Please try again in a few minutes.'),
            });
          }

          return (
            <Tooltip
              trigger={canDelete ? 'click' : 'mouseenter focus'}
              isVisible={canDelete ? tooltipOpen : undefined}
              distance={10}
              placement="top"
              content={this.getTooltipContent(deleteDataFiles)}
            >
              <div className={`d-inline-block ${className}`}>
                <button
                  type="button"
                  aria-label={translateText('Delete')}
                  className="btn btn-secondary btn-alt delete-button"
                  disabled={!canDelete || loading}
                  onClick={() => this.onClickDelete(deleteDataFiles)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </Tooltip>
          );
        }}
      </Mutation>
    );
  }
}

export default BulkDeleteAction;
