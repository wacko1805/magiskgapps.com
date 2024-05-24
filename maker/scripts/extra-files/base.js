// BASE Script

$('#extractButton').click(function() {
    console.log('BASE Selected.');
    document.getElementById("info").innerHTML += "BASE Selected. <br>";

    const fileInput = document.getElementById('zipFileInput');
    const files = fileInput.files;
    if (files.length === 0) {
        console.log('Please select a file to extract.');
        document.getElementById("info").innerHTML += "<b class='red'>Please select a file to extract!</p><br>";
        return;
    }
    
    const file = files[0];
    const reader = new FileReader();
    const newZip = new JSZip(); // Define newZip here
    let ogZipTitle = file.name; // Store the name of the original zip file
    let ogZipTitleStripped = ogZipTitle.replace('.zip','')
    
            
// Add contents of the 'template' folder to the new zip file
const templateFolder = {
    'customize.sh': 'customize.sh', 
    'uninstall.sh': 'uninstall.sh', 
    'META-INF/update-binary': 'META-INF/com/google/android/update-binary', 
    'META-INF/updater-script': 'META-INF/com/google/android/updater-script', 
    'common/functions.sh': 'common/functions.sh', 
    'common/install.sh': 'common/install.sh', 
    // Add more files as needed
};

Object.values(templateFolder).forEach(fileName => {
    // Assuming the files are in the same directory as your HTML file
    const filePath = './scripts/template/' + fileName;

    fetch(filePath)
        .then(response => response.blob())
        .then(blob => {
            // Convert blob to array buffer
            return new Response(blob).arrayBuffer();
        })
        .then(arrayBuffer => {
            // Create a Uint8Array from array buffer
            const uint8Array = new Uint8Array(arrayBuffer);
            // Add file to zip
            newZip.file(fileName, uint8Array, { binary: true });
        })
        .catch(error => {
            console.error(`Error loading file ${fileName}: ${error}`);
            document.getElementById("info").innerHTML += '<b class="red">Error loading file ' + fileName + ' : ' + error + '<b><br>';
        });
});

// making module.prop

            // Add contents of the 'template' folder to the new zip file
            const customFile = {
                'module.prop': 'id=MGM \n name=MGM '+ ogZipTitleStripped +' Modified by MagiskGApps \n version=v0.1 \n versionCode=17 \n author=Wacko1805 \n description=MagiskGApps modified version of '+ ogZipTitleStripped +' @ MagiskGApps.com/maker',                 // Add more files as needed
            };
            Object.keys(customFile).forEach(fileName => {
                const fileContent = customFile[fileName];
                newZip.file(fileName, fileContent, { binary: true });
            });

            Promise.all(promises).then(function() {
                console.log('All files extracted. Creating new zip file...');
                document.getElementById("info").innerHTML += '<h3>All files extracted. Creating new zip file...<br>This may take up to 5 minutes depending on the GApps package size, browser and device.<h3><br>';
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
                    document.getElementById("info").innerHTML += 'Zip file made. File should download shortly!<br>';
                });
            });
        });
    };
    reader.readAsArrayBuffer(file);
});