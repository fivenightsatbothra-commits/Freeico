import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('freeico.openPanel', () => {
        const panel = vscode.window.createWebviewPanel(
            'freeicoSearch',
            'Freeico: Icon Search',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'webview')),
                    vscode.Uri.file(path.join(context.extensionPath, 'data'))
                ]
            }
        );

        // Get URIs for local files to allow webview to load them
        const webviewPath = path.join(context.extensionPath, 'webview');
        
        const cssUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, 'ui.css')));
        const jsUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, 'ui.js')));
        const collectionsListUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, 'collections-list.js')));
        
        // Base path for the data folder (we will pass this to the UI to build URLs)
        const dataPathUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'data')));

        let htmlContent = fs.readFileSync(path.join(webviewPath, 'ui.html'), 'utf-8');
        
        // Inject URIs
        htmlContent = htmlContent.replace('{{CSS_URI}}', cssUri.toString());
        htmlContent = htmlContent.replace('{{JS_URI}}', jsUri.toString());
        htmlContent = htmlContent.replace('{{COL_URI}}', collectionsListUri.toString());
        htmlContent = htmlContent.replace('{{DATA_URI}}', dataPathUri.toString());

        panel.webview.html = htmlContent;

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'insert-icon':
                        const editor = vscode.window.activeTextEditor;
                        if (editor) {
                            editor.edit(editBuilder => {
                                editBuilder.insert(editor.selection.active, message.svgCode);
                            });
                        } else {
                            vscode.window.showErrorMessage('Please place your cursor in an active file to insert the icon.');
                        }
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
