// =============================================================
// SCRIPT.JS - VERSION COMPLETE (HYBRID + GAMIFICATION + SECRETS)
// =============================================================

// 1. CONFIGURATION HYBRIDE (PARTY vs OFFICE)
let modeDiscretActif = localStorage.getItem('mode_discret_actif') === 'true';

const THEMES = {
    PARTY: { iconeK: "🦄", icone3: "3️⃣", iconeMap: "👃", titre: "Mon Suivi", btnK: "+ 🦄", btn3: "+ 3️⃣" },
    OFFICE: { iconeK: "🎀", icone3: "🧵", iconeMap: "✂️", titre: "Sourcing Textile", btnK: "+ Ruban", btn3: "+ Tissu" }
};

function getTheme() { return modeDiscretActif ? THEMES.OFFICE : THEMES.PARTY; }

// --- GAMIFICATION (XP & NIVEAUX) ---
let userXP = parseInt(localStorage.getItem('textile_xp')) || 0;

const LEVELS = {
    0: { name: "Novice", xp: 0, unlock: "Liste de base" },
    1: { name: "Initié", xp: 100, unlock: "Carte (Map)" },         // DÉBLOQUE MAP
    2: { name: "Explorateur", xp: 300, unlock: "Trophées" },       // DÉBLOQUE TROPHÉES
    3: { name: "Analyste", xp: 600, unlock: "Smart Insights" },    // DÉBLOQUE DATA
    4: { name: "Architecte", xp: 1000, unlock: "Blueprint Mode" }, // DÉBLOQUE THÈME
    5: { name: "Directeur", xp: 2000, unlock: "Export Pro" }       // DÉBLOQUE PDF
};

function getCurrentLevel() {
    let lvl = 0;
    for (const [key, data] of Object.entries(LEVELS)) {
        if (userXP >= data.xp) lvl = parseInt(key);
    }
    return lvl;
}

// 2. DONNÉES (TA LISTE COMPLÈTE)
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

const SECRET_LIST = [
    { id: "Cook", icon: "🧑‍🍳", name: "Cuistot", hint: "Ca cook ou quoi la team", check: (m) => m === 30.03 },
    { id: "Vente", icon: "💰", name: "Vendeur", hint: "Lucratif cette histoire", check: (m) => m === 37.50 },
    { id: "Bonbon", icon: "💊", name: "L’ecstase", hint: "Il faut bien commencer quelque part", check: (m) => m === 30.03 }, // Attention doublon avec Cook (même distance)
    { id: "Vitesse", icon: "⚡️", name: "Vitesse", hint: "A la vitesse de la lumière", check: (m) => m === 2.99 },
    { id: "4", icon: "4️⃣", name: "3+1", hint: "Celui là il est facile", check: (m) => m === 44.44 },
    { id: "C", icon: "❄️", name: "Les bronzés", hint: "Vivement l'été", check: (m) => m === 21.06 },
    { id: "2CB", icon: "🚀", name: "Satellité", hint: "La constitution de la Veme République", check: (m) => m === 10.04 },
    { id: "Ice", icon: "🧊", name: "ICE", hint: "Sacré methcredi", check: (m) => m === 11.02 },
    { id: "H", icon: "💉", name: "Ustre", hint: "Année d'invention", check: (m) => m === 18.74 }
];

let unlockedSecrets = JSON.parse(localStorage.getItem('textile_secrets')) || [];
let activites = JSON.parse(localStorage.getItem('sport_data')) || [];
let typeEnCours = "K"; let idEnCours = null; let coordEnCours = null;


// =============================================================
// GESTION UI & ÉTATS (LE COEUR DU SYSTÈME)
// =============================================================

