let klantData = [];
let origineleVolgorde = [];
let isTimeSort = true;
let warehouseList = [];
let currentLanguage = 'nl'; // Default language

const languageStrings = {
    nl: {
        title: 'Beheerssysteem',
        searchPlaceholder: 'Zoek naar een klant (naam, nummer of tijdslot)...',
        searchButton: 'Scan klantnummer',
        detailsButton: 'Details',
        mailButton: 'Verstuur email',
        sortTime: 'Op tijd',
        sortAlpha: 'Alfabetisch',
        tabCustomers: 'Klanten',
        tabWarehouses: 'Magazijnen',
        scrollTop: 'TOP',
        noTimeSlot: 'Geen tijdslot',
        preferences: 'Voorkeuren',
        customerNumber: 'Klantnummer',
        timeSlot: 'Tijdslot',
        warehouseSearchPlaceholder: 'Zoek naar een magazijn...',
        mapTooltip: 'Klik om te openen in Google Maps',
        processingImage: 'Verwerken van afbeelding...',
        noValidCustomerNumber: 'Geen geldig klantnummer gevonden in de afbeelding. Probeer opnieuw.',
        ocrError: 'Fout bij het verwerken van de afbeelding. Probeer het opnieuw.',
        noCustomerNumberFound: 'Geen geldig klantnummer gevonden in de tekst',
        addCustomer: 'Klant toevoegen',
        customerName: 'Klantnaam',
        customerNumberLabel: 'Klantnummer',
        timeSlotLabel: 'Tijdslot',
        preferencesLabel: 'Voorkeuren',
        locationLabel: 'Locatie',
        submitButton: 'Opslaan',
        adminPanel: 'Admin Paneel',
        adminPanelButton: 'Open Admin Paneel',
        closeButton: 'Sluiten'
    },
    en: {
        title: 'Management System',
        searchPlaceholder: 'Search for a customer (name, number or time slot)...',
        searchButton: 'Scan client number',
        detailsButton: 'Details',
        mailButton: 'Send email',
        sortTime: 'By Time',
        sortAlpha: 'Alphabetically',
        tabCustomers: 'Customers',
        tabWarehouses: 'Warehouses',
        scrollTop: 'TOP',
        noTimeSlot: 'No time slot',
        preferences: 'Preferences',
        customerNumber: 'Customer number',
        timeSlot: 'Time slot',
        warehouseSearchPlaceholder: 'Search for a warehouse...',
        mapTooltip: 'Click to open in Google Maps',
        processingImage: 'Processing image...',
        noValidCustomerNumber: 'No valid customer number found in the image. Please try again.',
        ocrError: 'Error processing the image. Please try again.',
        noCustomerNumberFound: 'No valid customer number found in the text',
        addCustomer: 'Add Customer',
        customerName: 'Customer Name',
        customerNumberLabel: 'Customer Number',
        timeSlotLabel: 'Time Slot',
        preferencesLabel: 'Preferences',
        locationLabel: 'Location',
        submitButton: 'Submit',
        adminPanel: 'Admin Panel',
        adminPanelButton: 'Open Admin Panel',
        closeButton: 'Close'
    },
    ro: {
        title: 'Sistem de gestionare',
        searchPlaceholder: 'Caută un client (nume, număr sau interval orar)...',
        searchButton: 'Scanează numărul clientului',
        detailsButton: 'Detalii',
        mailButton: 'Trimite email',
        sortTime: 'După oră',
        sortAlpha: 'Alfabetic',
        tabCustomers: 'Clienți',
        tabWarehouses: 'Depozite',
        scrollTop: 'TOP',
        noTimeSlot: 'Fără interval orar',
        preferences: 'Preferințe',
        customerNumber: 'Număr client',
        timeSlot: 'Interval orar',
        warehouseSearchPlaceholder: 'Caută un depozit...',
        mapTooltip: 'Click pentru a deschide în Google Maps',
        processingImage: 'Se procesează imaginea...',
        noValidCustomerNumber: 'Nu s-a găsit un număr de client valid în imagine. Vă rugăm să încercați din nou.',
        ocrError: 'Eroare la procesarea imaginii. Vă rugăm să încercați din nou.',
        noCustomerNumberFound: 'Nu s-a găsit un număr de client valid în text',
        addCustomer: 'Adaugă Client',
        customerName: 'Nume Client',
        customerNumberLabel: 'Număr Client',
        timeSlotLabel: 'Interval Orar',
        preferencesLabel: 'Preferințe',
        locationLabel: 'Locație',
        submitButton: 'Salvează',
        adminPanel: 'Panou Admin',
        adminPanelButton: 'Deschide Panou Admin',
        closeButton: 'Închide'
    }
};

