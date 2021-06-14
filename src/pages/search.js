import React, { useEffect, useState } from 'react';
import { graphql, navigate } from 'gatsby';
import { useFlexSearch } from 'react-use-flexsearch';
import Layout from '../templates/Layout';

const parseSearch = query => {
  return new URLSearchParams(query).get('q');
};

const SearchPage = ({ data, location }) => {
  const [query, setQuery] = useState(null);
  const results = useFlexSearch(query, data.localSearchRecipes.index, data.localSearchRecipes.store);

  useEffect(() => {
    const q = parseSearch(location.search);

    if (!q) {
      navigate('/');
    }

    setQuery(q);
  }, [location.search]);

  if (!results.length) {
    return <>TODO: no results found</>;
  }

  return (
    <Layout query={query}>
      <ul>
        {results.map(result => (
          <li>{result.name}</li>
        ))}
      </ul>
    </Layout>
  );
};

export default SearchPage;

export const pageQuery = graphql`
  query index {
    localSearchRecipes {
      index
      store
    }
  }
`;
