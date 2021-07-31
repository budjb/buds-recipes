import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../templates/layout';
import { formatCategorySlug } from '../util';
import { Helmet } from 'react-helmet';
import { RecipeCard } from '../components/recipe-card';

const CategoryPage = ({ data, pageContext }) => {
  const title = formatCategorySlug(pageContext.slug);

  return (
    <Layout className="category" title={title}>
      <Helmet>
        <title>Things We Make - {}</title>
      </Helmet>

      <h1 className="display-5 mb-5">Category: {title}</h1>

      <div className="container p-0">
        <div className="row row-cols-1 row-cols-lg-4 align-items-stretch g-4 position-relative">
          {data.allRecipe.nodes.map(recipe => {
            return (
              <RecipeCard
                key={recipe.id}
                path={recipe.path}
                title={recipe.title}
                photo={recipe.imageFiles[0].childImageSharp.gatsbyImageData}
                subTitle={recipe.subTitle}
              />
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;

export const pageQuery = graphql`
  query RecipesByCategorySlug($slug: String!) {
    allRecipe(filter: { categories: { eq: $slug } }) {
      nodes {
        id
        title
        path
        subTitle
        imageFiles {
          childImageSharp {
            gatsbyImageData(placeholder: BLURRED, layout: CONSTRAINED, sizes: "275,700", aspectRatio: 1.5)
          }
        }
      }
    }
  }
`;
