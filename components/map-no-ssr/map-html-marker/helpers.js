const createHTMLMarker = ({
  OverlayView = google.maps.OverlayView,
  position: initialPosition,
  html: initialHtml,
  className: initialClassName,
  iconSize: initialIconSize,
  active: initialActive,
  onClick: initialOnClick,
  onMouseenter: initialOnMouseenter,
  onMouseleave: initialOnMouseleave,
}) => {
  class MapHTMLMarkerClass extends OverlayView {
    constructor() {
      super();

      // Must be defined here so the clusterer can call getPosition right away
      this.latLng = new google.maps.LatLng(initialPosition.lat, initialPosition.lng);
    }

    // Not called if the marker is in a cluster, so this.div is not always available
    createDiv() {
      this.div = document.createElement('div');
      this.div.classList.add('c-map-html-marker');
      this.setClassName(initialClassName);
      this.setActive(initialActive);

      if (initialIconSize) {
        this.setIconSize(initialIconSize);
      }

      if (initialHtml) {
        this.setHtml(initialHtml);
      }

      this.setEventListener('click', initialOnClick);
      this.setEventListener('mouseenter', initialOnMouseenter);
      this.setEventListener('mouseleave', initialOnMouseleave);
    }

    appendDivToMap() {
      const panes = this.getPanes();
      panes.overlayMouseTarget.appendChild(this.div);
    }

    draw() {
      if (!this.div) {
        this.createDiv();
        this.appendDivToMap();
      }

      this.setPosition(initialPosition);
    }

    onRemove() {
      if (this.div) {
        this.setEventListener('click', undefined, this.onClickListener);
        this.setEventListener('mouseenter', undefined, this.onMouseenterListener);
        this.setEventListener('mouseleave', undefined, this.onMouseleaveListener);
        this.div.parentNode.removeChild(this.div);
        this.div = null;
      }
    }

    getPosition() {
      return this.latLng;
    }

    // eslint-disable-next-line class-methods-use-this
    getDraggable() {
      return false;
    }

    setPosition(position) {
      if (this.div) {
        this.latLng = new google.maps.LatLng(position.lat, position.lng);

        const point = this.getProjection().fromLatLngToDivPixel(this.latLng);

        if (point) {
          this.div.style.left = `${point.x}px`;
          this.div.style.top = `${point.y}px`;
        }
      }
    }

    setClassName(className, oldClassName) {
      if (this.div) {
        if (oldClassName) {
          this.div.classList.remove(oldClassName);
        }

        if (className) {
          this.div.classList.add(className);
        }
      }
    }

    setIconSize(iconSize) {
      if (this.div) {
        this.div.style.width = `${iconSize}px`;
        this.div.style.height = `${iconSize}px`;
      }
    }

    setHtml(html) {
      if (this.div) {
        this.div.innerHTML = html;
      }
    }

    setActive(active) {
      if (this.div) {
        this.div.classList.toggle('-active', !!active);
      }
    }

    setOnClick(...params) {
      this.setEventListener('click', ...params);
    }

    setEventListener(event, listener, oldListener) {
      if (!this.div) {
        return;
      }

      if (oldListener) {
        this.div.removeEventListener(event, oldListener);
      }

      const listenerName = `on${event.slice(0, 1).toUpperCase()}${event.slice(
        1,
        event.length
      )}Listener`;

      if (listener) {
        this.div.addEventListener(event, listener);
        this[listenerName] = listener;
      } else {
        this[listenerName] = undefined;
      }
    }
  }

  return new MapHTMLMarkerClass();
};

export default createHTMLMarker;
export { createHTMLMarker };
