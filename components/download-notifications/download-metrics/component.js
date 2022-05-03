// @ts-nocheck
import React from 'react';
import T from 'components/transifex/translate';

import './style.scss';

const Messages = () => {

  const renderCard = () => {
    return (
      <div className="message-box">
        <div className="d-flex justify-content-between">
          <div className="project">Total downloads</div>
        </div>
        <div className="mrg-top-2">78</div>
        <div className="mrg-top-2">
        5 from last week
        </div>
      </div>
    );
  };

  return (
    <div className="c-download-metrics mt-5">
      <div className="heading d-flex justify-content-between">
        <div>Download metrics</div>
        <div className="see-all">
          See all metrics
          <img alt="" src="static/ic_arrow_forward_24px.png" />
        </div>
      </div>
      <div className="d-flex messages justify-content-between">
        {renderCard()}
        {renderCard()}
        {renderCard()}
        {renderCard()}
      </div>
    </div>
  );
};
  

export default Messages;
