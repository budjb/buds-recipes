import * as React from 'react';
import { graphql, Link } from 'gatsby';
import Layout from '../templates/layout';
import { GatsbyImage } from 'gatsby-plugin-image';

const NotFoundPage = ({ data }) => {
  return (
    <Layout title="Not Found">
      <div className="container my-5">
        <div className="row align-items-center justify-content-center my-5 pe-lg-5">
          <div className="col-lg-6 p-3 d-flex justify-content-center">
            <GatsbyImage alt="Not Found" image={data.allFile.nodes[0].childImageSharp.gatsbyImageData} />
          </div>
          <div className="col-lg-6 p-3 text-right">
            <h1 className="display-1">404</h1>
            <h2 className="display-5">UH OH! You're lost.</h2>
            <p>
              The page you're looking for doesn't exist! I'm not quite sure how you got here. Maybe something moved?
              Either way, click the button below to get back to the home page.
            </p>
            <Link to="/" className="btn btn-primary px-4">
              Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;

export const pageQuery = graphql`
  query NotFoundQuery {
    allFile(filter: { relativePath: { eq: "confused.png" } }) {
      nodes {
        childImageSharp {
          gatsbyImageData(layout: CONSTRAINED, height: 300)
        }
      }
    }
  }
`;
