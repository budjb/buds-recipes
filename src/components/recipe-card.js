import React from 'react';
import { Link } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import '../scss/recipe-card.scss';

export const RecipeCard = ({ path, title, photo, subTitle }) => {
  return (
    <div className="col">
      <Link to={`/${path}`} className="recipe-card card shadow border-0 h-100">
        <GatsbyImage alt={title} image={photo} className="card-img-top" />
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <p className="card-text">{subTitle}</p>
        </div>
      </Link>
    </div>
  );
};
