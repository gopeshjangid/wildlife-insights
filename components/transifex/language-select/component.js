import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { exists } from 'utils/functions';

class LanguageSelect extends PureComponent {
  static propTypes = {
    current: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      code: PropTypes.string,
    })).isRequired,
    languagesLoaded: PropTypes.bool.isRequired,
    fetchLanguages: PropTypes.func.isRequired,
    setLanguage: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { languagesLoaded, fetchLanguages, setLanguage } = this.props;

    // @ts-ignore
    if (typeof window !== 'undefined' && exists(window.Transifex)) {
      if (!languagesLoaded) {
        fetchLanguages();
      }

      Transifex.live.onReady(() => {
        const { code } = Transifex.live.getSourceLanguage();
        const langCode = Transifex.live.detectLanguage();

        // For any reason we have to translate at first to source code.
        Transifex.live.translateTo(code);
        Transifex.live.translateTo(langCode);
        setLanguage(langCode);
      });
    }
  }

  handleChange(langCode) {
    // @ts-ignore
    if (typeof window !== 'undefined' && exists(window.Transifex)) {
      const { setLanguage } = this.props;
      Transifex.live.translateTo(langCode);
      setLanguage(langCode);
    }
  }

  render() {
    const { current, data } = this.props;
    if (!data) return null;

    const options = data.filter(l => !l.source).map(lang => ({
      label: lang.name,
      value: lang.code
    }));

    return (
      <ul className="nav flex-column">
        {options.map(option => (
          <li key={option.value} className="nav-item">
            <div className="nav-link">
              <div className="custom-control custom-radio">
                <input
                  type="radio"
                  id={`language-select-${option.value}`}
                  name="language-select"
                  className="custom-control-input"
                  checked={option.value === current}
                  onChange={() => this.handleChange(option.value)}
                />
                <label
                  className="custom-control-label"
                  htmlFor={`language-select-${option.value}`}
                >
                  {option.label}
                </label>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }
}

export default LanguageSelect;
