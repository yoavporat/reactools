const provider = require('./provider');

exports.activate = function activate(context) {
    console.log('reactools are active!');
    new provider.PropsExplorer(context);
}

exports.deactivate = function deactivate() {

}