function updateLanguage(lang) {
    currentLanguage = lang;
    for (const key in languageStrings[lang]) {
        const element = document.getElementById(key) || document.querySelector(`[data-${key}]`);
        if (element) {
            element.textContent = languageStrings[lang][key];
            if (key === 'searchPlaceholder') element.placeholder = languageStrings[lang][key];
        }
    }
    document.getElementById('current-language').textContent = lang.toUpperCase();
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('active');
        if (option.dataset.lang === lang) {
            option.classList.add('active');
        }
    });
    toonKlanten('', true); //refresh display after language change
}

document.addEventListener('DOMContentLoaded', initializeData);

function initializeData() {
    if (typeof customerData !== 'undefined' && customerData.customers) {
        klantData = customerData.customers;
        origineleVolgorde = klantData.map(klant => klant.id);
        console.log('Processed customer data:', klantData);
    } else {
        console.error('customerData is not defined or does not contain customers');
    }

    if (typeof warehouseData !== 'undefined' && warehouseData.warehouses) {
        warehouseList = warehouseData.warehouses;
        console.log('Processed warehouse data:', warehouseList);
    } else {
        console.error('warehouseData is not defined or does not contain warehouses');
    }

    toonKlanten('', true);
    toonMagazijnen();
    scrollNaarHuidigeTijd();
}

async function scrollNaarHuidigeTijd() {
    let currentTime = await getCurrentTimeInCET();
    
    // Check if currentTime is a valid Date object
    if (!(currentTime instanceof Date) || isNaN(currentTime)) {
        console.error('Invalid date received from API, using default time.');
        currentTime = new Date(); // Use current time as a fallback
    }
    
    const huidigeUur = currentTime.getHours();
    const tijdSlot = `${huidigeUur.toString().padStart(2, '0')}:00`;

    console.log('Zoeken naar tijdslot:', tijdSlot);

    setTimeout(() => {
        const klantenVanUur = document.querySelectorAll(`[data-timeslot^="${tijdSlot}"]`);
        if (klantenVanUur.length > 0) {
            console.log('Gevonden element:', klantenVanUur[0]);
            
            const searchContainer = document.querySelector('.search-container');
            const searchContainerHeight = searchContainer.offsetHeight;
            
            const elementRect = klantenVanUur[0].getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            const middleOfViewport = window.innerHeight / 2;
            
            window.scrollTo({
                top: absoluteElementTop - searchContainerHeight - 20,
                behavior: 'smooth'
            });
        } else {
            console.log('Geen element gevonden voor tijdslot:', tijdSlot);
        }
    }, 500);
}

async function getCurrentTimeInCET() {
    try {
        const response = await fetch('http://worldtimeapi.org/api/timezone/Europe/Berlin');
        const data = await response.json();
        const currentTime = new Date(data.datetime);
        console.log('Huidige tijd in CET:', currentTime);
        return currentTime;
    } catch (error) {
        console.error('Fout bij het ophalen van de tijd:', error);
        return null; // Return null if the API call fails
    }
}

