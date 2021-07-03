import React, { createRef, useCallback, useEffect, useState } from 'react';
import { graphql, Link, navigate, StaticQuery } from 'gatsby';
import { formatCategorySlug } from '../util';
import _ from 'lodash';

import '../scss/layout.scss';
import { Helmet } from 'react-helmet';
import { GatsbyImage } from 'gatsby-plugin-image';
import { useSwipeable } from 'react-swipeable';

const SideBar = ({ children, show, close, duration = '0.3s', threshold = 33 }) => {
  const offCanvasRef = createRef();

  const swipeHandlers = useSwipeable({
    onSwiped: eventData => {
      const element = offCanvasRef.current;

      const width = element.clientWidth;
      const deltaX = eventData.deltaX;
      const deltaPercent = (deltaX / width) * 100;

      if (deltaPercent < threshold) {
        element.style.transitionDuration = duration;
        element.style.transform = `translateX(-100%)`;
      } else {
        close();
      }
    },
    onSwiping: eventData => {
      if (show && eventData.dir === 'Right') {
        const element = offCanvasRef.current;

        const width = element.clientWidth;
        const deltaX = eventData.deltaX;
        const deltaPercent = (deltaX / width) * 100;
        const percent = 100 - deltaPercent;

        element.style.transitionDuration = '0s';
        element.style.transform = `translateX(-${percent}%)`;
      }
    },
  });

  const refWrapper = ref => {
    swipeHandlers.ref(ref);
    offCanvasRef.current = ref;
  };

  const handleMenuClick = useCallback(
    event => {
      if (show && offCanvasRef.current && !offCanvasRef.current.contains(event.target)) {
        close();
      }
    },
    [offCanvasRef, show, close]
  );

  const handleEscape = useCallback(
    event => {
      if (event.keyCode === 27 && show) {
        event.preventDefault();
        close();
      }
    },
    [show, close]
  );

  useEffect(() => {
    if (show) {
      offCanvasRef.current.style.visibility = 'visible';
      offCanvasRef.current.style.transform = 'translateX(-100%)';
      offCanvasRef.current.style.transitionDuration = duration;
    } else {
      offCanvasRef.current.style.visibility = 'hidden';
      offCanvasRef.current.style.transform = 'translateX(0)';
      offCanvasRef.current.style.transitionDuration = duration;
    }
  }, [offCanvasRef, show, duration]);

  useEffect(() => {
    document.addEventListener('mousedown', handleMenuClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleMenuClick);
      document.removeEventListener('keydown', handleEscape);
    };
  });

  return (
    <div className="offcanvas-collapse" {...swipeHandlers} ref={refWrapper}>
      {children}
    </div>
  );
};

const topCategories = categories => {
  return _.sortBy(categories, category => category.totalCount)
    .reverse()
    .splice(0, 5);
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
  const [showOffCanvasNav, setShowOffCanvasNav] = useState(false);
  const searchInput = createRef();

  const showNav = useCallback(() => {
    setShowOffCanvasNav(true);
  }, [setShowOffCanvasNav]);

  const hideNav = useCallback(() => {
    setShowOffCanvasNav(false);
  }, [setShowOffCanvasNav]);

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

          <header className="py-2 container-fluid">
            <div className="d-flex justify-content-between align-content-center">
              <Link to="/" className="d-block">
                <GatsbyImage alt="Things We Make" image={data.headerLogo.childImageSharp.gatsbyImageData} />
              </Link>
              <button type="button" className="btn border-0 py-0 px-2 shadow-none" onClick={showNav}>
                <i className={`bi bi-list btn text-dark p-0 fs-1`} />
              </button>
            </div>

            <SideBar show={showOffCanvasNav} close={hideNav}>
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
            </SideBar>
          </header>

          <main className={contentProps.join(' ')}>{children}</main>

          <footer className="container-fluid py-5 fs-6 mt-auto text-muted text-center">
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
