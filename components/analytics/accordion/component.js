import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import './style.scss';

const Accordion = props => {
  const [activeItem, setItem] = useState('');
  return (
    <div className="accordion-container">
      {props?.list?.map((item, key) => {
        return (
          <div className="accordion-item">
            <div className="accordion-heading">
              <span className="accordion-title">{item?.title}</span>
              <i
                className="accordion-btn"
                onClick={() => setItem(activeItem === key ? '' : key)}
              >
                <FontAwesomeIcon
                  size="sm"
                  icon={activeItem === key ? faChevronDown : faChevronRight}
                />
              </i>
            </div>
            <div
              className={`accordion-content ${activeItem === key ? 'active-item' : ''
                }`}
            >
              <p>{item?.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