function toonKlanten(filter = '', sorteer = true) {
    console.log('Displaying customers. Filter:', filter, 'Sort:', sorteer);
    const klantLijst = document.getElementById('klant-lijst');
    klantLijst.innerHTML = '';
    
    let klanten = klantData.filter(klant => 
        klant.name.toLowerCase().includes(filter.toLowerCase()) ||
        (klant.customerNumber && klant.customerNumber.includes(filter)) ||
        (klant.timeSlot && klant.timeSlot.toLowerCase().includes(filter.toLowerCase()))
    );

    if (sorteer) {
        klanten.sort((a, b) => {
            if (!a.timeSlot && !b.timeSlot) return 0;
            if (!a.timeSlot) return 1;
            if (!b.timeSlot) return -1;
            return a.timeSlot.localeCompare(b.timeSlot);
        });
    } else {
        klanten.sort((a, b) => a.name.localeCompare(b.name));
    }

    let div; // Declare div outside the loop
    klanten.forEach(klant => {
        div = document.createElement('div');
        div.className = 'klant-kader';
        div.id = `klant-${klant.id}`;
        div.dataset.timeslot = klant.timeSlot ? klant.timeSlot.split(' - ')[0] + '-' + klant.timeSlot.split(' - ')[1] : 'no-timeslot';

        div.innerHTML = `
            <div class="mb-4">
                <span class="font-semibold text-lg">${klant.name}</span><br>
                <span class="text-sm text-gray-500">${languageStrings[currentLanguage].customerNumber}: ${klant.customerNumber}</span><br>
                <span class="text-sm text-gray-500">${languageStrings[currentLanguage].timeSlot}: ${klant.timeSlot || languageStrings[currentLanguage].noTimeSlot}</span>
            </div>
            <div class="flex flex-wrap justify-between items-center">
                <button class="details-button flex-grow mr-2 mb-2" onclick="toonKlantInfo('${klant.id}')">${languageStrings[currentLanguage].detailsButton}</button>
                <button class="mail-button flex-grow mb-2" onclick="sendMail('${klant.id}')">${languageStrings[currentLanguage].mailButton}</button>
            </div>
        `;
        klantLijst.appendChild(div);
    });
}

function toonKlantInfo(klantId) {
    console.log('Displaying customer info for ID:', klantId);
    const klant = klantData.find(k => k.id === klantId);
    const klantDiv = document.getElementById(`klant-${klantId}`);
    
    const bestaandeDetails = klantDiv.querySelector('.klant-details');
    if (bestaandeDetails) {
        bestaandeDetails.remove();
        return;
    }

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'klant-details mt-4';
    detailsDiv.innerHTML = `
        <div class="w-full mb-4">
            <button class="back-button" onclick="verbergKlantInfo('${klantId}')">Back</button>
        </div>
        <div class="w-full">
            <h2 class="text-xl font-semibold mb-2">${klant.name}</h2>
            <p class="mb-2">${languageStrings[currentLanguage].customerNumber}: ${klant.customerNumber}</p>
            <p class="mb-2">${languageStrings[currentLanguage].timeSlot}: ${klant.timeSlot || languageStrings[currentLanguage].noTimeSlot}</p>
            <p class="mb-2">${languageStrings[currentLanguage].preferences}: ${klant.voorkeuren[currentLanguage] || 'No preferences specified'}</p>
        </div>
        <div id="map-${klantId}" class="w-full h-64 mt-4 cursor-pointer"></div>
    `;
    klantDiv.appendChild(detailsDiv);

    if (klant.locatie) {
        const [lat, lng] = klant.locatie.split(', ').map(parseFloat);
        const map = L.map(`map-${klantId}`).setView([lat, lng], 17);
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        }).addTo(map);
        L.marker([lat, lng]).addTo(map);

        map.on('click', function() {
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            window.open(googleMapsUrl, '_blank');
        });

        const mapElement = document.getElementById(`map-${klantId}`);
        mapElement.title = languageStrings[currentLanguage].mapTooltip;
    }
}

function verbergKlantInfo(klantId) {
    const klantDiv = document.getElementById(`klant-${klantId}`);
    const detailsDiv = klantDiv.querySelector('.klant-details');
    if (detailsDiv) {
        detailsDiv.remove();
    }
}

