// =============================================================
// 1. CONFIGURATION & DONNÉES
// =============================================================
let activites = JSON.parse(localStorage.getItem('sport_data')) || [];
let typeEnCours = "K"; 
let idEnCours = null;
let coordEnCours = null;
let dernierGPSConnu = null;

// Éléments DOM
const modal = document.getElementById('modal');
const distanceInput = document.getElementById('distanceInput');
const locationNameInput = document.getElementById('locationNameInput');

// =============================================================
// 2. NAVIGATION
// =============================================================
function changerVue(vue) {
    const views = {
        marathon: document.getElementById('view-marathon'),
        map: document.getElementById('view-map'),
        trophies: document.getElementById('view-trophies')
    };
    
    const btns = {
        marathon: document.getElementById('btn-nav-marathon'),
        map: document.getElementById('btn-nav-map'),
        trophies: document.getElementById('btn-nav-trophies')
    };

    const cursor = document.getElementById('nav-cursor');

    // 1. GESTION DU SLIDE (Curseur)
    if (vue === 'marathon') cursor.style.transform = 'translateX(0%)';
    else if (vue === 'map') cursor.style.transform = 'translateX(100%)';
    else if (vue === 'trophies') cursor.style.transform = 'translateX(200%)';

    // 2. GESTION DES VUES (Afficher/Cacher)
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[vue].classList.remove('hidden');

    // 3. GESTION DES BOUTONS (Couleur texte)
    Object.keys(btns).forEach(key => {
        const btn = btns[key];
        if (key === vue) {
            btn.classList.remove('text-slate-400', 'hover:text-slate-600');
            btn.classList.add('text-white');
        } else {
            btn.classList.remove('text-white');
            btn.classList.add('text-slate-400', 'hover:text-slate-600');
        }
    });

    // =========================================================
    // 4. GESTION INTELLIGENTE DU GPS (Le Correctif)
    // =========================================================
    
    // Si on va sur la MAP
    if (vue === 'map') {
        initMap(); // Crée la carte si elle n'existe pas encore
        
        // On FORCE le redémarrage du GPS de la carte
        if (mapInstance) {
            mapInstance.locate({watch: true, enableHighAccuracy: true});
            setTimeout(() => { mapInstance.invalidateSize(); }, 300);
        }
    } 
    // Si on n'est PAS sur la map (Stats ou Trophées)
    else {
        // On COUPE le GPS de la carte pour libérer la ressource
        if (mapInstance) {
            mapInstance.stopLocate();
        }
        
        // Si on va sur Trophées, on charge la liste
        if (vue === 'trophies') {
            chargerTrophees();
        }
    }
}

// =============================================================
// 3. FONCTIONS DE SAISIE & INTERFACE
// =============================================================

function vibrer(type) {
    if (!window.navigator.vibrate) return;
    if (type === "succès") window.navigator.vibrate([50, 30, 50]);
    else if (type === "pile") window.navigator.vibrate(200);
}

// Nouvelle fonction pour gérer visuellement le choix 🦄 ou 3️⃣ dans la modale
function changerTypeSaisie(nouveauType) {
    typeEnCours = nouveauType;
    const btnK = document.getElementById('btn-select-K');
    const btn3 = document.getElementById('btn-select-3');

    if (typeEnCours === 'K') {
        btnK.className = "flex-1 py-3 rounded-xl border-2 border-purple-500 bg-purple-100 text-2xl transition-all shadow-inner";
        btn3.className = "flex-1 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-2xl transition-all opacity-50";
    } else {
        btn3.className = "flex-1 py-3 rounded-xl border-2 border-blue-600 bg-blue-100 text-2xl transition-all shadow-inner";
        btnK.className = "flex-1 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-2xl transition-all opacity-50";
    }
}

// =============================================================
// FONCTIONS UTILITAIRES POUR LE GPS & AUTOCOMPLETE
// =============================================================

