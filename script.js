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
    const viewMarathon = document.getElementById('view-marathon');
    const viewMap = document.getElementById('view-map');
    const btnMarathon = document.getElementById('btn-nav-marathon');
    const btnMap = document.getElementById('btn-nav-map');

    // Les classes pour l'état ACTIF (Fond sombre, texte blanc, shadow)
    const activeClasses = ['bg-slate-800', 'text-white', 'shadow-lg', 'scale-105'];
    // Les classes pour l'état INACTIF (Fond transparent, texte gris)
    const inactiveClasses = ['bg-transparent', 'text-slate-400', 'hover:bg-slate-100'];

    if (vue === 'marathon') {
        viewMarathon.classList.remove('hidden');
        viewMap.classList.add('hidden');
        
        // On active Marathon
        btnMarathon.classList.add(...activeClasses);
        btnMarathon.classList.remove(...inactiveClasses);
        
        // On désactive Map
        btnMap.classList.add(...inactiveClasses);
        btnMap.classList.remove(...activeClasses);

    } else {
        viewMarathon.classList.add('hidden');
        viewMap.classList.remove('hidden');

        // On active Map
        btnMap.classList.add(...activeClasses);
        btnMap.classList.remove(...inactiveClasses);
        
        // On désactive Marathon
        btnMarathon.classList.add(...inactiveClasses);
        btnMarathon.classList.remove(...activeClasses);

        initMap();
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

function ouvrirPopup(typeDefaut, coords = null, nomPredefini = "") {
    idEnCours = null; 
    coordEnCours = coords; 
    
    // On met à jour l'interface selon le type choisi
    changerTypeSaisie(typeDefaut || 'K');

    document.getElementById('modalTitle').innerText = coords 
        ? (nomPredefini ? "Ajouter à " + nomPredefini : "Nouveau lieu") 
        : "Ajouter une distance";
    
    locationNameInput.value = nomPredefini;
    
    modal.classList.remove('hidden');
    distanceInput.focus();
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
    const cm = parseFloat(distanceInput.value);
    const nomLieu = locationNameInput.value.trim();
    
    if (!isNaN(cm) && cm >= 0) {
        const metres = cm / 100;
        
        if (idEnCours !== null) {
            // Modification
            const index = activites.findIndex(a => a.id === idEnCours);
            if (cm === 0) activites.splice(index, 1);
            else {
                activites[index].valeurMetres = metres;
                activites[index].type = typeEnCours; // On peut changer le type en modifiant
                if(nomLieu) activites[index].nom = nomLieu;
            }
        } else if (cm > 0) {
            // Création
            activites.unshift({
                id: Date.now(),
                date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                type: typeEnCours, // Utilise le type sélectionné dans la modale
                valeurMetres: metres,
                nom: nomLieu,
                lat: coordEnCours ? coordEnCours.lat : null,
                lng: coordEnCours ? coordEnCours.lng : null
            });
        }
        
        sauvegarderEtAfficher();
        fermerPopup();
        if(mapInstance) chargerMarqueurs();
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
        { t: 6.66, n: "Barbe Blanche (One Piece) 🏴‍☠️" },
        { t: 11.2, n: "la statue de la 'Bonne Mère' ⛪" },
        { t: 14.0, n: "un grand palmier du Vieux-Port 🌴" },
        { t: 25.0, n: "le bus 83 qui longe la Corniche 🚌" },
        { t: 45.0, n: "le Château d'If 🏰" },
        { t: 60.0, n: "le toit de l'Orange Vélodrome 🏟️" },
        { t: 86.0, n: "la Grande Roue du Vieux-Port 🎡" },
        { t: 149, n: "le sommet de Notre-Dame de la Garde ⛪" },
        { t: 161, n: "la Tour CMA CGM 🏙️" },
        { t: 300, n: "la file du Berghain 🇩🇪" },
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

    // Clic sur la carte (zone vide) -> Nouveau point
    mapInstance.on('click', function(e) {
        ouvrirPopup('K', e.latlng); // Ouvre avec Licorne par défaut, mais modifiable
    });

    mapInstance.locate({watch: true, enableHighAccuracy: true});
    mapInstance.on('locationfound', function(e) {
        if (!userMarker) {
            const iconUser = L.divIcon({ className: 'user-location-dot', html: '<div class="dot"></div><div class="pulse"></div>', iconSize: [20, 20] });
            userMarker = L.marker(e.latlng, {icon: iconUser}).addTo(mapInstance);
            mapInstance.flyTo(e.latlng, 13);
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
        const emoji = lieu.typeDominant === 'K' ? '🦄' : '3️⃣';
        
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