function sendMail(klantId) {
    const klant = klantData.find(k => k.id === klantId);
    const webhookUrl = 'https://vanlaethem.app.n8n.cloud/webhook/1b6bb0a1-bd55-4f9f-a5a1-f61a849f02a6';

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            customerName: klant.name,
            customerNumber: klant.customerNumber,
            message: `The customer ${klant.name} (Customer number: ${klant.customerNumber}) has been delivered.`
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Email sent successfully via n8n!');
        alert('Email sent successfully!');
    })
    .catch(error => {
        console.error('Error sending email via n8n:', error);
        alert('Error sending email. Please try again.');
    });
}

function toonMagazijnen(filter = '') {
    const magazijnLijst = document.getElementById('warehouse-lijst');
    magazijnLijst.innerHTML = '';
    
    const magazijnen = warehouseList.filter(magazijn => 
        magazijn.name.toLowerCase().includes(filter.toLowerCase()) ||
        magazijn.address.toLowerCase().includes(filter.toLowerCase())
    );

    magazijnen.forEach(magazijn => {
        const div = document.createElement('div');
        div.className = 'klant-kader';
        div.innerHTML = `
            <div class="mb-4">
                <span class="font-semibold text-lg">${magazijn.name}</span><br>
                <span class="text-sm text-gray-500">${magazijn.address}</span><br>
            </div>
            <button class="details-button" onclick="toonMagazijnInfo('${magazijn.id}')">${languageStrings[currentLanguage].detailsButton}</button>
        `;
        magazijnLijst.appendChild(div);
    });
}

function toonMagazijnInfo(magazijnId) {
    const magazijn = warehouseList.find(w => w.id === magazijnId);
    const magazijnDiv = document.querySelector(`[onclick="toonMagazijnInfo('${magazijnId}')"]`).parentNode;
    
    const bestaandeDetails = magazijnDiv.querySelector('.magazijn-details');
    if (bestaandeDetails) {
        bestaandeDetails.remove();
        return;
    }

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'magazijn-details mt-4';
    detailsDiv.innerHTML = `
        <p>Type: ${magazijn.type}</p>
        <div id="map-${magazijnId}" class="w-full h-64 mt-4">
            <div class="loading-indicator">Kaart wordt geladen...</div>
        </div>
    `;
    magazijnDiv.appendChild(detailsDiv);

    if (magazijn.location) {
        setTimeout(() => {
            const mapContainer = document.getElementById(`map-${magazijnId}`);
            mapContainer.innerHTML = '';

            const [lat, lng] = magazijn.location.split(', ').map(parseFloat);
            const map = L.map(`map-${magazijnId}`, {
                attributionControl: false,
                zoomControl: false
            }).setView([lat, lng], 17);

            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: ''
            }).addTo(map);

            L.marker([lat, lng]).addTo(map);

            map.invalidateSize();
        }, 100);
    }
}

