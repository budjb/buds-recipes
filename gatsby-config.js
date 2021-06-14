module.exports = {
  siteMetadata: {
    title: "Bud's Recipes",
  },
  plugins: [
    'gatsby-plugin-sass',
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'recipe',
        path: `${__dirname}/src/recipes/`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: 'gatsby-plugin-local-search',
      options: {
        name: 'recipes',
        engine: 'flexsearch',
        // engineOptions: 'speed',

        query: `{
          allRecipe {
            nodes {
              id
              keywords
              name
              path
              preview
              imageFiles {
                childImageSharp {
                  gatsbyImageData(layout: CONSTRAINED, width: 768, aspectRatio: 1.5)
                }
              }
            }
          }
        }`,
        ref: 'id',
        index: ['name', 'keywords'],
        store: ['id', 'name', 'path', 'coverImage', 'preview'],

        normalizer: ({ data }) => {
          return data.allRecipe.nodes.map(node => ({
            id: node.id,
            name: node.name,
            keywords: node.keywords,
            path: node.path,
            preview: node.preview,
            coverImage: node.imageFiles && node.imageFiles[0].childImageSharp.gatsbyImageData
          }));
        },
      },
    },
  ],
};
