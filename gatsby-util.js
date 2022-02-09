const _ = require('lodash');
const { createRemoteFileNode } = require('gatsby-source-filesystem');

/**
 * Sleep for the given duration.
 */
const sleep = duration => {
  return new Promise(resolve => setTimeout(resolve, duration));
};

/**
 * Retry the given function until it either indicates that it's done or a timeout is reached.
 */
const retryWithTimeout = (timeout, interval, f) => {
  return new Promise(async (resolve, reject) => {
    let isDone = false;
    let result = null;

    const done = ret => {
      isDone = true;
      result = ret;
    };

    const start = new Date().getTime();

    while (new Date().getTime() < start + timeout) {
      f(done);

      if (isDone) {
        resolve(result);
        return;
      } else {
        await sleep(interval);
      }
    }

    reject(`function did not complete successfully after ${timeout}ms`);
  });
};

/**
 * Parses a list of image URLs to a configuration object, per URL.
 */
const parseImagesToConfig = images => {
  return images.map(image => parseImageToConfig(image));
};

/**
 * Parses an image URL to a configuration object.
 */
const parseImageToConfig = image => {
  let url;

  try {
    url = new URL(image);
  } catch {
    throw Error(`invalid URL ${url}`);
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
      type: 'web',
      url: image,
    };
  } else if (protocol === 's3') {
    return {
      type: 's3',
      filename: _.trimStart(url.pathname, '/'),
    };
  } else {
    throw new Error(`unsupported image scheme type ${protocol}`);
  }
};

/**
 * A workaround configuration for webpack config that does not strip out some SVG xmlns details.
 *
 * See https://github.com/gatsbyjs/gatsby/issues/31878
 */
const onCreateWebpackConfig = ({ actions, plugins, stage, getConfig }) => {
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

/**
 * Loads a web image node ID for a web URL.
 */
const loadWebImageId = async ({ nodeId, createNode, createNodeId, cache, store, config }) => {
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

/**
 * Loads a local file node ID for a file URL.
 */
const loadFileImageId = ({ getNodesByType, config }) => {
  const fileNodes = getNodesByType('File');

  const match = fileNodes.find(it => {
    if (config.sourceInstanceName && config.sourceInstanceName !== it.sourceInstanceName) {
      return false;
    }

    return config.relativePath === it.relativePath;
  });

  if (match) {
    return match.id;
  } else {
    throw Error(
      `could not find file node for source instance ${config.sourceInstanceName} and relative path ${config.relativePath}`
    );
  }
};

/**
 * Loads an S3 node ID for a s3 URL.
 */
const loadS3ImageId = async ({ getNodesByType, config }) => {
  const fileNodes = getNodesByType('S3Object');

  const match = fileNodes.find(it => {
    return config.filename === it.Key;
  });

  if (match) {
    const fileId = await retryWithTimeout(10000, 1000, done => {
      if (match.fields?.localFile) {
        done(match.fields.localFile);
      }
    });

    return fileId;
  } else {
    throw Error(`could not find S3 photo for filename ${config.filename}`);
  }
};

/**
 * Returns a list of image node IDs for a list of image URLs.
 */
const findImageIds = async ({ nodeId, images, getNodesByType, createNode, createNodeId, cache, store }) => {
  const childNodeIds = [];

  for (const image of parseImagesToConfig(images)) {
    if (image.type === 'web') {
      childNodeIds.push(
        await loadWebImageId({
          nodeId,
          createNode,
          createNodeId,
          cache,
          store,
          config: image,
        })
      );
    } else if (image.type === 'file') {
      childNodeIds.push(
        loadFileImageId({
          config: image,
          getNodesByType,
        })
      );
    } else if (image.type === 's3') {
      childNodeIds.push(await loadS3ImageId({ config: image, getNodesByType }));
    }
  }

  return childNodeIds;
};

module.exports = {
  sleep,
  retryWithTimeout,
  parseImagesToConfig,
  parseImageToConfig,
  onCreateWebpackConfig,
  findImageIds,
};
