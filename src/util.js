import _ from 'lodash';

export const formatCategorySlug = slug => {
  return _.startCase(_.camelCase(slug));
};