function updateUIState() {
    const lvl = getCurrentLevel();
    const t = getTheme();

    // 1. Appliquer le Thème (Party vs Office)
    const h1 = document.querySelector('h1'); if(h1) h1.innerText = t.titre;
    const iK = document.getElementById('icon-display-K'); if(iK) iK.innerText = t.iconeK;
    const i3 = document.getElementById('icon-display-3'); if(i3) i3.innerText = t.icone3;
    const bK = document.getElementById('btn-add-K'); if(bK) bK.innerText = t.btnK;
    const b3 = document.getElementById('btn-add-3'); if(b3) b3.innerText = t.btn3;
    const bsK = document.getElementById('btn-select-K'); if(bsK) bsK.innerText = t.iconeK;
    const bs3 = document.getElementById('btn-select-3'); if(bs3) bs3.innerText = t.icone3;

    // 2. Appliquer la Gamification (Locks & Rewards)
    const rankEl = document.getElementById('rankName'); if(rankEl) rankEl.innerText = LEVELS[lvl].name;
    const xpEl = document.getElementById('xpBar'); if(xpEl) xpEl.innerText = `| ${userXP} XP`;

    // Verrouillage Map (Niv 1)
    const btnMap = document.getElementById('btn-nav-map');
    if(btnMap) {
        if (lvl < 1) btnMap.classList.add('nav-locked'); 
        else btnMap.classList.remove('nav-locked');
    }

    // Verrouillage Trophées (Niv 2)
    const btnTrophy = document.getElementById('btn-nav-trophies');
    if(btnTrophy) {
        if (lvl < 2) btnTrophy.classList.add('nav-locked'); 
        else btnTrophy.classList.remove('nav-locked');
    }

    // Récompenses (Niv 3, 4, 5)
    const ins = document.getElementById('insightsSection'); if(ins) ins.className = (lvl >= 3) ? "mb-6" : "hidden";
    const blue = document.getElementById('btnBlueprint'); if(blue) blue.className = (lvl >= 4) ? "w-full mb-4 p-2 bg-slate-800 text-cyan-400 rounded-lg border border-cyan-900 shadow-lg text-xs font-mono animate-pulse" : "hidden";
    const expP = document.getElementById('btnExportPro'); if(expP) expP.className = (lvl >= 5) ? "w-full py-3 mb-3 bg-slate-800 text-white rounded-xl font-bold border border-slate-600" : "hidden";
}

function basculerModeDiscret() {
    modeDiscretActif = !modeDiscretActif;
    localStorage.setItem('mode_discret_actif', modeDiscretActif);
    updateUIState();
    sauvegarderEtAfficher(); 
    if(mapInstance) chargerMarqueurs();
    alert(modeDiscretActif ? "💼 Mode Bureau activé" : "🦄 Mode Party activé");
}

let clickTimer = null; let clickCount = 0;
function gererClicSecret() {
    clickCount++;
    if (clickCount === 1) { clickTimer = setTimeout(() => { clickCount = 0; }, 400); }
    else if (clickCount === 2) { clearTimeout(clickTimer); clickCount = 0; basculerModeDiscret(); }
}

function addXP(amount) {
    const oldLvl = getCurrentLevel();
    userXP += amount;
    localStorage.setItem('textile_xp', userXP);
    const newLvl = getCurrentLevel();
    if (newLvl > oldLvl) alert(`🎉 NIVEAU SUPÉRIEUR !\n\nVous êtes : ${LEVELS[newLvl].name}\nDébloqué : ${LEVELS[newLvl].unlock}`);
    updateUIState();
}

// =============================================================
// FONCTIONS CORE (Navigation, Saisie, Map)
// =============================================================

function changerVue(vue) {
    const lvl = getCurrentLevel();
    // Bloquage conditionnel
    if (vue === 'map' && lvl < 1) return alert("🔒 Atteignez le niveau Initié (100 XP) pour la Carte !");
    if (vue === 'trophies' && lvl < 2) return alert("🔒 Atteignez le niveau Explorateur (300 XP) pour les Trophées !");

    ['view-marathon', 'view-map', 'view-trophies'].forEach(v => document.getElementById(v).classList.add('hidden'));
    document.getElementById('view-' + vue).classList.remove('hidden');

    const cursor = document.getElementById('nav-cursor');
    if (vue === 'marathon') cursor.style.transform = 'translateX(0%)';
    if (vue === 'map') { cursor.style.transform = 'translateX(100%)'; initMap(); }
    if (vue === 'trophies') { cursor.style.transform = 'translateX(200%)'; chargerTrophees(); }
    
    document.querySelectorAll('nav button').forEach(b => b.classList.replace('text-white', 'text-slate-400'));
    document.getElementById('btn-nav-' + vue).classList.replace('text-slate-400', 'text-white');
}

