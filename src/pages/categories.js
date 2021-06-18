import React from 'react';
import { graphql, Link } from 'gatsby';
import Layout from '../templates/layout';
import { formatCategorySlug } from '../util';
import _ from 'lodash';
import { Helmet } from 'react-helmet';

const Categories = ({ data }) => {
  return (
    <Layout>
      <Helmet>
        <title>Things We Make - Categories</title>
      </Helmet>
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
