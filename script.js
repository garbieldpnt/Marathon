
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

    // --- NOUVEAUTÉ : Mise à jour des textes du leaderboard ---
    // Si modeDiscretActif est vrai, on envoie 'bureau', sinon on envoie 'party'
    const modeActuel = modeDiscretActif ? 'bureau' : 'party';
    actualiserTextesClassement(modeActuel);
    // ---------------------------------------------------------

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
    
    // 1. Blocage conditionnel (Sécurité Niveau)
    if (vue === 'map' && lvl < 1) return alert("🔒 Atteignez le niveau Initié (100 XP) pour la Carte !");
    if (vue === 'trophies' && lvl < 2) return alert("🔒 Atteignez le niveau Explorateur (300 XP) pour les Trophées !");
    if (vue === 'leaderboard' && lvl < 1) return alert("🔒 Atteignez le niveau Initié (100 XP) pour le Classement !");

    // 2. Masquer toutes les vues (Ajout de view-leaderboard dans la liste)
    ['view-marathon', 'view-map', 'view-trophies', 'view-leaderboard'].forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('hidden');
    });

    // 3. Afficher la vue demandée
    const targetView = document.getElementById('view-' + vue);
    if (targetView) targetView.classList.remove('hidden');

    // 4. Gestion du curseur (Translation par tranche de 100%)
    const cursor = document.getElementById('nav-cursor');
    if (cursor) {
        if (vue === 'marathon') cursor.style.transform = 'translateX(0%)';
        if (vue === 'map') { cursor.style.transform = 'translateX(100%)'; initMap(); }
        if (vue === 'trophies') { cursor.style.transform = 'translateX(200%)'; chargerTrophees(); }
        if (vue === 'leaderboard') { cursor.style.transform = 'translateX(300%)'; afficherLeaderboard(); }
    }
    
    // 5. Gestion des couleurs des boutons (Passage de slate-400 à white)
    document.querySelectorAll('nav button').forEach(b => {
        b.classList.replace('text-white', 'text-slate-400');
    });
    const activeBtn = document.getElementById('btn-nav-' + vue);
    if (activeBtn) activeBtn.classList.replace('text-slate-400', 'text-white');
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
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">${a.nom || 'Chez les fous peut-être'}</p>
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
    document.getElementById('insightTotal').innerText = totalM.toFixed(2) + " m";
    document.getElementById('statAvg').innerText = (activites.length ? (totalM/activites.length).toFixed(2) : 0) + " m";
    document.getElementById('statDom').innerText = k > t ? "Type 1" : "Type 2";
    // 1. Calcul des valeurs numériques
const grammes = (totalM * 100) / 120;
const prixTotal = grammes * 30;

// 2. Mise à jour directe du texte dans ton HTML
document.getElementById('statPoids').innerText = grammes.toFixed(1) + " g";
document.getElementById('statPrix').innerText = prixTotal.toFixed(2) + " €";
    // On récupère le total (ex: 12 mètres), on multiplie par 100 et on divise par 120
    document.getElementById('insightsModal').classList.remove('hidden');
}


// Appelle cette fonction là où tu affiches ton score total
// Exemple : calculerPoidsTissu(monTotalMetres);
function toggleBlueprint() { document.body.classList.toggle('theme-blueprint'); }

// =============================================================
// CARTE & RÈGLE & PARTAGE
// =============================================================

let mapInstance = null;
let userMarker = null;
let aDejaZoome = false;

