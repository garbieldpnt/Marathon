// =============================================================
// CONFIGURATION THEME (DISCRET)
// =============================================================
let modeDiscretActif = false;

const THEMES = {
    PARTY: {
        iconeK: "🦄",
        icone3: "3️⃣",
        iconeMap: "👃",
        titre: "Mon Suivi",
        btnK: "+ 🦄",
        btn3: "+ 3️⃣"
    },
    OFFICE: { 
        iconeK: "🎀", // Ruban / Soie
        icone3: "🧵", // Fil / Lin
        iconeMap: "✂️", // Ciseaux
        titre: "Sourcing Textile",
        btnK: "+ Ruban",
        btn3: "+ Tissu"
    }
};

// Fonction pour récupérer l'icône actuelle partout dans le code
function getTheme() {
    return modeDiscretActif ? THEMES.OFFICE : THEMES.PARTY;
}

// =============================================================
// 1. CONFIGURATION & DONNÉES
// =============================================================
let activites = JSON.parse(localStorage.getItem('sport_data')) || [];
let typeEnCours = "K"; 
let idEnCours = null;
let coordEnCours = null; 

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

    // 1. GESTION DU CONTENU (Views)
    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[vue].classList.remove('hidden');

    // 2. GESTION DU SLIDE (Le mouvement du fond noir)
    // On déplace le curseur selon l'onglet choisi
    if (vue === 'marathon') {
        cursor.style.transform = 'translateX(0%)';
    } else if (vue === 'map') {
        cursor.style.transform = 'translateX(100%)';
    } else if (vue === 'trophies') {
        cursor.style.transform = 'translateX(200%)';
    }

    // 3. GESTION DE LA COULEUR DU TEXTE
    // Le bouton actif doit être BLANC (car il est sur le fond noir)
    // Les autres doivent être GRIS (car ils sont sur le fond blanc)
    Object.keys(btns).forEach(key => {
        const btn = btns[key];
        if (key === vue) {
            btn.classList.remove('text-slate-400');
            btn.classList.add('text-white');
        } else {
            btn.classList.remove('text-white');
            btn.classList.add('text-slate-400');
            // Petit effet hover pour les boutons inactifs
            btn.classList.add('hover:text-slate-600');
        }
    });

    // 4. Logique spécifique
    if (vue === 'map') {
        initMap();
        setTimeout(() => { if(mapInstance) mapInstance.invalidateSize(); }, 300);
    }
    if (vue === 'trophies') {
        chargerTrophees();
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

    // Construire la liste pour l'autocomplete
    const lieuxUniques = {};
    activites.forEach(a => {
        if (a.nom && a.lat && a.lng) {
            lieuxUniques[a.nom] = { lat: a.lat, lng: a.lng };
        }
    });

    // Remplir la datalist HTML
    if(datalist) {
        datalist.innerHTML = Object.keys(lieuxUniques).map(nom => `<option value="${nom}">`).join('');
    }

    // Lancer le GPS
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const myLat = pos.coords.latitude;
            const myLng = pos.coords.longitude;
            
            // IMPORTANT : On met à jour la coordonnée globale pour l'enregistrement
            coordEnCours = { lat: myLat, lng: myLng };

            let meilleurMatch = null;
            let distanceMin = 50; // Rayon de 50m

            for (const [nom, coords] of Object.entries(lieuxUniques)) {
                const distance = getDistanceEnMetres(myLat, myLng, coords.lat, coords.lng);
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

        }, (err) => {
            console.log("GPS Erreur ou Refus :", err);
        }, { enableHighAccuracy: true, timeout: 5000 });
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
    // 1. Sauvegarde dans le téléphone
    localStorage.setItem('sport_data', JSON.stringify(activites));

    // 2. Calcul des Totaux
    let totalK = 0;
    let total3 = 0;

    activites.forEach(a => {
        if (a.type === 'K') totalK += a.valeurMetres;
        else total3 += a.valeurMetres;
    });

    // Mise à jour des compteurs du haut
    document.getElementById('totalK').innerText = totalK.toFixed(2) + " m";
    document.getElementById('total3').innerText = total3.toFixed(2) + " m";

    const totalGeneral = totalK + total3;
    document.getElementById('totalGeneral').innerText = totalGeneral.toFixed(2) + " m";

    // Mise à jour de la barre de progression & Fun Fact
    // (On garde ta logique de megaBiblio ici, je simplifie pour l'exemple mais ton code reste le même)
    // ... ta logique de barre de progression est ici normalement ...

    // 3. Génération de la liste (C'EST ICI QUE ÇA CHANGE POUR LE MODE DISCRET)
    const liste = document.getElementById('listeActivites');
    let html = "";

    // On récupère le thème actuel (Party ou Bureau)
    const theme = getTheme(); 

    activites.forEach((act, index) => {
        // On choisit l'icône selon le type ET le thème
        const iconeVisuelle = act.type === 'K' ? theme.iconeK : theme.icone3;
        
        // Gestion des étoiles
        let stars = "";
        if (act.note > 0) {
            stars = "⭐".repeat(act.note);
        }

        html += `
            <div onclick="ouvrirPopup('${act.type}', null, '${act.nom || ''}'); idEnCours=${act.id}; noteEnCours=${act.note || 0}; distanceInput.value=${(act.valeurMetres*100).toFixed(0)}" 
            class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden group hover:border-purple-200 transition-colors cursor-pointer mb-2">
                
                <div class="flex items-center gap-3 z-10">
                    <span class="text-2xl">${iconeVisuelle}</span> 
                    <div>
                        <p class="font-bold text-slate-700 text-sm">
                            ${(act.valeurMetres * 100).toFixed(0)} <span class="text-[10px] text-slate-400">CM</span>
                        </p>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            ${act.nom || 'Sans nom'} <span class="text-amber-400">${stars}</span>
                        </p>
                    </div>
                </div>

                <div class="text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        `;
    });

    liste.innerHTML = html;
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

    // Clic sur la carte (zone vide) -> Nouveau point
    mapInstance.on('click', function(e) {
        ouvrirPopup('K', e.latlng); // Ouvre avec Licorne par défaut, mais modifiable
    });

    mapInstance.locate({watch: true, enableHighAccuracy: true});
    mapInstance.on('locationfound', function(e) {
        if (!userMarker) {
            const iconUser = L.divIcon({ className: 'user-location-dot', html: '<div class="dot"></div><div class="pulse"></div>', iconSize: [20, 20] });
            userMarker = L.marker(e.latlng, {icon: iconUser}).addTo(mapInstance);
            mapInstance.flyTo(e.latlng, 16);
        } else {
            userMarker.setLatLng(e.latlng);
        }
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
    // Si la carte n'est pas prête, on arrête
    if (!mapInstance) return;

    // On nettoie les anciens marqueurs (sauf l'utilisateur)
    mapInstance.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer !== userMarker) {
            mapInstance.removeLayer(layer);
        }
    });

    // On regroupe les activités par lieu (nom + coords)
    const lieux = {};
    activites.forEach(a => {
        if (a.lat && a.lng) {
            // Clé unique basée sur les coordonnées pour grouper
            const key = a.lat.toFixed(5) + "," + a.lng.toFixed(5);
            
            if (!lieux[key]) {
                lieux[key] = {
                    lat: a.lat,
                    lng: a.lng,
                    nom: a.nom || "Lieu mystère",
                    total: 0,
                    count: 0
                };
            }
            lieux[key].total += a.valeurMetres;
            lieux[key].count += 1;
        }
    });

    // C'EST ICI QUE ÇA CHANGE : On récupère le thème pour savoir quel emoji afficher
    const theme = getTheme(); 
    const emojiMap = theme.iconeMap; // Sera soit 👃 soit 📌

    // On place les marqueurs
    Object.values(lieux).forEach(lieu => {
        
        const customIcon = L.divIcon({
            className: 'custom-map-icon pin-icon', // J'ai ajouté pin-icon pour l'animation CSS
            html: `<div style="font-size: 28px; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3)); transform: translateY(-10px);">${emojiMap}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        const marker = L.marker([lieu.lat, lieu.lng], {icon: customIcon}).addTo(mapInstance);
        
        // Popup au clic
        marker.bindPopup(`
            <div class="text-center">
                <strong class="block text-sm mb-1">${lieu.nom}</strong>
                <span class="text-xs bg-slate-100 px-2 py-1 rounded-full border border-slate-200">
                    Total : ${lieu.total.toFixed(2)} m
                </span>
                <br>
                <button onclick="ouvrirPopup('K', {lat:${lieu.lat}, lng:${lieu.lng}}, '${lieu.nom.replace(/'/g, "\\'")}')" 
                class="mt-2 text-[10px] bg-slate-800 text-white px-3 py-1 rounded-full font-bold shadow-md active:scale-95 transition-transform">
                    + Ajouter ici
                </button>
            </div>
        `);
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

window.voirDetailsTrophee = function(index) {
    const trophee = TROPHY_LIST[index];
    
    // 1. Calcul du total actuel
    let totalK = 0, total3 = 0;
    activites.forEach(a => {
        if (a.type === 'K') totalK += a.valeurMetres;
        else total3 += a.valeurMetres;
    });
    const totalM = totalK + total3;

    // 2. Le Calcul Magique (Combien de fois ?)
    const fois = (totalM / trophee.m).toFixed(1); // 1 chiffre après la virgule
    const pourcentage = ((totalM / trophee.m) * 100).toFixed(0);

    // 3. Le Message
    if (totalM < trophee.m) {
        // Pas encore débloqué
        const manque = (trophee.m - totalM).toFixed(2);
        alert(`🔒 Ce trophée est bloqué.\n\nIl te manque encore ${manque} mètres pour l'atteindre !`);
    } else {
        // Débloqué
        alert(`Tu as tapé ${fois} fois ${trophee.name} !`);
    }
};

function chargerTrophees() {
    const grid = document.getElementById('trophyGrid');
    const progressLabel = document.getElementById('trophyProgress');
    
    // Calcul du total
    let totalK = 0, total3 = 0;
    activites.forEach(a => {
        if (a.type === 'K') totalK += a.valeurMetres;
        else total3 += a.valeurMetres;
    });
    const totalM = totalK + total3;

    let unlockedCount = 0;
    let html = "";

    // Note l'ajout de 'index' dans la boucle pour identifier quel trophée on clique
    TROPHY_LIST.forEach((t, index) => {
        const isUnlocked = totalM >= t.m;
        if (isUnlocked) unlockedCount++;

        // On ajoute onclick="voirDetailsTrophee(${index})" sur les divs
        // On ajoute cursor-pointer et active:scale-95 pour l'effet bouton

        if (isUnlocked) {
            // DÉBLOQUÉ
            html += `
                <div onclick="voirDetailsTrophee(${index})" class="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center justify-center gap-2 relative overflow-hidden cursor-pointer transition-transform active:scale-95 hover:shadow-md" style="animation: popIn 0.3s ease-out forwards;">
                    <div class="absolute inset-0 bg-gradient-to-br from-yellow-50 to-white opacity-50 pointer-events-none"></div>
                    <span class="text-4xl relative z-10 filter drop-shadow-sm">${t.icon}</span>
                    <span class="text-xs font-bold text-slate-800 text-center relative z-10 leading-tight">${t.name}</span>
                    <span class="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full relative z-10 border border-amber-200">✅ ${t.m} m</span>
                </div>
            `;
        } else {
            // BLOQUÉ
            const manque = (t.m - totalM).toFixed(2);
            html += `
                <div onclick="voirDetailsTrophee(${index})" class="bg-slate-100 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2 opacity-60 grayscale relative cursor-pointer active:scale-95">
                    <span class="absolute top-2 right-2 text-lg opacity-40">🔒</span>
                    <span class="text-4xl opacity-20 filter blur-[1px]">${t.icon}</span>
                    <span class="text-xs font-bold text-slate-400 text-center">???</span>
                    <span class="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-1 rounded-full">encore ${manque} m</span>
                </div>
            `;
        }
    });

    if(grid) grid.innerHTML = html;
    if(progressLabel) progressLabel.innerText = `${unlockedCount} / ${TROPHY_LIST.length} DÉBLOQUÉS`;
}

function basculerModeDiscret() {
    modeDiscretActif = !modeDiscretActif;
    const t = getTheme();
    
    // 1. Mettre à jour les textes statiques
    document.querySelector('h1').innerText = t.titre;
    
    // Les gros compteurs du haut
    // Note : Il faudra ajouter des ID à tes <p> d'icônes dans le HTML pour faire ça proprement,
    // mais ici on va le faire à la brute pour l'exemple :
    const cards = document.querySelectorAll('.grid-cols-2 .text-2xl');
    if(cards.length >= 2) {
        cards[0].innerText = t.iconeK;
        cards[1].innerText = t.icone3;
    }

    // Les boutons d'ajout
    const btns = document.querySelectorAll('.grid-cols-2 button');
    if(btns.length >= 2) {
        btns[0].innerText = t.btnK;
        btns[1].innerText = t.btn3;
    }

    // Les boutons dans la modale (Sélecteurs)
    const btnSelectK = document.getElementById('btn-select-K');
    const btnSelect3 = document.getElementById('btn-select-3');
    if(btnSelectK) btnSelectK.innerText = t.iconeK;
    if(btnSelect3) btnSelect3.innerText = t.icone3;

    // 2. Rafraîchir l'historique (pour changer les icônes dans la liste)
    sauvegarderEtAfficher();

    // 3. Rafraîchir la carte (pour changer les Nez en Punaises)
    if(mapInstance) chargerMarqueurs();

    // Petit feedback visuel
    alert(modeDiscretActif ? "💼 Mode Bureau activé" : "🦄 Mode Party activé");
}

let clickTimer = null;
let clickCount = 0;

function gererClicSecret() {
    clickCount++;
    if (clickCount === 1) {
        clickTimer = setTimeout(() => {
            clickCount = 0; // Reset si pas de 2ème clic rapide
        }, 400); // 400ms pour faire le 2ème clic
    } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        basculerModeDiscret(); // BINGO
    }
}

