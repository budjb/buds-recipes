import React, { createRef, useEffect, useState } from 'react';
import { graphql, navigate } from 'gatsby';
import { useFlexSearch } from 'react-use-flexsearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Layout from '../templates/Layout';
import { faFrown } from '@fortawesome/free-regular-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import RecipeCardSection from '../components/RecipeCardSection';

import '../scss/search.scss';
import { Helmet } from 'react-helmet';

const parseSearch = query => {
  return new URLSearchParams(query).get('q');
};

const NoResults = ({ query }) => {
  const searchInput = createRef();
  const formRef = createRef();

  const handleSearch = event => {
    event.preventDefault();

    const q = searchInput.current.value;

    if (q) {
      navigate(`/search?q=${q}`);
    }
  };

  return (
    <Layout query={query} className="search-no-results">
      <Helmet>
        <title>Things We Make - Search Results</title>
      </Helmet>
      <h1>
        Nothing Found <FontAwesomeIcon icon={faFrown} />
      </h1>
      We couldn't find any recipes that contained the term <strong>{query}</strong>.<br />
      Feel free to try again with a different search!
      <form ref={formRef} onSubmit={handleSearch}>
        <div className="new-search">
          <input type="text" ref={searchInput} placeholder="Search..." />
          <FontAwesomeIcon icon={faSearch} fixedWidth onClick={() => formRef.current.requestSubmit()} />
        </div>
      </form>
    </Layout>
  );
};

const SearchPage = ({ data, location }) => {
  const [isLoading, setLoading] = useState(true);
  const [query, setQuery] = useState(null);
  const results = useFlexSearch(query, data.localSearchRecipes.index, data.localSearchRecipes.store);

  useEffect(() => {
    const q = parseSearch(location.search);

    if (!q) {
      navigate('/');
    }

    setQuery(q);
    setLoading(false);
  }, [location.search]);

  if (isLoading) {
    return <>TODO: Loading</>;
  } else if (!results.length) {
    return <NoResults query={query} />;
  } else {
    return (
      <Layout query={query} className="search-results">
        <Helmet>
          <title>Things We Make - Search Results</title>
        </Helmet>
        <h1>Results for: {query}</h1>
        <RecipeCardSection>
          {results.map(recipe => {
            return (
              <RecipeCardSection.RecipeCard
                name={recipe.name}
                path={recipe.path}
                preview={recipe.preview}
                photo={recipe.coverImage}
              />
            );
          })}
        </RecipeCardSection>
      </Layout>
    );
  }
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
