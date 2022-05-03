import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';

import { mapEntities } from './helpers';
import EntitiesList from './entities-list';

import userPermissionsQuery from './user-permissions.graphql';

const WelcomeNotification = ({ firstLogin, displayInfo }) => {
  const [permissionsData, setPermissionsData] = useState(null);

  const { data, error } = useQuery(userPermissionsQuery, {
    skip: !firstLogin,
  });

  useEffect(() => {
    if (!permissionsData && !error && data?.getParticipantData) {
      setPermissionsData(data.getParticipantData);
    }
  }, [data, error, permissionsData, setPermissionsData]);

  useEffect(() => {
    if (firstLogin && permissionsData) {
      // Note that this case shouldn't happen
      if (
        !permissionsData.organizationRoles.length
        && !permissionsData.initiativeRoles.length
        && !permissionsData.projectRoles.length
      ) {
        return;
      }

      displayInfo({
        uid: 'welcome-notification',
        title: 'Welcome to Wildlife Insights!',
        message: (
          <EntitiesList
            organizations={mapEntities('organization', permissionsData)}
            initiatives={mapEntities('initiative', permissionsData)}
            projects={mapEntities('project', permissionsData)}
          />
        ),
        autoDismiss: 0,
      });
    }
  }, [firstLogin, displayInfo, permissionsData]);

  return null;
};

WelcomeNotification.propTypes = {
  firstLogin: PropTypes.bool.isRequired,
  displayInfo: PropTypes.func.isRequired,
};

export default WelcomeNotification;