function initMap() {
    if (mapInstance) return;

    // 1. Initialisation de la carte
    mapInstance = L.map('map', { zoomControl: false }).setView([46.60, 1.88], 5);

    // 2. Couche de base (Voyager)
    const plan = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png');
    plan.addTo(mapInstance);

    // 3. Option Satellite (Niveau 3+)
    if (typeof getCurrentLevel === 'function' && getCurrentLevel() >= 3) {
        const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}');
        L.control.layers({ "Plan": plan }, { "Satellite": satellite }).addTo(mapInstance);
    }

    // 4. Clic pour ajouter un marqueur
    mapInstance.on('click', e => {
        if (typeof ouvrirPopup === 'function') {
            ouvrirPopup('K', e.latlng);
        }
    });

    // 5. Géolocalisation
    mapInstance.locate({ watch: true, enableHighAccuracy: true });

    mapInstance.on('locationfound', e => {
        // Mise à jour du point bleu
        if (!userMarker) {
            const icon = L.divIcon({
                className: 'user-location-dot',
                html: '<div class="dot"></div><div class="pulse"></div>',
                iconSize: [20, 20]
            });
            userMarker = L.marker(e.latlng, { icon: icon }).addTo(mapInstance);
        } else {
            userMarker.setLatLng(e.latlng);
        }

        // Zoom automatique une seule fois
        if (!aDejaZoome) {
            mapInstance.setView(e.latlng, 16);
            aDejaZoome = true;
        }
    });

    mapInstance.on('locationerror', () => {
        console.log("Géolocalisation refusée.");
    });
 // <--- Vérifie bien que cette accolade est présente !
    chargerMarqueurs();
}

