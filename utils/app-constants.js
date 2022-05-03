export const DISABLE_PUBLIC_DOWNLOAD = false;
export const MAX_PUBLIC_DOWNLOAD_LIMIT = 500000;
export const MAX_EMBARGO = 48;
export const MAX_IMAGEGRID_PAGESIZE = 500;

// api error code, when an entity(which is still
// associated with another entity) is deleted
export const ENTITY_ASSOCIATION_ERROR = 4001;

// for react-apollo clients
export const GQL_DEFAULT = 'graphql_default';
export const GQL_PUBLIC_DEFAULT = 'graphql_public_default';
export const GQL_GET_DATA_FILES = 'graphql_get_data_files';
export const GQL_ENDPOINTS = {
    [GQL_DEFAULT]: 'graphql',
    [GQL_PUBLIC_DEFAULT]: 'graphql-public',
    [GQL_GET_DATA_FILES]: 'graphql-data-file'
};

// different types of states
export const LOADING = 'loading';
export const SUCCESS = 'success';
export const FAILED = 'failed';

export const IMAGE_PROJECT = 'image';
export const SEQUENCE_PROJECT = 'sequence';
