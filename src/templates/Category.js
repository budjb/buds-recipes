import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../templates/Layout';
import '../scss/category.scss';
import _ from 'lodash';
import RecipeCardSection from '../components/RecipeCardSection';

const categoryName = slug => _.startCase(_.camelCase(slug));

const CategoryPage = ({ data, pageContext }) => {
  return (
    <Layout className="category">
      <h1>Category: {categoryName(pageContext.slug)}</h1>
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
