const _ = require('lodash');

const sleep = duration => {
  return new Promise(resolve => setTimeout(resolve, duration));
};

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

const parseImagesToConfig = images => {
  return images.map(image => parseImageToConfig(image));
};

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
  } else if (protocol === 'gphotos') {
    return {
      type: 'gphotos',
      album: url.hostname && url.hostname.replace(/\+/g, ' '),
      filename: _.trimStart(url.pathname, '/'),
    };
  } else {
    throw new Error(`unsupported image scheme type ${protocol}`);
  }
};

exports.sleep = sleep;
exports.retryWithTimeout = retryWithTimeout;
exports.parseImagesToConfig = parseImagesToConfig;
exports.parseImageToConfig = parseImageToConfig;
