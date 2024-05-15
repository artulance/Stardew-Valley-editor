let xmlNodes = [];
let currentPage = 1;
const pageSize = 1; // Mostrar un elemento del nodo principal por página
let principalNode = null; // El nodo principal del archivo XML

function loadFile() {
  const fileInput = document.getElementById('fileInput');
  fileInput.click();
  fileInput.addEventListener('change', function() {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      const xmlString = event.target.result;
      xmlNodes = parseXML(xmlString);
      currentPage = 1; // Reiniciar la página actual al cargar un nuevo archivo
      displayPage(currentPage);
      document.getElementById('saveBtn').style.display = 'block';
    };
    reader.readAsText(file);
  });
}

function parseXML(xmlString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  principalNode = xmlDoc.documentElement; // Guardar el nodo principal
  const nodes = principalNode.childNodes;
  return Array.from(nodes).filter(node => node.nodeType === Node.ELEMENT_NODE);
}

function displayPage(pageNumber) {
  const table = document.getElementById('xmlTable');
  table.innerHTML = ''; // Clear previous content

  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageNodes = Array.from(principalNode.childNodes).filter((node, index) => index >= startIndex && index < endIndex);

  const rows = ['<tr><th>Node</th><th>Value</th></tr>'];
  pageNodes.forEach(node => {
    parseNode(node, rows);
  });
  table.innerHTML = rows.join('');

  document.getElementById('currentPage').textContent = pageNumber;
  document.getElementById('totalPages').textContent = Math.ceil(principalNode.childNodes.length / pageSize);
  updatePaginationButtons();
}

function parseNode(node, rows, indent = 0) {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const nodeName = node.nodeName;
    const nodeValue = getNodeValue(node);
    rows.push(`<tr><td style="padding-left: ${indent * 20}px">${nodeName}</td><td contenteditable="true">${nodeValue}</td></tr>`);
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
      parseNode(children[i], rows, indent + 1);
    }
  }
}

function getNodeValue(node) {
  if (node.childNodes.length === 1 && node.firstChild.nodeType === Node.TEXT_NODE) {
    return node.firstChild.nodeValue.trim();
  }
  return '';
}

function updatePaginationButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (currentPage === 1) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }

  if (currentPage * pageSize >= principalNode.childNodes.length) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
}

function nextPage() {
  currentPage++;
  displayPage(currentPage);
}

function prevPage() {
  currentPage--;
  displayPage(currentPage);
}

function goToPage() {
    const pageInput = document.getElementById('pageInput');
    let pageNumber = parseInt(pageInput.value);
    if (pageNumber < 1) {
      pageNumber = 1;
    } else if (pageNumber > Math.ceil(principalNode.childNodes.length / pageSize)) {
      pageNumber = Math.ceil(principalNode.childNodes.length / pageSize);
    }
    currentPage = pageNumber;
    displayPage(currentPage);
}

function saveFile() {
    const fileInput = document.getElementById('fileInput');
    const fileName = fileInput.files[0].name; // Obtener el nombre del archivo cargado
    const lastDotIndex = fileName.lastIndexOf('.');
    let fileExtension = '';
    let typeFile = 'application/octet-stream';
    if (lastDotIndex !== -1) {
      fileExtension = fileName.substring(lastDotIndex); // Obtener la extensión del archivo
    }
  
    let fileNameWithoutExtension = fileName;
    if (fileExtension.toLowerCase() === '.xml') {
        typeFile = 'text/xml';
        fileNameWithoutExtension = fileName.substring(0, lastDotIndex); // Eliminar la extensión .xml
    }
  
    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlString += principalNode.outerHTML; // Agregar el nodo principal y su contenido
    const blob = new Blob([xmlString], { type:  typeFile});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
  
    // Establecer el nombre de descarga según la extensión del archivo original
    a.download = fileNameWithoutExtension + fileExtension;
  
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }