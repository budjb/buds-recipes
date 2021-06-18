import React from 'react';
import Layout from '../templates/layout';
import { graphql } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import { Helmet } from 'react-helmet';
import { RecipeCard } from '../components/recipe-card';

const IndexPage = ({ data }) => {
  const latest = data.latest.nodes;

  return (
    <Layout className="index">
      <Helmet>
        <title>Things We Make - Home</title>
      </Helmet>

      <div className="container shadow-lg border-b">
        <div className="row flex-lg-row-reverse align-items-center justify-content-center my-5 ps-lg-5">
          <div className="col-lg-6 rounded-3 overflow-hidden p-3">
            <GatsbyImage alt="Things We Make" image={data.cover.nodes[0].childImageSharp.gatsbyImageData} />
          </div>
          <div className="col-lg-6 p-3">
            <h1 className="display-3 fw-bold lh-1 mb-3">Things We Make</h1>
            <p className="fs-2">
              Welcome to our collection of recipes for things we love to make in our home. From us to you, enjoy!
            </p>
          </div>
        </div>
      </div>

      <div className="container p-0">
        <div className="row row-cols-1 row-cols-lg-4 align-items-stretch g-4 position-relative">
          {latest.map(recipe => (
            <RecipeCard
              key={recipe.id}
              name={recipe.name}
              path={recipe.path}
              preview={recipe.preview}
              photo={recipe.imageFiles[0].childImageSharp.gatsbyImageData}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;

export const pageQuery = graphql`
  query LatestRecipes {
    cover: allFile(filter: { sourceInstanceName: { eq: "images" }, relativePath: { eq: "cover.jpg" } }) {
      nodes {
        childImageSharp {
          gatsbyImageData(layout: CONSTRAINED, width: 800)
        }
      }
    }
    latest: allRecipe(limit: 5, sort: { fields: published, order: DESC }) {
      nodes {
        id
        path
        name
        preview
        imageFiles {
          childImageSharp {
            gatsbyImageData(placeholder: BLURRED, layout: CONSTRAINED, width: 1280, aspectRatio: 1.25)
          }
        }
      }
    }
    localSearchRecipes {
      index
      store
    }
  }
`;
