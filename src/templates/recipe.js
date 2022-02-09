import React from 'react';
import { graphql } from 'gatsby';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faClock, faLightbulb, faShareAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import Layout from '../templates/layout';
import { marked } from 'marked';
import { ImageGallery } from '../components/image-gallery';
import {
  FacebookIcon,
  FacebookShareButton,
  PinterestIcon,
  PinterestShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share';
import '../scss/recipe.scss';
import { GatsbyImage } from 'gatsby-plugin-image';

const sanitizeHtml = require('sanitize-html');

const SharePanel = ({ url, title, subTitle, image }) => {
  const isBrowser = typeof navigator !== 'undefined';
  const longTitle = subTitle ? `${title} - ${subTitle}` : title;

  if (isBrowser && navigator.share) {
    return (
      <div className="d-flex flex-row align-items-center py-2">
        <button
          id="shareButton"
          className="btn border-0 p-0 shadow-none"
          onClick={() =>
            navigator.share({
              url: url,
              title: title,
              text: longTitle,
            })
          }
        >
          <FontAwesomeIcon icon={faShareAlt} fixedWidth className="text-muted me-2" /> Share...
        </button>
      </div>
    );
  } else {
    return (
      <div className="py-2 py-md-0">
        <FacebookShareButton url={url} quote={longTitle}>
          <FacebookIcon size={32} />
        </FacebookShareButton>

        <PinterestShareButton url={url} media={image} description={longTitle}>
          <PinterestIcon size={32} />
        </PinterestShareButton>

        <TwitterShareButton url={url} title={longTitle}>
          <TwitterIcon size={32} />
        </TwitterShareButton>
      </div>
    );
  }
};

const Markdown = ({ children, renderAs = 'div' }) => {
  const RenderAs = renderAs;
  return <RenderAs dangerouslySetInnerHTML={{ __html: sanitizeHtml(marked(children)) }} />;
};

const StatsItem = ({ children, icon }) => {
  return (
    <div className="py-2">
      {icon && <FontAwesomeIcon fixedWidth icon={icon} className="text-muted me-2" />}
      {children}
    </div>
  );
};

const StatsBar = ({ children }) => {
  return (
    <div className="d-block d-md-flex flex-row align-items-center justify-content-between my-2 py-2 py-md-3">
      {children}
    </div>
  );
};

const IngredientSection = ({ ingredients, title }) => {
  const titleContent = title && <strong>{title}</strong>;
  const ingredientContent = ingredients.map((text, i) => (
    <Markdown renderAs="li" className="py-2" key={i}>
      {text}
    </Markdown>
  ));

  return (
    <>
      {titleContent}
      <ul>{ingredientContent}</ul>
    </>
  );
};

const InstructionsSection = ({ instructions, title }) => {
  const titleContent = title && <strong>{title}</strong>;
  const instructionContent = instructions.map((text, i) => (
    <Markdown renderAs="li" key={i}>
      {text}
    </Markdown>
  ));

  return (
    <>
      {titleContent}
      <ol>{instructionContent}</ol>
    </>
  );
};

/**
 * Renders a recipe as retrieved by GraphQL.
 */
const Recipe = ({ location, data }) => {
  const recipe = data.recipe;
  const siteUrl = data.site.siteMetadata.siteUrl;

  return (
    <Layout className="recipe d-flex justify-content-center" title={recipe.title}>
      <div className="col-12 col-lg-10">
        <ImageGallery>
          {recipe.imageFiles.map(({ fullSize: { gatsbyImageData: image } }, i) => (
            <GatsbyImage key={i} alt={recipe.title} image={image} />
          ))}
        </ImageGallery>
        <StatsBar>
          <StatsItem icon={faUser}>{recipe.author}</StatsItem>
          <StatsItem icon={faClock}>{recipe.totalTime}</StatsItem>
          <StatsItem icon={faChartPie}>{recipe.servings}</StatsItem>

          <div className="share-links">
            <SharePanel
              title={recipe.title}
              url={location.href}
              subTitle={recipe.subTitle}
              image={siteUrl + recipe.imageFiles[0].fullSize.gatsbyImageData.images.fallback.src}
            />
          </div>
        </StatsBar>

        <h1 className="my-3 display-4">{recipe.title}</h1>
        <h3>{recipe.subTitle}</h3>

        {recipe.description && (
          <div className="my-5">
            <Markdown>{recipe.description}</Markdown>
          </div>
        )}

        <div className="container p-0 my-5">
          <div className="row m-0 g-5">
            <div className="col-lg-4 m-0 p-0">
              <div className="ingredients bg-light-site p-3">
                <h1>Ingredients</h1>
                {recipe.ingredientSections.map((section, i) => {
                  return <IngredientSection key={i} title={section.title} ingredients={section.ingredients} />;
                })}
              </div>
            </div>

            <div className="col m-0 instructions">
              <h1 className="py-3 m-0">Instructions</h1>
              {recipe.instructionSections.map((section, i) => (
                <div className="instruction-set" key={i}>
                  <InstructionsSection title={section.title} instructions={section.instructions} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {recipe.tips && (
          <div className="p-3 bg-light-site tips">
            <h1 className="mb-3">
              Tips <FontAwesomeIcon icon={faLightbulb} className="text-muted" />
            </h1>
            <Markdown>{recipe.tips}</Markdown>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Recipe;

export const pageQuery = graphql`
  query RecipeById($id: String!) {
    site {
      siteMetadata {
        siteUrl
      }
    }
    recipe(id: { eq: $id }) {
      author
      cuisine
      description
      published
      ingredientSections {
        title
        ingredients
      }
      instructionSections {
        title
        instructions
      }
      tips
      subTitle
      title
      servings
      totalTime
      imageFiles {
        fullSize: childImageSharp {
          gatsbyImageData(placeholder: BLURRED, layout: CONSTRAINED, width: 1280, aspectRatio: 1.5, sizes: "768,1280")
        }
      }
    }
  }
`;