// Event listeners en initialisatie
document.addEventListener('DOMContentLoaded', () => {
    const zoekInput = document.getElementById('klant-zoek');
    const clearSearch = document.getElementById('clear-search');
    const warehouseZoekInput = document.getElementById('warehouse-zoek');
    const clearWarehouseSearch = document.getElementById('clear-warehouse-search');
    const scrollTopButton = document.getElementById('scroll-top');
    const sortTimeButton = document.getElementById('sort-time');
    const sortAlphaButton = document.getElementById('sort-alpha');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const languageSelector = document.getElementById('language-selector');
    const languageDropdown = document.getElementById('language-dropdown');
    const languageOptions = document.querySelectorAll('.language-option');
    const adminPanelButton = document.getElementById('admin-panel-button');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdminPanelButton = document.getElementById('close-admin-panel');
    const addCustomerForm = document.getElementById('add-customer-form');

    zoekInput.addEventListener('focus', () => clearSearch.style.display = 'block');
    zoekInput.addEventListener('blur', () => {
        setTimeout(() => {
            if (zoekInput.value === '') {
                clearSearch.style.display = 'none';
            }
        }, 100);
    });
    zoekInput.addEventListener('input', (e) => {
        toonKlanten(e.target.value, isTimeSort);
        clearSearch.style.display = e.target.value ? 'block' : 'none';
    });

    clearSearch.addEventListener('click', () => {
        zoekInput.value = '';
        toonKlanten('', isTimeSort);
        zoekInput.focus();
    });

    sortTimeButton.addEventListener('click', () => {
        if (!isTimeSort) {
            isTimeSort = true;
            updateSortButtons();
            toonKlanten('', true);
        }
    });

    sortAlphaButton.addEventListener('click', () => {
        if (isTimeSort) {
            isTimeSort = false;
            updateSortButtons();
            toonKlanten('', false);
        }
    });

    scrollTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            scrollTopButton.style.display = 'flex';
        } else {
            scrollTopButton.style.display = 'none';
        }
    });

    warehouseZoekInput.addEventListener('input', (e) => {
        toonMagazijnen(e.target.value);
        clearWarehouseSearch.style.display = e.target.value ? 'block' : 'none';
    });

    clearWarehouseSearch.addEventListener('click', () => {
        warehouseZoekInput.value = '';
        toonMagazijnen();
        warehouseZoekInput.focus();
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Verwijder de actieve klasse van alle knoppen en inhoud
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Voeg de actieve klasse toe aan de geklikte knop en de bijbehorende inhoud
            button.classList.add('active');
            const contentId = `${button.id.split('-')[1]}-content`;
            document.getElementById(contentId).classList.add('active');

            // Laad de juiste data op basis van de geselecteerde tab
            if (button.id === 'tab-customers') {
                toonKlanten(); // Zorg ervoor dat deze functie de klanten weergeeft
            } else if (button.id === 'tab-warehouses') {
                toonMagazijnen(); // Zorg ervoor dat deze functie de magazijnen weergeeft
            }
        });
    });

    // Move the language selector event listener here
    if (languageSelector) {
        languageSelector.addEventListener('click', () => {
            languageDropdown.classList.toggle('hidden');
        });
    }

    languageOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            updateLanguage(lang);
            languageDropdown.classList.add('hidden');
        });
    });

    if (adminPanelButton) {
        adminPanelButton.addEventListener('click', () => {
            adminPanel.classList.remove('hidden');
        });
    }

    if (closeAdminPanelButton) {
        closeAdminPanelButton.addEventListener('click', () => {
            adminPanel.classList.add('hidden');
        });
    }

    if (addCustomerForm) {
        addCustomerForm.addEventListener('submit', handleFormSubmit);
    }

    initializeData();
});

function updateSortButtons() {
    document.getElementById('sort-time').classList.toggle('active', isTimeSort);
    document.getElementById('sort-alpha').classList.toggle('active', !isTimeSort);
}

function handleFormSubmit(event) {
    event.preventDefault();

    const customerName = document.getElementById('customer-name').value;
    const customerNumber = document.getElementById('customer-number').value;
    const timeSlot = document.getElementById('time-slot').value;
    const preferences = document.getElementById('preferences').value;
    const location = document.getElementById('location').value;

    const newCustomer = {
        id: customerName.toLowerCase().replace(/ /g, '-'),
        name: customerName,
        customerNumber: customerNumber,
        timeSlot: timeSlot,
        voorkeuren: {
            nl: preferences,
            en: preferences,
            ro: preferences
        },
        locatie: location
    };

    klantData.push(newCustomer);
    origineleVolgorde.push(newCustomer.id);

    // Update customerData.js
    updateCustomerDataFile();

    toonKlanten('', isTimeSort);
    adminPanel.classList.add('hidden');
    addCustomerForm.reset();
}

function updateCustomerDataFile() {
    const updatedCustomerData = { customers: klantData };
    const jsonString = JSON.stringify(updatedCustomerData, null, 2);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customerData.js';

    // Append the link to the document
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);

    // Revoke the URL
    URL.revokeObjectURL(url);
}