// =============================================================
// OUTIL RÈGLE DIGITALE (CORRIGÉ)
// =============================================================

let rulerStart = null;
let currentDistCM = 0;
let pixelsPerCM = 0; // Sera calculé dynamiquement

function ouvrirRegle() {
    document.getElementById('rulerModal').classList.remove('hidden');
    // On calcule combien de pixels font 1cm sur CET écran spécifiquement
    calibrerEchelle();
    initRulerCanvas();
}

function fermerRegle() {
    document.getElementById('rulerModal').classList.add('hidden');
    resetRegle();
}

function resetRegle() {
    currentDistCM = 0;
    rulerStart = null;
    document.getElementById('rulerValue').innerHTML = `0 <span class="text-sm">cm</span>`;
    const canvas = document.getElementById('rulerCanvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function validerRegle() {
    const input = document.getElementById('distanceInput');
    if(input) {
        // On envoie l'entier arrondi
        input.value = currentDistCM; 
    }
    fermerRegle();
}

// C'est ici qu'on assure que JS = CSS
function calibrerEchelle() {
    const div = document.createElement("div");
    div.style.width = "1cm";
    div.style.height = "1cm";
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    document.body.appendChild(div);
    pixelsPerCM = div.getBoundingClientRect().width; // La valeur EXACTE du navigateur
    document.body.removeChild(div);
    console.log("Calibration : 1cm = " + pixelsPerCM + "px");
}

function initRulerCanvas() {
    const zone = document.getElementById('touchZone');
    const canvas = document.getElementById('rulerCanvas');
    const ctx = canvas.getContext('2d');
    const displayVal = document.getElementById('rulerValue');

    // Adapter le canvas à la taille réelle
    const rect = zone.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Gestion unifiée Souris / Tactile pour éviter les bugs
    const getCoords = (e) => {
        const box = canvas.getBoundingClientRect(); // Position absolue du canvas
        let clientX, clientY;
        
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        // On renvoie les coordonnées RELATIVES au canvas (0,0 en haut à gauche de la zone blanche)
        return {
            x: clientX - box.left,
            y: clientY - box.top
        };
    };

    let isDrawing = false;

    // Début du tracé
    const start = (e) => {
        // Empêcher le scroll sur mobile
        if(e.type === 'touchstart') e.preventDefault(); 
        
        isDrawing = true;
        const coords = getCoords(e);
        rulerStart = coords;
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Nettoyer précédent
        
        // Petit point de départ
        ctx.beginPath();
        ctx.arc(rulerStart.x, rulerStart.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "#9333ea";
        ctx.fill();
    };

    // Mouvement
    const move = (e) => {
        if (!isDrawing || !rulerStart) return;
        if(e.type === 'touchmove') e.preventDefault();

        const coords = getCoords(e);
        const currentX = coords.x;
        const currentY = coords.y;

        // 1. Calcul Pythagore en pixels
        const dx = currentX - rulerStart.x;
        const dy = currentY - rulerStart.y;
        const distPixels = Math.sqrt(dx*dx + dy*dy);

        // 2. Conversion en CM (Arrondi au dessus)
        const rawCM = distPixels / pixelsPerCM;
        currentDistCM = Math.ceil(rawCM); // ARRONDIT À L'ENTIER SUPÉRIEUR (1.1 -> 2)

        // Affichage (On montre aussi la décimale en petit pour info, ou juste l'entier ?)
        // Ici je mets juste l'entier comme demandé
        displayVal.innerHTML = `${currentDistCM} <span class="text-sm">cm</span>`;

        // 3. Dessin
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Ligne
        ctx.beginPath();
        ctx.moveTo(rulerStart.x, rulerStart.y);
        ctx.lineTo(currentX, currentY);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#9333ea";
        ctx.setLineDash([10, 10]);
        ctx.stroke();

        // Points extrémités
        ctx.beginPath();
        ctx.arc(rulerStart.x, rulerStart.y, 5, 0, 2 * Math.PI);
        ctx.arc(currentX, currentY, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#9333ea";
        ctx.fill();
        
        // Bulle de valeur flottante à côté du doigt (Optionnel, sympa pour l'UX)
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#9333ea";
        ctx.fillText(`${rawCM.toFixed(1)}`, currentX + 15, currentY - 15);
    };

    const end = () => {
        isDrawing = false;
    };

    // Listeners
    zone.onmousedown = start;
    zone.onmousemove = move;
    zone.onmouseup = end;
    zone.onmouseleave = end;

    zone.ontouchstart = start;
    zone.ontouchmove = move;
    zone.ontouchend = end;
}
