import { PureComponent, cloneElement } from 'react';
import PropTypes from 'prop-types';
import { MAP, MARKER, MARKER_CLUSTERER, ANCHOR } from 'react-google-maps/lib/constants';

import { createHTMLMarker } from './helpers';

import './style.scss';

class MapHTMLMarker extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      [MARKER]: this.createMarker(props, context),
      openPopup: false,
    };
  }

  getChildContext() {
    const { [MARKER]: marker } = this.state;
    const { [ANCHOR]: anchor } = this.context;

    return {
      [ANCHOR]: anchor || marker,
    };
  }

  componentDidUpdate(prevProps) {
    const { position, className, iconSize, html, active, onClick } = this.props;
    const { [MARKER]: marker } = this.state;

    const hasChanged = {
      position:
        prevProps.position?.lat !== position?.lat || prevProps.position?.lng !== position?.lng,
      className: prevProps.className !== className,
      iconSize: prevProps.iconSize !== iconSize,
      html: prevProps.html !== html,
      active: prevProps.active !== active,
      onClick: prevProps.onClick !== onClick,
    };

    Object.keys(hasChanged).forEach((key) => {
      if (hasChanged[key]) {
        const setter = marker[
          `set${key.slice(0, 1).toUpperCase()}${key.slice(1, key.length)}`
        ].bind(marker);
        if (setter) {
          // eslint-disable-next-line react/destructuring-assignment
          setter(this.props[key], prevProps[key]);
        }
      }
    });
  }

  componentWillUnmount() {
    this.removeMarker();
  }

  onClickMarker() {
    const { onClick, popupTrigger } = this.props;

    if (popupTrigger === 'click') {
      const { openPopup } = this.state;
      this.setState({ openPopup: !openPopup });
    }

    onClick();
  }

  onClickCloseTooltip() {
    this.setState({ openPopup: false });
  }

  onMouseenterMarker() {
    const { popupTrigger } = this.props;
    if (popupTrigger === 'mouseenter') {
      this.setState({ openPopup: true });
    }
  }

  onMouseleaveMarker() {
    const { popupTrigger } = this.props;
    if (popupTrigger === 'mouseenter') {
      this.setState({ openPopup: false });
    }
  }

  createMarker(props, context) {
    const { [MAP]: map, [MARKER_CLUSTERER]: markerClusterer } = context;
    const { position, className, iconSize, html, active, clusterPopupContent } = props;
    const marker = createHTMLMarker({
      position,
      className,
      iconSize,
      html,
      active,
      onClick: this.onClickMarker.bind(this),
      onMouseenter: this.onMouseenterMarker.bind(this),
      onMouseleave: this.onMouseleaveMarker.bind(this),
    });

    marker.clusterPopupContent = clusterPopupContent;

    if (markerClusterer) {
      markerClusterer.addMarker(marker, true);
    } else {
      marker.setMap(map);
    }

    return marker;
  }

  removeMarker() {
    const { [MARKER_CLUSTERER]: markerClusterer } = this.context;
    const { [MARKER]: marker } = this.state;

    if (marker) {
      if (markerClusterer) {
        markerClusterer.removeMarker(marker, true);
      } else {
        // @ts-ignore
        marker.setMap(null);
      }

      this.setState({ [MARKER]: null });
    }
  }

  render() {
    const { children, iconSize } = this.props;
    const { openPopup } = this.state;

    if (!children) {
      return null;
    }

    return cloneElement(/** @type {React.ReactElement} */ (children), {
      open: openPopup,
      options: { pixelOffset: new google.maps.Size(0, -iconSize / 2) },
      onCloseClick: this.onClickCloseTooltip.bind(this),
    });
  }
}

MapHTMLMarker.contextTypes = {
  [MAP]: PropTypes.shape({}),
  [MARKER_CLUSTERER]: PropTypes.shape({}),
};

MapHTMLMarker.childContextTypes = {
  [ANCHOR]: PropTypes.shape({}),
};

MapHTMLMarker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }).isRequired,
  className: PropTypes.string,
  iconSize: PropTypes.number,
  html: PropTypes.string,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  popupTrigger: PropTypes.oneOf(['click', 'mouseenter']),
  children: PropTypes.element,
  clusterPopupContent: PropTypes.string,
};

MapHTMLMarker.defaultProps = {
  className: null,
  iconSize: 20,
  html: null,
  active: false,
  onClick: () => null,
  popupTrigger: 'click',
  children: null,
  clusterPopupContent: null
};

export default MapHTMLMarker;
