import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "Freeico" is now active!');

	let disposable = vscode.commands.registerCommand('freeico.open', () => {
		const panel = vscode.window.createWebviewPanel(
			'freeico',
			'Freeico Icons',
			vscode.ViewColumn.Beside,
			{ enableScripts: true, retainContextWhenHidden: true }
		);

		panel.webview.html = getWebviewContent();

		// Handle messages sent from the iframe via our universal postMessage API!
		panel.webview.onDidReceiveMessage(
			message => {
				if (message.type === 'insert-svg') {
					const editor = vscode.window.activeTextEditor;
					if (editor) {
						editor.edit(editBuilder => {
							editBuilder.insert(editor.selection.active, message.svg);
						});
						vscode.window.showInformationMessage(`⚡ Freeico: Inserted ${message.name || 'icon'}`);
					} else {
						// Fallback to clipboard if no active text editor is open
						vscode.env.clipboard.writeText(message.svg);
						vscode.window.showInformationMessage(`⚡ Freeico: Copied ${message.name || 'icon'} to clipboard!`);
					}
				}
			},
			undefined,
			context.subscriptions
		);
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent() {
	return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Freeico Webview</title>
    <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100vh; overflow: hidden; background: #fafafa; }
        iframe { width: 100%; height: 100%; border: none; }
    </style>
</head>
<body>
    <iframe src="https://fivenightsatbothra-commits.github.io/Freeico/index.html?minimal=true&v=${Date.now()}" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
    <script>
        const vscode = acquireVsCodeApi();
        
        // Intercept cross-origin messages from the Freeico web app
        window.addEventListener('message', event => {
            if (event.origin !== "https://fivenightsatbothra-commits.github.io") return;
            
            const msg = event.data?.pluginMessage;
            if (msg && msg.type === 'insert-svg') {
                // Forward it natively to the VS Code backend
                vscode.postMessage(msg);
            }
        });
    </script>
</body>
</html>`;
}

export function deactivate() {}
