// =============================================================
// CONFIGURATION THEME (DISCRET)
// =============================================================
let modeDiscretActif = localStorage.getItem('mode_discret_actif') === 'true';
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
        iconeK: "🎀", 
        icone3: "🧵", 
        iconeMap: "✂️", 
        titre: "Sourcing Textile",
        btnK: "+ Ruban",
        btn3: "+ Tissu"
    }
};

function getTheme() {
    return modeDiscretActif ? THEMES.OFFICE : THEMES.PARTY;
}

// =============================================================
// 0. LISTE DES TROPHÉES (DÉPLACÉ ICI POUR ÊTRE ACCESSIBLE PARTOUT)
// =============================================================
const TROPHY_LIST = [
    { m: 0.02, icon: "🎚️", name: "Fader" },
    { m: 0.05, icon: "👂", name: "Bouchon d'oreille" },
    { m: 0.30, icon: "💿", name: "Vinyle Maxi" },
    { m: 1.00, icon: "🔌", name: "Câble XLR" },
    { m: 1.57, icon: "🌸", name: "Fleur" },
    { m: 1.63, icon: "👸", name: "Sara" },
    { m: 1.65, icon: "💀", name: "Anaïs" },
    { m: 1.67, icon: "🦶", name: "Kim" },
    { m: 1.68, icon: "💜", name: "Lucie" },
    { m: 1.70, icon: "🐅", name: "Gabriel" },
    { m: 1.84, icon: "🤐", name: "Raph" },
    { m: 1.88, icon: "🎸", name: "Jolan the tracer" },
    { m: 1.90, icon: "🥸", name: "Adrien askip" },
    { m: 2.50, icon: "🏛️", name: "Palais Longchamp" },
    { m: 5.00, icon: "🗿", name: "Le David" },
    { m: 5.26, icon: "🗽", name: "Tête Liberté" },
    { m: 6.26, icon: "🥖", name: "Saut Perche" },
    { m: 7.32, icon: "⚽", name: "But de Foot" },
    { m: 7.62, icon: "🚐", name: "Breaking Bad" },
    { m: 9.15, icon: "👮", name: "Mur Coup-franc" },
    { m: 11.2, icon: "⛪", name: "Bonne Mère" },
    { m: 12.19, icon: "🚢", name: "Conteneur 40'" },
    { m: 13.76, icon: "🦖", name: "T-Rex" },
    { m: 15.00, icon: "🔵", name: "Pétanque" },
    { m: 18.29, icon: "🎳", name: "Bowling" },
    { m: 25.0, icon: "🚌", name: "Bus 83" },
    { m: 45.0, icon: "🏰", name: "Château d'If" },
    { m: 60.0, icon: "🏟️", name: "Vélodrome" },
    { m: 86.0, icon: "🎡", name: "Grande Roue" },
    { m: 149, icon: "⛪", name: "Sommet N-D Garde" },
    { m: 161, icon: "🏙️", name: "Tour CMA CGM" },
    { m: 300, icon: "🌑", name: "Berghain" },
    { m: 828, icon: "🏗️", name: "Burj Khalifa" }
];

// ... après TROPHY_LIST ...

// LISTE DES TROPHÉES SECRETS (Easter Eggs)
const SECRET_LIST = [
    { 
        id: "Bonbon", 
        icon: "💊", 
        name: "L’ecstase", 
        hint: "Une erreur dans le système...",
        // Condition : Taper 404 cm (4.04m)
        check: (metres, nom) => metres === 30.03 
    },
  { 
        id: "Vitesse", 
        icon: "⚡️", 
        name: "Vitesse", 
        hint: "Une erreur dans le système...",
        // Condition : Taper 404 cm (4.04m)
        check: (metres, nom) => metres === 2.99 
    },
  { 
        id: "4", 
        icon: "4️⃣", 
        name: "3+1", 
        hint: "Une erreur dans le système...",
        // Condition : Taper 404 cm (4.04m)
        check: (metres, nom) => metres === 44.44 
    },
    { 
        id: "C", 
        icon: "❄️", 
        name: "Les bronzés", 
        hint: "Une erreur dans le système...",
        // Condition : Taper 404 cm (4.04m)
        check: (metres, nom) => metres === 21.06 
    },
  { 
        id: "2CB", 
        icon: "🚀", 
        name: "Satellité", 
        hint: "Une erreur dans le système...",
        // Condition : Taper 404 cm (4.04m)
        check: (metres, nom) => metres === 10.04 
    },
  { 
        id: "Ice", 
        icon: "🧊", 
        name: "Immigration and Customs Enforcement", 
        hint: "Une erreur dans le système...",
        // Condition : Taper 404 cm (4.04m)
        check: (metres, nom) => metres === 11.02 
    },
  { 
        id: "H", 
        icon: "💉", 
        name: "Ustre", 
        hint: "Une erreur dans le système...",
        // Condition : Taper 404 cm (4.04m)
        check: (metres, nom) => metres === 18.74 
    },
];

