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
              slug
              description
              imageFiles {
                id
              }
            }
          }
        }`,
        ref: 'id',
        index: ['name', 'keywords'],
        store: ['id', 'name', 'slug', 'coverImage', 'description'],

        normalizer: ({ data }) => {
          return data.allRecipe.nodes.map(node => ({
            id: node.id,
            name: node.name,
            keywords: node.keywords,
            slug: node.slug,
            coverImage: node.imageFiles && node.imageFiles[0].id
          }));
        },
      },
    },
  ],
};
