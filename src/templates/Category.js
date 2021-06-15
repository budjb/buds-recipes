import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../templates/Layout';
import '../scss/category.scss';
import { formatCategorySlug } from '../util';
import RecipeCardSection from '../components/RecipeCardSection';
import { Helmet } from 'react-helmet';

const CategoryPage = ({ data, pageContext }) => {
  return (
    <Layout className="category">
      <Helmet>
        <title>Things We Make - {formatCategorySlug(pageContext.slug)}</title>
      </Helmet>
      <h1>Category: {formatCategorySlug(pageContext.slug)}</h1>
      <RecipeCardSection>
        {data.allRecipe.nodes.map(recipe => {
          return (
            <RecipeCardSection.RecipeCard
              key={recipe.id}
              path={recipe.path}
              name={recipe.name}
              photo={recipe.imageFiles[0].childImageSharp.gatsbyImageData}
              preview={recipe.preview}
            />
          );
        })}
      </RecipeCardSection>
    </Layout>
  );
};

export default CategoryPage;

export const pageQuery = graphql`
  query RecipesByCategorySlug($slug: String!) {
    allRecipe(filter: { categories: { eq: $slug } }) {
      nodes {
        id
        name
        path
        preview
        imageFiles {
          childImageSharp {
            gatsbyImageData(layout: CONSTRAINED, width: 768, aspectRatio: 1.5)
          }
        }
      }
    }
  }
`;
