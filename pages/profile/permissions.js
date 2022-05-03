import React from 'react';
import Table from 'react-table';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { translateText } from 'utils/functions';
import './style.scss';

const PermissionCell = ({ value, isInactive }) => (
  <span className={classnames({ inactive: isInactive })}>
    {value ? <FontAwesomeIcon icon={faCheck} size="sm" /> : null }
  </span>
);

PermissionCell.propTypes = {
  value: PropTypes.bool.isRequired,
  isInactive: PropTypes.bool.isRequired,
};

const PermissionPage = ({ isUserWhitelisted }) => {
  const getColumns = () => [
    { Header: '', accessor: 'permission', sortable: false, style: { } },
    {
      Header: () => <span className={classnames({ active: !isUserWhitelisted })}>{translateText('Registered User')}</span>,
      accessor: 'registered_user',
      sortable: false,
      width: 200,
      style: { textAlign: 'center' },
      Cell: props => (
        <PermissionCell
          {...props}
          isInactive={isUserWhitelisted}
        />
      ),
    },
    {
      Header: () => <span className={classnames({ active: isUserWhitelisted })}>{translateText('Data Contributor * account must be approved by Wildlife Insights')}</span>,
      accessor: 'contributor',
      sortable: false,
      width: 250,
      style: { textAlign: 'center' },
      Cell: props => (
        <PermissionCell
          {...props}
          isInactive={!isUserWhitelisted}
        />
      ),
    },
  ];

  const getPermissionData = () => [
    { permission: 'Explore public data and images', registered_user: true, contributor: true },
    { permission: 'Download public data (excludes sensitive and embargoed \n data unless granted access by Data Contributor)', registered_user: true, contributor: true },
    { permission: 'View project summary information', registered_user: true, contributor: true },
    { permission: 'Create and manage projects', registered_user: false, contributor: true },
    { permission: 'Upload camera trap images', registered_user: false, contributor: true },
    { permission: 'Use computer vision for species identification', registered_user: false, contributor: true },
  ];
  return (
    <div className="c-permission-list">
      <h1>Account access</h1>
      <Table
        className="table"
        data={getPermissionData()}
        columns={getColumns()}
        resizable={false}
        showPagination={false}
        pageSize={6}
      />
      {!isUserWhitelisted
      && (
        <a href="https://www.wildlifeinsights.org/trusted-tester" rel="noopener noreferrer" target="_requestaccess">
          <button type="button" className="btn btn-primary request-access">
            Request access
          </button>
        </a>)
      }
    </div>
  );
};

PermissionPage.propTypes = {
  isUserWhitelisted: PropTypes.bool.isRequired,
};

export default PermissionPage;
