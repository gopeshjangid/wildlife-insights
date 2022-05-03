import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import classnames from 'classnames';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudDownloadAlt, faTrash, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import './style.scss';

import T from 'components/transifex/translate';
import Tooltip from 'components/tooltip';
import HighlightBtnHolder from './shared/highlight-btn-holder';
import getOriginalImageUrl from 'utils/shared-gql-queries/image-original-url.graphql';
import EditTab from './edit-tab';
import MetadataTab from './metadata-tab';
import IdentifyTab from './identify-tab';

class Sidebar extends PureComponent {
  static propTypes = {
    images: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
    image: PropTypes.shape({ thumbnailUrl: PropTypes.string.isRequired }),
    canHighlight: PropTypes.bool.isRequired,
    canDelete: PropTypes.bool.isRequired,
    deleteImage: PropTypes.func.isRequired,
    displayError: PropTypes.func.isRequired,
    projectsPermissions: PropTypes.shape({}).isRequired,
    tab: PropTypes.string.isRequired,
    isBurst: PropTypes.bool.isRequired,
    isSingleBurstPreview: PropTypes.bool.isRequired,
    isLastImageGroup: PropTypes.bool.isRequired
  }

  static defaultProps = {
    image: null,
  }

  static shortcutkeysTooltip() {
    return (
      <ul className="no-style">
        <li><b>Ctrl+E</b> - to Edit Identification</li>
        <li><b>Ctrl+B</b> - to Mark as Blank</li>
        <li><b>Ctrl+A</b> - to Accept ID</li>
        <li><b>Ctrl+S</b> - to Save Changes</li>
        <li><b>Ctrl+Y</b> - for Yes, Bounding boxes</li>
        <li><b>Ctrl+J</b> - for No, Bounding boxes</li>
        <li><b>Ctrl+H</b> - to Highlight an image</li>
        <li><b>Right arrow</b> - next image/burst</li>
        <li><b>Left arrow</b> - previous image/burst</li>
        <li><b>Ctrl+Right arrow</b> - next image in a Burst</li>
        <li><b>Ctrl+Left arrow</b> - previous image in a Burst</li>
        <li><b>Up arrow</b> - Zoom in</li>
        <li><b>Down arrow</b> - Zoom out</li>
      </ul>
    );
  }

  elDownload = React.createRef()

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  onClickDelete() {
    const { deleteImage, displayError } = this.props;

    deleteImage().catch(() => {
      displayError({
        title: 'Unable to delete the photo',
        message: 'Please try again in a few minutes.',
      });
    });
  }

  handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 68) { // Ctrl + D
      e.preventDefault();
      this.elDownload.current.click();
    }
  };

  render() {
    const {
      images,
      image,
      canHighlight,
      canDelete,
      projectsPermissions,
      tab,
      isBurst,
      isSingleBurstPreview,
      isLastImageGroup
    } = this.props;
    let disableHighlight = false;
    if (tab === 'catalogued' && projectsPermissions[image?.deployment?.project?.id]?.role === 'PROJECT_TAGGER') {
      disableHighlight = true;
    }
    const isSingleImagePreview = !isBurst || isSingleBurstPreview;

    return (
      <div className="c-sidebar">
        <Tabs>
          <div className="tabs-container">
            <TabList>
              <Tab>Identify</Tab>
              <Tab disabled={!isSingleImagePreview}>Edit photo</Tab>
              <Tab disabled={!isSingleImagePreview}>Metadata</Tab>
            </TabList>
          </div>
          <TabPanel>
            <IdentifyTab images={images} isLastImageGroup={isLastImageGroup} />
          </TabPanel>
          <TabPanel>
            <EditTab images={images} />
          </TabPanel>
          <TabPanel>
            <MetadataTab images={images} />
          </TabPanel>
        </Tabs>
        {image && isSingleImagePreview && (
          <div className="fixed-actions mt-2 text-center">
            <HighlightBtnHolder
              imageId={+image?.id}
              projectId={+image?.deployment?.projectId}
              deploymentId={+image?.deployment?.id}
              disabled={!canHighlight || disableHighlight}
            />
            <Query
              query={getOriginalImageUrl}
              variables={{
                projectId: +image.deployment.projectId,
                deploymentId: +image.deployment.id,
                id: +image.id,
              }}
            >
              {({ error, data: { getDataFileDownloadUrl } }) => (
                <a
                  ref={this.elDownload}
                  className={classnames('btn btn-sm', {
                    disabled: !getDataFileDownloadUrl || error,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={getDataFileDownloadUrl ? getDataFileDownloadUrl.url : '#'}
                  aria-disabled={!getDataFileDownloadUrl || error}
                >
                  <FontAwesomeIcon className="mb-2" icon={faCloudDownloadAlt} size="lg" />
                  Download
                </a>
              )}
            </Query>
            <Tooltip
              trigger="mouseenter focus"
              isVisible={image.canDelete ? false : undefined}
              distance={10}
              placement="left"
              content={(
                <div className="text-left">
                  <p className="alert alert-warning" role="alert">
                    <T text="This photo can't be deleted." />
                  </p>
                  <p>
                    <strong><T text="Why?" /></strong>{' '}
                    <T text="Once uploaded, the photos are protected against accidental deletion. If you've recently uploaded some photos by mistake, you have a short period of time to delete them." />
                  </p>
                </div>
              )}
            >
              <div className="d-inline-block"> {/* div needed for the tooltip to work when the button is disabled */}
                <button
                  type="button"
                  className="btn btn-sm"
                  disabled={!image.canDelete || !canDelete}
                  onClick={() => this.onClickDelete()}
                >
                  <FontAwesomeIcon className="mb-2" icon={faTrash} size="lg" />
                  Delete
                </button>
              </div>
            </Tooltip>
            <Tooltip trigger="mouseenter focus" placement="left" content={<span className="text-left">{Sidebar.shortcutkeysTooltip()}</span>}>
              <div className="d-inline-block"> {/* div needed for the tooltip to work when the button is disabled */}
                <button
                  type="button"
                  className="btn btn-sm"
                >
                  <FontAwesomeIcon className="mb-2" icon={faInfoCircle} size="lg" />
                  Shortcuts
                </button>
              </div>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }
}

export default Sidebar;
