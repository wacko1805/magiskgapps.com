$('#extractButton').click(function() {
    const fileInput = document.getElementById('zipFileInput');
    const files = fileInput.files;
    if (files.length === 0) {
        alert('Please select a file to extract.');
        return;
    }
    
    const file = files[0];
    const reader = new FileReader();
    const newZip = new JSZip(); // Define newZip here
    let ogZipTitle = file.name; // Store the name of the original zip file
    reader.onload = function(e) {
        console.log('File loaded. Extracting...');
        document.getElementById("info").innerHTML = "File loaded. Extracting...";
        const zip = new JSZip();
        zip.loadAsync(e.target.result).then(function(zipFiles) {
            const promises = [];
            zip.forEach(function(relativePath, zipEntry) {
                console.log('Processing file:', relativePath);
                document.getElementById("info").innerHTML = 'Processing file...';
                if (relativePath.endsWith('installer.sh') || relativePath.endsWith('uninstaller.sh')) {
                    console.log('Skipping file:', relativePath);
                    return; // Skip installer.sh and uninstaller.sh files
                }
                promises.push(new Promise((resolve, reject) => {
                    if (relativePath.startsWith('AppSet/') && relativePath.endsWith('.zip')) {
                        const subZip = new JSZip();
                        subZip.loadAsync(zipEntry.async('blob')).then(function(subZipFiles) {
                            subZip.forEach(function(subRelativePath, subZipEntry) {
                                const parts = subRelativePath.split('___').filter(Boolean);
                                const targetPath = ['system', ...parts].join('/');
                                console.log('Extracting to:', targetPath);
                                document.getElementById("info").innerHTML = 'Extracting files...';
                                subZipEntry.async('blob').then(function(blob) {
                                    newZip.file(targetPath, blob);
                                    resolve();
                                });
                            });
                        });
                    } else {
                        const parts = relativePath.split('___').filter(Boolean);
                        const targetPath = ['system', ...parts].join('/');
                        console.log('Extracting to:', targetPath);
                        document.getElementById("info").innerHTML = 'creating new zip file...';
                        zipEntry.async('blob').then(function(blob) {
                            newZip.file(targetPath, blob);
                            resolve();
                        });
                    }
                }));
            });
            
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

            Promise.all(promises).then(function() {
                console.log('All files extracted. Creating new zip file...');
                document.getElementById("info").innerHTML = 'All files extracted. Creating new zip file...(This may take up to 5 minutes)';
                newZip.generateAsync({type:'blob'}).then(function(blob) {
                    console.log('New zip file created. Downloading...');
                    document.getElementById("info").innerHTML = 'New zip file created. Downloading...';
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'MagiskGAppsMaker converted - '+ ogZipTitle +'.zip';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    console.log('Download complete.');
                    document.getElementById("info").innerHTML = 'Download complete.';
                });
            });
        });
    };
    reader.readAsArrayBuffer(file);
});
