import React, { useCallback, useEffect, useRef, useState } from 'react';
import { graphql, Link, navigate, StaticQuery } from 'gatsby';
import { formatCategorySlug } from '../util';
import _ from 'lodash';

import '../scss/layout.scss';
import { Helmet } from 'react-helmet';
import { GatsbyImage } from 'gatsby-plugin-image';
import { useSwipeable } from 'react-swipeable';

const SideBar = ({ children, show, open, close, duration = '0.3s', threshold = 33 }) => {
  /**
   * Track whether the initial swipe was either to the left or right,
   * and lock the axis (open/close sidebar vs vertical scroll) based on
   * the original scroll direction for the duration of the swipe.
   */
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);

  /**
   * Reference to the sidebar element.
   *
   * @type {React.RefObject<Element>}
   */
  const offCanvasRef = useRef();

  /**
   * Event handler for the very beginning of a swipe.
   */
  const onSwipeStart = eventData => {
    if (['Left', 'Right'].includes(eventData.dir)) {
      setIsHorizontalSwipe(true);
    }
  };

  useEffect(() => {
    if (isHorizontalSwipe) {
      document.documentElement.style.overflowY = 'hidden';
    } else {
      document.documentElement.style.overflowY = 'visible';
    }
  }, [isHorizontalSwipe]);
  /**
   * Event handler for when a swipe has completed.
   */
  const onSwiped = eventData => {
    if (!isHorizontalSwipe) {
      return;
    }

    const element = offCanvasRef.current;

    const width = element.clientWidth;
    const deltaX = _.clamp(show ? eventData.deltaX : eventData.deltaX * -1, 0, width);
    const deltaPercent = (deltaX / width) * 100;

    if (show) {
      if (deltaPercent < threshold) {
        element.style.transitionDuration = duration;
        element.style.transform = `translateX(-100%)`;
      } else {
        close();
      }
    } else {
      if (deltaPercent < threshold) {
        element.style.transitionDuration = duration;
        element.style.transform = `translateX(0)`;
      } else {
        open();
      }
    }

    setIsHorizontalSwipe(false);
  };

  /**
   * Event handler for when a swipe is ongoing.
   *
   * @param eventData
   */
  const onSwiping = eventData => {
    if (!isHorizontalSwipe) {
      return;
    }

    const element = offCanvasRef.current;

    const width = element.clientWidth;
    const deltaX = _.clamp(show ? eventData.deltaX : eventData.deltaX * -1, 0, width);
    const deltaPercent = (deltaX / width) * 100;
    const percent = show ? 100 - deltaPercent : deltaPercent;

    element.style.transitionDuration = '0s';
    element.style.transform = `translateX(-${percent}%)`;
  };

  /**
   * Swipe configuration.
   *
   * @type {SwipeableHandlers}
   */
  const swipeHandlers = useSwipeable({
    delta: 16,
    onSwiped,
    onSwiping,
    onSwipeStart,
  });

  /**
   * Register the swipe event handlers with the document.
   */
  useEffect(() => {
    swipeHandlers.ref(document.documentElement);
  }, [swipeHandlers]);

  /**
   * Handle CSS transition animations depending on open or close state,
   * and lock the body when the sidebar is open on mobile clients.
   */
  useEffect(() => {
    if (show) {
      offCanvasRef.current.style.transform = 'translateX(-100%)';
      offCanvasRef.current.style.transitionDuration = duration;

      if (document.scrollingElement) {
        document.scrollingElement.classList.add('lock-scroll');
      }
    } else {
      offCanvasRef.current.style.transform = 'translateX(0)';
      offCanvasRef.current.style.transitionDuration = duration;

      if (document.scrollingElement) {
        document.scrollingElement.classList.remove('lock-scroll');
      }
    }
  }, [offCanvasRef, show, duration]);

  /**
   * Hand click events so that any click outside the sidebar when it is shown will close it.
   *
   * @type {function(*): void}
   */
  const handleMenuClick = useCallback(
    event => {
      if (show && offCanvasRef.current && !offCanvasRef.current.contains(event.target)) {
        close();
      }
    },
    [offCanvasRef, show, close]
  );

  /**
   * Handle escape key to close menu when it is open.
   *
   * @type {function(*): void}
   */
  const handleEscape = useCallback(
    event => {
      if (event.keyCode === 27 && show) {
        event.preventDefault();
        close();
      }
    },
    [show, close]
  );

  /**
   * Register click and keyboard handlers.
   */
  useEffect(() => {
    document.addEventListener('mousedown', handleMenuClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleMenuClick);
      document.removeEventListener('keydown', handleEscape);
    };
  });

  return (
    <div className="offcanvas-collapse" ref={offCanvasRef}>
      {children}
    </div>
  );
};

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
  const [showOffCanvasNav, setShowOffCanvasNav] = useState(false);
  const searchInput = useRef();

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

          <header className="container-fluid shadow bg-light position-sticky top-0">
            <div className="d-flex justify-content-between align-content-center">
              <Link to="/" className="d-block">
                <GatsbyImage alt="Things We Make" image={data.headerLogo.childImageSharp.gatsbyImageData} />
              </Link>
              <button type="button" className="btn border-0 py-0 px-2 shadow-none" onClick={showNav}>
                <i className={`bi bi-list btn text-dark p-0 fs-1`} />
              </button>
            </div>

            <SideBar show={showOffCanvasNav} close={hideNav} open={showNav}>
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
