let stream;
let lat, lon;
let map;
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');

async function startCamera() {
    stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
    });
    video.srcObject = stream;
}

function takePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    photo.src = canvas.toDataURL('image/jpeg');

    if (stream) {
        stream.getTracks().forEach((t) => t.stop());
    }

    getLocation();
}

function getLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;

        if (map) {
            map.remove();
        }

        map = L.map('map').setView([lat, lon], 16);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        L.marker([lat, lon])
            .addTo(map)
            .bindPopup('📸 Tu zrobiono zdjęcie')
            .openPopup();
    });
}

async function sharePhoto() {
    if (!photo.src || !lat || !lon) {
        alert('Najpierw zrób zdjęcie!');
        return;
    }

    const blob = await (await fetch(photo.src)).blob();
    const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

    const text = `Zdjęcie zrobione tutaj:
https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}`;

    try {
        await navigator.share({
            title: 'PhotoMap',
            text: text,
            files: [file],
        });
    } catch (err) {
        console.error('Błąd udostępniania:', err);
    }
}
