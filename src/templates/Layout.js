import React, { createRef } from 'react';
import FancyHR from '../components/FancyHR';
import { Link, navigate } from 'gatsby';

const buildCopyrightYears = () => {
  const startYear = 2021;
  const currentYear = new Date().getFullYear();

  if (startYear === currentYear) {
    return currentYear;
  } else {
    return `${startYear} - ${currentYear}`;
  }
};

const Layout = ({ children, className, query }) => {
  const searchInput = createRef();

  const handleSearch = event => {
    event.preventDefault();
    const q = searchInput.current.value;

    if (q) {
      navigate(`/search?q=${q}`);
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
        <div className="search">
          <form onSubmit={handleSearch}>
            <input type="text" defaultValue={query} ref={searchInput} placeholder="Search..." />
          </form>
        </div>
      </header>
      <FancyHR />
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
