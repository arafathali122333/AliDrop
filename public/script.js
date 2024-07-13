const fileInput = document.getElementById('fileInput');
const sendButton = document.getElementById('sendButton');
const devices = document.getElementById('devices');
const messages = document.getElementById('messages');

let connectedDevices = [];

const ws = new WebSocket(`wss://${location.host}`);

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'clients') {
        updateDevices(data.clients);
    } else if (data.type === 'file') {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = 'data:application/octet-stream;base64,' + data.fileContent;
        link.download = data.fileName;
        link.textContent = `Download ${data.fileName} from ${data.senderId}`;
        li.appendChild(link);
        messages.appendChild(li);
    }
};

sendButton.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const arrayBuffer = event.target.result;
            const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            ws.send(JSON.stringify({ type: 'file', fileName: file.name, fileContent: base64String }));
        };
        reader.readAsArrayBuffer(file);
    }
});

function updateDevices(clients) {
    connectedDevices = clients;
    devices.innerHTML = '';
    connectedDevices.forEach(client => {
        const li = document.createElement('li');
        li.className = 'device';
        li.textContent = `${client.address} (ID: ${client.id})`;
        devices.appendChild(li);
    });
}
