const fs = require('fs');
const path = require(`path`);
const yaml = require('js-yaml');
const { createRemoteFileNode, createFilePath } = require('gatsby-source-filesystem');
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
      categories: [String!]
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
  actions: { createNode },
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

    const source = fs.readFileSync(node.absolutePath, 'utf-8');
    const data = yaml.load(source);

    data.slug = node.name;
    data.path = `recipes/${data.slug}`;

    if (data.categories) {
      data.categories = data.categories.map(it => _.kebabCase(it));
    }

    const nodeMeta = {
      id: createNodeId(`recipe-${node.name}`),
      parent: null,
      children: [],
      internal: {
        type: `Recipe`,
        content: source,
        contentDigest: createContentDigest(data),
      },
    };

    await createNode({ ...data, ...nodeMeta });
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
  const childNodeIds = [];

  for (const image of parseImages(images)) {
    if (image.type === 'remote') {
      const childNode = await createRemoteFileNode({
        url: image.url,
        parentNodeId: nodeId,
        createNode,
        createNodeId,
        cache,
        store,
      });

      if (childNode) {
        childNodeIds.push(childNode.id);
      } else {
        console.error(`could not load image at URL ${image.url}`);
      }
    } else if (image.type === 'file') {
      const fileNodes = getNodesByType('File');

      const match = fileNodes.find(it => {
        if (image.sourceInstanceName && image.sourceInstanceName !== it.sourceInstanceName) {
          return false;
        }

        return image.relativePath === it.relativePath;
      });

      if (match) {
        childNodeIds.push(match.id);
      } else {
        console.error(
          `could not find file node for source instance ${image.sourceInstanceName} and relative path ${image.relativePath}`
        );
      }
    } else if (image.type === 'gphotos') {
      const photoNodes = getNodesByType('GooglePhotosPhoto');

      const match = photoNodes.find(it => {
        return image.filename === it.filename;
      });

      if (match) {
        childNodeIds.push(match.photo___NODE);
      } else {
        console.error(`could not find Google photo for album ${image.album} and filename ${image.filename}`);
      }
    }
  }

  return childNodeIds;
};

const parseImages = images => {
  return images.map(image => {
    let url;

    try {
      url = new URL(image);
    } catch {
      throw Error(`recipe ${node.name} contains unsupported URL ${url}`);
    }

    const protocol = _.trimEnd(url.protocol, ':');

    if (protocol === 'file') {
      return {
        type: 'file',
        sourceInstanceName: url.host || '__PROGRAMMATIC__',
        relativePath: _.trimStart(url.pathname, '/'),
      };
    } else if (protocol === 'http' || protocol === 'https') {
      return {
        type: 'remote',
        url: image,
      };
    } else if (protocol === 'gphotos') {
      return {
        type: 'gphotos',
        album: url.hostname && url.hostname.replace(/\+/g, ' '),
        filename: _.trimStart(url.pathname, '/'),
      };
    } else {
      throw new Error(`unsupported image scheme type ${protocol}`);
    }
  });
};
