const fs = require('fs');
const path = require(`path`);
const yaml = require('js-yaml');
const { createRemoteFileNode } = require('gatsby-source-filesystem');

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const recipeTemplate = path.resolve(`./src/templates/recipe.js`);

  const result = await graphql(
    `
      {
        recipes: allRecipe {
          edges {
            node {
              id
              slug
            }
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
      path: recipe.slug,
      component: recipeTemplate,
      context: {
        id: recipe.id,
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
      cuisine: String!
      totalTime: String!
      servings: String!
      name: String!
      keywords: [String!]
      published: Date!
      author: String!
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

    const nodeMeta = {
      id: createNodeId(`recipe-${data.slug}`),
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
