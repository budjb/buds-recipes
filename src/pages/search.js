import React, { useEffect, useRef, useState } from 'react';
import { graphql, navigate } from 'gatsby';
import { useFlexSearch } from 'react-use-flexsearch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Layout from '../templates/layout';
import { faFrown } from '@fortawesome/free-regular-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { RecipeCard } from '../components/recipe-card';

import { Helmet } from 'react-helmet';

const parseSearch = query => {
  return new URLSearchParams(query).get('q');
};

const NoResults = ({ query }) => {
  const searchInput = useRef();
  const formRef = useRef();

  const handleSearch = event => {
    event.preventDefault();

    const q = searchInput.current.value;

    if (q) {
      navigate(`/search?q=${q}`);
    }
  };

  return (
    <Layout query={query} title="Search Results">
      <Helmet>
        <title>Things We Make - Search Results</title>
      </Helmet>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-9 col-lg-6">
            <h1 className="display-4 mb-3">
              Nothing Found <FontAwesomeIcon icon={faFrown} />
            </h1>

            <p>
              We couldn't find any recipes that contained the term <strong>{query}</strong>. Feel free to try again with
              a different search!
            </p>

            <form ref={formRef} onSubmit={handleSearch}>
              <div className="input-group border border-1 rounded-pill border-secondary overflow-hidden">
                <input
                  className="form-control border-0  shadow-none"
                  type="text"
                  ref={searchInput}
                  defaultValue={query}
                  placeholder="Search..."
                />
                <button className="btn input-group-text">
                  <FontAwesomeIcon icon={faSearch} fixedWidth onClick={() => formRef.current.requestSubmit()} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
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
      <Layout query={query} className="search-results" title="Search Results">
        <h1 className="display-5 mb-5">Results for: {query}</h1>

        <div className="container p-0">
          <div className="row row-cols-1 row-cols-lg-4 align-items-stretch g-4 position-relative">
            {results.map(recipe => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                path={recipe.path}
                subTitle={recipe.subTitle}
                photo={recipe.coverImage}
              />
            ))}
          </div>
        </div>
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
