module.exports = {
  siteMetadata: {
    title: "Bud's Recipes",
  },
  plugins: [
    "gatsby-plugin-sass",
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "recipe",
        path: `${__dirname}/src/recipes/`
      }
    }
  ],
};