// Récupération des secrets déjà débloqués
let unlockedSecrets = JSON.parse(localStorage.getItem('textile_secrets')) || [];

// =============================================================
// 1. DONNÉES & DOM
// =============================================================
let activites = JSON.parse(localStorage.getItem('sport_data')) || [];
let typeEnCours = "K"; 
let idEnCours = null;
let coordEnCours = null; 

const modal = document.getElementById('modal');
// Attention : on récupère les inputs dans les fonctions pour éviter les conflits d'ID

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

    Object.values(views).forEach(el => el.classList.add('hidden'));
    views[vue].classList.remove('hidden');

    if (vue === 'marathon') cursor.style.transform = 'translateX(0%)';
    else if (vue === 'map') cursor.style.transform = 'translateX(100%)';
    else if (vue === 'trophies') cursor.style.transform = 'translateX(200%)';

    Object.keys(btns).forEach(key => {
        const btn = btns[key];
        if (key === vue) {
            btn.classList.remove('text-slate-400');
            btn.classList.add('text-white');
        } else {
            btn.classList.remove('text-white');
            btn.classList.add('text-slate-400');
            btn.classList.add('hover:text-slate-600');
        }
    });

    if (vue === 'map') {
        initMap();
        setTimeout(() => { if(mapInstance) mapInstance.invalidateSize(); }, 300);
    }
    if (vue === 'trophies') {
        chargerTrophees();
    }
}

// =============================================================
// 3. FONCTIONS DE SAISIE
// =============================================================

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

// GPS & Autocomplete
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

function detecterLieuEtAutocomplet() {
    const input = document.getElementById('locationNameInput');
    const datalist = document.getElementById('lieux-connus');
    const hint = document.getElementById('gpsHint');
    
    if(input) {
        input.value = "";
        input.classList.remove('border-green-500', 'bg-green-50');
    }
    if(hint) hint.classList.add('hidden');

    const lieuxUniques = {};
    activites.forEach(a => {
        if (a.nom && a.lat && a.lng) {
            lieuxUniques[a.nom] = { lat: a.lat, lng: a.lng };
        }
    });

    if(datalist) {
        datalist.innerHTML = Object.keys(lieuxUniques).map(nom => `<option value="${nom}">`).join('');
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const myLat = pos.coords.latitude;
            const myLng = pos.coords.longitude;
            coordEnCours = { lat: myLat, lng: myLng };

            let meilleurMatch = null;
            let distanceMin = 50; 

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

        }, (err) => console.log("GPS err", err), { enableHighAccuracy: true, timeout: 5000 });
    }
}

function ouvrirPopup(typeDefaut, coords = null, nomPredefini = "") {
    idEnCours = null; 
    const inputNom = document.getElementById('locationNameInput');
    const inputDist = document.getElementById('distanceInput');
    const modalEl = document.getElementById('modal');

    changerTypeSaisie(typeDefaut || 'K');

    const titreEl = document.getElementById('modalTitle');
    if(titreEl) {
        titreEl.innerText = coords 
            ? (nomPredefini ? "Ajouter à " + nomPredefini : "Nouveau lieu") 
            : "Ajouter une distance";
    }
    
    if (coords) {
        coordEnCours = coords;
        if(inputNom) inputNom.value = nomPredefini;
        const hint = document.getElementById('gpsHint');
        if(hint) hint.classList.add('hidden');
    } else {
        detecterLieuEtAutocomplet();
    }
    
    if(modalEl) modalEl.classList.remove('hidden');
    if(inputDist) inputDist.focus();
}

