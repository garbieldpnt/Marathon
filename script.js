// =============================================================
// 1. CONFIGURATION & DONNÉES
// =============================================================
let activites = JSON.parse(localStorage.getItem('sport_data')) || [];
let typeEnCours = "";
let idEnCours = null;

// Éléments DOM fréquemment utilisés
const modal = document.getElementById('modal');
const distanceInput = document.getElementById('distanceInput');

// =============================================================
// 2. FONCTIONS DE SAISIE (Ajout / Modif)
// =============================================================

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
            // Modification ou Suppression
            const index = activites.findIndex(a => a.id === idEnCours);
            if (cm === 0) {
                activites.splice(index, 1); // Suppression si 0
            } else {
                activites[index].valeurMetres = metres; // Modif
            }
        } else if (cm > 0) {
            // Création
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

function resetData() {
    if(confirm("Effacer tout l'historique ?")) {
        activites = [];
        sauvegarderEtAfficher();
    }
}

// =============================================================
// 3. LOGIQUE PRINCIPALE (Calculs & Affichage)
// =============================================================

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
    { t: 1.90, n: "Adrien askip" },  
    { t: 1.93, n: "Nolan / un vigile" },

    // --- MARSEILLE ICONIQUE ---
    { t: 2.50, n: "une colonne du Palais Longchamp 🏛️" },
    { t: 5.00, n: "la statue du David (Prado) 🗿" },
    { t: 11.2, n: "la statue de la 'Bonne Mère' (sans le clocher) " },
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

    // Trouver le meilleur match
    let meilleurMatch = megaBiblio[0];
    let diffMin = Math.abs(totalGeneral - megaBiblio[0].t);
    megaBiblio.forEach(item => {
        let diff = Math.abs(totalGeneral - item.t);
        if (diff < diffMin) { diffMin = diff; meilleurMatch = item; }
    });

    // Message Fun Fact
    const ecart = Math.abs(totalGeneral - meilleurMatch.t);
    let msg = "";
    if (ecart < 0.005 && totalGeneral > 0) {
        msg = `C'est <b>exactement</b> la taille de <b>${meilleurMatch.n}</b> ! 🎯`;
        vibrer("pile");
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

// =============================================================
// 4. PARTAGE ET PHOTO (Le cœur du problème réglé)
// =============================================================

// 1. DÉCLENCHEURS
function ouvrirMenuPartage() {
    document.getElementById('photoModal').style.display = 'flex';
}

function fermerModal() {
    document.getElementById('photoModal').style.display = 'none';
}

function declencherAjoutPhoto() {
    const input = document.getElementById('imageInputTrigger');
    if (input) {
        input.value = ""; // Reset pour permettre de reprendre la même photo
        input.click();
    }
}

function lancerGenerationSansPhoto() {
    document.getElementById('photoContainer').style.display = 'none';
    fermerModal();
    genererImageEtAfficherApercu();
}

function traiterLaPhoto(input) {
    if (input.files && input.files[0]) {
        fermerModal(); // On ferme tout de suite pour fluidifier

        let reader = new FileReader();
        reader.onload = function(event) {
            let img = document.getElementById('userPhoto');
            if (img) {
                img.src = event.target.result;
                document.getElementById('photoContainer').style.display = 'block';
                
                // Petit délai pour l'affichage DOM avant capture
                setTimeout(() => {
                    genererImageEtAfficherApercu();
                }, 300);
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 2. CŒUR DU SYSTÈME : GÉNÉRATION + APERÇU
function genererImageEtAfficherApercu() {
    // --- A. Préparation des textes ---
    const totalGen = document.getElementById('totalGeneral').innerText.replace(' m', '');
    document.getElementById('shareTotalK').innerText = document.getElementById('totalK').innerText;
    document.getElementById('shareTotal3').innerText = document.getElementById('total3').innerText;
    document.getElementById('shareTotalGeneral').innerText = totalGen;

    let rawFact = document.getElementById('funFact').innerText;
    let cleanFact = rawFact.replace("C'est environ ", "").replace("C'est exactement la taille de ", "PILE : ").replace("En attente de data...", "");
    let texteFinal = cleanFact.replace(/[^a-zA-Z0-9àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ\s.,!?'"()\/-]/g, '').trim().toUpperCase();
    if (texteFinal.length === 0) texteFinal = "MON WRAPPED";

    // Taille police
    let taillePolice = 38;
    if (texteFinal.length > 60) taillePolice = 22;
    else if (texteFinal.length > 40) taillePolice = 26;
    else if (texteFinal.length > 25) taillePolice = 30;

    const solidText = document.getElementById('shareFunFactSolid');
    const hollowText = document.getElementById('shareFunFactHollow');
    solidText.style.fontSize = taillePolice + "px";
    hollowText.style.fontSize = taillePolice + "px";
    solidText.innerText = texteFinal;
    hollowText.innerText = texteFinal;

    // --- B. Clonage Propre ---
    document.querySelectorAll('[id^="clone_"]').forEach(el => el.remove()); // Nettoyage
    const original = document.getElementById('shareCardContainer');
    const clone = original.cloneNode(true);
    const uniqueID = "clone_" + Date.now();
    clone.id = uniqueID;
    
    Object.assign(clone.style, {
        position: 'fixed', top: '0', left: '0',
        width: '400px', height: '400px',
        zIndex: '-9999', display: 'block'
    });
    document.body.appendChild(clone);

    // --- C. Capture ---
    setTimeout(() => {
        const target = document.getElementById(uniqueID);
        if(!target) return;

        html2canvas(target, {
            backgroundColor: "#bc13fe",
            scale: 1, // Scale 1 pour stabilité iPhone
            useCORS: true,
            logging: false
        }).then(canvas => {
            target.remove(); // Ménage

            canvas.toBlob(blob => {
                if (!blob) return;
                // AU LIEU DE PARTAGER DIRECTEMENT, ON LANCE L'APERÇU
                afficherEcranValidation(blob);
            });
        }).catch(err => {
            if(document.getElementById(uniqueID)) document.getElementById(uniqueID).remove();
            alert("Erreur génération. Réessaie.");
        });
    }, 200);
}

// 3. NOUVELLE FONCTION : L'ÉCRAN INTERMÉDIAIRE
function afficherEcranValidation(blob) {
    const url = URL.createObjectURL(blob);
    const file = new File([blob], 'wrapped.png', { type: 'image/png' });

    // Création de l'interface en JS pur (pour ne pas toucher ton HTML)
    const overlay = document.createElement('div');
    Object.assign(overlay.style, {
        position: 'fixed', inset: '0', backgroundColor: 'rgba(0,0,0,0.95)',
        zIndex: '10000', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '20px'
    });

    // Image
    const img = document.createElement('img');
    img.src = url;
    Object.assign(img.style, {
        width: '80%', maxWidth: '350px', borderRadius: '15px',
        boxShadow: '0 0 20px rgba(188, 19, 254, 0.4)'
    });

    // Bouton Partager
    const btnShare = document.createElement('button');
    btnShare.innerHTML = "Envoyer 🚀";
    Object.assign(btnShare.style, {
        padding: '15px 30px', borderRadius: '50px', border: 'none',
        backgroundColor: '#bc13fe', color: 'white', fontSize: '18px',
        fontWeight: 'bold', cursor: 'pointer'
    });

    // Bouton Fermer
    const btnClose = document.createElement('button');
    btnClose.innerHTML = "Fermer";
    Object.assign(btnClose.style, {
        background: 'transparent', border: 'none', color: '#888',
        marginTop: '10px', textDecoration: 'underline'
    });

    // ACTION AU CLIC (C'est ici que la magie opère pour iOS)
    btnShare.onclick = () => {
        if (navigator.share && navigator.canShare({ files: [file] })) {
            navigator.share({
                files: [file],
                title: 'My Wrapped'
            }).then(() => {
                document.body.removeChild(overlay); // Ferme après succès
            }).catch(console.error);
        } else {
            alert("Appuie longuement sur l'image pour l'enregistrer !");
        }
    };

    btnClose.onclick = () => document.body.removeChild(overlay);

    overlay.appendChild(img);
    overlay.appendChild(btnShare);
    overlay.appendChild(btnClose);
    document.body.appendChild(overlay);
}


// =============================================================
// 5. SAUVEGARDE ET RESTAURATION
// =============================================================

function copierDonnees() {
    // CORRECTION : On force la conversion du Storage en véritable Objet JavaScript
    // L'opérateur { ...localStorage } permet de cloner proprement les données
    const donneesBrutes = { ...localStorage };
    const sauvegarde = JSON.stringify(donneesBrutes);
    
    // Vérification de sécurité
    if (sauvegarde === "{}" || Object.keys(donneesBrutes).length === 0) {
        alert("⚠️ Il n'y a aucune donnée à sauvegarder (Historique vide).");
        return;
    }

    navigator.clipboard.writeText(sauvegarde)
        .then(() => alert("✅ Données copiées dans le presse-papier !\n\nTu peux maintenant aller sur l'autre version de l'app et cliquer sur 'Restaurer'."))
        .catch(err => {
            // Fallback si le presse-papier échoue (rare mais possible)
            console.error(err);
            alert("❌ Le copier-coller automatique a échoué.\nNous allons essayer une autre méthode.");
            prompt("Copie ce texte manuellement :", sauvegarde);
        });
}

async function collerDonnees() {
    try {
        const text = await navigator.clipboard.readText();
        if (!text || !text.startsWith("{")) {
            alert("⚠️ Presse-papier vide ou invalide. Copie d'abord tes données.");
            return;
        }

        const data = JSON.parse(text);
        
        // 1. On met à jour la base de données du navigateur
        localStorage.clear();
        for (const [key, val] of Object.entries(data)) {
            localStorage.setItem(key, val);
        }

        // 2. LA CORRECTION : On met à jour l'affichage SANS recharger la page
        // On recharge la variable globale 'activites' avec les nouvelles données
        activites = JSON.parse(localStorage.getItem('sport_data')) || [];
        
        // On lance la fonction principale qui recalcule tout
        sauvegarderEtAfficher();

        alert("✅ Données restaurées et affichage mis à jour !");
        
    } catch (e) {
        alert("❌ Erreur : " + e.message);
    }
}

// Lancement au chargement de la page
sauvegarderEtAfficher();
