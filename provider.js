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
        treeItem.iconPath = item.type === 'msg' ? null : {
            light: this.context.asAbsolutePath(path.join('resources', 'icons', 'experimental_light.svg')),
            dark: this.context.asAbsolutePath(path.join('resources', 'icons', 'experimental_dark.svg'))
        }
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
        const path = vscode.window.activeTextEditor.document.fileName;
        const body = ast.parse(path);
        return ast.getImports(body).map(componentName => {
            const path = tree.getCoreComponentPath(componentName);
            const componentAst = ast.parse(path);
            const propTypes = ast.getPropTypes(componentAst);
            return { 
                label: componentName,
                type: 'core',
                propTypes
            };
        });    
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