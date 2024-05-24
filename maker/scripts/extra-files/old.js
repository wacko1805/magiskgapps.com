            // Add contents of the 'template' folder to the new zip file
            const templateFolder = {
                'customize.sh': 'SGVsbG8gV29ybGQhCg==', 
                'module.prop': 'VGhpcyBpcyBhIHRlc3QK', 
                'uninstall.sh': 'VGhpcyBpcyBhIHRlc3QK', 
                'META-INF/update-binary': 'VGhpcyBpcyBhIHRlc3QK', 
                'META-INF/updater-script': 'VGhpcyBpcyBhIHRlc3QK', 
                'common/functions.sh': 'VGhpcyBpcyBhIHRlc3QK', 
                'common/install.sh': 'VGhpcyBpcyBhIHRlc3QK', 
                // Add more files as needed
            };
            Object.keys(templateFolder).forEach(fileName => {
                const fileContent = templateFolder[fileName];
                newZip.file(fileName, atob(fileContent), { binary: true });
            });