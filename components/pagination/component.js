import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleLeft,
  faAngleRight,
  faAngleDoubleLeft,
  faAngleDoubleRight,
  faAngleDown,
} from '@fortawesome/free-solid-svg-icons';

import PageInput from './page-input';
import './style.scss';

/**
 * This component is based on the Popout example here:
 * https://react-select.com/advanced#experimental
 * */
const Dropdown = ({ children, isOpen, target, onClose }) => (
  <div style={{ position: 'relative' }}>
    {target}
    {
      isOpen && (
        <Fragment>
          <div className="select">{children}</div>
          {/* eslint-disable-next-line */}
          <div className="select__overlay" onClick={onClose} />
        </Fragment>
      )
    }
  </div>
);

Dropdown.propTypes = {
  children: PropTypes.element.isRequired,
  isOpen: PropTypes.bool.isRequired,
  target: PropTypes.element.isRequired,
  onClose: PropTypes.func.isRequired,
};

class Pagination extends PureComponent {
  static propTypes = {
    pageIndex: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    pageSize: PropTypes.number,
    pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
    onChangePage: PropTypes.func.isRequired,
    onChangePageSize: PropTypes.func,
  };

  static defaultProps = {
    pageSize: null,
    pageSizeOptions: [],
    onChangePageSize: () => {
    },
  };

  constructor(props) {
    super(props);
    this.state = { isPerPageOpen: false };
  }

  /**
   * @param {number} pageIndex
   */
  onChangePage = (pageIndex) => {
    const { onChangePage } = this.props;
    onChangePage(pageIndex);
  };

  onChangePageSize = ({ value }) => {
    const { onChangePageSize } = this.props;
    this.onClosePerPage();
    onChangePageSize(value);
  };

  onClosePerPage = () => {
    this.setState(state => ({ isPerPageOpen: !state.isPerPageOpen }));
  };

  render() {
    const {
      pageIndex,
      pages,
      pageSize,
      pageSizeOptions,
      onChangePage,
    } = this.props;
    const { isPerPageOpen } = this.state;

    return (
      <div className="c-pagination">
        {
          pageSize && pageSizeOptions.length && (
            <div className="per-page">
              <Dropdown
                isOpen={isPerPageOpen}
                onClose={this.onClosePerPage}
                target={
                  (
                    <button
                      type="button"
                      className="dropdown-button"
                      aria-label="Select number of items per page"
                      onClick={this.onClosePerPage}
                    >
                      {pageSize}
                      <FontAwesomeIcon
                        icon={faAngleDown}
                        className="ml-2"
                        size="lg"
                      />
                    </button>
                  )
                }
              >
                <Select
                  menuIsOpen
                  isSearchable={false}
                  options={pageSizeOptions.map(o => ({
                    label: `${o}`,
                    value: o,
                  }))}
                  hideSelectedOptions={false}
                  isClearable={false}
                  controlShouldRenderValue={false}
                  backspaceRemovesValue={false}
                  components={{ IndicatorSeparator: null }}
                  classNamePrefix="select"
                 
                  onChange={this.onChangePageSize}
                  value={{ label: `${pageSize}`, value: pageSize }}
                />
              </Dropdown>
              <span>per page</span>
            </div>
          )
        }
        <div
          className={classnames({
            paginator: true,
            '-full-width': !pageSize || !pageSizeOptions.length,
          })}
        >
          <div className="btn-group">
            <button
              type="button"
              aria-label="First page"
             
              disabled={pageIndex === 0}
              onClick={() => {
                onChangePage(0);
              }}
            >
              <FontAwesomeIcon icon={faAngleDoubleLeft} size="lg" />
            </button>
            <button
              type="button"
              aria-label="Previous page"
             
              disabled={pageIndex === 0}
              onClick={() => {
                onChangePage(pageIndex - 1);
              }}
            >
              <FontAwesomeIcon icon={faAngleLeft} size="lg" />
            </button>
          </div>
          <div className="page-info">
            <PageInput
              // WARN: don't remove the key unless you fully understand
              // what you're doing
              // https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#preferred-solutions
              key={`${pageIndex}-${pages}`}
              pageIndex={pageIndex}
              pages={pages}
              onChangePage={page => this.onChangePage(page)}
            />
            {
              pages > 1 && (
                <div className="page-total">
                  <span>of</span>
                  <span> {pages}</span>
                </div>
              )
            }
          </div>
          <div className="btn-group">
            <button
              type="button"
              aria-label="Next page"
             
              disabled={pageIndex === pages - 1}
              onClick={() => {
                onChangePage(pageIndex + 1);
              }}
            >
              <FontAwesomeIcon icon={faAngleRight} size="lg" />
            </button>
            <button
              type="button"
              aria-label="Last page"
             
              disabled={pageIndex === pages - 1}
              onClick={() => {
                onChangePage(pages - 1);
              }}
            >
              <FontAwesomeIcon icon={faAngleDoubleRight} size="lg" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Pagination;
