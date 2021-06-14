import React from 'react';
import {Link} from 'gatsby';
import {GatsbyImage} from 'gatsby-plugin-image';

const RecipeCard = ({path, name, photo, preview}) => {
  return (
      <Link to={`/${path}`} className="recipe-card">
        <GatsbyImage alt={name} image={photo}/>
        <div className="details">
          <h3>{name}</h3>
          <p>{preview}</p>
        </div>
      </Link>
  );
};
const RecipeCardSection = ({children, className = ""}) => {
  return (
      <div className={`recipe-card-section ${className}`}>
        {children}
      </div>
  );
}

export default Object.assign(RecipeCardSection, {
  RecipeCard
});