function fermerPopup() {
    document.getElementById('modal').classList.add('hidden');
    const i1 = document.getElementById('distanceInput');
    const i2 = document.getElementById('locationNameInput');
    if(i1) i1.value = "";
    if(i2) i2.value = "";
    coordEnCours = null;
}

function modifierLigne(id) {
    // 1. On retrouve l'activité concernée
    const ligne = activites.find(a => a.id === id);
    
    if (ligne) {
        // 2. On passe en mode "Modification" (idEnCours n'est pas null)
        idEnCours = id;
        coordEnCours = null; // On ne touche pas aux coordonnées existantes
        
        // 3. On remplit l'interface
        changerTypeSaisie(ligne.type);
        
        const titreEl = document.getElementById('modalTitle');
        if(titreEl) titreEl.innerText = "Modifier l'entrée";

        const inputDist = document.getElementById('distanceInput');
        const inputNom = document.getElementById('locationNameInput');
        
        if(inputDist) inputDist.value = (ligne.valeurMetres * 100).toFixed(0); // On remet en cm
        if(inputNom) inputNom.value = ligne.nom || "";

        // 4. On cache l'indice GPS car on modifie une donnée existante
        const hint = document.getElementById('gpsHint');
        if(hint) hint.classList.add('hidden');

        // 5. On ouvre la modale
        const modalEl = document.getElementById('modal');
        if(modalEl) modalEl.classList.remove('hidden');
        if(inputDist) inputDist.focus();
    }
}

