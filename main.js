const params = new URLSearchParams(window.location.search);
const version = params.get('version');
const rssUrl = "https://corsanywhere.herokuapp.com/https://sourceforge.net/projects/magiskgapps/rss?path=/" + version;
const durl = "https://sourceforge.net/projects/magiskgapps/files/" + version;
const outputEl = document.getElementById("output");
const variantHeading = document.getElementById('variant');
variantHeading.textContent = `${version}:`;
fetch(rssUrl)
  .then((response) => response.text())
  .then((xmlString) => {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, "text/xml");
    const items = xml.querySelectorAll("item");
    
    const files = {};

    items.forEach((item) => {
      const link = item.querySelector("link").textContent;
      const pathParts = link.split("/");
      const fileName = pathParts[pathParts.length - 1];
      const subfolderName = pathParts[pathParts.length - 2];
      const subSubfolderName = pathParts[pathParts.length - 3];
      if (!files[subSubfolderName]) {
        files[subSubfolderName] = {};
      }
      if (!files[subSubfolderName][subfolderName]) {
        files[subSubfolderName][subfolderName] = [];
      }
      files[subSubfolderName][subfolderName].push({ name: subfolderName, link: `${durl}/${subSubfolderName}/${subfolderName}/${fileName}` });
    });

    for (const subSubfolderName in files) {
      const subSubfolderEl = document.createElement("div");
      subSubfolderEl.innerHTML = `<h2>${subSubfolderName}</h2>`;
      outputEl.appendChild(subSubfolderEl);

      for (const subfolderName in files[subSubfolderName]) {
        const subfolderEl = document.createElement("table");
        const tableHeader = document.createElement("thead");
        const tableBody = document.createElement("tbody");
        tableHeader.innerHTML = `<tr><th colspan="2">${subfolderName}</th></tr>`;
        subfolderEl.appendChild(tableHeader);
        subfolderEl.appendChild(tableBody);

        files[subSubfolderName][subfolderName].forEach((file) => {
          const rowEl = document.createElement("tr");
          const cell1El = document.createElement("td");
          const cell2El = document.createElement("td");
          cell1El.textContent = file.name;
          const fileLinkEl = document.createElement("a");
          fileLinkEl.textContent = "Download";
          fileLinkEl.href = file.link;
          cell2El.appendChild(fileLinkEl);
          rowEl.appendChild(cell1El);
          rowEl.appendChild(cell2El);
          tableBody.appendChild(rowEl);
        });

        subSubfolderEl.appendChild(subfolderEl);
      }
    }
  })
  .catch((error) => {
    console.error(error);
  });