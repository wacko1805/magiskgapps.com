// NikGApps Script
$('#extractButton').click(function() {
    console.log('NikGApps Selected.');
    document.getElementById("info").innerHTML += "NikGApps Selected. <br>";

    const fileInput = document.getElementById('zipFileInput');
    const files = fileInput.files;
    if (files.length === 0) {
        const errorMessage = 'Error: No file selected for extraction.';
        console.log(errorMessage);
        document.getElementById("info").innerHTML += "<b class='red'>" + errorMessage + "</b><br>";
        return;
    }

    const file = files[0];
    console.log('File selected:', file.name);
    
    const reader = new FileReader();
    const newZip = new JSZip(); // Define newZip here
    let ogZipTitle = file.name; // Store the name of the original zip file
    let ogZipTitleStripped = ogZipTitle.replace('.zip', ''); // Zip file with extension removed

    // Main functions for specified files:
    reader.onload = function(e) {
        console.log('File loaded. Extracting...');
        document.getElementById("info").innerHTML += "File loaded. Extracting...<br>";
        
        const zip = new JSZip();
        zip.loadAsync(e.target.result).then(function(zipFiles) {
            const promises = [];
            console.log('Zip loaded successfully. Processing files...');

            zip.forEach(function(relativePath, zipEntry) {
                console.log('Processing file:', relativePath);
                document.getElementById("info").innerHTML += '<b>Processing file: </b>' + relativePath + '<br>';
                
                // Ensure only files from the AppSet folder are processed
                if (!relativePath.startsWith('AppSet/')) {
                    const errorMessage = 'Skipping file outside AppSet folder: ' + relativePath;
                    console.log(errorMessage);
                    document.getElementById("info").innerHTML += "<b>" + errorMessage + "</b><br>";
                    return; // Skip files not in the AppSet folder
                }

                // Skip installer.sh and uninstaller.sh files
                if (relativePath.endsWith('installer.sh') || relativePath.endsWith('uninstaller.sh')) {
                    const errorMessage = 'Skipping installer/uninstaller script: ' + relativePath;
                    console.log(errorMessage);
                    document.getElementById("info").innerHTML += "<b class='red'>" + errorMessage + "</b><br>";
                    return;
                }

                promises.push(new Promise((resolve, reject) => {
                    if (relativePath.endsWith('.zip')) {
                        console.log('Found nested zip file:', relativePath);
                        const subZip = new JSZip();
                        subZip.loadAsync(zipEntry.async('blob')).then(function(subZipFiles) {
                            subZip.forEach(function(subRelativePath, subZipEntry) {
                                const parts = subRelativePath.split('___').filter(Boolean);
                                const targetPath = ['system', ...parts].join('/');
                                console.log('Extracting to:', targetPath);
                                document.getElementById("info").innerHTML += '<b>Extracting File: </b>' + targetPath + '<br>';
                                
                                subZipEntry.async('blob').then(function(blob) {
                                    newZip.file(targetPath, blob);
                                    resolve();
                                }).catch(error => {
                                    const errorMessage = 'Error extracting blob from sub-zip entry: ' + error;
                                    console.log(errorMessage);
                                    document.getElementById("info").innerHTML += "<b class='red'>" + errorMessage + "</b><br>";
                                    reject(error);
                                });
                            });
                        }).catch(error => {
                            const errorMessage = 'Error loading nested zip file: ' + error;
                            console.log(errorMessage);
                            document.getElementById("info").innerHTML += "<b class='red'>" + errorMessage + "</b><br>";
                            reject(error);
                        });
                    } else {
                        const parts = relativePath.split('___').filter(Boolean);
                        const targetPath = ['system', ...parts].join('/');
                        console.log('Extracting to:', targetPath);
                        document.getElementById("info").innerHTML += 'Creating new zip file...<br>';
                        
                        zipEntry.async('blob').then(function(blob) {
                            newZip.file(targetPath, blob);
                            resolve();
                        }).catch(error => {
                            const errorMessage = 'Error extracting blob from zip entry: ' + error;
                            console.log(errorMessage);
                            document.getElementById("info").innerHTML += "<b class='red'>" + errorMessage + "</b><br>";
                            reject(error);
                        });
                    }
                }));
            });

            // Add contents of the 'template' folder to the new zip file
            const templateFolder = {
                'customize.sh': 'customize.sh', 
                'uninstall.sh': 'uninstall.sh', 
                'META-INF/com/google/android/update-binary': 'META-INF/com/google/android/update-binary', 
                'META-INF/com/google/android/updater-script': 'META-INF/com/google/android/updater-script', 
                'common/functions.sh': 'common/functions.sh', 
                'common/install.sh': 'common/install.sh',
            };

            Object.values(templateFolder).forEach(fileName => {
                const filePath = './scripts/template/' + fileName;
                console.log('Adding file from template:', fileName);

                fetch(filePath)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch file: ' + fileName);
                        }
                        return response.blob();
                    })
                    .then(blob => {
                        return new Response(blob).arrayBuffer();
                    })
                    .then(arrayBuffer => {
                        const uint8Array = new Uint8Array(arrayBuffer);
                        newZip.file(fileName, uint8Array, { binary: true });
                    })
                    .catch(error => {
                        const errorMessage = `Error loading file ${fileName}: ${error}`;
                        console.error(errorMessage);
                        document.getElementById("info").innerHTML += "<b class='red'>" + errorMessage + "</b><br>";
                    });
            });

            // Making module.prop
            const customFile = {
                'module.prop': 'id=MGM \nname=MGM ' + ogZipTitleStripped + ' Modified by MagiskGApps \nversion=v0.1 \nversionCode=17 \nauthor=Wacko1805 \ndescription=MagiskGApps modified version of ' + ogZipTitleStripped + ' @ MagiskGApps.com/maker',
            };
            Object.keys(customFile).forEach(fileName => {
                const fileContent = customFile[fileName];
                console.log('Adding custom file:', fileName);
                newZip.file(fileName, fileContent, { binary: true });
            });

            // Wait for all promises to complete
            Promise.all(promises).then(function() {
                console.log('All files extracted successfully. Creating new zip file...');
                document.getElementById("info").innerHTML += '<h3>All files extracted. Creating new zip file...<br>This may take up to 5 minutes depending on the GApps package size, browser, and device.<h3><br>';
                
                newZip.generateAsync({type:'blob'}).then(function(blob) {
                    console.log('New zip file created. Downloading...');
                    document.getElementById("info").innerHTML += 'New zip file created. Downloading...<br>';
                    
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'MagiskGAppsMaker converted - ' + ogZipTitle + '.zip';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    console.log('Download complete.');
                    document.getElementById("info").innerHTML += 'Zip file made. File should download shortly!<br><h3 class="red">Want to support me for free? just visit the support page!</h3><a href="support.html"><button>Support me here</button></a>';
                }).catch(error => {
                    const errorMessage = 'Error generating zip file: ' + error;
                    console.log(errorMessage);
                    document.getElementById("info").innerHTML += "<b class='red'>" + errorMessage + "</b><br>";
                });
            }).catch(error => {
                const errorMessage = 'Error extracting files: ' + error;
                console.log(errorMessage);
                document.getElementById("info").innerHTML += "<b class='red'>" + errorMessage + "</b><br>";
            });
        }).catch(error => {
            const errorMessage = 'Error loading zip file: ' + error;
            console.log(errorMessage);
            document.getElementById("info").innerHTML += "<b class='red'>" + errorMessage + "</b><br>";
        });
    };
    reader.readAsArrayBuffer(file);
});
