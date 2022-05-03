/* eslint-disable react/no-danger */
import React, { Fragment } from 'react';

const transifexConfig = () => ({
  api_key: process.env.TRANSIFEX_API_KEY,
  detectlang: true,
  autocollect: true,
  dynamic: true,
  picker: '#transifexSelectorHidden',
  staging: process.env.IS_STAGING === 'true' || process.env.NODE_ENV !== 'production',
  ignore_class: ['svg-inline--fa'],
});

export default () => (
  <Fragment>
    <script
      type="text/javascript"
      dangerouslySetInnerHTML={{
        __html: `window.liveSettings = ${JSON.stringify(transifexConfig())}`,
      }}
    />
    <script type="text/javascript" src="//cdn.transifex.com/live.js" />
  </Fragment>
);
