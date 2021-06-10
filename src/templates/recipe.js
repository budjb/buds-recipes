import React from 'react';
import { graphql } from 'gatsby';
import ImageGallery from 'react-image-gallery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faClock, faLightbulb, faTag, faUser } from '@fortawesome/free-solid-svg-icons';
import FancyHR from '../components/FancyHR';
import Layout from '../templates/Layout';
import marked from 'marked';
import DOMPurify from 'dompurify';

import 'react-image-gallery/styles/css/image-gallery.css';
import '../scss/recipe.scss';

const Markdown = ({ children, renderAs = 'div' }) => {
  const RenderAs = renderAs;
  return <RenderAs dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked(children)) }} />;
};

const StatsItem = ({ children, icon }) => {
  return (
    <div className="stats-item">
      {icon && <FontAwesomeIcon fixedWidth icon={icon} />}
      {children}
    </div>
  );
};

const StatsBar = ({ children }) => {
  return <div className="stats-bar">{children}</div>;
};

const IngredientSection = ({ ingredients, name }) => {
  const nameContent = name && <strong>{name}</strong>;
  const ingredientContent = ingredients.map(text => <li>{text}</li>);

  return (
    <>
      {nameContent}
      <ul>{ingredientContent}</ul>
    </>
  );
};

const InstructionsSection = ({ instructions, name }) => {
  const nameContent = name && <strong>{name}</strong>;
  const instructionContent = instructions.map(text => <Markdown renderAs="li">{text}</Markdown>);

  return (
    <>
      {nameContent}
      <ol>{instructionContent}</ol>
    </>
  );
};

/**
 * Renders a recipe as retrieved by GraphQL.
 *
 * @param data
 * @returns {JSX.Element}
 * @constructor
 */
const Recipe = ({ data }) => {
  const recipe = data.recipe;

  const imagesConfig = recipe.imageFiles.map(img => {
    return {
      original: img.fullSize.gatsbyImageData.images.fallback.src,
    };
  });

  return (
    <Layout className="recipe">
      {imagesConfig.length && (
        <ImageGallery
          items={imagesConfig}
          showBullets={true}
          showIndex={false}
          showThumbnails={false}
          lazyLoad={true}
          showPlayButton={false}
          showFullscreenButton={false}
        />
      )}
      <StatsBar>
        <StatsItem icon={faUser}>{recipe.author}</StatsItem>
        <StatsItem icon={faClock}>{recipe.totalTime}</StatsItem>
        <StatsItem icon={faChartPie}>{recipe.servings}</StatsItem>
        <StatsItem icon={faTag}>{recipe.cuisine}</StatsItem>
      </StatsBar>

      <FancyHR />

      <title>{recipe.name}</title>

      {recipe.description && (
        <div className="description">
          <Markdown>{recipe.description}</Markdown>
        </div>
      )}

      <div className="content-parent">
        <div className="ingredients-wrapper">
          <div className="ingredients">
            <h1>Ingredients</h1>
            {recipe.ingredientSections.map(section => {
              return <IngredientSection name={section.name} ingredients={section.ingredients} />;
            })}
          </div>
        </div>

        <div className="instructions">
          <h1>Instructions</h1>
          {recipe.instructionSections.map(section => {
            return <InstructionsSection name={section.name} instructions={section.instructions} />;
          })}
        </div>
      </div>

      {recipe.tips && (
        <div className="tips">
          <h1>
            Tips <FontAwesomeIcon icon={faLightbulb} />
          </h1>
          <Markdown>{recipe.tips}</Markdown>
        </div>
      )}
    </Layout>
  );
};

export default Recipe;

export const pageQuery = graphql`
  query RecipeById($id: String!) {
    recipe(id: { eq: $id }) {
      author
      cuisine
      description
      published
      ingredientSections {
        name
        ingredients
      }
      instructionSections {
        name
        instructions
      }
      tips
      name
      servings
      totalTime
      imageFiles {
        fullSize: childImageSharp {
          gatsbyImageData(layout: CONSTRAINED, width: 1280, height: 720, sizes: "768,1280")
        }
      }
    }
  }
`;
