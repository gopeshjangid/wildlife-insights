import React, { Component, Fragment } from 'react';
import { Query } from 'react-apollo';
import { Router, Link } from 'lib/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Autocomplete from 'components/autocomplete';
import query from './projects.graphql';

import './style.scss';

const renderSuggestion = suggestion => (
  <Link
    route="projects_show"
    params={{
      organizationId: suggestion.organizationId,
      projectId: suggestion.id,
    }}
  >
    <a>{suggestion.shortName}</a>
  </Link>
);

class ProjectSearch extends Component {
  state = { value: '' };

  onChangeInput = (e, { newValue, method }) => {
    if (method === 'down' || method === 'up' || method === 'enter') {
      e.stopPropagation();
    } else {
      this.setState({ value: newValue });
    }
  };

  render() {
    const { value } = this.state;

    return (
      <div className="c-project-search">
        <Query query={query} variables={{ shortName: value }}>
          {({ loading, error, data }) => {
            const getProjects = data?.getProjects || { data: [] };
            return (
              <Fragment>
                <Autocomplete
                  loading={loading}
                  suggestions={(loading && !getProjects) || error ? [] : getProjects.data}
                  getSuggestionValue={suggestion => suggestion.shortName}
                  onSuggestionSelected={(_, { method, suggestionIndex }) => {
                    if (method === 'enter') {
                      const suggestion = getProjects.data[suggestionIndex];
                      Router.pushRoute('projects_show', {
                        organizationId: suggestion.organizationId,
                        projectId: suggestion.id,
                      });
                    }
                  }}
                  renderSuggestion={renderSuggestion}
                  inputProps={{
                    placeholder: 'Search a project',
                    'aria-label': 'Search a project',
                    value,
                    type: 'search',
                    className: 'form-control form-control-sm search-input',
                    onChange: this.onChangeInput,
                  }}
                />
                <div className="search-icon">
                  <FontAwesomeIcon icon={faSearch} />
                </div>
              </Fragment>
            );
          }}
        </Query>
      </div>
    );
  }
}

export default ProjectSearch;
