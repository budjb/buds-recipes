const fs = require('fs');
const path = require(`path`);
const yaml = require('js-yaml');
const { createRemoteFileNode } = require('gatsby-source-filesystem');
const _ = require('lodash');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const recipeTemplate = path.resolve(`./src/templates/Recipe.js`);
  const categoryTemplate = path.resolve(`./src/templates/Category.js`);

  const result = await graphql(
    `
      {
        recipes: allRecipe {
          edges {
            node {
              id
              path
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
        slug: slug
      }
    })
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

exports.onCreateNode = async ({ node, actions: { createNode }, store, cache, createNodeId, createContentDigest }) => {
  if (node.internal.type === 'File' && node.sourceInstanceName === 'recipe') {
    if (node.extension !== 'yaml') {
      return;
    }

    const source = fs.readFileSync(node.absolutePath, 'utf-8');
    const data = yaml.load(source);

    data.slug = node.name;
    data.path = `recipes/${data.slug}`

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
    if (node.images) {
      const fileNodeIds = [];

      for (const url of node.images) {
        const fileNode = await createRemoteFileNode({
          url: url,
          parentNodeId: node.id,
          createNode,
          createNodeId,
          cache,
          store,
        });

        if (fileNode) {
          fileNodeIds.push(fileNode.id);
        }
      }

      node.imageFiles___NODE = fileNodeIds;
    }
  }
};
