// MindTheGApps Script
$('#extractButton').click(function() {
    const fileInput = document.getElementById('zipFileInput');
    const files = fileInput.files;
    if (files.length === 0) {
        alert('Please select a file to extract.');
        return;
    }
    
    const file = files[0];
    const reader = new FileReader();
    const newZip = new JSZip();
    let ogZipTitle = file.name;
    reader.onload = function(e) {
        console.log('File loaded. Extracting...');
        document.getElementById("info").innerHTML += "File loaded. Extracting...<br>";
        const zip = new JSZip();
        zip.loadAsync(e.target.result).then(function(zipFiles) {
            const promises = [];
            zip.forEach(function(relativePath, zipEntry) {
                console.log('Processing file:', relativePath);
                document.getElementById("info").innerHTML += '<b>Processing file: </b>' + relativePath + '<br>';
                if (relativePath.startsWith('system/')) {
                    // Extracting files from the 'system' folder to maintain original structure
                    const targetPath = 'system/' + relativePath.split('system/')[1];
                    console.log('Extracting to:', targetPath);
                    document.getElementById("info").innerHTML += 'Extracting File: ' + targetPath + '<br>';
                    promises.push(zipEntry.async('blob').then(function(blob) {
                        newZip.file(targetPath, blob);
                    }));
                }
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
                document.getElementById("info").innerHTML += '<h3>All files extracted. Creating new zip file...(This may take up to 5 minutes)<h3><br>';
                newZip.generateAsync({type:'blob'}).then(function(blob) {
                    console.log('New zip file created. Downloading...');
                    document.getElementById("info").innerHTML += 'New zip file created. Downloading...<br>';
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'MagiskGAppsMaker converted - '+ ogZipTitle +'.zip';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                    console.log('Download complete.');
                    document.getElementById("info").innerHTML += 'Download complete.<br>';
                });
            });
        });
    };
    reader.readAsArrayBuffer(file);
});
