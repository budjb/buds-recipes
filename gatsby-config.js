module.exports = {
  siteMetadata: {
    title: 'Things We Make',
    siteUrl: 'https://recipes.budjb.com',
  },
  plugins: [
    'gatsby-plugin-sass',
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-source-s3`,
      options: {
        aws: {
          credentials: {
            accessKeyId: process.env.TWM_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.TWM_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
          },
          region: process.env.TWM_AWS_REGION || process.env.AWS_REGION,
        },
        buckets: ['things-we-make'],
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
              title
              path
              subTitle
              imageFiles {
                childImageSharp {
                  gatsbyImageData(placeholder: BLURRED, layout: CONSTRAINED, sizes: "275,700", aspectRatio: 1.5)
                }
              }
            }
          }
        }`,
        ref: 'id',
        index: ['title', 'keywords'],
        store: ['id', 'title', 'path', 'coverImage', 'subTitle'],

        normalizer: ({ data }) => {
          return data.allRecipe.nodes.map(node => ({
            id: node.id,
            title: node.title,
            keywords: node.keywords,
            path: node.path,
            subTitle: node.subTitle,
            coverImage: node.imageFiles && node.imageFiles[0].childImageSharp.gatsbyImageData,
          }));
        },
      },
    },
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: `Things We Make`,
        short_name: `Things We Make`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: '#ffffff',
        display: `standalone`,
        icon: `src/images/logo-maskable.png`,
        icon_options: {
          purpose: `any maskable`,
        },
      },
    },
    'gatsby-plugin-offline',
    'gatsby-plugin-catch-links',
  ],
};
