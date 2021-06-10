import React from 'react';
import FancyHR from '../components/FancyHR'
const buildCopyrightYears = () => {
  const startYear = 2021;
  const currentYear = new Date().getFullYear();

  if (startYear === currentYear) {
    return currentYear;
  } else {
    return `${startYear} - ${currentYear}`;
  }
};

const Layout = ({ children, className }) => {
  const props = {};

  if (className) {
    props.className = className;
  }

  return (
    <>
      <main {...props}>{children}</main>

      <FancyHR/>

      <footer>Copyright &copy; {buildCopyrightYears()} <a href="https://budjb.dev" target="_blank" rel="noreferrer">Bud Byrd</a></footer>
    </>
  );
};

export default Layout;
