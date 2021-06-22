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
      resolve: 'gatsby-source-google-photos',
      options: {
        albumsTitles: ['Recipes Website'],
        photosMaxWidth: 1280,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'recipe',
        path: `${__dirname}/src/recipes/`,
      },
    },
    {
      resolve: 'gatsby-plugin-local-search',
      options: {
        name: 'recipes',
        engine: 'flexsearch',

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
                  gatsbyImageData(placeholder: BLURRED, layout: CONSTRAINED, sizes: "275,700", aspectRatio: 1.5)
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
            coverImage: node.imageFiles && node.imageFiles[0].childImageSharp.gatsbyImageData,
          }));
        },
      },
    },
    'gatsby-plugin-react-helmet',
  ],
};
