import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';

import './style.scss';

class SidebarEditTab extends PureComponent {
  static propTypes = {
    image: PropTypes.shape({ thumbnailUrl: PropTypes.string.isRequired }),
    presets: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        brightness: PropTypes.number.isRequired,
        contrast: PropTypes.number.isRequired,
        saturation: PropTypes.number.isRequired
      })
    ).isRequired,
    brightness: PropTypes.number.isRequired,
    contrast: PropTypes.number.isRequired,
    saturation: PropTypes.number.isRequired,
    setBrightness: PropTypes.func.isRequired,
    setContrast: PropTypes.func.isRequired,
    setSaturation: PropTypes.func.isRequired,
    setFilter: PropTypes.func.isRequired
  };

  static defaultProps = { image: null };

  render() {
    const {
      image,
      presets,
      brightness,
      contrast,
      saturation,
      setBrightness,
      setContrast,
      setSaturation,
      setFilter
    } = this.props;

    if (!image) return null;

    return (
      <div className="c-sidebar-edit-tab">
        <div className="my-mb-4">
          <span className="label">Brightness</span>
          <Slider
            min={0}
            max={200}
            value={brightness}
            onChange={setBrightness}
          />
        </div>
        <div className="my-md-4">
          <span className="label">Contrast</span>
          <Slider min={0} max={200} value={contrast} onChange={setContrast} />
        </div>
        <div className="my-md-4">
          <span className="label">Saturation</span>
          <Slider
            min={0}
            max={200}
            value={saturation}
            onChange={setSaturation}
          />
        </div>
        <p className="h5 font-weight-normal mt-md-5">Presets</p>
        <ul className="presets">
          {presets.map(preset => (
            <li key={preset.name} className="mb-1">
              <button
                type="button"
                onClick={() => setFilter({
                  brightness: preset.brightness,
                  contrast: preset.contrast,
                  saturation: preset.saturation
                })
                }
              >
                <div
                  className="preview mr-md-3"
                  style={{
                    backgroundImage: `url(${image.thumbnailUrl})`,
                    filter: `brightness(${preset.brightness}%) contrast(${
                      preset.contrast
                    }%) saturate(${preset.saturation}%)`
                  }}
                />
                {preset.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default SidebarEditTab;
