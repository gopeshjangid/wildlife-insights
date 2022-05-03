import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import './style.scss';

const Steper = ({ stepList, activeStep }) => {
  return (
    <div className="step-container">
      <div className="step-number-wrapper">
        <ul className="stepper stepper-horizontal">
          {stepList?.map((step, index) => {
            return (
              <li key={'stepper-' + index} className="completed">
                <span
                  className={
                    activeStep === index + 1
                      ? 'circle active'
                      : `circle ${index + 1 < activeStep ? 'checked-step' : ''}`
                  }
                >
                  {index + 1 < activeStep ? (
                    <FontAwesomeIcon size="sm" icon={faCheck} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={
                    activeStep === index + 1 ? 'label activeLabel' : 'label'
                  }
                >
                  {step?.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Steper;
