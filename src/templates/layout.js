import React, { createRef, useCallback, useEffect, useState } from 'react';
import { graphql, Link, navigate, StaticQuery } from 'gatsby';
import { formatCategorySlug } from '../util';

import '../scss/layout.scss';
import { Helmet } from 'react-helmet';

const buildCopyrightYears = () => {
  const startYear = 2021;
  const currentYear = new Date().getFullYear();

  if (startYear === currentYear) {
    return currentYear;
  } else {
    return `${startYear} - ${currentYear}`;
  }
};

const Layout = ({ children, className, query = '' }) => {
  const searchInput = createRef();
  const [showOffCanvasNav, setShowOffCanvasNav] = useState(false);
  const offCanvasRef = createRef();

  const showNav = useCallback(() => {
    setShowOffCanvasNav(true);
  }, [setShowOffCanvasNav]);

  const hideNav = useCallback(() => {
    setShowOffCanvasNav(false);
  }, [setShowOffCanvasNav]);

  const handleMenuClick = useCallback(
    event => {
      if (offCanvasRef && !offCanvasRef.current.contains(event.target)) {
        setShowOffCanvasNav(false);
      }
    },
    [offCanvasRef, setShowOffCanvasNav]
  );

  const handleEscape = useCallback(
    event => {
      if (event.keyCode === 27 && showOffCanvasNav) {
        event.preventDefault();
        setShowOffCanvasNav(false);
      }
    },
    [showOffCanvasNav, setShowOffCanvasNav]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleMenuClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleMenuClick);
      document.removeEventListener('keydown', handleEscape);
    };
  });

  const handleSearch = event => {
    event.preventDefault();
    const q = searchInput.current.value;

    if (q) {
      navigate(`/search?q=${q}`);
    } else {
      navigate('/');
    }
  };

  const props = {};

  if (className) {
    props.className = className;
  }

  return (
    <>
      <header className="p-2 mb-5 container-fluid">
        <div className="d-flex justify-content-between align-content-center">
          <Link to="/" className="title d-block fs-1">
            Things We Make
          </Link>
          <i className={`bi bi-list ${showOffCanvasNav ? 'fade' : 'visible'} fs-1 btn text-dark`} onClick={showNav} />
        </div>

        <div className={`offcanvas-collapse ${(showOffCanvasNav && 'open') || ''}`} ref={offCanvasRef}>
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn-close btn-close-white pt-4 shadow-none"
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

          <StaticQuery
            query={graphql`
              query CategoriesQuery {
                categories: allRecipe {
                  group(field: categories) {
                    fieldValue
                  }
                }
              }
            `}
            render={data => (
              <nav className="nav flex-column mx-3 mt-4">
                {data.categories.group.map(({ fieldValue: slug }) => (
                  <Link to={`/categories/${slug}`} className="nav-link text-light">
                    {formatCategorySlug(slug)}
                  </Link>
                ))}
                <Link to="/categories" className="nav-link text-light">
                  <small>More...</small>
                </Link>
              </nav>
            )}
          />
        </div>
      </header>

      <div className="container">
        <Helmet bodyAttributes={{ class: 'bg-body' }} />

        <main {...props}>{children}</main>

        <footer className="py-5 fs-6 text-muted text-center">
          Copyright &copy; {buildCopyrightYears()}{' '}
          <a href="https://budjb.dev" target="_blank" rel="noreferrer">
            Bud Byrd
          </a>
        </footer>
      </div>
    </>
  );
};

export default Layout;
