const path = require(`path`);
const yaml = require('js-yaml');
const { onCreateWebpackConfig, findImageIds } = require('./src/gatsby-util');

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
      title: String
      ingredients: [String!]!
    }
    
    type InstructionSection {
      title: String
      instructions: [String!]!
    }
    
    type Recipe implements Node {
      slug: String!
      path: String!
      cuisine: String!
      totalTime: String!
      servings: String!
      title: String!
      keywords: [String!]
      categories: [String!]!
      published: Date!
      author: String!
      subTitle: String!
      description: String
      imageIds: [ID!]!
      imageFiles: [File] @link(from: "fields.imageIds")
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
  actions: { createNode, createParentChildLink, createNodeField },
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
    const imageIds = nodes.images?.length
      ? await findImageIds({
          nodeId: node.id,
          images: node.images,
          getNodesByType,
          createNode,
          createNodeId,
          cache,
          store,
        })
      : [];

    createNodeField({ node, name: 'imageIds', value: imageIds });
  }
};

exports.onCreateWebpackConfig = onCreateWebpackConfig;
