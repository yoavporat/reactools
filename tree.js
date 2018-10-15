const path = require('path');

const DUDA_ROOT = path.resolve('c:/Users/yoavp/Code/duda/DudaRoot/client/src/modules');

exports.getCoreComponentPath = function(componentName) {
    return path.join(DUDA_ROOT, 'common/components/core', `core-${componentName.toLowerCase()}`, `${componentName}.jsx`);
};