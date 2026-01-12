let activites = JSON.parse(localStorage.getItem('sport_data')) || [];
let typeEnCours = "";
let idEnCours = null;

const modal = document.getElementById('modal');
const distanceInput = document.getElementById('distanceInput');

// --- FONCTIONS MOBILES ---
function vibrer(type) {
    if (!window.navigator.vibrate) return;
    if (type === "succès") window.navigator.vibrate([50, 30, 50]);
    else if (type === "pile") window.navigator.vibrate(200);
}

function ouvrirPopup(type) {
    typeEnCours = type;
    idEnCours = null; 
    const emoji = (type === 'K') ? '🦄' : '3️⃣';
    document.getElementById('modalTitle').innerText = "Ajouter " + emoji + " (cm)";
    modal.classList.remove('hidden');
    distanceInput.focus();
}

function modifierLigne(id) {
    const ligne = activites.find(a => a.id === id);
    if (ligne) {
        idEnCours = id;
        typeEnCours = ligne.type;
        const emoji = (typeEnCours === 'K') ? '🦄' : '3️⃣';
        document.getElementById('modalTitle').innerText = "Modifier " + emoji;
        distanceInput.value = (ligne.valeurMetres * 100).toFixed(0);
        modal.classList.remove('hidden');
        distanceInput.focus();
    }
}

function fermerPopup() {
    modal.classList.add('hidden');
    distanceInput.value = "";
}

function validerSaisie() {
    const cm = parseFloat(distanceInput.value);
    if (!isNaN(cm) && cm >= 0) {
        const metres = cm / 100;
        if (idEnCours !== null) {
            const index = activites.findIndex(a => a.id === idEnCours);
            if (cm === 0) activites.splice(index, 1);
            else activites[index].valeurMetres = metres;
        } else if (cm > 0) {
            activites.unshift({
                id: Date.now(),
                date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                type: typeEnCours,
                valeurMetres: metres
            });
        }
        sauvegarderEtAfficher();
        fermerPopup();
    }
}

// --- LOGIQUE PRINCIPALE ---
function sauvegarderEtAfficher() {
    localStorage.setItem('sport_data', JSON.stringify(activites));
    
    let sumK = 0, sum3 = 0, html = "";

    activites.forEach(act => {
        const isK = act.type === "K";
        if(isK) sumK += act.valeurMetres; else sum3 += act.valeurMetres;
        const valCm = (act.valeurMetres * 100).toFixed(0);
        html += `
            <div onclick="modifierLigne(${act.id})" class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm active:bg-slate-50">
                <span class="text-xl">${isK ? '🦄' : '3️⃣'}</span>
                <span class="text-[10px] text-slate-400 font-medium">${act.date}</span>
                <p class="font-black text-slate-800">${valCm} <span class="text-[10px] font-normal text-slate-500 uppercase">cm</span></p>
            </div>`;
    });

    const totalGeneral = sumK + sum3;

    const megaBiblio = [
    // --- PETITES DISTANCES (Musique & Tech) ---
    { t: 0.02, n: "un fader de table de mixage 🎚️" },
    { t: 0.05, n: "un bouchon d'oreille (indispensable !) 👂" },
    { t: 0.12, n: "un disque vinyle 7 pouces 💿" },
    { t: 0.30, n: "un vinyle 12 pouces (Maxi) 🎶" },
    { t: 0.45, n: "une platine Technics SL-1200 🎧" },
    { t: 1.00, n: "un câble XLR de 1 mètre 🔌" },

    // --- ARTISTES & PERSONNAGES ---
    { t: 1.57, n: "Fleur" },
    { t: 1.65, n: "Anaïs" },
    { t: 1.63, n: "Sara / Peggy Gou" },
    { t: 1.70, n: "Gabriel / Charlotte de Witte " },
    { t: 1.77, n: "Amelie Lens" },
    { t: 1.83, n: "Carl Cox" },
    { t: 1.88, n: "Jolan / un caisson de basse Funktion-One" },
    { t: 1.93, n: "Nolan / un vigile" },

    // --- MARSEILLE ICONIQUE ---
    { t: 2.50, n: "une colonne du Palais Longchamp 🏛️" },
    { t: 5.00, n: "la statue du David (Prado) 🗿" },
    { t: 11.2, n: "la statue de la 'Bonne Mère' (sans le clocher) ⛪" },
    { t: 14.0, n: "un grand palmier du Vieux-Port 🌴" },
    { t: 25.0, n: "le bus 83 qui longe la Corniche 🚌" },
    { t: 36.0, n: "le Pavillon M 🏢" },
    { t: 45.0, n: "le Château d'If (hauteur des remparts) 🏰" },
    { t: 60.0, n: "le toit de l'Orange Vélodrome 🏟️" },
    { t: 86.0, n: "la Grande Roue du Vieux-Port 🎡" },
    { t: 149, n: "le sommet de Notre-Dame de la Garde ⛪" },
    { t: 161, n: "la Tour CMA CGM 🏙️" },

    // --- GRANDS DELIRES ---
    { t: 300, n: "une file d'attente interminable devant le Berghain 🇩🇪" },
    { t: 828, n: "le Burj Khalifa 🏗️" },
    { t: 1000, n: "1 km!!! (c'est beaucoupr trop seek help Xays)" },
    { t: 42195, n: "UN MARATHON C'EST UN FUCKING MARATHON PAR PITIE C'EST UNE BLAGUE" },
];

    // Trouver meilleur match
    let meilleurMatch = megaBiblio[0];
    let diffMin = Math.abs(totalGeneral - megaBiblio[0].t);
    megaBiblio.forEach(item => {
        let diff = Math.abs(totalGeneral - item.t);
        if (diff < diffMin) { diffMin = diff; meilleurMatch = item; }
    });

    // Message et Effets
    const ecart = Math.abs(totalGeneral - meilleurMatch.t);
    let msg = "";
    if (ecart < 0.001 && totalGeneral > 0) {
        msg = `C'est <b>exactement</b> la taille de <b>${meilleurMatch.n}</b> ! 🎯`;
        vibrer("pile");
        new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3').play().catch(() => {});
    } else {
        const ratio = (totalGeneral / (meilleurMatch.t || 1)).toFixed(1);
        msg = totalGeneral > 0 ? `C'est environ <b>${ratio} x</b> la taille de <b>${meilleurMatch.n}</b>` : "En attente de data...";
        if (idEnCours === null && activites.length > 0) vibrer("succès");
    }

    // Barre de progression
    let prochain = megaBiblio.find(item => item.t > totalGeneral) || megaBiblio[megaBiblio.length - 1];
    let actuelPourBarre = [...megaBiblio].reverse().find(item => item.t <= totalGeneral) || megaBiblio[0];
    let pourcent = ((totalGeneral - actuelPourBarre.t) / (prochain.t - actuelPourBarre.t)) * 100;

    // Mise à jour DOM
    document.getElementById('totalK').innerText = sumK.toFixed(2) + " m";
    document.getElementById('total3').innerText = sum3.toFixed(2) + " m";
    document.getElementById('totalGeneral').innerText = totalGeneral.toFixed(2) + " m";
    document.getElementById('funFact').innerHTML = msg;
    document.getElementById('progressBar').style.width = (totalGeneral >= 1000 ? 100 : Math.max(0, Math.min(pourcent, 100))) + "%";
    document.getElementById('nextMilestone').innerText = totalGeneral < 1000 ? `Cap : ${prochain.n}` : "Gros record ! 🏆";
    document.getElementById('listeActivites').innerHTML = html || "<p class='text-center text-slate-400 py-4 text-sm'>Ajoute ta première distance</p>";
}

