import React, { Children } from 'react';
import _ from 'lodash';

import '../scss/image-gallery.scss';

export const ImageGallery = ({ children, id = 'gatsby-carousel', firstSlide = 0 }) => {
  const numChildren = Children.count(children);

  if (numChildren === 0) {
    return null;
  } else if (numChildren === 1) {
    return children;
  }

  const idTarget = `#${id}`;
  firstSlide = _.clamp(firstSlide, 0, numChildren - 1);

  return (
    <div id={id} className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-indicators">
        {_.times(numChildren, i => {
          const isActive = i === firstSlide;

          const props = {
            key: i,
            type: 'button',
            'data-bs-target': idTarget,
            'data-bs-slide-to': i,
            'aria-label': `Photo ${i + 1}`,
          };

          if (isActive) {
            Object.assign(props, {
              className: 'active',
              'aria-current': 'true',
            });
          }

          return <button {...props} />;
        })}
      </div>

      <div className="carousel-inner">
        {Children.map(children, (slide, i) => {
          const isActive = i === firstSlide;

          let className = 'carousel-item';
          if (isActive) {
            className += ' active';
          }

          return (
            <div key={i} className={className}>
              {slide}
            </div>
          );
        })}
      </div>
      <button className="carousel-control-prev" type="button" data-bs-target={idTarget} data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Previous</span>
      </button>
      <button className="carousel-control-next" type="button" data-bs-target={idTarget} data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};
