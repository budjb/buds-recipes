const path = require(`path`);
const yaml = require('js-yaml');
const { createRemoteFileNode } = require('gatsby-source-filesystem');
const { parseImagesToConfig, retryWithTimeout } = require('./src/gatsby-util');

const _ = require('lodash');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const recipeTemplate = path.resolve(`./src/templates/recipe.js`);
  const categoryTemplate = path.resolve(`./src/templates/category.js`);

  const result = await graphql(
    `
      {
        recipes: allRecipe {
          edges {
            node {
              id
              path
              images
            }
          }
        }
        categories: allRecipe {
          group(field: categories) {
            fieldValue
          }
        }
      }
    `
  );

  if (result.errors) {
    throw result.errors;
  }

  const recipes = result.data.recipes.edges;

  for (const { node: recipe } of recipes) {
    createPage({
      path: recipe.path,
      component: recipeTemplate,
      context: {
        type: 'Recipe',
        id: recipe.id,
      },
    });
  }

  const categories = result.data.categories.group;

  for (const { fieldValue: slug } of categories) {
    createPage({
      path: `categories/${slug}`,
      component: categoryTemplate,
      context: {
        slug: slug,
      },
    });
  }
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type IngredientSection {
      name: String
      ingredients: [String!]!
    }
    
    type InstructionSection {
      name: String
      instructions: [String!]!
    }
    
    type Recipe implements Node {
      slug: String!
      path: String!
      cuisine: String!
      totalTime: String!
      servings: String!
      name: String!
      keywords: [String!]
      categories: [String!]!
      published: Date!
      author: String!
      preview: String!
      description: String
      imageFiles: [File] @link(from: "imageFiles___NODE")
      ingredientSections: [IngredientSection!]!
      instructionSections: [InstructionSection!]!
      tips: String
      featured: Boolean
    }
  `);
};

exports.onCreateNode = async ({
  node,
  loadNodeContent,
  actions: { createNode, createParentChildLink },
  createNodeId,
  createContentDigest,
  store,
  cache,
  getNodesByType,
}) => {
  if (node.internal.type === 'File' && node.sourceInstanceName === 'recipe') {
    if (node.extension !== 'yaml') {
      return;
    }

    const source = await loadNodeContent(node);
    const data = yaml.load(source);

    const recipeNode = {
      id: createNodeId(`recipe-${node.name}`),
      parent: node.id,
      children: [],
      ...data,
      internal: {
        type: `Recipe`,
        content: source,
        contentDigest: createContentDigest(data),
      },
      categories: data.categories.map(it => _.kebabCase(it)),
      slug: node.name,
      path: `recipes/${node.name}`,
    };

    createNode(recipeNode);
    createParentChildLink({ parent: node, child: recipeNode });

    return recipeNode;
  } else if (node.internal.type === 'Recipe') {
    if (node.images.length) {
      node.imageFiles___NODE = await loadImageIds(
        node.id,
        node.images,
        getNodesByType,
        createNode,
        createNodeId,
        cache,
        store
      );
    }
  }
};

const loadImageIds = async (nodeId, images, getNodesByType, createNode, createNodeId, cache, store) => {
  const loadWebImageId = async config => {
    const childNode = await createRemoteFileNode({
      url: config.url,
      parentNodeId: nodeId,
      createNode,
      createNodeId,
      cache,
      store,
    });

    if (childNode) {
      return childNode.id;
    } else {
      throw Error(`could not load image at URL ${config.url}`);
    }
  };

  const loadFileImageId = config => {
    const fileNodes = getNodesByType('File');

    const match = fileNodes.find(it => {
      if (config.sourceInstanceName && config.sourceInstanceName !== it.sourceInstanceName) {
        return false;
      }

      return config.relativePath === it.relativePath;
    });

    if (match) {
      match.id;
    } else {
      throw Error(
        `could not find file node for source instance ${config.sourceInstanceName} and relative path ${config.relativePath}`
      );
    }
  };

  const loadGooglePhotoImageId = async config => {
    const photoNodes = getNodesByType('GooglePhotosPhoto');

    const match = photoNodes.find(it => {
      return config.filename === it.filename;
    });

    if (match) {
      const photoId = await retryWithTimeout(60000, 1000, done => {
        if (match.photo___NODE) {
          done(match.photo___NODE);
        }
      });

      childNodeIds.push(photoId);
    } else {
      throw Error(`could not find Google photo for album ${config.album} and filename ${config.filename}`);
    }
  };

  const childNodeIds = [];

  for (const image of parseImagesToConfig(images)) {
    if (image.type === 'web') {
      childNodeIds.push(await loadWebImageId(image));
    } else if (image.type === 'file') {
      childNodeIds.push(loadFileImageId(image));
    } else if (image.type === 'gphotos') {
      childNodeIds.push(await loadGooglePhotoImageId(image));
    }
  }

  return childNodeIds;
};

// TODO: temporary workaround for https://github.com/gatsbyjs/gatsby/issues/31878
exports.onCreateWebpackConfig = ({ actions, plugins, stage, getConfig }) => {
  // override config only during production JS & CSS build
  if (stage === 'build-javascript') {
    // get current webpack config
    const config = getConfig();

    const options = {
      minimizerOptions: {
        preset: [
          `default`,
          {
            svgo: {
              full: true,
              plugins: [
                // potentially destructive plugins removed - see https://github.com/gatsbyjs/gatsby/issues/15629
                // use correct config format and remove plugins requiring specific params - see https://github.com/gatsbyjs/gatsby/issues/31619
                `removeUselessDefs`,
                `cleanupAttrs`,
                `cleanupEnableBackground`,
                `cleanupIDs`,
                `cleanupListOfValues`,
                `cleanupNumericValues`,
                `collapseGroups`,
                `convertColors`,
                `convertPathData`,
                `convertStyleToAttrs`,
                `convertTransform`,
                `inlineStyles`,
                `mergePaths`,
                `minifyStyles`,
                `moveElemsAttrsToGroup`,
                `moveGroupAttrsToElems`,
                `prefixIds`,
                `removeAttrs`,
                `removeComments`,
                `removeDesc`,
                `removeDimensions`,
                `removeDoctype`,
                `removeEditorsNSData`,
                `removeEmptyAttrs`,
                `removeEmptyContainers`,
                `removeEmptyText`,
                `removeHiddenElems`,
                `removeMetadata`,
                `removeNonInheritableGroupAttrs`,
                `removeOffCanvasPaths`,
                `removeRasterImages`,
                `removeScriptElement`,
                `removeStyleElement`,
                `removeTitle`,
                `removeUnknownsAndDefaults`,
                `removeUnusedNS`,
                `removeUselessStrokeAndFill`,
                `removeXMLProcInst`,
                `reusePaths`,
                `sortAttrs`,
              ],
            },
          },
        ],
      },
    };
    // find CSS minimizer
    const minifyCssIndex = config.optimization.minimizer.findIndex(
      minimizer => minimizer.constructor.name === 'CssMinimizerPlugin'
    );
    // if found, overwrite existing CSS minimizer with the new one
    if (minifyCssIndex > -1) {
      config.optimization.minimizer[minifyCssIndex] = plugins.minifyCss(options);
    }
    // replace webpack config with the modified object
    actions.replaceWebpackConfig(config);
  }
};