// --- SAISIE ---
function changerTypeSaisie(t) { 
    typeEnCours = t; 
    const tData = getTheme(); // Pour avoir les bonnes icones
    // On met à jour l'UI des boutons select
    // (Simplification : on garde le style par défaut et on change juste l'opacité/bordure)
    const btnK = document.getElementById('btn-select-K');
    const btn3 = document.getElementById('btn-select-3');
    if(t === 'K') {
        btnK.className = "flex-1 py-3 rounded-xl border-2 border-purple-500 bg-purple-100 text-2xl transition-all shadow-inner";
        btn3.className = "flex-1 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-2xl transition-all opacity-50";
    } else {
        btn3.className = "flex-1 py-3 rounded-xl border-2 border-blue-600 bg-blue-100 text-2xl transition-all shadow-inner";
        btnK.className = "flex-1 py-3 rounded-xl border-2 border-slate-100 bg-slate-50 text-2xl transition-all opacity-50";
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

function modifierLigne(id) {
    const l = activites.find(a => a.id === id);
    if(l) {
        idEnCours = id;
        coordEnCours = null;
        changerTypeSaisie(l.type);
        document.getElementById('modalTitle').innerText = "Modifier l'entrée";
        document.getElementById('distanceInput').value = (l.valeurMetres * 100).toFixed(0);
        document.getElementById('locationNameInput').value = l.nom || "";
        document.getElementById('gpsHint').classList.add('hidden');
        document.getElementById('modal').classList.remove('hidden');
    }
}

function fermerPopup() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('distanceInput').value = "";
    document.getElementById('locationNameInput').value = "";
    coordEnCours = null;
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
            // --- MODE MODIFICATION ---
            const index = activites.findIndex(a => a.id === idEnCours);
            if (index !== -1) {
                if (cm === 0) {
                    // Suppression de l'entrée si on met la distance à 0
                    activites.splice(index, 1);
                } else {
                    activites[index].valeurMetres = metres;
                    activites[index].type = typeEnCours;
                    activites[index].nom = nomLieu;
                }
            }
        } else if (cm > 0) {
            // --- MODE CRÉATION ---
            let finalLat = coordEnCours ? coordEnCours.lat : null;
            let finalLng = coordEnCours ? coordEnCours.lng : null;

            // Récupération des coordonnées si le lieu existe déjà
            if (nomLieu) {
                const lieuExistant = activites.find(a => 
                    a.nom && a.nom.toLowerCase() === nomLieu.toLowerCase() && a.lat && a.lng
                );
                if (lieuExistant) {
                    finalLat = lieuExistant.lat;
                    finalLng = lieuExistant.lng;
                }
            }
          
            // 1. Vérification des Easter Eggs (Secrets)
            SECRET_LIST.forEach(secret => {
                if (!unlockedSecrets.includes(secret.id) && secret.check(metres, nomLieu)) {
                    unlockedSecrets.push(secret.id);
                    localStorage.setItem('textile_secrets', JSON.stringify(unlockedSecrets));
                    
                    alert(`🏆 SECRET DÉBLOQUÉ : ${secret.name}\n${secret.icon}`);
                    addXP(100); // Bonus de 100 XP pour la découverte d'un secret
                }
            });

            // 2. Ajout de la nouvelle activité en haut de la liste
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

            // 3. Gain d'XP uniquement basé sur la distance (250 XP par mètre)
            const gainXP = Math.floor(metres * 250);
            if (gainXP > 0) {
                addXP(gainXP);
            }
        }
        
        // Sécurité : On recalcule l'XP globale pour s'assurer que le compte est juste,
        // notamment en cas de modification ou de suppression d'une ligne.
        if (typeof synchroniserXP === 'function') {
            synchroniserXP();
        }
        
        // Mise à jour de l'interface et sauvegarde
        sauvegarderEtAfficher();
        fermerPopup();
        
        // Mise à jour de la carte si elle est initialisée
        if (typeof mapInstance !== 'undefined' && mapInstance) {
            chargerMarqueurs();
        }
    } else {
        alert("Veuillez entrer une distance valide.");
    }
}

