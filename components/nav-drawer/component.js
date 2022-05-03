import React, { PureComponent, createRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { Router } from 'lib/routes';
import ManageSidebar from './manage-sidebar';

import './style.scss';

class NavDrawer extends PureComponent {
  state = {
    open: false,
    // To avoid excessive api calls - render ManageSidebar component only after NavDrawer 
    // has expanded for at least once
    hasExpandedOnce: false
  };

  sidebar = createRef();

  componentDidMount() {
    Router.events.on('routeChangeStart', this.onRouteChangeStart);
  }

  componentWillUnmount() {
    Router.events.off('routeChangeStart', this.onRouteChangeStart);
  }

  onToggleDrawer = () => {
    const { open, hasExpandedOnce } = this.state;
    this.setState({
      open: !open,
      ...(!hasExpandedOnce && !open && { hasExpandedOnce: true })
    }, () => {
      if (!open) {
        this.sidebar.current.focus();
      }
    });
  }

  onHideDrawer = () => {
    this.setState({ open: false });
  };

  onRouteChangeStart = () => {
    this.onHideDrawer();
  }

  render() {
    const { open, hasExpandedOnce } = this.state;

    return (
      <div className="c-nav-drawer">
        <button
          type="button"
          id="c-nav-drawer-toggle-button"
          className="btn btn-secondary btn-sm toggle-button"
          aria-label="Toggle projects list"
          aria-controls="c-nav-drawer-drawer"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={this.onToggleDrawer}
        >
          Projects list
        </button>
        <div
          id="c-nav-drawer-drawer"
          className="drawer"
          aria-labelledby="c-nav-drawer-toggle-button"
          aria-hidden={!open}
        >
          {/* Backdrop doesn't need to be interactive for keyboard users */}
          <div // eslint-disable-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, max-len
            className="backdrop"
            tabIndex={-1}
            onClick={this.onToggleDrawer}
          />
          {
            hasExpandedOnce && <ManageSidebar ref={this.sidebar} />
          }
          <button
            type="button"
            className="btn btn-light close-button"
            aria-label="Hide projects list"
            onClick={this.onHideDrawer}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>
    );
  }
}

export default NavDrawer;
