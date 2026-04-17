let stream;
let lat, lon;
let map;
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const placeholder = document.getElementById('placeholder');

async function startCamera() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
        });
        video.srcObject = stream;
    } catch (err) {
        console.error('Błąd kamery: ', err);
        alert('Nie udało się uzyskać dostępu do kamery.');
    }
}

function takePhoto() {
    if (!video.videoWidth) {
        alert('Włącz najpierw kamerę!');
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    photo.src = canvas.toDataURL('image/jpeg');

    photo.style.display = 'block';
    if (placeholder) placeholder.style.display = 'none';

    if (stream) {
        stream.getTracks().forEach((t) => t.stop());
    }

    getLocation();
}

function getLocation() {
    if (!navigator.geolocation) {
        alert('Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
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
                .bindPopup('📸 Tu znaleziono skrytkę!')
                .openPopup();
        },
        (err) => {
            console.error('Błąd geolokalizacji: ', err);
            alert('Nie udało się pobrać lokalizacji. Sprawdź uprawnienia GPS.');
        },
    );
}

async function sharePhoto() {
    if (!photo.src || !lat || !lon) {
        alert('Najpierw zrób zdjęcie i pobierz lokalizację!');
        return;
    }

    try {
        const blob = await (await fetch(photo.src)).blob();
        const file = new File([blob], 'geocache.jpg', { type: 'image/jpeg' });

        const text = `Znalazłem skrytkę! Moja lokalizacja:
https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}`;

        if (navigator.share) {
            await navigator.share({
                title: 'Geocache PWA',
                text: text,
                files: [file],
            });
        } else {
            alert(
                'Twoja przeglądarka nie obsługuje udostępniania plików. Link został skopiowany do schowka.',
            );
            navigator.clipboard.writeText(text);

            const link = document.createElement('a');
            link.href = photo.src;
            link.download = 'geocache.jpg';
            link.click();
        }
    } catch (err) {
        console.error('Błąd udostępniania:', err);
    }
}
