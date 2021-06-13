import React from 'react';
import Layout from '../templates/Layout';
import '../scss/index.scss';
import {graphql, Link} from 'gatsby';
import {GatsbyImage} from 'gatsby-plugin-image';

const IndexPage = ({data}) => {
  console.log(data);
  return (
      <Layout className="index">
        <div className="lead">
          <div className="cover-text">
            <title>Things We Make</title>
            <p>
              Welcome to our collection of recipes for things we love to make in our home.
              From us to you, enjoy!
            </p>
          </div>
          <div className="cover-photo">
            <GatsbyImage image={data.coverPhoto.childImageSharp.gatsbyImageData}/>
          </div>
        </div>
        <div className="newest-recipes">
          {data.allRecipe.nodes.map(recipe => {
            return (
                <Link to={recipe.slug} className="recipe-card">
                  <GatsbyImage alt="foo" image={recipe.imageFiles[0].childImageSharp.gatsbyImageData}/>
                  <div className="details"><p>{recipe.name}</p></div>
                </Link>
            );
          })}
          {data.allRecipe.nodes.map(recipe => {
            return (
                <Link to={recipe.slug} className="recipe-card">
                  <GatsbyImage alt="foo" image={recipe.imageFiles[0].childImageSharp.gatsbyImageData}/>
                  <div className="details"><p>{recipe.name}</p></div>
                </Link>
            );
          })}
        </div>
      </Layout>
  );
};

export default IndexPage

export const pageQuery = graphql`
  query LatestRecipes {
    allRecipe(limit: 4, sort: {fields: published, order: DESC}) {
      nodes {
        slug
        name
        imageFiles {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED, width: 1280, aspectRatio: 1)
          }
        }
      }
    }
    coverPhoto:file(relativePath: {eq: "cover.jpg"}) {
      childImageSharp {
        gatsbyImageData(layout: CONSTRAINED, width: 1280, aspectRatio: 1)
      }
    }
  }
`;