function chargerMarqueurs() {
    if (!mapInstance) return;

    // 1. Nettoyer les anciens marqueurs (sauf la position de l'utilisateur)
    mapInstance.eachLayer((layer) => {
        if (layer instanceof L.Marker && layer !== userMarker) {
            mapInstance.removeLayer(layer);
        }
    });

    // 2. Regrouper les activités par lieu pour éviter les doublons au même endroit
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

    // 3. Récupérer l'émoji du mode actuel (Party 👃 ou Bureau ✂️)
    const theme = getTheme(); 
    const emojiMap = theme.iconeMap;

    // 4. Placer les nouveaux marqueurs sur la carte
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
// =============================================================
// PARTAGE & EXPORT IMAGE (Visuel Réseau avec Photo & PDF Pro)
// =============================================================

function ouvrirMenuPartage() {
    const modal = document.getElementById('photoModal');
    if (modal) modal.classList.remove('hidden');
}

function fermerMenuPartage() {
    const modal = document.getElementById('photoModal');
    if (modal) modal.classList.add('hidden');
}

function genererImage(mode) {
    fermerMenuPartage(); 

    if (mode === 'pro') {
        // ==========================================
        // --- MODE PDF PRO (TOUTES LES ENTRÉES) ---
        // ==========================================
        if (typeof window.html2pdf === 'undefined') {
            const script = document.createElement('script');
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
            script.onload = () => genererImage('pro'); 
            document.head.appendChild(script);
            return;
        }

        const pdfContainer = document.createElement('div');
        pdfContainer.style.padding = '20px';
        pdfContainer.style.fontFamily = "'Helvetica Neue', Helvetica, Arial, sans-serif";
        pdfContainer.style.color = '#1e293b';

        const theme = getTheme();
        let tableRows = activites.map(a => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 10px 5px; font-size: 12px;">${a.date}</td>
                <td style="padding: 10px 5px; font-size: 16px; text-align: center;">${a.type === 'K' ? theme.iconeK : theme.icone3}</td>
                <td style="padding: 10px 5px; font-size: 12px;">${a.nom || '-'}</td>
                <td style="padding: 10px 5px; font-size: 12px; text-align: right;">${(a.valeurMetres * 100).toFixed(0)} cm</td>
            </tr>
        `).join('');

        pdfContainer.innerHTML = `
            <div style="text-align: center; border-bottom: 2px solid #0f172a; margin-bottom: 20px; padding-bottom: 15px;">
                <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Fiche de Sourcing Globale</h1>
                <p style="margin: 5px 0 0 0; color: #64748b; font-size: 12px;">Généré le ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
                <div><strong>Total Global :</strong> <span style="color: #bc13fe; font-size: 16px;">${document.getElementById('totalGeneral') ? document.getElementById('totalGeneral').innerText : '0 m'}</span></div>
                <div><strong>Nombre d'entrées :</strong> ${activites.length}</div>
            </div>

            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background-color: #0f172a; color: white;">
                        <th style="padding: 10px 5px; font-size: 12px;">Date</th>
                        <th style="padding: 10px 5px; font-size: 12px;">Type</th>
                        <th style="padding: 10px 5px; font-size: 12px;">Lieu / Projet</th>
                        <th style="padding: 10px 5px; font-size: 12px; text-align: right;">Longueur</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        `;

        const opt = {
            margin:       15,
            filename:     'Sourcing_Complet.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(pdfContainer).save();

    } else {
        // ==========================================
        // --- MODE FUN / RÉSEAU (AVEC PHOTO) ---
        // ==========================================
        
        // 1. Demander si on veut une photo
        if (confirm("📸 Veux-tu ajouter une photo de fond pour ton visuel ?")) {
            // Création d'un champ d'upload invisible
            const inputPhoto = document.createElement('input');
            inputPhoto.type = 'file';
            inputPhoto.accept = 'image/*'; // N'accepte que les images
            
            inputPhoto.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        // On lance la capture avec la photo
                        lancerCaptureRapport(event.target.result);
                    };
                    reader.readAsDataURL(file); // Convertit l'image pour html2canvas
                } else {
                    lancerCaptureRapport(null); // Annulation -> pas de photo
                }
            };
            inputPhoto.click(); // Ouvre la galerie
        } else {
            // On lance directement sans photo
            lancerCaptureRapport(null);
        }
    }
}

// Fonction interne qui gère le clonage une fois la photo choisie (ou non)
function lancerCaptureRapport(photoDataUrl) {
    if (typeof window.html2canvas === 'undefined') {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = () => lancerCaptureRapport(photoDataUrl);
        document.head.appendChild(script);
        return;
    }

    const oContainer = document.getElementById('shareCardContainer');
    if (!oContainer) return alert("❌ Erreur HTML : 'shareCardContainer' introuvable.");

    // Nettoyage des clones précédents
    document.querySelectorAll('[id^="clone_"]').forEach(el => el.remove());

    try {
        // 1. Injection de la Photo si elle existe
        const photoCont = document.getElementById('photoContainer');
        const userPhoto = document.getElementById('userPhoto');
        if (photoCont && userPhoto) {
            if (photoDataUrl) {
                userPhoto.src = photoDataUrl;
                photoCont.style.display = 'block'; // Affiche le conteneur photo
            } else {
                userPhoto.src = '';
                photoCont.style.display = 'none'; // Cache si pas de photo
            }
        }

        // 2. Peuplement des textes
        const tg = document.getElementById('totalGeneral');
        const stg = document.getElementById('shareTotalGeneral');
        if (stg && tg) stg.innerText = tg.innerText.replace(' m', '');

        const tk = document.getElementById('totalK');
        const stk = document.getElementById('shareTotalK');
        if (stk && tk) stk.innerText = tk.innerText;

        const t3 = document.getElementById('total3');
        const st3 = document.getElementById('shareTotal3');
        if (st3 && t3) st3.innerText = t3.innerText;

        let texteFinal = "MON SUIVI";
        const ff = document.getElementById('funFact');
        if (ff && ff.innerText) {
            let cleanFact = ff.innerText
                .replace("C'est environ ", "")
                .replace("C'est exactement la taille de ", "")
                .replace(/\s*\(.*?\)/g, ""); 
            texteFinal = cleanFact.trim().toUpperCase() || "MON SUIVI";
        }

        const s = document.getElementById('shareFunFactSolid');
        if (s) s.innerText = texteFinal;
        
        const h = document.getElementById('shareFunFactHollow');
        if (h) h.innerText = texteFinal;
        
    } catch (err) {
        console.error(err);
        return alert("❌ Erreur de peuplement HTML. Vérifiez vos IDs.");
    }

    // 3. Clonage et Capture
    const clone = oContainer.cloneNode(true);
    const uid = "clone_" + Date.now();
    clone.id = uid;
    Object.assign(clone.style, {
        position:'fixed', top:'0', left:'0', width:'400px', height:'400px', 
        zIndex:'-9999', display:'block', visibility:'visible'
    });
    document.body.appendChild(clone);

    // Petit délai pour laisser l'image (photo) charger dans le DOM
    setTimeout(() => {
        const target = document.getElementById(uid);
        if(!target) return;
        
        html2canvas(target, {
            backgroundColor: "#bc13fe", 
            scale: 2, // HD
            useCORS: true, 
            logging: false
        }).then(cv => {
            target.remove(); 
            cv.toBlob(b => { 
                if(!b) return alert("Erreur lors de la création de l'image."); 
                afficherEcranValidation(b); 
            });
        }).catch(e => { 
            if(document.getElementById(uid)) document.getElementById(uid).remove(); 
            alert("Erreur génération réseau."); 
        });
    }, 500); // 500ms c'est plus sûr pour laisser la photo s'afficher avant de "prendre la capture"
}

// 3. Interface de Partage Final (Natif iOS/Android)
function afficherEcranValidation(blob) {
    const url = URL.createObjectURL(blob);
    const file = new File([blob], 'wrapped.png', { type: 'image/png' });
    
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', inset: '0', backgroundColor: 'rgba(0,0,0,0.95)', 
        zIndex: '10000', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '20px'
    });
    
    const img = document.createElement('img'); 
    img.src = url;
    Object.assign(img.style, {
        width: '100%', maxWidth: '350px', borderRadius: '15px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
    });
    
    const btnShare = document.createElement('button'); 
    btnShare.innerHTML = "Partager 🚀";
    Object.assign(btnShare.style, {
        padding: '15px 30px', borderRadius: '50px', border: 'none', 
        backgroundColor: '#bc13fe', color: 'white', fontSize: '18px', 
        fontWeight: 'bold', cursor: 'pointer', width: '100%', maxWidth: '350px'
    });
    
    const btnClose = document.createElement('button'); 
    btnClose.innerHTML = "Fermer";
    Object.assign(btnClose.style, {
        background: 'transparent', border: 'none', color: '#888', 
        marginTop: '10px', textDecoration: 'underline', fontSize: '16px'
    });

    btnShare.onclick = () => {
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({ 
                files: [file], 
                title: 'Mon Sourcing', 
                text: 'Regarde mon avancement !' 
            }).then(() => {
                document.body.removeChild(overlay);
                URL.revokeObjectURL(url);
            }).catch(e => console.log(e));
        } else { 
            alert("Appuie longuement sur l'image (ou clic droit) pour l'enregistrer dans ton téléphone !"); 
        }
    };
    
    btnClose.onclick = () => {
        document.body.removeChild(overlay);
        URL.revokeObjectURL(url);
    };
    
    overlay.appendChild(img); 
    overlay.appendChild(btnShare); 
    overlay.appendChild(btnClose); 
    document.body.appendChild(overlay);
}

// =============================================================
// LEADERBOARD SUPABASE (Multijoueur) - SÉCURISÉ
// =============================================================

// Tes identifiants (À REMPLACER par les tiens)
const supabaseUrl = 'https://fjgcayrqfociipmhpqza.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZ2NheXJxZm9jaWlwbWhwcXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MTI4MTIsImV4cCI6MjA4ODE4ODgxMn0.CGOJEjbW2f-K27X0ZrgupmY3mqHcScScdZZ9PYQAGfM';

// 1. Connexion "Paresseuse" (Anti-crash)
// 1. Connexion "Paresseuse" (Anti-crash CodePen)
function getSupabase() {
    if (typeof window.supabase === 'undefined') {
        alert("La base de données charge encore, réessaie dans une seconde !");
        return null;
    }
    
    if (!window.maBaseDeDonnees) {
        // NOUVEAU : On ajoute une option pour désactiver la recherche d'authentification
        window.maBaseDeDonnees = window.supabase.createClient(supabaseUrl, supabaseKey, {
            auth: {
                persistSession: false // 👈 C'est cette ligne qui empêche le crash sur CodePen !
            }
        });
    }
    return window.maBaseDeDonnees;
}

// 2. Fonction pour envoyer/mettre à jour son score
async function publierScore() {
    const db = getSupabase();
    if (!db) return; // Arrêt sécurisé si pas chargé

    const totalGeneralEl = document.getElementById('totalGeneral');
    if (!totalGeneralEl) return alert("Erreur : Impossible de lire le total.");
    
    const total = parseFloat(totalGeneralEl.innerText.replace(' m', ''));

    if (total <= 0) {
        return alert("Tu dois avoir un score supérieur à 0 pour entrer dans le classement !");
    }

    const pseudo = prompt("🏆 Entre ton pseudo pour le classement mondial :");
    if (!pseudo || pseudo.trim() === "") return;

    // Envoi à la base de données
    const { error } = await db
        .from('Leaderboard')
        .upsert(
            { pseudo: pseudo.trim(), score_metres: total }, 
            { onConflict: 'pseudo' }
        );

    if (error) {
        console.error("Erreur Supabase :", error);
        alert("Oups, impossible de publier le score.");
    } else {
        alert(`Félicitations ${pseudo} ! Ton score de ${total}m est en ligne.`);
        afficherLeaderboard(); 
    }
}

// 3. Fonction pour récupérer et afficher le Top 10
async function afficherLeaderboard() {
    const db = getSupabase();
    if (!db) return;

    // 1. Récupération du Top 10
    const { data, error } = await db
        .from('Leaderboard')
        .select('pseudo, score_metres')
        .order('score_metres', { ascending: false })
        .limit(10);

    if (error) return console.error("Erreur :", error);

    const podiumBox = document.getElementById('podium-container');
    const listBox = document.getElementById('leaderboard-list');
    
    podiumBox.innerHTML = '';
    listBox.innerHTML = '';

    if (!data || data.length === 0) {
        listBox.innerHTML = "<p class='text-center text-slate-500 py-10 uppercase font-bold text-xs'>Aucun score pour le moment...</p>";
        return;
    }

// --- LOGIQUE DU PODIUM (TOP 3) ---
    const podiumOrder = [1, 0, 2]; 
    
    podiumOrder.forEach((posIndex) => {
        const joueur = data[posIndex];
        if (!joueur) {
            podiumBox.innerHTML += `<div class="flex-1 opacity-0"></div>`;
            return;
        }

        const isFirst = posIndex === 0;
        const color = isFirst ? 'bg-yellow-500' : (posIndex === 1 ? 'bg-slate-300' : 'bg-orange-500');
        const height = isFirst ? 'h-32' : (posIndex === 1 ? 'h-24' : 'h-20');
        const medal = isFirst ? '🥇' : (posIndex === 1 ? '🥈' : '🥉');

        podiumBox.innerHTML += `
            <div class="flex flex-col items-center flex-1">
                <span class="text-slate-800 font-black text-[10px] mb-2 truncate w-20 text-center uppercase tracking-tighter">
                    ${joueur.pseudo}
                </span>
                
                <div class="${height} ${color} w-full rounded-t-2xl relative flex flex-col items-center justify-start pt-3 shadow-lg">
                    <span class="text-2xl mb-1">${medal}</span>
                    <div class="flex flex-col items-center leading-none">
                        <span class="text-slate-900 font-black text-sm">${joueur.score_metres.toFixed(1)}</span>
                        <span class="text-slate-900/60 font-bold text-[8px] uppercase">Mètres</span>
                    </div>
                </div>
            </div>
        `;
    });

    // --- LOGIQUE DE LA LISTE (TOP 4-10) ---
    if (data.length > 3) {
        data.slice(3).forEach((joueur, index) => {
            listBox.innerHTML += `
                <div class="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div class="flex items-center gap-4">
                        <span class="text-slate-400 font-bold w-6 text-sm">#${index + 4}</span>
                        <span class="text-slate-800 font-bold uppercase tracking-tight text-sm">${joueur.pseudo}</span>
                    </div>
                    <div class="flex items-baseline gap-1">
                        <span class="text-[#bc13fe] font-black">${joueur.score_metres.toFixed(2)}</span>
                        <span class="text-[9px] text-slate-400 font-bold uppercase">m</span>
                    </div>
                </div>
            `;
        });
    }
    

}

function actualiserTextesClassement(modeActif) {
    const titre = document.getElementById('lb-titre');
    const sousTitre = document.getElementById('lb-sous-titre');
    const cta = document.getElementById('lb-cta');
    const btn = document.getElementById('lb-btn');

    // Sécurité au cas où la page n'est pas encore chargée
    if (!titre) return; 

    if (modeActif === 'party') {
        titre.innerText = "Marathon de la DROGUE";
        sousTitre.innerText = "Le classement des tox de Marseille";
        cta.innerText = "Prêt à casser le score ?";
        btn.innerText = "Lâcher mon score 🚀";
        
        // Optionnel : tu peux même changer la couleur du bouton ici si tu veux
        btn.classList.replace('bg-blue-600', 'bg-[#bc13fe]'); // Exemple
    } else { 
        // Mode Bureau
        titre.innerText = "Performance Sourcing";
        sousTitre.innerText = "Classement professionnel des saisies";
        cta.innerText = "Enregistrez vos metrics";
        btn.innerText = "Publier mes résultats 📊";
        
        // Optionnel : couleur plus sobre pour le bureau
        btn.classList.replace('bg-[#bc13fe]', 'bg-blue-600'); // Exemple
    }
}
function afficherTopSpots() {
    let cumulsParLieu = {};

    // 1. On s'assure d'utiliser le bon tableau. 
    // (Si ton code utilise 'sport_data' au lieu de 'activites', remplace le mot ci-dessous)
    let donnees = typeof activites !== 'undefined' ? activites : []; 
    if (donnees.length === 0) return; // Si c'est vide, on s'arrête

    // 2. On parcourt tes saisies avec LES BONS MOTS
    donnees.forEach(saisie => {
        // Dans ta sauvegarde, le lieu s'appelle "nom". Si c'est vide (""), on met "Spot Inconnu"
        let nomLieu = saisie.nom || "Spot Inconnu";
        
        // Dans ta sauvegarde, la distance s'appelle "valeurMetres" !
        let distance = parseFloat(saisie.valeurMetres) || 0;

        // On additionne dans la bonne enveloppe
        if (cumulsParLieu[nomLieu]) {
            cumulsParLieu[nomLieu] += distance;
        } else {
            cumulsParLieu[nomLieu] = distance;
        }
    });

    // 3. On transforme en liste
    let tableauLieux = [];
    for (let lieu in cumulsParLieu) {
        if (cumulsParLieu[lieu] > 0) {
            tableauLieux.push({
                nom: lieu,
                totalMetres: cumulsParLieu[lieu]
            });
        }
    }

    // 4. On trie du plus grand au plus petit
    tableauLieux.sort((a, b) => b.totalMetres - a.totalMetres);

    // 5. On affiche le résultat
    const conteneurListe = document.getElementById('liste-top-lieux');
    if (!conteneurListe) return; 

    conteneurListe.innerHTML = ''; 

    tableauLieux.forEach(lieu => {
        conteneurListe.innerHTML += `
            <div class="flex justify-between items-center border-b border-slate-200 pb-3">
                <span class="text-slate-600 text-[15px]">${lieu.nom} :</span>
                <span class="text-slate-900 font-bold text-[15px]">${lieu.totalMetres.toFixed(2)} m</span>
            </div>
        `;
    });
    

    // 6. On ouvre la fenêtre
    document.getElementById('modal-top-lieux').classList.remove('hidden');
}
// INIT
synchroniserXP(); // Recalcule l'XP au chargement pour les anciens utilisateurs
updateUIState();
sauvegarderEtAfficher();
