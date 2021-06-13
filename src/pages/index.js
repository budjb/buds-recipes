import React from 'react';
import Layout from '../templates/Layout';
import '../scss/index.scss';
import { graphql, Link } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';

const RecipeCard = ({ recipe, className = '' }) => {
  return (
    <Link to={recipe.slug} className={`recipe-card cover-photo ${className}`}>
      <GatsbyImage alt={recipe.name} image={recipe.imageFiles[0].childImageSharp.gatsbyImageData} />
      <div className="details">
        <p>{recipe.name}</p>
      </div>
    </Link>
  );
};

const IndexPage = ({ data }) => {
  const featured = data.featured.nodes[0];
  const latest = data.latest.nodes.filter(page => page.id !== featured.id);

  return (
    <Layout className="index">
      <div className="lead">
        <div className="cover-text">
          <title>Things We Make</title>
          <p>Welcome to our collection of recipes for things we love to make in our home. From us to you, enjoy!</p>
        </div>
        <RecipeCard recipe={featured} className={'cover-photo'} />
      </div>

      <div className="newest-recipes">
        {latest.map(recipe => {
          return <RecipeCard recipe={recipe} key={recipe.id}/>;
        })}
      </div>
    </Layout>
  );
};

export default IndexPage;

export const pageQuery = graphql`
  query LatestRecipes {
    featured: allRecipe(filter: { featured: { eq: true } }, limit: 1, sort: { fields: published, order: DESC }) {
      nodes {
        id
        slug
        name
        imageFiles {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED, width: 1280, aspectRatio: 1)
          }
        }
      }
    }
    latest: allRecipe(limit: 5, sort: { fields: published, order: DESC }) {
      nodes {
        id
        slug
        name
        imageFiles {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED, width: 1280, aspectRatio: 1)
          }
        }
      }
    }
  }
`;
