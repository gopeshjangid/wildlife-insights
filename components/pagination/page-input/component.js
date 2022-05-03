import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class PageInput extends PureComponent {
  static propTypes = {
    pageIndex: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    const { pageIndex } = this.props;
    this.state = { stashPage: pageIndex + 1 };
  }

  render() {
    const { pages, onChangePage } = this.props;
    const { stashPage } = this.state;

    return (
      <input
        type="number"
        aria-label="Current page"
        value={stashPage}
        min={1}
        max={pages}
        step={1}
        onChange={({ target }) => {
          const value = +target.value;
          if (!Number.isNaN(value)) {
            const clampedValue = Math.max(1, Math.min(pages, value));
            this.setState({ stashPage: clampedValue });
          }
        }}
        onBlur={() => onChangePage(stashPage - 1)}
        onKeyDown={({ key }) => {
          if (key === 'Enter') {
            onChangePage(stashPage - 1);
          }
        }}
        style={{ width: `calc(${`${stashPage}`.length}ch + 2rem)` }}
      />
    );
  }
}

export default PageInput;
