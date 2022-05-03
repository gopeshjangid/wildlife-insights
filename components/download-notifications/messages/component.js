// @ts-nocheck
import React, { useState, Fragment } from 'react';
import { map } from 'lodash';
import { Carousel } from 'react-responsive-carousel';
import { Query } from 'react-apollo';
import classnames from 'classnames';
import { formatDate, copyToClipboard, arrayToChunk, getGraphQLErrorMessage } from 'utils/functions';
import LoadingSpinner from 'components/loading-spinner';

import getMessageQuery from './messages.graphql';
import './style.scss';

const Messages = () => {
  const [state, setState] = useState({
    selectedItem: 0,
    pageNumber: 1,
    totalPages: 0,
    messageData: [],
    prevLoading: false,
    nextLoading: false,
  });
  
  const { selectedItem, pageNumber } = state;
  const pageSize = 50;
  
  const onNextPageClick = () => {
    setState({
      ...state,
      pageNumber: pageNumber + 1,
      selectedItem: 0,
    });
  };

  const onPrevPageClick = () => {
    setState({
      ...state,
      pageNumber: pageNumber - 1,
      prevLoading: true,
      selectedItem: 100,
    });
  };

  const onNextClick = () => {
    setState({
      ...state,
      selectedItem: selectedItem + 1,
    });
  };

  const onPrevClick = () => {
    setState({
      ...state,
      selectedItem: selectedItem - 1,
    });
  };

  const renderMessage = (obj, key) => (
    <div className="message-box" key={key}>
      <div className="d-flex justify-content-between">
        <div className="subject">{obj.emailSubject}</div>
        <div>
          <img alt="" src="static/ic_close_24px.png" />
        </div>
      </div>
      <div className="mt-6">
        <div className="email">{obj?.participant?.email}</div>
        <div className="text-left">
          <button
            type="button"
            className="copy-content"
            onClick={() => {
              copyToClipboard(obj?.participant?.email);
            }}
          >
            <img className="copy-img" alt="" src="static/ic_content_copy_grey_24px.png" />
          </button>
        </div>
      </div>
      <div className="text-left">{obj?.requestedTimestamp ? formatDate(new Date(obj.requestedTimestamp), 'MMM dd, yyyy') : null}</div>
      <div className="mt-6 text-justify">
        {obj.emailMessage}
      </div>
    </div>
  );

  const renderData = data => map(data, (row, index) => (
    <div className="d-flex messages justify-content-between" key={`msg-holder-${index}`}>
      {
        map(row, (r, ind) => (
          <Fragment key={`msg-${ind}`}>
            {renderMessage(r, `msg-${index}-${ind}`)}
          </Fragment>
        ))
      }
    </div>
  ));

  const setSelectedItem = (pTotalSlides) => {
    if (state.prevLoading) {
      setState({
        ...state,
        prevLoading: false,
        selectedItem: pTotalSlides,
      });
    }
  };

  const renderLoading = () => (
    <div className="message-box empty">
      <LoadingSpinner inline />
    </div>
  );

  return (
    <div className="c-download-messages mt-5">
      <Query
        query={getMessageQuery}
        variables={{
          pageSize,
          pageNumber,
        }}
      >
        {({ error, loading, data }) => {
          const getMessages = data?.getMessages || {};
          const totalItems = getMessages?.meta?.totalItems || 0;
          const elKey = new Date();
          if (loading && !getMessages?.data) {
            return (
              <Fragment key={elKey}>
                <div className="heading">{totalItems} messages</div>
                {renderLoading()}
              </Fragment>
            );
          }
          if (error) {
            return (
              <Fragment key={elKey}>
                <div className="heading">{totalItems} messages</div>
                <div className="message-box empty error">
                  {getGraphQLErrorMessage(error)}
                </div>
              </Fragment>
            );
          }
          const totalRecords = getMessages?.data?.length || 0;
          const totalPages = getMessages?.meta?.totalPages || 0;
          const totalSlides = (totalRecords / 2) - 1;
          const chunkData = arrayToChunk(getMessages?.data, 2);
          const hasNext = selectedItem < totalSlides;
          const hasPrev = selectedItem > 0;

          const hasNextPage = pageNumber < totalPages;
          const hasPrevPage = pageNumber > 1;
          const handleNext = () => {
            if (hasNext) {
              onNextClick();
            } else if (hasNextPage) {
              onNextPageClick();
            }
          };

          const handlePrev = () => {
            if (hasPrev) {
              onPrevClick();
            } else if (hasPrevPage) {
              onPrevPageClick();
            }
          };
          if (!loading) {
            setSelectedItem(totalSlides);
          }
          return (
            <Fragment key={elKey}>
              <div className="heading">{totalItems} messages</div>
              <button type="button" className={classnames('right-arrow btn-raw', { 'invisible cursor-default': loading || (!hasNext && !hasNextPage) })} onClick={handleNext}>
                <img alt="" src="static/ic_arrow_forward_ios_24px.png" className="" />
              </button>
              <button type="button" className={classnames('left-arrow btn-raw', { 'invisible cursor-default': loading || (!hasPrev && !hasPrevPage) })} onClick={handlePrev}>
                <img alt="" src="static/ic_arrow_backward_ios_24px.png" className="" />
              </button>
              {loading && renderLoading()}
              {!loading
                && (
                <Carousel
                  showArrows={false}
                  showThumbs={false}
                  showStatus={false}
                  selectedItem={selectedItem}
                >
                  {renderData(chunkData)}
                </Carousel>
                )}
              {chunkData.length === 0
                && (
                  <div className="message-box empty">
                    No Data found
                  </div>
                )
              }
            </Fragment>);
        }}
      </Query>
    </div>
  );
};

export default Messages;