// 1. Mathématiques (Calcul de distance)
function getDistanceEnMetres(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 2. Détection Intelligente
function detecterLieuEtAutocomplet() {
    const input = document.getElementById('locationNameInput');
    const datalist = document.getElementById('lieux-connus');
    const hint = document.getElementById('gpsHint');
    
    // Reset visuel
    if(input) {
        input.value = "";
        input.classList.remove('border-green-500', 'bg-green-50');
    }
    if(hint) hint.classList.add('hidden');

    // Construire la liste (inchangé)
    const lieuxUniques = {};
    activites.forEach(a => {
        if (a.nom && a.lat && a.lng) lieuxUniques[a.nom] = { lat: a.lat, lng: a.lng };
    });
    if(datalist) datalist.innerHTML = Object.keys(lieuxUniques).map(nom => `<option value="${nom}">`).join('');

    // --- LA LOGIQUE HYBRIDE ---

    // Fonction interne pour traiter une position (qu'elle vienne de la mémoire ou du GPS)
    const traiterPosition = (lat, lng) => {
        // Mise à jour de la coordonnée pour la validation future
        coordEnCours = { lat: lat, lng: lng };
        
        // Mise à jour de la mémoire au cas où
        dernierGPSConnu = { lat: lat, lng: lng };

        let meilleurMatch = null;
        let distanceMin = 50; 

        for (const [nom, coords] of Object.entries(lieuxUniques)) {
            const distance = getDistanceEnMetres(lat, lng, coords.lat, coords.lng);
            if (distance < distanceMin) {
                distanceMin = distance;
                meilleurMatch = nom;
            }
        }

        if (meilleurMatch && input) {
            input.value = meilleurMatch;
            if(hint) hint.classList.remove('hidden');
            input.classList.add('border-green-500', 'bg-green-50');
        }
    };

    // STRATÉGIE :
    // 1. Si on a une position en mémoire récente (la carte était ouverte il y a peu), on l'utilise direct.
    if (dernierGPSConnu) {
        console.log("🚀 Utilisation du GPS en cache (Map)");
        traiterPosition(dernierGPSConnu.lat, dernierGPSConnu.lng);
    } 
    // 2. Sinon, on demande au navigateur (avec option 'maximumAge' pour récupérer un cache système si dispo)
    else if (navigator.geolocation) {
        console.log("📡 Demande GPS fraîche...");
        navigator.geolocation.getCurrentPosition(pos => {
            traiterPosition(pos.coords.latitude, pos.coords.longitude);
        }, (err) => {
            console.log("Erreur GPS :", err);
        }, { 
            enableHighAccuracy: true, 
            timeout: 5000,
            maximumAge: 60000 // Accepte une position vieille d'1 minute max
        });
    }
}

// =============================================================
// FONCTION D'OUVERTURE DE POPUP (Corrigée)
// =============================================================

function ouvrirPopup(typeDefaut, coords = null, nomPredefini = "") {
    idEnCours = null; 
    
    // On s'assure de récupérer les éléments frais du DOM
    const inputNom = document.getElementById('locationNameInput');
    const inputDist = document.getElementById('distanceInput');
    const modalEl = document.getElementById('modal');

    // Gestion du type et des étoiles
    if(typeof changerTypeSaisie === "function") changerTypeSaisie(typeDefaut || 'K');
    if(typeof changerNote === "function") changerNote(0); 

    // Titre
    const titreEl = document.getElementById('modalTitle');
    if(titreEl) {
        titreEl.innerText = coords 
            ? (nomPredefini ? "Ajouter à " + nomPredefini : "Nouveau lieu") 
            : "Ajouter une distance";
    }
    
    // Logique Principale
    if (coords) {
        // Cas 1 : Clic sur la carte (Manuel)
        coordEnCours = coords;
        if(inputNom) inputNom.value = nomPredefini;
        // On cache l'indice GPS si on force un lieu
        const hint = document.getElementById('gpsHint');
        if(hint) hint.classList.add('hidden');
    } else {
        // Cas 2 : Bouton "+" (Automatique)
        // On lance la détection
        detecterLieuEtAutocomplet();
    }
    
    // Affichage
    if(modalEl) modalEl.classList.remove('hidden');
    if(inputDist) inputDist.focus();
}

function modifierLigne(id) {
    const ligne = activites.find(a => a.id === id);
    if (ligne) {
        idEnCours = id;
        coordEnCours = null; 
        changerTypeSaisie(ligne.type);
        
        document.getElementById('modalTitle').innerText = "Modifier l'entrée";
        distanceInput.value = (ligne.valeurMetres * 100).toFixed(0);
        locationNameInput.value = ligne.nom || "";
        
        modal.classList.remove('hidden');
        distanceInput.focus();
    }
}

function fermerPopup() {
    modal.classList.add('hidden');
    distanceInput.value = "";
    locationNameInput.value = "";
    coordEnCours = null;
}

function validerSaisie() {
    console.log("🟢 Clic sur Valider..."); // Pour vérifier que le bouton marche

    // 1. On récupère les éléments HTML proprement
    const inputDist = document.getElementById('distanceInput');
    const inputNom = document.getElementById('locationNameInput');

    // Sécurité : si le HTML est cassé
    if (!inputDist || !inputNom) {
        alert("Erreur : Impossible de trouver les champs de saisie dans le HTML.");
        return;
    }

    // 2. Récupération des valeurs
    const valTexte = inputDist.value;
    const cm = parseFloat(valTexte);
    const nomLieu = inputNom.value.trim();

    console.log("Valeur saisie :", cm, "Nom :", nomLieu);

    // 3. Vérification de la validité (Doit être un nombre positif)
    if (!isNaN(cm) && cm >= 0) {
        const metres = cm / 100;
        
        if (idEnCours !== null) {
            // --- MODE MODIFICATION ---
            const index = activites.findIndex(a => a.id === idEnCours);
            if (index !== -1) {
                if (cm === 0) {
                    activites.splice(index, 1);
                } else {
                    activites[index].valeurMetres = metres;
                    activites[index].type = typeEnCours;
                    // On garde la note si elle existe, sinon on met celle en cours
                    activites[index].note = (typeof noteEnCours !== 'undefined') ? noteEnCours : 0;
                    if(nomLieu) activites[index].nom = nomLieu;
                }
            }
        } else if (cm > 0) {
            // --- MODE CRÉATION ---
            
            // Par défaut : coordonnées GPS actuelles (ou nulles)
            let finalLat = coordEnCours ? coordEnCours.lat : null;
            let finalLng = coordEnCours ? coordEnCours.lng : null;

            // REGROUPEMENT : On vérifie si ce nom existe déjà
            if (nomLieu) {
                // On cherche un lieu avec le même nom (insensible à la casse) et qui a des coordonnées
                const lieuExistant = activites.find(a => 
                    a.nom && 
                    a.nom.toLowerCase() === nomLieu.toLowerCase() && 
                    a.lat && a.lng
                );
                
                if (lieuExistant) {
                    // On s'aligne sur l'existant
                    finalLat = lieuExistant.lat;
                    finalLng = lieuExistant.lng;
                    console.log("📍 Regroupement avec : " + nomLieu);
                }
            }

            activites.unshift({
                id: Date.now(),
                date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                type: typeEnCours, // Variable globale définie dans script.js
                valeurMetres: metres,
                nom: nomLieu,
                note: (typeof noteEnCours !== 'undefined') ? noteEnCours : 0,
                lat: finalLat,
                lng: finalLng
            });
        }
        
        // 4. Sauvegarde et fermeture
        sauvegarderEtAfficher();
        fermerPopup();
        
        // Rafraîchir la carte si elle est chargée
        if (typeof mapInstance !== 'undefined' && mapInstance) {
            chargerMarqueurs();
        }
    } else {
        alert("Veuillez entrer une distance valide (chiffre).");
    }
}

function resetData() {
    if(confirm("Effacer tout l'historique ?")) {
        activites = [];
        sauvegarderEtAfficher();
        if(mapInstance) chargerMarqueurs();
    }
}

// =============================================================
// 4. LOGIQUE PRINCIPALE
// =============================================================

function sauvegarderEtAfficher() {
    localStorage.setItem('sport_data', JSON.stringify(activites));
    
    let sumK = 0, sum3 = 0, html = "";

    activites.forEach(act => {
        const isK = act.type === "K";
        if(isK) sumK += act.valeurMetres; else sum3 += act.valeurMetres;
        const valCm = (act.valeurMetres * 100).toFixed(0);
        const lieuHTML = act.nom ? `<span class="block text-[10px] text-slate-500 italic">📍 ${act.nom}</span>` : '';

        html += `
            <div onclick="modifierLigne(${act.id})" class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm active:bg-slate-50">
                <div class="flex items-center gap-3">
                    <span class="text-xl">${isK ? '🦄' : '3️⃣'}</span>
                    <div>
                        <span class="text-[10px] text-slate-400 font-medium">${act.date}</span>
                        ${lieuHTML}
                    </div>
                </div>
                <p class="font-black text-slate-800">${valCm} <span class="text-[10px] font-normal text-slate-500 uppercase">cm</span></p>
            </div>`;
    });

    const totalGeneral = sumK + sum3;
    
    // --- BIBLIO (Abrégée pour lisibilité, remets ta liste complète ici si besoin) ---
    const megaBiblio = [
         { t: 0.02, n: "un fader de table de mixage 🎚️" },
        { t: 0.05, n: "un bouchon d'oreille 👂" },
        { t: 0.12, n: "un disque vinyle 7 pouces 💿" },
        { t: 0.30, n: "un vinyle 12 pouces (Maxi) 🎶" },
        { t: 0.45, n: "une platine Technics SL-1200 🎧" },
        { t: 1.00, n: "un câble XLR de 1 mètre 🔌" },
        { t: 1.57, n: "Fleur" },
        { t: 1.63, n: "Sara / Peggy Gou" },
        { t: 1.65, n: "Anaïs" },
        { t: 1.70, n: "Gabriel / Charlotte de Witte " },
        { t: 1.77, n: "Amelie Lens" },
        { t: 1.83, n: "Carl Cox" },
        { t: 1.88, n: "Jolan / un caisson de basse Funktion-One" },
        { t: 1.93, n: "Nolan / un vigile" },
        { t: 2.50, n: "une colonne du Palais Longchamp 🏛️" },
        { t: 5.00, n: "la statue du David (Prado) 🗿" },
        { t: 5.26, n: "la statue de la liberté 🗽" },        
        // --- LE VENTRE MOU (5m - 20m) ---
        { t: 5.26, n: "la tête de la Statue de la Liberté (menton-crâne) 🗽" },
        { t: 5.50, n: "une limousine de mariage 🥂" },
        { t: 6.17, n: "Lolong, le plus grand crocodile capturé 🐊" },
        { t: 6.26, n: "le saut à la perche de Duplantis (WR) 🥖" },
        { t: 6.66, n: "Barbe Blanche (One Piece) 🏴‍☠️" },
        { t: 7.32, n: "la largeur exacte d'un but de foot ⚽" },
        { t: 7.62, n: "le Camping-Car de Breaking Bad 🚐" },
        { t: 8.95, n: "le record du monde de saut en longueur 👟" },
        { t: 9.15, n: "la distance du mur sur un coup-franc 👮" },
        { t: 10.97, n: "la largeur d'un court de tennis (double) 🎾" },
        { t: 11.23, n: "un bus de la RTM (Standard) 🚌" },
        { t: 12.19, n: "un conteneur maritime 40 pieds 🚢" },
        { t: 13.76, n: "un T-Rex (le spécimen Scotty) 🦖" },
        { t: 14.00, n: "un grand palmier du Vieux-Port 🌴" },
        { t: 15.00, n: "un terrain de pétanque (longueur max) 🔵" },
        { t: 16.50, n: "la surface de réparation (profondeur) 🥅" },
        { t: 18.29, n: "une piste de Bowling (foul line -> quille) 🎳" },
        { t: 18.44, n: "la distance Lanceur-Batteur au Baseball ⚾" },
        { t: 19.05, n: "la distance entre les bases (Baseball) 🏃" },

        // --- LES GÉANTS ---
        { t: 25.0, n: "le bus 83 qui longe la Corniche 🚌" },
        { t: 30.0, n: "une Baleine Bleue 🐳" },
        { t: 33.0, n: "le Christ Rédempteur (Rio) 🇧🇷" },
        { t: 45.0, n: "le Château d'If (hauteur) 🏰" },
        { t: 60.0, n: "le toit de l'Orange Vélodrome 🏟️" },
        { t: 86.0, n: "la Grande Roue du Vieux-Port 🎡" },
        { t: 149, n: "le sommet de Notre-Dame de la Garde ⛪" },
        { t: 161, n: "la Tour CMA CGM 🏙️" },
        { t: 300, n: "la file du Berghain 🇩🇪" },
        { t: 324, n: "la Tour Eiffel 🗼" },
        { t: 828, n: "le Burj Khalifa 🏗️" },
        { t: 1000, n: "1 km (Stop it Xays)" },
        { t: 42195, n: "UN MARATHON (C'est une blague ?)" },
    ];

    let meilleurMatch = megaBiblio[0];
    let diffMin = Math.abs(totalGeneral - megaBiblio[0].t);
    megaBiblio.forEach(item => {
        let diff = Math.abs(totalGeneral - item.t);
        if (diff < diffMin) { diffMin = diff; meilleurMatch = item; }
    });

    const ecart = Math.abs(totalGeneral - meilleurMatch.t);
    let msg = "";
    if (ecart < 0.005 && totalGeneral > 0) {
        msg = `C'est <b>exactement</b> la taille de <b>${meilleurMatch.n}</b> ! 🎯`;
        vibrer("pile");
    } else {
        const ratio = (totalGeneral / (meilleurMatch.t || 1)).toFixed(1);
        msg = totalGeneral > 0 ? `C'est environ <b>${ratio} x</b> la taille de <b>${meilleurMatch.n}</b>` : "En attente de data...";
    }

    let prochain = megaBiblio.find(item => item.t > totalGeneral) || megaBiblio[megaBiblio.length - 1];
    let actuelPourBarre = [...megaBiblio].reverse().find(item => item.t <= totalGeneral) || megaBiblio[0];
    let pourcent = ((totalGeneral - actuelPourBarre.t) / (prochain.t - actuelPourBarre.t)) * 100;

    document.getElementById('totalK').innerText = sumK.toFixed(2) + " m";
    document.getElementById('total3').innerText = sum3.toFixed(2) + " m";
    document.getElementById('totalGeneral').innerText = totalGeneral.toFixed(2) + " m";
    document.getElementById('funFact').innerHTML = msg;
    document.getElementById('progressBar').style.width = (totalGeneral >= 1000 ? 100 : Math.max(0, Math.min(pourcent, 100))) + "%";
    document.getElementById('nextMilestone').innerText = totalGeneral < 1000 ? `Cap : ${prochain.n}` : "Gros record ! 🏆";
    document.getElementById('listeActivites').innerHTML = html || "<p class='text-center text-slate-400 py-4 text-sm'>Ajoute ta première distance</p>";
}

// =============================================================
// 5. GESTION DE LA CARTE (Regroupement des points)
// =============================================================

let mapInstance = null;
let userMarker = null;

function initMap() {
    if (mapInstance) return;

    mapInstance = L.map('map', { zoomControl: false }).setView([46.603354, 1.888334], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap', subdomains: 'abcd', maxZoom: 20
    }).addTo(mapInstance);

    mapInstance.on('click', function(e) {
        ouvrirPopup('K', e.latlng);
    });

    // On lance le suivi
    mapInstance.locate({watch: true, enableHighAccuracy: true});
    
    mapInstance.on('locationfound', function(e) {
        // 1. ON SAUVEGARDE LA POSITION DANS LA MÉMOIRE GLOBALE
        dernierGPSConnu = { lat: e.latlng.lat, lng: e.latlng.lng };

        if (!userMarker) {
            const iconUser = L.divIcon({ className: 'user-location-dot', html: '<div class="dot"></div><div class="pulse"></div>', iconSize: [20, 20] });
            userMarker = L.marker(e.latlng, {icon: iconUser}).addTo(mapInstance);
            mapInstance.flyTo(e.latlng, 16); 
        } else {
            userMarker.setLatLng(e.latlng);
        }
    });
    
    // Ajout : Gestion d'erreur GPS sur la carte
    mapInstance.on('locationerror', function(e) {
        console.log("Erreur GPS Map:", e.message);
    });

    chargerMarqueurs();
    setTimeout(() => { mapInstance.invalidateSize(); }, 200);
}

