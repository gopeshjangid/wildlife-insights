import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-apollo-hooks';
import classnames from 'classnames';

import { exists } from 'utils/functions';
import { Link } from 'lib/routes';
import T from 'components/transifex/translate';

import projectQuery from './project.graphql';
import initiativeQuery from './initiative.graphql';
import './style.scss';

const Breadcrumbs = ({
  organizationId,
  initiativeId,
  projectId,
  canAccessOrganization,
  canAccessInitiative,
  pathname,
}) => {
  const showOrganization = useMemo(
    () => exists(organizationId) && (exists(projectId) || exists(initiativeId)),
    [organizationId, initiativeId, projectId]
  );
  const showInitiative = useMemo(() => exists(initiativeId) && exists(projectId), [
    initiativeId,
    projectId,
  ]);

  const [organization, setOrganization] = useState(null);
  const [initiative, setInitiative] = useState(null);

  const { data: projectData } = useQuery(projectQuery, {
    skip: !exists(organizationId) || !exists(projectId),
    variables: {
      organizationId,
      projectId,
    },
  });

  const { data: initiativeData } = useQuery(initiativeQuery, {
    skip: !exists(initiativeId) || exists(projectId),
    variables: {
      initiativeId,
    },
  });

  useEffect(() => {
    if (showOrganization) {
      if (projectData?.getProject) {
        setOrganization(projectData.getProject.organization.name);
      } else if (initiativeData?.getInitiative) {
        setOrganization(initiativeData.getInitiative.ownerOrganization.name);
      }
    }
  }, [showOrganization, projectData, initiativeData, setOrganization]);

  useEffect(() => {
    if (showInitiative && exists(projectData?.getProject?.initiativeId)) {
      setInitiative(projectData.getProject.initiative.name);
    }
  }, [showInitiative, projectData, setInitiative]);

  return (
    <div className="c-breadcrumbs">
      <div className="container-fluid">
        <div className="row">
          <div className={classnames({ 'col-12': pathname !== '/manage', 'col-6': pathname === '/manage' })}>
            <ul>
              <li>
                <Link route="manage">
                  <a>
                    <T text="Manage" />
                  </a>
                </Link>
              </li>
              {showOrganization && !!organization && (
                <li>
                  {canAccessOrganization(organizationId) && (
                    <Link route="organizations_show" params={{ organizationId }}>
                      <a>{organization}</a>
                    </Link>
                  )}
                  {!canAccessOrganization(organizationId) && (
                    <span className="font-weight-bold">{organization}</span>
                  )}
                </li>
              )}
              {showInitiative && !!initiative && (
                <li>
                  {canAccessInitiative(initiativeId) && (
                    <Link route="initiatives_show" params={{ initiativeId }}>
                      <a>{initiative}</a>
                    </Link>
                  )}
                  {!canAccessInitiative(initiativeId) && (
                    <span className="font-weight-bold">{initiative}</span>
                  )}
                </li>
              )}
            </ul>
          </div>
          {pathname === '/manage'
            && (
              <div className="col-6">
                <div className="row">
                  <div className="col-12">
                    <a
                      href="https://form.asana.com/?k=eMP-aOLDpb-CeIS7DMEcLw&d=33223349994147"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="help-links"
                    >
                      Report a bug
                    </a>
                    <a
                      className="help-links"
                      href="https://airtable.com/shrvImX12zoS73lDu"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Feature request
                    </a>
                    <a
                      className="help-links"
                      href="https://airtable.com/shrpbVfBPahYkyJmp"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Taxonomy request
                    </a>
                    <a
                      className="help-links"
                      href="https://www.wildlifeinsights.org/get-started"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Help
                    </a>
                    <a
                      className="help-links"
                      href="https://groups.google.com/g/wildlifeinsights"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Community forum
                    </a>
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

Breadcrumbs.propTypes = {
  organizationId: PropTypes.number,
  initiativeId: PropTypes.number,
  projectId: PropTypes.number,
  canAccessOrganization: PropTypes.func.isRequired,
  canAccessInitiative: PropTypes.func.isRequired,
};

Breadcrumbs.defaultProps = {
  organizationId: null,
  initiativeId: null,
  projectId: null,
};

export default Breadcrumbs;
