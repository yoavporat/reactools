const vscode = require('vscode');
const path = require('path');
const ast = require('./ast');
const tree = require('./tree');

const EMPTY_STATE = [{ label: 'No supported components in scope', type: 'msg' }]

class ComponentsDataProvider {    
    
    constructor(context) {
        this.context = context;
        this.path = vscode.window.activeTextEditor.document.fileName;
        this.onDidChangeTreeDataEvent = new vscode.EventEmitter();
	    this.onDidChangeTreeData = this.onDidChangeTreeDataEvent.event;
    }

    refresh() {
        this.onDidChangeTreeDataEvent.fire();
    }

    getChildren(item) {
        if (item) {
            return item.propTypes;
        }
        const content = this.getContent();
        return content.length ? content : EMPTY_STATE;
    }

    getTreeItem(item) {
        let treeItem = new vscode.TreeItem(item.label, this.getCollapsedState(item.type));
        treeItem.iconPath = item.type === 'msg' 
            ? null 
            : this.context.asAbsolutePath(path.join('resources', 'icons', `${item.type}.svg`));        
        return treeItem;
    }

    getCollapsedState(type) {
        switch(type) {
            case 'prop':
            case 'msg':
                return vscode.TreeItemCollapsibleState.None;
            default:
                return vscode.TreeItemCollapsibleState.Collapsed;
        }
    }

    getContent() {
        this.path = vscode.window.activeTextEditor.document.fileName;

        if (!this.isSupportedFile()) {
            console.log('unsupported file');
            return [];
        };

        const content = [];
        const body = ast.parse(this.path);
        ast.getImports(body).forEach(importData => {
            const type = importData.type.replace('_/', '');
            importData.components.map(componentName => {
                const componentPath = tree.resolveCommonPath(componentName, type);                
                const componentAst = ast.parse(componentPath);
                const propTypes = ast.getPropTypes(componentAst);
                content.push({ 
                    label: componentName,
                    type: type.replace('mobile-layout', 'layout'),
                    propTypes
                });
            });
        });

        return content;
    }

    isSupportedFile() {
        const supported = ['.jsx', '.js'];
        return supported.some(ext => ext === path.extname(this.path));
    }
}

exports.PropsExplorer = class PropsExplorer {
    
    constructor(context) {
        this.context = context;
        this.dataProvider = new ComponentsDataProvider(context);
        this.explorer = vscode.window.createTreeView('proptypes', { treeDataProvider: this.dataProvider });

        vscode.window.onDidChangeActiveTextEditor(() => {
            this.dataProvider.refresh();
        });
    }
}