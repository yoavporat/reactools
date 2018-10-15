const parser = require('@babel/parser');
const fs = require('fs');
const path = require('path');

const resolvedPath = path.join('c:', 'Users/yoavp/Code/duda/DudaRoot/client/src/modules/mobileEditor/src/components/Stats/Stats.jsx');
const file = fs.readFileSync(resolvedPath, { encoding: 'utf8' });
const options = {
    sourceType: 'module',
    decoratorsBeforeExport: true,
    plugins: ['jsx', 'decorators-legacy', 'classProperties', 'objectRestSpread', 'dynamicImport']
}
const bodyAst = parser.parse(file, options).program.body;
const component = bodyAst.filter(node => node.type === 'ClassDeclaration')[0];
const staticProperties = component.body.body.filter(classNode => {
    return classNode.type === 'ClassProperty' && classNode.static;
});
const propTypes = staticProperties.filter(staticProperty => staticProperty.key.name === 'propTypes')[0];
console.log(propTypes.value.properties.length);