function resetData() {
    if(confirm("Effacer tout l'historique ?")) {
        activites = [];
        sauvegarderEtAfficher();
    }
}

// Lancement
sauvegarderEtAfficher();

// Remplacez votre ancienne fonction partagerStats par celle-ci

function partagerStats() {
    // 1. Récupération des données existantes...
    document.getElementById('shareTotalK').innerText = document.getElementById('totalK').innerText;
    document.getElementById('shareTotal3').innerText = document.getElementById('total3').innerText;
    document.getElementById('shareTotalGeneral').innerText = document.getElementById('totalGeneral').innerText.replace(' m', '');

    // 2. Préparation du texte de comparaison
    let rawFact = document.getElementById('funFact').innerText;
    let cleanFact = rawFact.replace("C'est environ ", "").replace("C'est exactement la taille de ", "PILE : ");
    // On enlève les émojis pour un look plus "clean" type poster
    let texteFinal = cleanFact.replace(/🎯|🔥/g, '').toUpperCase();

    // 3. INJECTION DANS LES DEUX CALQUES
    // On remplit le calque du fond (Solid)
    document.getElementById('shareFunFactSolid').innerText = texteFinal;
    // On remplit le calque du dessus (Hollow)
    document.getElementById('shareFunFactHollow').innerText = texteFinal;

    const container = document.getElementById('shareCardContainer');

    // On attend que les polices soient prêtes
    document.fonts.ready.then(() => {
        html2canvas(container, {
            backgroundColor: "#000",
            scale: 2, // Pour une image haute définition
            logging: false,
        }).then(canvas => {
            canvas.toBlob(blob => {
                const file = new File([blob], 'techno-stats.png', { type: 'image/png' });
                if (navigator.share && navigator.canShare({ files: [file] })) {
                    navigator.share({
                        files: [file],
                        title: 'TADAAA',
                    });
                } else {
                    downloadImage(canvas.toDataURL());
                }
            });
        });
    });
}
// Fonction utilitaire pour télécharger l'image (si le partage natif n'est pas possible)
function downloadImage(dataUrl) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'MesStatsTechno.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert("Votre carte de stats a été téléchargée !");
}

function gererPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('userPhoto').src = e.target.result;
            document.getElementById('photoContainer').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}
