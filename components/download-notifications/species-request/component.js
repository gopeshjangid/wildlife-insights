// @ts-nocheck
import React, { useState, Fragment } from 'react';
import { Carousel } from 'react-responsive-carousel';
import { map } from 'lodash';
import classnames from 'classnames';
import { useQuery, useMutation } from 'react-apollo-hooks';
import T from 'components/transifex/translate';
import LoadingSpinner from 'components/loading-spinner';
import ConfirmModal from 'components/modal/confirm';
import { formatDate, arrayToChunk, getGraphQLErrorMessage } from 'utils/functions';

import './style.scss';
import getSensitiveSpeciesRequestQuery from './sensitive-species-request.graphql';
import updateSensitiveSpeciesAccessNotification from './update-sensitive-speciesAccess-notification.graphql';

const Messages = ({ permissions }) => {
  const [state, setState] = useState({
    selectedItem: 0,
    pageNumber: 1,
    totalPages: 0,
    data: [],
    prevLoading: false,
    nextLoading: false,
    showModalConfirm: false,
    confirmHeaderLabel: 'Confirm',
    confirmId: 0,
    confirmReqType: '',
  });

  const [
    mutate,
    { loading: mutationLoading, error: mutationError },
  ] = useMutation(updateSensitiveSpeciesAccessNotification, {
    refetchQueries: (resp) => {
      return resp.errors ? [] : ['getSensitiveSpeciesAprrovalRequest'];
    },
  });
  
  const { selectedItem, pageNumber, showModalConfirm, confirmHeaderLabel, confirmationText, confirmId, confirmReqType } = state;
  const pageSize = 50;

  const { data, error, loading } = useQuery(getSensitiveSpeciesRequestQuery, {
    variables: {
      pageSize,
      pageNumber,
    },
  });

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

  const setShowConfirmModel = (flag, reqType = '', id = 0) => {
    setState({
      ...state,
      showModalConfirm: flag,
      confirmHeaderLabel: `${reqType === 'APPROVED' ? 'Approve' : 'Deny'} sensitive species requests`,
      confirmationText: `Are you sure you want to ${reqType === 'APPROVED' ? 'approve' : 'deny'}`,
      confirmReqType: reqType,
      confirmId: id,
    });
  };

  const updateRequest = () => {
    if (showModalConfirm) {
      setState({
        ...state,
        showModalConfirm: false
      })
    }
    mutate({ variables: { accessNotificationId: confirmId, status: confirmReqType } });
  };

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

  const renderCard = (obj, key) => {
    const isProjectViewer = permissions?.projects[obj.projectId].role === 'PROJECT_VIEWER';
    return (
      <div className={classnames('message-box', { 'disable-cards': mutationLoading })} key={key}>
        <div className="d-flex">
          <div className="project">{obj.project.shortName}</div>
        </div>
        <div className="date">
          {obj?.requestedTimestamp ? formatDate(new Date(obj.requestedTimestamp), 'MMM dd, yyyy') : null}
        </div>
        <div className="mrg-top-2">{obj.participant.email}</div>
        <div className="mrg-top-2">
          {obj.requestApprovalMessage}
        </div>
        {!isProjectViewer && obj.status === 'APPROVAL_REQUESTED'
        && (
          <div className="action-panel">
            <button
              type="button"
              className="btn btn-approve"
              disabled={obj.status === 'APPROVED'}
              onClick={() => setShowConfirmModel(true, 'APPROVED', obj.id)}
            >
              <T text="Approve" />
            </button>
            <button
              type="button"
              className="btn btn-deny"
              disabled={obj.status === 'DENIED'}
              onClick={() => setShowConfirmModel(true, 'DENIED', obj.id)}
            >
              <T text="Deny" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderData = obj => map(obj, (row, index) => (
    <div className="d-flex messages" key={`msg-holder-${index}`}>
      {
        map(row, (r, ind) => (
          <Fragment key={`msg-${ind}`}>
            {renderCard(r, `msg-${index}-${ind}`)}
          </Fragment>
        ))
      }
    </div>
  ));

  const getSensitiveSpeciesRequest = data?.getSensitiveSpeciesAprrovalRequest || [];
  const totalItems = getSensitiveSpeciesRequest?.meta?.totalItems || 0;
  
  const totalRecords = getSensitiveSpeciesRequest?.sensitiveSpeciesAccessNotificationData?.length || 0;
  const totalPages = getSensitiveSpeciesRequest?.meta?.totalPages || 0;
  const totalSlides = (totalRecords / 3) - 1;
  const chunkData = arrayToChunk(getSensitiveSpeciesRequest?.sensitiveSpeciesAccessNotificationData || [], 3);
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
    <div className="c-download-species-request mt-5">
      {showModalConfirm
        && (
          <ConfirmModal
            open={showModalConfirm}
            onClose={() => setShowConfirmModel(false)}
            headerLabel={confirmHeaderLabel}
            confirmationText={confirmationText}
            fnConfirm={updateRequest}
          />
        )
      }
      {
        loading
          && (
            <Fragment>
              <div className="heading">{totalItems} sensitive species requests</div>
              <div className="sub-heading">Approve or deny requests to download sensitive species locations.</div>
              {renderLoading()}
            </Fragment>
          )
        }
      {
        error
          && (
            <Fragment>
              <div className="heading">{totalItems} sensitive species requests</div>
              <div className="sub-heading">Approve or deny requests to download sensitive species locations.</div>
              <div className="message-box empty error">
                {getGraphQLErrorMessage(error)}
              </div>
            </Fragment>
          )
        }
      {!loading && !error
        && (
        <Fragment>
          <div className="heading">{totalItems} sensitive species requests</div>
          <div className="sub-heading">Approve or deny requests to download sensitive species locations.</div>
          {mutationError
            && (
              <div className="error">
                {getGraphQLErrorMessage(mutationError)}
              </div>
            )
          }
          <button type="button" className={classnames('right-arrow btn-raw', { 'invisible cursor-default': loading || (!hasNext && !hasNextPage) })} onClick={handleNext}>
            <img alt="" src="static/ic_arrow_forward_ios_24px.png" className="" />
          </button>
          <button type="button" className={classnames('left-arrow btn-raw', { 'invisible cursor-default': loading || (!hasPrev && !hasPrevPage) })} onClick={handlePrev}>
            <img alt="" src="static/ic_arrow_backward_ios_24px.png" className="" />
          </button>
          <Carousel
            showArrows={false}
            showThumbs={false}
            showStatus={false}
            selectedItem={selectedItem}
          >
            {renderData(chunkData)}
          </Carousel>
          {chunkData.length === 0
              && (
                <div className="message-box empty">
                  No Data found
                </div>
              )
            }
        </Fragment>
        )}
    </div>
  );
};

export default Messages;
