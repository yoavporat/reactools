const parser = require('@babel/parser');
const fs = require('fs');

exports.parse = function(path) {
    // console.log('parsing AST for', path);
    const file = fs.readFileSync(path, { encoding: 'utf8' });
    const options = {
        sourceType: 'module',
        decoratorsBeforeExport: true,
        plugins: ['jsx', 'decorators-legacy', 'classProperties', 'objectRestSpread', 'dynamicImport']
    }
    return parser.parse(file, options).program.body;
}

exports.getPropTypes = function(ast) {
    let propTypes = [];
    const statements = ast.filter(node => node.type === 'ExpressionStatement');
    const propTypeStatement = statements.length && statements.filter(node => node.expression.left.property.name === 'propTypes')[0];

    if (propTypeStatement) {
        // propTypes are declared outside class scope
        propTypes = propTypeStatement.expression.right.properties;
    } else {
        // propTypes are declared inside class scope
        const component = ast.filter(node => node.type === 'ClassDeclaration')[0];
        propTypes = component.body.body.filter(classNode => {
            return classNode.key.name === 'propTypes'
        })[0].value.properties;
    }

    return propTypes.map(node => {
        return {
            label: `${node.key.name} : ${node.value.name}`,
            type: 'prop'
        };
    });
}

exports.getImports = function(ast) {
    const imports = ast.filter(node => node.type === 'ImportDeclaration' && node.source.value.startsWith('_/'));
    return imports.map(node => {
        return {
            type: node.source.value,
            components: node.specifiers.map(importNode => importNode.imported.name)
        }
    });
}