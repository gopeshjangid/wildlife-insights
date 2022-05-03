import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'components/tooltip';
import { MAX_IMAGEGRID_PAGESIZE } from 'utils/app-constants';
import { exists } from 'utils/functions';
import { smoothScroll, HEADER_HEIGHT } from 'utils/scroll';
import LoadingSpinner from 'components/loading-spinner';
import ImagePreviewModal from 'components/images/preview-modal';
import ActionsBar from 'components/actions-bar';
import CardView from 'components/images/grid/card-view';
import Pagination from 'components/pagination';
import BulkActionsPanel from 'components/images/grid/bulk-actions-panel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import gridInitialState from './initial-state';

import './style.scss';

const optionType = PropTypes.shape({
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

class ImageGrid extends React.PureComponent {
  static propTypes = {
    data: PropTypes.shape({
      getDataFilesForProject: PropTypes.object,
      getDataFilesForIdentifyForProject: PropTypes.object,
      loading: PropTypes.bool,
      error: PropTypes.object,
    }),
    filters: PropTypes.objectOf(
      PropTypes.oneOfType([optionType, PropTypes.arrayOf(optionType), PropTypes.number])
    ).isRequired,
    refetchImages: PropTypes.bool,
    onRefetchImagesComplete: PropTypes.func,
    pageIndex: PropTypes.number.isRequired,
    pageSize: PropTypes.number.isRequired,
    pageSizeOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
    selectedImageGroupIndex: PropTypes.number,
    setFilters: PropTypes.func.isRequired,
    setPageIndex: PropTypes.func.isRequired,
    setPageSize: PropTypes.func.isRequired,
    setSelectedImageGroupIndex: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    projectType: PropTypes.string,
    forceImageRefetch: PropTypes.bool,
    anyImageClassfied: PropTypes.bool,
    setForceImageRefetch: PropTypes.func.isRequired,
    setAnyImageClassfied: PropTypes.func.isRequired,
  }

  static defaultProps = {
    data: {
      getDataFilesForProject: null,
      getDataFilesForIdentifyForProject: null,

      loading: false,
      error: null,
    },
    refetchImages: false,
    onRefetchImagesComplete: () => undefined,
    selectedImageGroupIndex: null,
    projectType: null,
    forceImageRefetch: false,
    anyImageClassfied: false
  }

  static bulkSelectionTooltip() {
    return (
      <React.Fragment>
        <div className="text-left mb-1">Quickly select multiple images using these common shortcuts:</div>
        <ul className="dash-ul">
          <li>Select all on a page: Command+A (Mac) or Ctrl+A (PC)</li>
          <li>Add or remove from a selection: Command+click (Mac) or Ctrl+click (PC)</li>
          <li>Select many: click and drag over desired selection</li>
          <li>Select all in between: Shift+click the first image, then Shift+click the last image. For this method, selections
            must be made by clicking the thumbnail instead of white circle.
          </li>
        </ul>
      </React.Fragment>
    );
  }

  constructor(props) {
    super(props);

    this.onChangeFilters = this.onChangeFilters.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {
      data: {
        loading,
        refetch,
        getDataFilesForProject,
        getDataFilesForIdentifyForProject
      },
      refetchImages,
      onRefetchImagesComplete,
      selectedImageGroupIndex,
      pageIndex,
      setSelectedImageGroupIndex,
      setPageIndex,
      forceImageRefetch,
      anyImageClassfied,
      setForceImageRefetch,
      setAnyImageClassfied,
      identify
    } = this.props;

    const needImageRefetchAfterClassification = identify && forceImageRefetch
      && anyImageClassfied;
    if (forceImageRefetch) {
      setForceImageRefetch();
      setAnyImageClassfied();
    }

    // After the user uploads images, a flag is put in the URL to force the images to reload
    if (refetchImages || needImageRefetchAfterClassification) {
      refetch().then(() => {
        if (onRefetchImagesComplete) {
          onRefetchImagesComplete();
        }
      });
    }

    // We've just finished loading and the user is seeing an image
    if (prevProps.data.loading && !loading && exists(selectedImageGroupIndex)) {
      const { data, meta } = getDataFilesForProject
        || getDataFilesForIdentifyForProject
        || { data: [], meta: { totalPages: 0 } };

      const { totalPages } = meta;

      if (totalPages === 0) {
        // There's no more images, we close the modal
        setPageIndex(0);
        setSelectedImageGroupIndex(null);
      } else if (pageIndex + 1 > totalPages) {
        // The page the user was seeing doesn't exist anymore
        // We move the user to the previous one and reset the
        // selected index
        setPageIndex(totalPages - 1);
        setSelectedImageGroupIndex(0);
      } else if (pageIndex + 1 === totalPages && selectedImageGroupIndex + 1 > data.length) {
        // The user was seeing the last image of the last page
        // and there are less images on the page now
        // We move the selected index
        setSelectedImageGroupIndex(data.length - 1);
      }
    }
  }

  componentWillUnmount() {
    const { reset } = this.props;
    reset();
  }

  onChangeFilters(newFilters) {
    const { filters, setPageIndex, setPageSize, setFilters } = this.props;
    setPageIndex(0);
    setFilters(newFilters);

    if (filters.timeStep === 0 && newFilters.timeStep > 0) {
      // If the user switches to the bursts view, we increase the page size in order to conceal the
      // pagination issue (the number of bursts per page is not consistent)
      setPageSize(MAX_IMAGEGRID_PAGESIZE);
    } else if (filters.timeStep > 0 && newFilters.timeStep === 0) {
      // If the user switches back, we use the default setting
      setPageSize(gridInitialState.pageSize);
    }
  }

  scrollTop() {
    if (!this.el) return;

    const bounds = this.el.getBoundingClientRect();
    const scroll = bounds.top + window.scrollY - HEADER_HEIGHT;
    smoothScroll(500, window.scrollY, scroll);
  }

  render() {
    const {
      data: {
        loading,
        error,
        getDataFilesForProject,
        getDataFilesForIdentifyForProject
      },
      filters,
      pageIndex,
      pageSize,
      pageSizeOptions,
      selectedImageGroupIndex,
      setSelectedImageGroupIndex,
      setPageIndex,
      setPageSize,
      projectType
    } = this.props;

    const { data: groups, meta, dataFileMeta } = getDataFilesForProject
      || getDataFilesForIdentifyForProject
      || { data: [], meta: undefined, dataFileMeta: undefined };

    const totalPages = (meta && meta.totalPages) || 1;
    const imageCount = (dataFileMeta && dataFileMeta.dataFileCount) || 0;
    const burstCount = (dataFileMeta && dataFileMeta.burstCount) || 0;
    const imageGroups = groups.length ? groups.map(g => g.data) : [];
    const isSequenceProject = projectType === 'sequence';

    return (
      <div
        className="c-image-grid"
        ref={(node) => {
          this.el = node;
        }}
      >
        <ImagePreviewModal imagesLoading={false} imageGroups={imageGroups} />
        <BulkActionsPanel imageGroups={imageGroups} />
        <div className="row mb-3">
          <div className="col">
            <ActionsBar selected={filters} setFilters={this.onChangeFilters} />
          </div>
        </div>
        <div className="mb-3 flex-with-space-between">
          <div>
            {
              !loading && (
                <span>
                  {
                    burstCount
                      ? `Viewing ${imageCount} images within ${burstCount} ${isSequenceProject ? 'sequences' : 'bursts'}`
                      : `Viewing ${imageCount} images`
                  }
                </span>
              )}
          </div>
          <div>
            <span>Bulk selections{'   '}</span>
            <Tooltip trigger="mouseenter focus" placement="left" content={<span className="text-left">{ImageGrid.bulkSelectionTooltip()}</span>}>
              <button type="button" className="btn btn-link m-0 p-0">
                <FontAwesomeIcon icon={faInfoCircle} />
              </button>
            </Tooltip>
          </div>
        </div>
        {loading && (
          <div className="text-center">
            <LoadingSpinner inline />
          </div>
        )}
        {error && (
          <div className="row">
            <div className="col">
              <div className="alert alert-danger text-center" role="alert">
                Unable to load the images. Please try again in a few minutes.
              </div>
            </div>
          </div>
        )}
        {!error && !loading && imageGroups.length === 0 && (
          <div className="row">
            <div className="col">
              <div className="alert alert-warning text-center" role="alert">
                {
                  // for sequence based projects, timeStep filter is fixed at 60 and is 
                  // disabled. so it is not considered a part of user managed filters
                  Object.values({
                    ...filters,
                    ...(isSequenceProject && { timeStep: undefined })
                  }).filter(v => !!v).length
                    ? 'No result. Try to widen your search.'
                    : 'No photo'
                }
              </div>
            </div>
          </div>
        )}
        {!loading && <CardView imageGroups={imageGroups} />}
        {/* We don't display the pagination element if the user is seeing bursts and we just have
        one page */}
        {(filters.timeStep === 0 || totalPages > 1) && (
          <div className="row">
            <div className="col text-center">
              {!loading && (
                <Pagination
                  pageIndex={pageIndex}
                  pages={totalPages}
                  // We hide the “per page” element when display bursts
                  pageSize={filters.timeStep > 0 ? null : pageSize}
                  pageSizeOptions={pageSizeOptions}
                  onChangePage={(index) => {
                    if (selectedImageGroupIndex !== null) setSelectedImageGroupIndex(0);
                    setPageIndex(index);
                    this.scrollTop();
                  }}
                  onChangePageSize={(pSize) => {
                    setPageIndex(0);
                    setPageSize(pSize);
                    this.scrollTop();
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ImageGrid;