// =============================================================
// RECALCUL RÉTROACTIF DE L'XP
// =============================================================
function synchroniserXP() {
    let xpCalculee = 0;
    
    // 1. XP liée au métrage (250 XP par mètre, pas de bonus par saisie)
    activites.forEach(a => {
        xpCalculee += Math.floor(a.valeurMetres * 250);
    });
    
    // 2. XP liée aux secrets (100 XP par secret)
    xpCalculee += (unlockedSecrets.length * 100);
    
    // On met à jour l'XP globale si le calcul donne un résultat différent
    if (userXP !== xpCalculee) {
        userXP = xpCalculee;
        localStorage.setItem('textile_xp', userXP);
    }
}
// GPS & Autocomplete
function getDistanceEnMetres(lat1, lon1, lat2, lon2) {
    const R = 6371e3; const dLat = (lat2-lat1)*Math.PI/180; const dLon = (lon2-lon1)*Math.PI/180;
    const a = Math.sin(dLat/2)*Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function detecterLieuEtAutocomplet() {
    const input = document.getElementById('locationNameInput');
    const datalist = document.getElementById('lieux-connus');
    const hint = document.getElementById('gpsHint');
    if(input) { input.value = ""; input.classList.remove('border-green-500', 'bg-green-50'); }
    if(hint) hint.classList.add('hidden');

    const lieuxUniques = {}; activites.forEach(a => { if (a.nom && a.lat) lieuxUniques[a.nom] = { lat: a.lat, lng: a.lng }; });
    if(datalist) datalist.innerHTML = Object.keys(lieuxUniques).map(nom => `<option value="${nom}">`).join('');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const myLat = pos.coords.latitude; const myLng = pos.coords.longitude;
            coordEnCours = { lat: myLat, lng: myLng };
            let match = null; let minD = 50;
            for (const [nom, coords] of Object.entries(lieuxUniques)) {
                const d = getDistanceEnMetres(myLat, myLng, coords.lat, coords.lng);
                if (d < minD) { minD = d; match = nom; }
            }
            if (match && input) { input.value = match; if(hint) hint.classList.remove('hidden'); input.classList.add('border-green-500', 'bg-green-50'); }
        }, err => console.log("GPS err", err), { enableHighAccuracy: true, timeout: 5000 });
    }
}

function resetData() {
    if(confirm("Attention : Voulez-vous vraiment TOUT effacer (Historique, Secrets, et retomber au Niveau 0) ?")) {
        // 1. Remise à zéro des variables JavaScript
        activites = [];
        unlockedSecrets = [];
        userXP = 0; // Remise à zéro de l'XP !
        
        // 2. Nettoyage ciblé de la mémoire du navigateur (localStorage)
        localStorage.removeItem('sport_data');     // Historique
        localStorage.removeItem('textile_data');   // Historique (sécurité selon la version)
        localStorage.removeItem('textile_secrets');// Les easter eggs
        localStorage.removeItem('textile_xp');     // L'expérience et le niveau
        
        // Note : On ne supprime PAS 'mode_discret_actif' pour qu'il garde son thème actuel (Bureau ou Party)
        
        // 3. Mise à jour de l'interface (Remet les cadenas, change le badge...)
        updateUIState();
        sauvegarderEtAfficher();
        
        // 4. Rafraîchir la carte si elle était ouverte
        if(typeof mapInstance !== 'undefined' && mapInstance) {
            chargerMarqueurs();
        }
        
        // 5. On force un rechargement propre de la page pour être 100% sûr du nettoyage
        location.reload();
    }
}

