const vscode = require('vscode');
const path = require('path');
const ast = require('./ast');
const tree = require('./tree');

const EMPTY_STATE = [{ label: 'No supported components in scope', type: 'msg' }]

class ComponentsDataProvider {    
    
    constructor(context) {
        this.context = context;
        this.onDidChangeTreeDataEvent = new vscode.EventEmitter();
	    this.onDidChangeTreeData = this.onDidChangeTreeDataEvent.event;
    }

    activeEditorPath() {
        return vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.fileName;
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
        treeItem.iconPath = this.getIcons(item.type);
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

    getIcons(type) {
        switch(type) {
            case 'core':
            case 'fields':
            case 'layout':
            case 'prop':
                return this.context.asAbsolutePath(path.join('resources', 'icons', `${type}.svg`));
            default:
                return null;
        }
    }

    getContent() {
        const activeEditor = this.activeEditorPath();
        if (!this.isSupportedFile() || !activeEditor) {
            console.log('unsupported file');
            return [];
        };

        const content = [];
        const body = ast.parse(activeEditor);
        ast.getImports(body).forEach(importData => {
            const type = importData.type.replace('_/', '');
            importData.components.map(componentName => {
                const componentPath = tree.resolveCommonPath(componentName, type, activeEditor);
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
        const activeEditor = this.activeEditorPath();
        if (activeEditor) {
            return supported.some(ext => ext === path.extname(activeEditor));            
        }
        return false;
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