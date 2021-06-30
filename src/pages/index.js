import React from 'react';
import Layout from '../templates/layout';
import { graphql } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';
import { RecipeCard } from '../components/recipe-card';

const IndexPage = ({ data }) => {
  const latest = data.latest.nodes;

  return (
    <Layout className="index" title="Home">
      <div className="container shadow-lg border-b">
        <div className="row flex-lg-row-reverse align-items-center justify-content-center mb-4 mb-lg-5 ps-lg-5">
          <div className="col-lg-6 border-0 overflow-hidden p-3 position-relative">
            <GatsbyImage
              className="rounded-3"
              alt="Things We Make"
              image={data.cover.childImageSharp.gatsbyImageData}
            />
            <div
              className="position-absolute h-100 w-100 top-0 start-0 d-flex align-items-center justify-content-center"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
              }}
            >
              <GatsbyImage
                alt="Things We Make"
                image={data.logo.childImageSharp.gatsbyImageData}
                objectFit='contain'
                className="h-75"
              />
            </div>
          </div>
          <div className="col-lg-6 p-5">
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
    logo: file(sourceInstanceName: { eq: "images" }, relativePath: { eq: "logo-black.png" }) {
      childImageSharp {
        gatsbyImageData(layout: CONSTRAINED, sizes: "400,675")
      }
    }
    cover: file(sourceInstanceName: { eq: "images" }, relativePath: { eq: "cover.jpg" }) {
      childImageSharp {
        gatsbyImageData(layout: CONSTRAINED, sizes: "400,675", aspectRatio: 1.5)
      }
    }
    latest: allRecipe(limit: 4, sort: { fields: published, order: DESC }) {
      nodes {
        id
        path
        name
        preview
        imageFiles {
          childImageSharp {
            gatsbyImageData(placeholder: BLURRED, layout: CONSTRAINED, sizes: "275,700", aspectRatio: 1.5)
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
