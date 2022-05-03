import React, { Fragment, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsersCog } from '@fortawesome/free-solid-svg-icons';

import UsersPermissionsModal from './modal';

const UsersPermissions = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const onClose = () => setModalOpen(false);
  const onClick = () => setModalOpen(true);

  return (
    <Fragment>
      <UsersPermissionsModal open={modalOpen} onClose={onClose} />
      <button
        type="button"
        aria-label="Permissions"
        title="Permissions"
        className="btn btn-sm btn-secondary"
        onClick={onClick}
      >
        <FontAwesomeIcon icon={faUsersCog} />
      </button>
    </Fragment>
  );
};

export default UsersPermissions;