// =============================================================
// LOGIQUE PRINCIPALE (SAUVEGARDE ET AFFICHAGE)
// =============================================================

function sauvegarderEtAfficher() {
    localStorage.setItem('sport_data', JSON.stringify(activites));

    let k=0, t=0; activites.forEach(a => a.type === 'K' ? k+=a.valeurMetres : t+=a.valeurMetres);
    const total = k + t;

    const tk = document.getElementById('totalK'); if(tk) tk.innerText = k.toFixed(2) + " m";
    const t3 = document.getElementById('total3'); if(t3) t3.innerText = t.toFixed(2) + " m";
    const tg = document.getElementById('totalGeneral'); if(tg) tg.innerText = total.toFixed(2) + " m";

    // Widget
    let next = TROPHY_LIST.find(tr => tr.m > total) || { m: total*1.2, name: "L'Infini" };
    let pct = total > 0 ? (total/next.m)*100 : 0; if(pct>100) pct=100;

    const pb = document.getElementById('progressBar'); if(pb) pb.style.width = pct + "%";
    const ff = document.getElementById('funFact');
    if (ff) {
        if (total === 0) ff.innerText = "Commencez pour voir une comparaison !";
        else {
            const done = [...TROPHY_LIST].reverse().find(tr => tr.m <= total);
            ff.innerText = done ? `C'est environ ${(total/done.m).toFixed(1)}x ${done.name} (${done.m}m)` : "En route vers la gloire...";
        }
    }
    const nm = document.getElementById('nextMilestone'); if(nm) nm.innerText = `Objectif : ${next.name} (${(next.m - total).toFixed(2)}m)`;

    // Liste
    const list = document.getElementById('listeActivites');
    const theme = getTheme();
    if(list) {
        list.innerHTML = activites.map(a => {
            const icone = a.type === 'K' ? theme.iconeK : theme.icone3;
            return `
            <div onclick="modifierLigne(${a.id})" class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 relative overflow-hidden group hover:border-purple-200 transition-colors cursor-pointer mb-2">
                <div class="flex items-center gap-3 z-10 w-full">
                    <span class="text-2xl shrink-0">${icone}</span> 
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline">
                            <p class="font-bold text-slate-700 text-sm">${(a.valeurMetres * 100).toFixed(0)} <span class="text-[10px] text-slate-400">CM</span></p>
                            <p class="text-[10px] text-slate-300 font-mono shrink-0">${a.date || ''}</p>
                        </div>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">${a.nom || 'Sans nom'}</p>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    updateUIState();
}

// =============================================================
// VUE TROPHÉES
// =============================================================
window.voirDetailsTrophee = function(index) {
    const tr = TROPHY_LIST[index];
    let k=0, t=0; activites.forEach(a => a.type === 'K' ? k+=a.valeurMetres : t+=a.valeurMetres);
    const tot = k+t;
    if (tot < tr.m) alert(`🔒 Bloqué.\nManque ${(tr.m - tot).toFixed(2)} m.`);
    else alert(`Tu as tapé ${(tot/tr.m).toFixed(1)} fois ${tr.name} !`);
};

function chargerTrophees() {
    let k=0, t=0; activites.forEach(a => a.type === 'K' ? k+=a.valeurMetres : t+=a.valeurMetres);
    const tot = k+t;
    let unlocked = 0;

    let html = TROPHY_LIST.map((tr, idx) => {
        const isU = tot >= tr.m;
        if(isU) unlocked++;
        return `
        <div onclick="voirDetailsTrophee(${idx})" class="p-4 rounded-xl border flex flex-col items-center relative overflow-hidden active:scale-95 transition-transform ${isU ? 'bg-white border-green-200' : 'bg-slate-100 grayscale opacity-50'}">
            <span class="text-3xl relative z-10">${tr.icon}</span>
            <span class="text-xs font-bold mt-2 relative z-10 text-center">${tr.name}</span>
            <span class="text-[10px] bg-slate-100 px-2 rounded mt-1 relative z-10">${tr.m} m</span>
            ${isU ? '<div class="absolute inset-0 bg-gradient-to-br from-yellow-50 to-white opacity-50"></div>' : ''}
        </div>`;
    }).join('');

    if(SECRET_LIST.length > 0) {
        html += `<div class="col-span-2 h-1 bg-slate-200 rounded my-4"></div>`;
        html += SECRET_LIST.map(s => {
            if(unlockedSecrets.includes(s.id)) {
                return `<div class="bg-slate-800 text-white p-4 rounded-xl flex flex-col items-center relative overflow-hidden"><div class="absolute inset-0 bg-gradient-to-br from-purple-900 to-slate-900 opacity-50"></div><span class="text-3xl relative z-10">${s.icon}</span><span class="text-xs font-bold relative z-10">${s.name}</span></div>`;
            } else {
                return `<div onclick="alert('Indice : ${s.hint}')" class="bg-slate-50 border-2 border-dashed p-4 rounded-xl flex flex-col items-center opacity-50 cursor-help"><span class="text-3xl">❓</span><span class="text-xs">Secret</span></div>`;
            }
        }).join('');
    }

    const grid = document.getElementById('trophyGrid'); if(grid) grid.innerHTML = html;
    const pl = document.getElementById('trophyProgress'); if(pl) pl.innerText = `${unlocked} / ${TROPHY_LIST.length} PALIERS`;
}

// =============================================================
// REWARDS (Insights, Blueprint, Export)
// =============================================================
function showLevelInfo() {
    const lvl = getCurrentLevel();
    const next = LEVELS[lvl+1];
    let msg = `Niveau : ${LEVELS[lvl].name} (${userXP} XP)`;
    if(next) msg += `\nProchain : ${next.name} (${next.xp} XP) -> ${next.unlock}`;
    alert(msg);
}
function showInsights() {
    let k=0, t=0; activites.forEach(a => a.type === 'K' ? k++ : t++);
    let totalM = 0; activites.forEach(a => totalM += a.valeurMetres);
    document.getElementById('statCount').innerText = activites.length;
    document.getElementById('statAvg').innerText = (activites.length ? (totalM/activites.length).toFixed(2) : 0) + " m";
    document.getElementById('statDom').innerText = k > t ? "Type 1" : "Type 2";
    document.getElementById('insightsModal').classList.remove('hidden');
}
function toggleBlueprint() { document.body.classList.toggle('theme-blueprint'); }

// =============================================================
// CARTE & RÈGLE & PARTAGE
// =============================================================
function initMap() {
    if(mapInstance) return;
    mapInstance = L.map('map', {zoomControl: false}).setView([46.60, 1.88], 5);
    const plan = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png');
    plan.addTo(mapInstance);
    // Reward Niv 3+ : Satellite
    if(getCurrentLevel() >= 3) {
        L.control.layers({ "Plan": plan }, { "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}') }).addTo(mapInstance);
    }
    mapInstance.on('click', e => ouvrirPopup('K', e.latlng));
    mapInstance.locate({watch: true, enableHighAccuracy: true});
    mapInstance.on('locationfound', e => {
        if(!userMarker) { 
            const icon = L.divIcon({className: 'user-location-dot', html: '<div class="dot"></div><div class="pulse"></div>', iconSize: [20,20]});
            userMarker = L.marker(e.latlng, {icon: icon}).addTo(mapInstance);
        } else userMarker.setLatLng(e.latlng);
    });
    chargerMarqueurs();
}

function ouvrirMenuPartage() { document.getElementById('photoModal').classList.remove('hidden'); }
// ... (Les fonctions genererImage, traiterPhoto, etc. restent identiques, je les laisse actives via le bloc précédent ou tu peux les remettre si besoin) ...
// Pour être sûr, je remets le strict minimum pour l'export :
function genererImage(mode) {
    const container = document.getElementById('shareCardContainer');
    container.style.display = 'block';
    
    if (mode === 'pro') {
        container.style.background = "white"; container.style.color = "black"; container.style.fontFamily = "Courier New";
        let listHTML = activites.slice(0, 5).map(a => `<div style="border-bottom:1px solid #ccc; padding:5px; display:flex; justify-content:space-between;"><span>${a.type==='K'?'TYPE A':'TYPE B'}</span><span>${(a.valeurMetres*100).toFixed(0)}cm</span></div>`).join('');
        container.innerHTML = `<div style="text-align:center; font-weight:bold; border-bottom:2px solid black; margin-bottom:10px;">FICHE TECHNIQUE</div>${listHTML}<div style="margin-top:20px; font-weight:bold; text-align:right;">TOTAL: ${document.getElementById('totalGeneral').innerText}</div>`;
    } else {
        genererImageEtAfficherApercu(); // Appel à ton ancienne fonction fun
        return;
    }

    setTimeout(() => {
        html2canvas(container).then(c => {
            container.style.display = 'none';
            c.toBlob(b => {
                const url = URL.createObjectURL(b);
                const win = window.open("");
                win.document.write(`<img src="${url}" style="width:100%; box-shadow:0 0 20px rgba(0,0,0,0.2); margin:20px auto; display:block; max-width:400px;">`);
            });
        });
    }, 200);
}

// RÈGLE
const CALIBRATION_CSS = "1.62cm"; let rulerStart=null; let currentDistCM=0; let pixelsPerUnit=0;
function ouvrirRegle() { document.getElementById('rulerModal').classList.remove('hidden'); forcerGrilleCSS(); calibrerEchelle(); initRulerCanvas(); }
function fermerRegle() { document.getElementById('rulerModal').classList.add('hidden'); resetRegle(); }
function resetRegle() { currentDistCM=0; rulerStart=null; document.getElementById('rulerValue').innerHTML=`0 <span class="text-sm">cm</span>`; const c=document.getElementById('rulerCanvas'); if(c)c.getContext('2d').clearRect(0,0,c.width,c.height); }
function validerRegle() { const i=document.getElementById('distanceInput'); if(i)i.value=currentDistCM; fermerRegle(); }
function forcerGrilleCSS() { const id='dynamic-grid'; let s=document.getElementById(id); if(!s){s=document.createElement('style');s.id=id;document.head.appendChild(s);} s.innerHTML=`.grid-background{background-size:${CALIBRATION_CSS} ${CALIBRATION_CSS}!important;}`; }
function calibrerEchelle() { const d=document.createElement('div'); d.style.width=CALIBRATION_CSS; d.style.position='absolute'; d.style.left='-9999px'; document.body.appendChild(d); pixelsPerUnit=d.getBoundingClientRect().width; document.body.removeChild(d); }
function initRulerCanvas() {
    const z=document.getElementById('touchZone'); const c=document.getElementById('rulerCanvas'); const ctx=c.getContext('2d');
    c.width=z.getBoundingClientRect().width; c.height=z.getBoundingClientRect().height;
    const getC = e => { const b=c.getBoundingClientRect(); const t=e.touches?e.touches[0]:e; return {x:t.clientX-b.left, y:t.clientY-b.top}; };
    let d=false;
    const start=e=>{ if(e.type==='touchstart')e.preventDefault(); d=true; rulerStart=getC(e); ctx.clearRect(0,0,c.width,c.height); ctx.beginPath(); ctx.arc(rulerStart.x,rulerStart.y,4,0,2*Math.PI); ctx.fillStyle="#9333ea"; ctx.fill(); };
    const move=e=>{ if(!d)return; if(e.type==='touchmove')e.preventDefault(); const p=getC(e); 
        const dx=p.x-rulerStart.x; const dy=p.y-rulerStart.y; const dist=Math.sqrt(dx*dx+dy*dy); 
        const raw=dist/pixelsPerUnit; const dec=raw-Math.floor(raw); 
        currentDistCM = dec>0.85 ? Math.floor(raw)+1 : Math.floor(raw);
        document.getElementById('rulerValue').innerHTML=`${currentDistCM} <span class="text-sm">cm</span>`;
        ctx.clearRect(0,0,c.width,c.height); ctx.beginPath(); ctx.moveTo(rulerStart.x,rulerStart.y); ctx.lineTo(p.x,p.y); ctx.lineWidth=4; ctx.strokeStyle="#9333ea"; ctx.setLineDash([10,10]); ctx.stroke(); ctx.beginPath(); ctx.arc(rulerStart.x,rulerStart.y,5,0,2*Math.PI); ctx.arc(p.x,p.y,5,0,2*Math.PI); ctx.fillStyle="#9333ea"; ctx.fill();
    };
    const end=()=>{d=false;};
    z.onmousedown=start; z.onmousemove=move; z.onmouseup=end; z.ontouchstart=start; z.ontouchmove=move; z.ontouchend=end;
}

// =============================================================
// SAUVEGARDE & RESTAURATION (Import/Export sans rechargement)
// =============================================================

function copierDonnees() { 
    const d = { ...localStorage }; 
    const s = JSON.stringify(d); 
    if(s === "{}") { alert("Rien à sauvegarder"); return; } 
    navigator.clipboard.writeText(s)
        .then(() => alert("✅ Copié !"))
        .catch(() => prompt("Copie ça:", s)); 
}

// NOUVELLE FONCTION : Met à jour l'écran à chaud sans recharger la page
function actualiserDonneesEnMemoire() {
    // 1. On recharge les variables depuis le LocalStorage (en gérant les différentes clés possibles)
    activites = JSON.parse(localStorage.getItem('textile_data')) || JSON.parse(localStorage.getItem('sport_data')) || [];
    unlockedSecrets = JSON.parse(localStorage.getItem('textile_secrets')) || JSON.parse(localStorage.getItem('unlocked_secrets')) || [];
    userXP = parseInt(localStorage.getItem('textile_xp')) || 0;
    modeDiscretActif = localStorage.getItem('mode_discret_actif') === 'true';
    
    // 2. On met à jour l'interface visuelle
    updateUIState();
    sauvegarderEtAfficher();
    chargerTrophees();
    
    if (typeof mapInstance !== 'undefined' && mapInstance) {
        chargerMarqueurs();
    }
}

async function collerDonnees() { 
    try { 
        const t = await navigator.clipboard.readText(); 
        const d = JSON.parse(t); 
        
        localStorage.clear(); 
        for(const [k,v] of Object.entries(d)) localStorage.setItem(k, v); 
        
        actualiserDonneesEnMemoire(); // On rafraîchit à chaud
        alert("✅ Données restaurées avec succès !"); 
        
    } catch(e) {
        // Fallback si le presse-papier automatique est bloqué (ex: Safari)
        const manuel = prompt("Impossible de lire le presse-papier automatiquement.\nColle ton texte de sauvegarde ici :");
        if (manuel) {
            try {
                const dManuel = JSON.parse(manuel);
                localStorage.clear();
                for(const [k,v] of Object.entries(dManuel)) localStorage.setItem(k, v);
                
                actualiserDonneesEnMemoire(); // On rafraîchit à chaud
                alert("✅ Données restaurées !");
            } catch (err) {
                alert("❌ Erreur : Le texte collé n'est pas une sauvegarde valide.");
            }
        }
    } 
}

function resetData() {
    if(confirm("Attention : Voulez-vous vraiment TOUT effacer (Historique, Secrets, et retomber au Niveau 0) ?")) {
        // 1. On vide tout
        activites = [];
        unlockedSecrets = [];
        userXP = 0;
        
        localStorage.removeItem('sport_data');
        localStorage.removeItem('textile_data');
        localStorage.removeItem('textile_secrets');
        localStorage.removeItem('unlocked_secrets');
        localStorage.removeItem('textile_xp');
        
        // 2. On rafraîchit à chaud
        actualiserDonneesEnMemoire();
        alert("🧹 Application remise à zéro !");
    }
}
// INIT
synchroniserXP(); // Recalcule l'XP au chargement pour les anciens utilisateurs
updateUIState();
sauvegarderEtAfficher();