// Fonction spéciale pour ajouter à un endroit déjà existant
// Elle est appelée depuis le bouton HTML dans la popup du marqueur
window.ajouterSurLieuExistant = function(lat, lng, nomEncode) {
    const nom = decodeURIComponent(nomEncode);
    // On ouvre la popup avec ces coordonnées et ce nom
    ouvrirPopup('K', { lat: lat, lng: lng }, nom);
};

function chargerMarqueurs() {
    if (!mapInstance) return;

    // 1. Nettoyage
    mapInstance.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer !== userMarker) {
            mapInstance.removeLayer(layer);
        }
    });

    // 2. REGROUPEMENT (CLUSTERING)
    // On crée un dictionnaire où la clé est "lat,lng"
    const lieux = {};

    activites.forEach(act => {
        if (act.lat && act.lng) {
            const key = `${act.lat},${act.lng}`;
            
            if (!lieux[key]) {
                lieux[key] = {
                    lat: act.lat,
                    lng: act.lng,
                    nom: act.nom || "Lieu mystère",
                    totalMetres: 0,
                    count: 0,
                    typeDominant: act.type // Juste pour l'icône initiale
                };
            }
            lieux[key].totalMetres += act.valeurMetres;
            lieux[key].count += 1;
            // Si le dernier ajout est un 3, l'icône devient un 3 (optionnel)
            lieux[key].typeDominant = act.type; 
        }
    });

    // 3. AFFICHAGE DES MARQUEURS REGROUPÉS
    Object.values(lieux).forEach(lieu => {
        const emoji = '👃';
        
        // Icône personnalisée
        const customIcon = L.divIcon({
            className: 'custom-map-icon',
            html: `<div style="font-size: 28px; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3)); transform: translateY(-10px);">${emoji}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30], // Ancré en bas
            popupAnchor: [0, -30] // Popup au dessus
        });

        // Contenu de la popup avec le bouton "Ajouter ici"
        // On encode le nom pour éviter les bugs si y'a des guillemets
        const nomSafe = encodeURIComponent(lieu.nom);
        
        const popupContent = `
            <div style="text-align:center; min-width: 150px;">
                <b style="font-size:16px; color:#333;">${lieu.nom}</b><br>
                <div style="margin: 8px 0; padding: 5px; background: #f1f5f9; border-radius: 8px;">
                    <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Total ici</span><br>
                    <span style="font-size: 18px; color: #7c3aed; font-weight: 900;">${(lieu.totalMetres * 100).toFixed(0)} cm</span>
                </div>
                <div style="font-size:11px; color:#999; margin-bottom:10px;">${lieu.count} entrée(s)</div>
                
                <button onclick="window.ajouterSurLieuExistant(${lieu.lat}, ${lieu.lng}, '${nomSafe}')" 
                    style="width:100%; background: #0f172a; color: white; border: none; padding: 8px; border-radius: 8px; font-weight: bold; cursor: pointer;">
                    + Ajouter ici
                </button>
            </div>
        `;

        L.marker([lieu.lat, lieu.lng], { icon: customIcon })
            .addTo(mapInstance)
            .bindPopup(popupContent);
    });
}

// =============================================================
// 6. PARTAGE & PHOTO (Copie ton code précédent ici)
// =============================================================
// ... (Garde ton code de partage d'image existant, il n'a pas besoin de changer)
function ouvrirMenuPartage() { document.getElementById('photoModal').style.display = 'flex'; }
function fermerModal() { document.getElementById('photoModal').style.display = 'none'; }
function declencherAjoutPhoto() { const i = document.getElementById('imageInputTrigger'); if(i){ i.value=""; i.click(); } }
function lancerGenerationSansPhoto() { document.getElementById('photoContainer').style.display='none'; fermerModal(); genererImageEtAfficherApercu(); }
function traiterLaPhoto(i) { if(i.files && i.files[0]) { fermerModal(); let r = new FileReader(); r.onload=function(e){ let img=document.getElementById('userPhoto'); if(img){ img.src=e.target.result; document.getElementById('photoContainer').style.display='block'; setTimeout(()=>{genererImageEtAfficherApercu()},300); } }; r.readAsDataURL(i.files[0]); } }

function genererImageEtAfficherApercu() {
    const totalGen = document.getElementById('totalGeneral').innerText.replace(' m', '');
    document.getElementById('shareTotalK').innerText = document.getElementById('totalK').innerText;
    document.getElementById('shareTotal3').innerText = document.getElementById('total3').innerText;
    document.getElementById('shareTotalGeneral').innerText = totalGen;

    let rawFact = document.getElementById('funFact').innerText;
    let cleanFact = rawFact.replace("C'est environ ", "").replace("C'est exactement la taille de ", "PILE : ").replace("En attente de data...", "");
    let texteFinal = cleanFact.replace(/[^a-zA-Z0-9àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ\s.,!?'"()\/-]/g, '').trim().toUpperCase();
    if (texteFinal.length === 0) texteFinal = "MON WRAPPED";

    let taillePolice = 38;
    if (texteFinal.length > 60) taillePolice = 22; else if (texteFinal.length > 40) taillePolice = 26; else if (texteFinal.length > 25) taillePolice = 30;

    const s = document.getElementById('shareFunFactSolid'); const h = document.getElementById('shareFunFactHollow');
    s.style.fontSize = taillePolice + "px"; h.style.fontSize = taillePolice + "px";
    s.innerText = texteFinal; h.innerText = texteFinal;

    document.querySelectorAll('[id^="clone_"]').forEach(el => el.remove());
    const o = document.getElementById('shareCardContainer'); const c = o.cloneNode(true);
    const uid = "clone_" + Date.now(); c.id = uid;
    Object.assign(c.style, {position:'fixed', top:'0', left:'0', width:'400px', height:'400px', zIndex:'-9999', display:'block'});
    document.body.appendChild(c);

    setTimeout(() => {
        const t = document.getElementById(uid); if(!t) return;
        html2canvas(t, {backgroundColor: "#bc13fe", scale: 1, useCORS: true, logging: false}).then(cv => {
            t.remove();
            cv.toBlob(b => { if(!b)return; afficherEcranValidation(b); });
        }).catch(e => { if(document.getElementById(uid)) document.getElementById(uid).remove(); alert("Erreur génération."); });
    }, 200);
}

function afficherEcranValidation(blob) {
    const url = URL.createObjectURL(blob);
    const file = new File([blob], 'wrapped.png', { type: 'image/png' });
    const ov = document.createElement('div');
    Object.assign(ov.style, {position:'fixed', inset:'0', backgroundColor:'rgba(0,0,0,0.95)', zIndex:'10000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'20px'});
    
    const img = document.createElement('img'); img.src = url;
    Object.assign(img.style, {width:'80%', maxWidth:'350px', borderRadius:'15px', boxShadow:'0 0 20px rgba(188, 19, 254, 0.4)'});
    
    const btn = document.createElement('button'); btn.innerHTML = "Envoyer 🚀";
    Object.assign(btn.style, {padding:'15px 30px', borderRadius:'50px', border:'none', backgroundColor:'#bc13fe', color:'white', fontSize:'18px', fontWeight:'bold', cursor:'pointer'});
    
    const close = document.createElement('button'); close.innerHTML = "Fermer";
    Object.assign(close.style, {background:'transparent', border:'none', color:'#888', marginTop:'10px', textDecoration:'underline'});

    btn.onclick = () => {
        if (navigator.share && navigator.canShare({ files: [file] })) {
            navigator.share({ files: [file], title: 'My Wrapped' }).then(() => document.body.removeChild(ov));
        } else { alert("Appuie longuement sur l'image pour l'enregistrer !"); }
    };
    close.onclick = () => document.body.removeChild(ov);
    ov.appendChild(img); ov.appendChild(btn); ov.appendChild(close); document.body.appendChild(ov);
}
// 7. SAUVEGARDE (Inchangé)
function copierDonnees() { const d = { ...localStorage }; const s = JSON.stringify(d); if(s==="{}"){alert("Rien à sauvegarder");return;} navigator.clipboard.writeText(s).then(()=>alert("✅ Copié !")).catch(()=>prompt("Copie ça:",s)); }
async function collerDonnees() { try { const t = await navigator.clipboard.readText(); const d = JSON.parse(t); localStorage.clear(); for(const[k,v]of Object.entries(d))localStorage.setItem(k,v); activites = JSON.parse(localStorage.getItem('sport_data'))||[]; sauvegarderEtAfficher(); alert("✅ Restauré !"); } catch(e){alert("Erreur: "+e.message);} }

sauvegarderEtAfficher();

// =============================================================
// 8. SYSTÈME DE TROPHÉES (Vue dédiée)
// =============================================================

const TROPHY_LIST = [
    { m: 0.02, icon: "🎚️", name: "Fader" },
    { m: 0.05, icon: "👂", name: "Bouchon d'oreille" },
    { m: 0.30, icon: "💿", name: "Vinyle Maxi" },
    { m: 1.00, icon: "🔌", name: "Câble XLR" },
    { m: 1.57, icon: "🌸", name: "Fleur" },
    { m: 1.63, icon: "👸", name: "Sara" },
    { m: 1.65, icon: "💀", name: "Anaïs" },
    { m: 1.65, icon: "🦶", name: "Kim" },
    { m: 1.70, icon: "🐅", name: "Gabriel" },
    { m: 1.70, icon: "🤐", name: "Raph" },
    { m: 1.88, icon: "🎸", name: "Jolan the tracer" },
    { m: 1.90, icon: "🥸", name: "Adrien askip" },
    { m: 2.50, icon: "🏛️", name: "Palais Longchamp" },
    { m: 5.00, icon: "🗿", name: "Le David" },
    { m: 5.26, icon: "🗽", name: "Tête Liberté" }, // NOUVEAU
    { m: 6.26, icon: "🥖", name: "Saut Perche" }, // NOUVEAU
    { m: 7.32, icon: "⚽", name: "But de Foot" }, // NOUVEAU
    { m: 7.62, icon: "🚐", name: "Breaking Bad" }, // NOUVEAU
    { m: 9.15, icon: "👮", name: "Mur Coup-franc" }, // NOUVEAU
    { m: 11.2, icon: "⛪", name: "Bonne Mère" },
    { m: 12.19, icon: "🚢", name: "Conteneur 40'" }, // NOUVEAU
    { m: 13.76, icon: "🦖", name: "T-Rex" }, // NOUVEAU
    { m: 15.00, icon: "🔵", name: "Pétanque" }, // INDISPENSABLE
    { m: 18.29, icon: "🎳", name: "Bowling" }, // NOUVEAU
    { m: 25.0, icon: "🚌", name: "Bus 83" },
    { m: 45.0, icon: "🏰", name: "Château d'If" },
    { m: 60.0, icon: "🏟️", name: "Vélodrome" },
    { m: 86.0, icon: "🎡", name: "Grande Roue" },
    { m: 149, icon: "⛪", name: "Sommet N-D Garde" },
    { m: 161, icon: "🏙️", name: "Tour CMA CGM" },
    { m: 300, icon: "🌑", name: "Berghain" },
    { m: 828, icon: "🏗️", name: "Burj Khalifa" }
];

function chargerTrophees() {
    const grid = document.getElementById('trophyGrid');
    const progressLabel = document.getElementById('trophyProgress');
    
    // On recalcule le total à la volée pour être sûr d'être à jour
    let totalK = 0, total3 = 0;
    activites.forEach(a => {
        if (a.type === 'K') totalK += a.dist || a.valeurMetres; // Sécurité double nommage
        else total3 += a.dist || a.valeurMetres;
    });
    const totalM = totalK + total3; // total est déjà en mètres dans 'activites' normalement
    
    // Petite sécurité : si tes objets utilisent 'dist' en cm ou 'valeurMetres' en m
    // Dans ton code actuel 'valeurMetres' est bien en mètres.
    // Mais pour le totalGeneral affiché dans le DOM, on peut aussi le récupérer là :
    // const totalM = parseFloat(document.getElementById('totalGeneral').innerText) || 0;

    let unlockedCount = 0;
    let html = "";

    TROPHY_LIST.forEach(t => {
        const isUnlocked = totalM >= t.m;
        if (isUnlocked) unlockedCount++;

        if (isUnlocked) {
            // DÉBLOQUÉ
            html += `
                <div class="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center justify-center gap-2 relative overflow-hidden" style="animation: popIn 0.3s ease-out forwards;">
                    <div class="absolute inset-0 bg-gradient-to-br from-yellow-50 to-white opacity-50"></div>
                    <span class="text-4xl relative z-10 filter drop-shadow-sm">${t.icon}</span>
                    <span class="text-xs font-bold text-slate-800 text-center relative z-10 leading-tight">${t.name}</span>
                    <span class="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full relative z-10 border border-amber-200">✅ ${t.m} m</span>
                </div>
            `;
        } else {
            // BLOQUÉ
            const manque = (t.m - totalM).toFixed(2);
            html += `
                <div class="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2 opacity-60 grayscale relative">
                    <span class="absolute top-2 right-2 text-lg opacity-40">🔒</span>
                    <span class="text-4xl opacity-20 filter blur-[1px]">${t.icon}</span>
                    <span class="text-xs font-bold text-slate-400 text-center">???</span>
                    <span class="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded-full">encore ${manque} m</span>
                </div>
            `;
        }
    });

    grid.innerHTML = html;
    progressLabel.innerText = `${unlockedCount} / ${TROPHY_LIST.length} DÉBLOQUÉS`;
}

