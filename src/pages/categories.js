import React from 'react';
import { graphql, Link } from 'gatsby';
import Layout from '../templates/layout';
import { formatCategorySlug } from '../util';
import _ from 'lodash';

const Categories = ({ data }) => {
  return (
    <Layout title="Categories">
      <ul>
        {_.sortBy(data.categories.group, o => o.slug).map(({ fieldValue: slug, totalCount: total }) => {
          return (
            <li key={slug}>
              <Link to={`/categories/${slug}`}>
                {formatCategorySlug(slug)} ({total})
              </Link>
            </li>
          );
        })}
      </ul>
    </Layout>
  );
};

export default Categories;

export const pageQuery = graphql`
  query CategoriesPageQuery {
    categories: allRecipe {
      group(field: categories) {
        fieldValue
        totalCount
      }
    }
  }
`;
