import React from 'react';
import { graphql, Link } from 'gatsby';
import Layout from '../templates/layout';
import { formatCategorySlug } from '../util';
import _ from 'lodash';

const Categories = ({ data }) => {
  const groupCategories = categories => {
    const groups = {};

    categories.forEach(category => {
      const first = category.fieldValue.charAt(0);

      if (!groups.hasOwnProperty(first)) {
        groups[first] = [];
      }

      groups[first].push(category);
    });

    return groups;
  };

  return (
    <Layout title="Categories">
      <h1>Categories</h1>
      {Object.entries(groupCategories(data.categories.group)).map(([letter, categories]) => (
        <div key={letter} className="category-group my-5">
          <h1 className="display-5">{_.upperCase(letter)}</h1>
          <hr />
          <ul>
            {_.sortBy(categories, it => it.fieldValue).map(it => (
              <li key={it.fieldValue}>
                <Link to={`/categories/${it.fieldValue}`}>{formatCategorySlug(it.fieldValue)}</Link>{' '}
                <span className="badge rounded-pill bg-secondary">{it.totalCount}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
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