function validerSaisie() {
    const inputDist = document.getElementById('distanceInput');
    const inputNom = document.getElementById('locationNameInput');

    if (!inputDist) return;

    const valTexte = inputDist.value;
    const cm = parseFloat(valTexte);
    const nomLieu = inputNom ? inputNom.value.trim() : "";

    if (!isNaN(cm) && cm >= 0) {
        const metres = cm / 100;
        
        if (idEnCours !== null) {
            const index = activites.findIndex(a => a.id === idEnCours);
            if (index !== -1) {
                if (cm === 0) {
                    activites.splice(index, 1);
                } else {
                    activites[index].valeurMetres = metres;
                    activites[index].type = typeEnCours;
                    activites[index].nom = nomLieu;
                }
            }
        } else if (cm > 0) {
            let finalLat = coordEnCours ? coordEnCours.lat : null;
            let finalLng = coordEnCours ? coordEnCours.lng : null;

            if (nomLieu) {
                const lieuExistant = activites.find(a => 
                    a.nom && a.nom.toLowerCase() === nomLieu.toLowerCase() && a.lat && a.lng
                );
                if (lieuExistant) {
                    finalLat = lieuExistant.lat;
                    finalLng = lieuExistant.lng;
                }
            }
          
          SECRET_LIST.forEach(secret => {
            // Si pas déjà débloqué ET que la condition est remplie
            if (!unlockedSecrets.includes(secret.id) && secret.check(metres, nomLieu)) {
                unlockedSecrets.push(secret.id);
                localStorage.setItem('textile_secrets', JSON.stringify(unlockedSecrets));
                
                // Petit effet sympa
                alert(`🏆 SECRET DÉBLOQUÉ : ${secret.name}\n${secret.icon}`);
                vibrer("succès"); // Si tu as gardé la fonction vibrer
            }
        });

            activites.unshift({
                id: Date.now(),
                date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                type: typeEnCours,
                valeurMetres: metres,
                nom: nomLieu,
                note: 0,
                lat: finalLat,
                lng: finalLng
            });
        }
        
        sauvegarderEtAfficher();
        fermerPopup();
        if (typeof mapInstance !== 'undefined' && mapInstance) chargerMarqueurs();
    } else {
        alert("Veuillez entrer une distance valide.");
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
// 4. LOGIQUE PRINCIPALE (SAUVEGARDE ET AFFICHAGE)
// =============================================================

function sauvegarderEtAfficher() {
    // 1. Sauvegarde
    localStorage.setItem('sport_data', JSON.stringify(activites));

    // 2. Calculs
    let totalK = 0, total3 = 0;
    activites.forEach(a => {
        if (a.type === 'K') totalK += a.valeurMetres;
        else total3 += a.valeurMetres;
    });
    const totalGeneral = totalK + total3;

    // Mise à jour DOM des totaux
    const tk = document.getElementById('totalK'); if(tk) tk.innerText = totalK.toFixed(2) + " m";
    const t3 = document.getElementById('total3'); if(t3) t3.innerText = total3.toFixed(2) + " m";
    const tg = document.getElementById('totalGeneral'); if(tg) tg.innerText = totalGeneral.toFixed(2) + " m";

    // 3. WIDGET DE PROGRESSION
    let nextTrophy = TROPHY_LIST.find(t => t.m > totalGeneral);
    let targetM = nextTrophy ? nextTrophy.m : (totalGeneral * 1.5);
    let targetName = nextTrophy ? nextTrophy.name : "L'infini";

    let percent = totalGeneral > 0 ? (totalGeneral / targetM) * 100 : 0;
    if (percent > 100) percent = 100;

    const progressBar = document.getElementById('progressBar');
    const funFact = document.getElementById('funFact');
    const nextMilestone = document.getElementById('nextMilestone');

    if (progressBar) progressBar.style.width = percent + "%";
    
    if (funFact) {
        if (totalGeneral === 0) {
            funFact.innerText = "Commencez pour voir une comparaison !";
        } else {
            const done = [...TROPHY_LIST].reverse().find(t => t.m <= totalGeneral);
            if (done) {
                const count = (totalGeneral / done.m).toFixed(1);
                funFact.innerText = `C'est environ ${count}x ${done.name} (${done.m}m)`;
            } else {
                funFact.innerText = "En route vers la gloire...";
            }
        }
    }

    if (nextMilestone) {
        nextMilestone.innerText = `Objectif : ${targetName} (${(targetM - totalGeneral).toFixed(2)}m restants)`;
    }

    // 4. GÉNÉRATION DE LA LISTE (Avec appel à modifierLigne)
    const liste = document.getElementById('listeActivites');
    let html = "";
    const theme = getTheme(); 

    activites.forEach((act) => {
        const iconeVisuelle = act.type === 'K' ? theme.iconeK : theme.icone3;
        const stars = act.note > 0 ? "⭐".repeat(act.note) : "";
        
        // MODIFICATION ICI : On appelle modifierLigne(id) proprement
        html += `
            <div onclick="modifierLigne(${act.id})" 
            class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden group hover:border-purple-200 transition-colors cursor-pointer mb-2">
                
                <div class="flex items-center gap-3 z-10 w-full">
                    <span class="text-2xl shrink-0">${iconeVisuelle}</span> 
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline">
                            <p class="font-bold text-slate-700 text-sm">
                                ${(act.valeurMetres * 100).toFixed(0)} <span class="text-[10px] text-slate-400">CM</span>
                            </p>
                            <p class="text-[10px] text-slate-300 font-mono shrink-0">${act.date || ''}</p>
                        </div>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">
                            ${act.nom || 'Sans nom'} <span class="text-amber-400">${stars}</span>
                        </p>
                    </div>
                </div>
            </div>
        `;
    });

    if(liste) liste.innerHTML = html;
}

// =============================================================
// 5. CARTE
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

function chargerMarqueurs() {
    if (!mapInstance) return;

    mapInstance.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer !== userMarker) {
            mapInstance.removeLayer(layer);
        }
    });

    const lieux = {};
    activites.forEach(a => {
        if (a.lat && a.lng) {
            const key = a.lat.toFixed(5) + "," + a.lng.toFixed(5);
            if (!lieux[key]) {
                lieux[key] = { lat: a.lat, lng: a.lng, nom: a.nom || "Lieu mystère", total: 0 };
            }
            lieux[key].total += a.valeurMetres;
        }
    });

    const theme = getTheme(); 
    const emojiMap = theme.iconeMap;

    Object.values(lieux).forEach(lieu => {
        const customIcon = L.divIcon({
            className: 'custom-map-icon pin-icon', 
            html: `<div style="font-size: 28px; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3)); transform: translateY(-10px);">${emojiMap}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
            popupAnchor: [0, -30]
        });

        const marker = L.marker([lieu.lat, lieu.lng], {icon: customIcon}).addTo(mapInstance);
        
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
// 6. PARTAGE & PHOTO
// =============================================================
function ouvrirMenuPartage() { document.getElementById('photoModal').style.display = 'flex'; }
function fermerModal() { document.getElementById('photoModal').style.display = 'none'; }
function declencherAjoutPhoto() { const i = document.getElementById('imageInputTrigger'); if(i){ i.value=""; i.click(); } }
function lancerGenerationSansPhoto() { document.getElementById('photoContainer').style.display='none'; fermerModal(); genererImageEtAfficherApercu(); }
function traiterLaPhoto(i) { if(i.files && i.files[0]) { fermerModal(); let r = new FileReader(); r.onload=function(e){ let img=document.getElementById('userPhoto'); if(img){ img.src=e.target.result; document.getElementById('photoContainer').style.display='block'; setTimeout(()=>{genererImageEtAfficherApercu()},300); } }; r.readAsDataURL(i.files[0]); } }

// DANS script.js, remplace la fonction genererImageEtAfficherApercu par celle-ci :

function genererImageEtAfficherApercu() {
    const totalGen = document.getElementById('totalGeneral').innerText.replace(' m', '');
    document.getElementById('shareTotalK').innerText = document.getElementById('totalK').innerText;
    document.getElementById('shareTotal3').innerText = document.getElementById('total3').innerText;
    document.getElementById('shareTotalGeneral').innerText = totalGen;

    let rawFact = document.getElementById('funFact').innerText;
    
    // 1. On enlève le début de phrase
    let cleanFact = rawFact.replace("C'est environ ", "").replace("C'est exactement la taille de ", "");

    // 2. LA MODIF EST ICI : On enlève la partie entre parenthèses (la taille en mètres)
    // Cette ligne cherche "espace + parenthèse + n'importe quoi + parenthèse" et l'efface
    cleanFact = cleanFact.replace(/\s*\(.*?\)/, "");

    let texteFinal = cleanFact.trim().toUpperCase();
    if (texteFinal.length === 0) texteFinal = "MON SUIVI";

    // Mise à jour des textes de la carte
    const s = document.getElementById('shareFunFactSolid'); 
    const h = document.getElementById('shareFunFactHollow');
    s.innerText = texteFinal; 
    h.innerText = texteFinal;

    // --- Le reste de la fonction ne change pas ---
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

function copierDonnees() { const d = { ...localStorage }; const s = JSON.stringify(d); if(s==="{}"){alert("Rien à sauvegarder");return;} navigator.clipboard.writeText(s).then(()=>alert("✅ Copié !")).catch(()=>prompt("Copie ça:",s)); }
async function collerDonnees() { try { const t = await navigator.clipboard.readText(); const d = JSON.parse(t); localStorage.clear(); for(const[k,v]of Object.entries(d))localStorage.setItem(k,v); activites = JSON.parse(localStorage.getItem('sport_data'))||[]; sauvegarderEtAfficher(); alert("✅ Restauré !"); } catch(e){alert("Erreur: "+e.message);} }

// =============================================================
// 7. VUE TROPHÉES
// =============================================================

window.voirDetailsTrophee = function(index) {
    const trophee = TROPHY_LIST[index];
    let totalK = 0, total3 = 0;
    activites.forEach(a => {
        if (a.type === 'K') totalK += a.valeurMetres;
        else total3 += a.valeurMetres;
    });
    const totalM = totalK + total3;
    const fois = (totalM / trophee.m).toFixed(1);

    if (totalM < trophee.m) {
        const manque = (trophee.m - totalM).toFixed(2);
        alert(`🔒 Ce trophée est bloqué.\n\nIl te manque encore ${manque} mètres pour l'atteindre !`);
    } else {
        alert(`Tu as tapé ${fois} fois ${trophee.name} !`);
    }
};

function chargerTrophees() {
    const grid = document.getElementById('trophyGrid');
    const progressLabel = document.getElementById('trophyProgress');
    
    // 1. Calcul des totaux standards
    let totalK = 0, total3 = 0;
    activites.forEach(a => {
        if (a.type === 'K') totalK += a.valeurMetres;
        else total3 += a.valeurMetres;
    });
    const totalM = totalK + total3;

    let unlockedCount = 0;
    let html = "";

    // 2. BOUCLE DES TROPHÉES CLASSIQUES (inchangée)
    TROPHY_LIST.forEach((t, index) => {
        const isUnlocked = totalM >= t.m;
        if (isUnlocked) unlockedCount++;

        if (isUnlocked) {
            html += `
                <div onclick="voirDetailsTrophee(${index})" class="bg-white p-4 rounded-2xl shadow-sm border border-amber-100 flex flex-col items-center justify-center gap-2 relative overflow-hidden cursor-pointer transition-transform active:scale-95 hover:shadow-md" style="animation: popIn 0.3s ease-out forwards;">
                    <div class="absolute inset-0 bg-gradient-to-br from-yellow-50 to-white opacity-50 pointer-events-none"></div>
                    <span class="text-4xl relative z-10 filter drop-shadow-sm">${t.icon}</span>
                    <span class="text-xs font-bold text-slate-800 text-center relative z-10 leading-tight">${t.name}</span>
                    <span class="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full relative z-10 border border-amber-200">✅ ${t.m} m</span>
                </div>
            `;
        } else {
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

    // 3. AJOUT DES SECRETS À LA FIN
    if (SECRET_LIST.length > 0) {
        // Petit séparateur visuel (optionnel)
        html += `<div class="col-span-2 mt-4 mb-2 flex items-center justify-center"><div class="h-1 w-20 bg-slate-200 rounded-full"></div></div>`;

        SECRET_LIST.forEach((secret) => {
            const isSecretUnlocked = unlockedSecrets.includes(secret.id);

            if (isSecretUnlocked) {
                // Secret DÉCOUVERT (Style spécial "Dark/Gold")
                html += `
                    <div class="bg-slate-800 p-4 rounded-2xl shadow-md border border-slate-700 flex flex-col items-center justify-center gap-2 relative overflow-hidden cursor-pointer transition-transform active:scale-95" style="animation: popIn 0.3s ease-out forwards;">
                        <div class="absolute inset-0 bg-gradient-to-br from-purple-900 to-slate-900 opacity-50 pointer-events-none"></div>
                        <span class="text-4xl relative z-10 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">${secret.icon}</span>
                        <span class="text-xs font-bold text-white text-center relative z-10 leading-tight">${secret.name}</span>
                        <span class="text-[10px] font-bold text-purple-200 bg-purple-900/50 px-2 py-1 rounded-full relative z-10 border border-purple-500/30">SECRET</span>
                    </div>
                `;
            } else {
                // Secret NON DÉCOUVERT (Case mystérieuse)
                html += `
                    <div class="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 opacity-50 relative">
                        <span class="text-3xl grayscale opacity-20">❓</span>
                        <span class="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Secret</span>
                    </div>
                `;
            }
        });
    }

    if(grid) grid.innerHTML = html;
    if(progressLabel) progressLabel.innerText = `${unlockedCount} / ${TROPHY_LIST.length} PALIERS`;
}

// =============================================================
// 8. MODE DISCRET & CLIC SECRET (AVEC MÉMOIRE)
// =============================================================

// Cette fonction applique juste les changements visuels sans changer l'état
function appliquerThemeVisuel() {
    const t = getTheme();
    
    // Titre
    const h1 = document.querySelector('h1');
    if(h1) h1.innerText = t.titre;
    
    // Compteurs du haut
    const cards = document.querySelectorAll('.grid-cols-2 .text-2xl');
    if(cards.length >= 2) {
        cards[0].innerText = t.iconeK;
        cards[1].innerText = t.icone3;
    }

    // Boutons d'ajout (Accueil)
    const btns = document.querySelectorAll('.grid-cols-2 button');
    if(btns.length >= 2) {
        btns[0].innerText = t.btnK;
        btns[1].innerText = t.btn3;
    }

    // Boutons dans la modale (Sélecteurs)
    const btnSelectK = document.getElementById('btn-select-K');
    const btnSelect3 = document.getElementById('btn-select-3');
    if(btnSelectK) btnSelectK.innerText = t.iconeK;
    if(btnSelect3) btnSelect3.innerText = t.icone3;

    // Rafraîchir les listes et cartes
    sauvegarderEtAfficher();
    if(mapInstance) chargerMarqueurs();
}

function basculerModeDiscret() {
    // 1. On change l'état
    modeDiscretActif = !modeDiscretActif;
    
    // 2. SAUVEGARDE DANS LA MÉMOIRE DU TÉLÉPHONE
    localStorage.setItem('mode_discret_actif', modeDiscretActif);

    // 3. On applique les visuels
    appliquerThemeVisuel();

    // 4. Feedback
    alert(modeDiscretActif ? "💼 Mode Bureau activé" : "🦄 Mode Party activé");
}

let clickTimer = null;
let clickCount = 0;
function gererClicSecret() {
    clickCount++;
    if (clickCount === 1) {
        clickTimer = setTimeout(() => { clickCount = 0; }, 400);
    } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        basculerModeDiscret();
    }
}


// =============================================================
// 9. OUTIL RÈGLE (SYNCHRONISÉ)
// =============================================================
const CALIBRATION_CSS = "1.62cm"; 

let rulerStart = null;
let currentDistCM = 0;
let pixelsPerUnit = 0; 

function ouvrirRegle() {
    document.getElementById('rulerModal').classList.remove('hidden');
    forcerGrilleCSS();
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
    if(canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function validerRegle() {
    const input = document.getElementById('distanceInput');
    if(input) input.value = currentDistCM; 
    fermerRegle();
}

function forcerGrilleCSS() {
    const styleId = 'dynamic-grid-style';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = `
        .grid-background {
            background-size: ${CALIBRATION_CSS} ${CALIBRATION_CSS} !important;
        }
    `;
}

function calibrerEchelle() {
    const div = document.createElement("div");
    div.style.width = CALIBRATION_CSS; 
    div.style.height = "10px";
    div.style.position = "absolute";
    div.style.left = "-9999px"; 
    document.body.appendChild(div);
    pixelsPerUnit = div.getBoundingClientRect().width; 
    document.body.removeChild(div);
}

function initRulerCanvas() {
    const zone = document.getElementById('touchZone');
    const canvas = document.getElementById('rulerCanvas');
    const ctx = canvas.getContext('2d');
    const displayVal = document.getElementById('rulerValue');

    const rect = zone.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const getCoords = (e) => {
        const box = canvas.getBoundingClientRect();
        let cx, cy;
        if (e.touches && e.touches.length > 0) {
            cx = e.touches[0].clientX;
            cy = e.touches[0].clientY;
        } else {
            cx = e.clientX;
            cy = e.clientY;
        }
        return { x: cx - box.left, y: cy - box.top };
    };

    let isDrawing = false;
    const start = (e) => {
        if(e.type === 'touchstart') e.preventDefault(); 
        isDrawing = true;
        rulerStart = getCoords(e);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(rulerStart.x, rulerStart.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = "#9333ea"; ctx.fill();
    };

    const move = (e) => {
        if (!isDrawing || !rulerStart) return;
        if(e.type === 'touchmove') e.preventDefault();
        const c = getCoords(e);
        
        const dx = c.x - rulerStart.x;
        const dy = c.y - rulerStart.y;
        const distPixels = Math.sqrt(dx*dx + dy*dy);
        const rawUnits = distPixels / pixelsPerUnit;
        
        const partieEntiere = Math.floor(rawUnits);
        const partieDecimale = rawUnits - partieEntiere;
        const SEUIL = 0.85; 

        if (partieDecimale > SEUIL) currentDistCM = partieEntiere + 1;
        else currentDistCM = partieEntiere;

        displayVal.innerHTML = `${currentDistCM} <span class="text-sm">cm</span>`;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(rulerStart.x, rulerStart.y);
        ctx.lineTo(c.x, c.y);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#9333ea";
        ctx.setLineDash([10, 10]);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rulerStart.x, rulerStart.y, 5, 0, 2 * Math.PI);
        ctx.arc(c.x, c.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#9333ea"; ctx.fill();
    };

    const end = () => { isDrawing = false; };
    zone.onmousedown = start; zone.onmousemove = move; zone.onmouseup = end; zone.onmouseleave = end;
    zone.ontouchstart = start; zone.ontouchmove = move; zone.ontouchend = end;
}

// LANCEMENT INITIAL
appliquerThemeVisuel(); // Applique le thème (Party ou Bureau) sauvegardé
// Note : appliquerThemeVisuel appelle déjà sauvegarderEtAfficher(), donc pas besoin de le remettre
