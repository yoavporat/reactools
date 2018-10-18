const vscode = require('vscode');
const path = require('path');

exports.resolveCommonPath = function(name, type, root) {
    const rootPath = vscode.workspace.getConfiguration('reactools').get('modulesPath');
    const importType = type.includes('/') ? type.split('/')[0] : type;
    console.log(name, type, root);
    switch (importType) {
        case 'mobile-layout':
            return path.join(rootPath, `common/components/${type}/${name}/${name}.jsx`);
        case 'fields':
            const fieldName = camelize(name.replace('Field', ''));
            return path.join(rootPath, `common/components/${type}/field-${fieldName}/${name}.jsx`);
        case 'core':
        case 'layout':
            return type !== importType 
                ? path.join(rootPath, `common/components/${type}.jsx`)
                : path.join(rootPath, `common/components/${type}/${type}-${name.toLowerCase()}/${name}.jsx`);
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