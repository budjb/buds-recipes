import React, { useCallback, useRef } from 'react';
import { graphql, Link, navigate, StaticQuery } from 'gatsby';
import { formatCategorySlug } from '../util';
import { OffCanvas } from '../components/off-canvas';
import _ from 'lodash';

import '../scss/layout.scss';
import { Helmet } from 'react-helmet';
import { GatsbyImage } from 'gatsby-plugin-image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const topCategories = categories => {
  return _.orderBy(categories, ['totalCount', 'fieldValue'], ['desc', 'asc']).splice(0, 5);
};

const buildCopyrightYears = () => {
  const startYear = 2021;
  const currentYear = new Date().getFullYear();

  if (startYear === currentYear) {
    return currentYear;
  } else {
    return `${startYear} - ${currentYear}`;
  }
};

const Layout = ({ children, className, title, query = '' }) => {
  const searchInput = useRef();
  const sidebarRef = useRef();

  const showNav = useCallback(() => {
    sidebarRef.current.open();
  }, [sidebarRef]);

  const hideNav = useCallback(() => {
    sidebarRef.current.close();
  }, [sidebarRef]);

  const handleSearch = event => {
    event.preventDefault();
    const q = searchInput.current.value;

    if (q) {
      navigate(`/search?q=${q}`);
    } else {
      navigate('/');
    }
  };

  const contentProps = ['container', 'my-3', 'my-lg-5'];

  if (className) {
    contentProps.push(className);
  }

  return (
    <StaticQuery
      query={graphql`
        query CategoriesQuery {
          headerLogo: file(sourceInstanceName: { eq: "images" }, relativePath: { eq: "logo-black.png" }) {
            childImageSharp {
              gatsbyImageData(width: 65, placeholder: NONE)
            }
          }
          categories: allRecipe {
            group(field: categories) {
              fieldValue
              totalCount
            }
          }
        }
      `}
      render={data => (
        <div className="min-vh-100 d-flex flex-column">
          <Helmet
            defaultTitle="Things We Make"
            titleTemplate="%s | Things We Make"
            bodyAttributes={{ class: 'bg-body' }}
          >
            <title>{title}</title>
            <meta name="robots" content="noindex,nofollow" />
          </Helmet>

          <header className="container-fluid shadow bg-light position-sticky top-0">
            <div className="d-flex justify-content-between align-items-center">
              <Link to="/" className="d-block">
                <GatsbyImage alt="Things We Make" image={data.headerLogo.childImageSharp.gatsbyImageData} />
              </Link>
              <button type="button" className="btn border-0 py-0 px-2 shadow-none" onClick={showNav}>
                <FontAwesomeIcon icon={faBars} size="2x" fixedWidth />
              </button>
            </div>

            <OffCanvas ref={sidebarRef}>
              <div className="d-flex justify-content-end my-3">
                <button
                  type="button"
                  className="btn-close btn-close-white shadow-none"
                  aria-label="Close"
                  onClick={hideNav}
                />
              </div>

              <form className="d-flex order-lg-2" onSubmit={handleSearch}>
                <input
                  className="form-control rounded-pill shadow-none"
                  type="search"
                  defaultValue={query}
                  ref={searchInput}
                  placeholder="Search..."
                />
              </form>

              <nav className="nav flex-column mx-3 mt-4">
                {topCategories(data.categories.group).map(({ fieldValue: slug }) => (
                  <Link key={slug} to={`/categories/${slug}`} className="nav-link text-light">
                    {formatCategorySlug(slug)}
                  </Link>
                ))}
                <Link to="/categories" className="nav-link text-light">
                  <small>More...</small>
                </Link>
              </nav>
            </OffCanvas>
          </header>

          <main className={contentProps.join(' ')}>{children}</main>

          <footer className="container-fluid py-5 fs-6 mt-auto text-center bg-dark text-light shadow-inverted">
            Copyright &copy; {buildCopyrightYears()}{' '}
            <a href="https://budjb.dev" target="_blank" rel="noreferrer">
              Bud Byrd
            </a>
          </footer>
        </div>
      )}
    />
  );
};

export default Layout;
