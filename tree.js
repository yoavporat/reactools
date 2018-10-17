const path = require('path');
const DUDA_ROOT = path.resolve('c:/Users/yoavp/Code/duda/DudaRoot/client/src/modules');

exports.resolveCommonPath = function(name, type, root) {
    switch (type) {
        case 'mobile-layout':
            return path.join(DUDA_ROOT, `common/components/${type}/${name}/${name}.jsx`);
        case 'fields':
            const fieldName = camelize(name.replace('Field', ''));
            return path.join(DUDA_ROOT, `common/components/${type}/field-${fieldName}/${name}.jsx`);
        case 'core':
        case 'layout':
            return path.join(DUDA_ROOT, `common/components/${type}/${type}-${name.toLowerCase()}/${name}.jsx`);
        default:
            const rootDir = path.dirname(root);
            const relativePath = path.join(rootDir, `${type}.jsx`);
            return path.normalize(relativePath);
    }
};

function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
      if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
      return index == 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }