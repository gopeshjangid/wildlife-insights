import React from 'react';
import PropTypes from 'prop-types';

import './style.scss';

const YoutubeVideo = ({ id, title, showControls, showLogo }) => (
  <div className="c-youtube-video">
    <iframe title={title} src={`https://www.youtube.com/embed/${id}?controls=${+showControls}&modestbranding=${+(!showLogo)}`} />
  </div>
);

YoutubeVideo.propTypes = {
  /**
   * YouTube ID
   */
  id: PropTypes.string.isRequired,
  /**
   * Title of the iframe
   */
  title: PropTypes.string.isRequired,
  /**
   * Whether to show the controls of the video
   */
  showControls: PropTypes.bool,
  /**
   * Whether to show the YouTube logo
   */
  showLogo: PropTypes.bool,
};

YoutubeVideo.defaultProps = {
  showControls: false,
  showLogo: false,
};

export default YoutubeVideo;
