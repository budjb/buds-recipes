import React, { createRef, useCallback, useEffect, useState } from 'react';
import FancyHR from '../components/FancyHR';
import { graphql, Link, navigate, StaticQuery } from 'gatsby';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatCategorySlug } from '../util';

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
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = createRef();
  const menuButtonRef = createRef();
  const searchInput = createRef();

  const handleMenuClick = useCallback(
    event => {
      if (menuButtonRef && menuButtonRef.current.contains(event.target) && !showMenu) {
        setShowMenu(true);
      } else if (menuRef && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    },
    [menuRef, menuButtonRef, setShowMenu, showMenu]
  );

  const handleEscape = useCallback(
    event => {
      if (event.keyCode === 27 && showMenu) {
        event.preventDefault();
        setShowMenu(false);
      }
    },
    [showMenu, setShowMenu]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleMenuClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleMenuClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [handleMenuClick, handleEscape]);

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
      <header>
        <Link to="/" className="title">
          Things We Make
        </Link>
        <div className={`menu ${showMenu && 'active'}`}>
          <div className="menu-button" ref={menuButtonRef}>
            <FontAwesomeIcon icon={faBars} />
          </div>
          <div className="menu-content" ref={menuRef}>
            <div className="search">
              <form onSubmit={handleSearch}>
                <input type="text" defaultValue={query} ref={searchInput} placeholder="Search..." />
              </form>
            </div>
            <h3>Categories</h3>
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
                <ul>
                  {data.categories.group.map(({ fieldValue: slug }) => (
                    <li key={slug}>
                      <Link to={`/categories/${slug}`}>{formatCategorySlug(slug)}</Link>
                    </li>
                  ))}
                  <Link to="/categories">
                    <small>More...</small>
                  </Link>
                </ul>
              )}
            />
          </div>
        </div>
      </header>
      <FancyHR className="layout-header-divider" />
      <main {...props}>{children}</main>

      <FancyHR />

      <footer>
        Copyright &copy; {buildCopyrightYears()}{' '}
        <a href="https://budjb.dev" target="_blank" rel="noreferrer">
          Bud Byrd
        </a>
      </footer>
    </>
  );
};

export default Layout;
