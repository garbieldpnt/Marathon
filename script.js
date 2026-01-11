let activites = JSON.parse(localStorage.getItem('sport_data')) || [];
let typeEnCours = "";

// Fonctions pour gérer le Pop-up
function ouvrirPopup(type) {
    typeEnCours = type;
    const emoji = (type === 'K') ? '🦄' : '3️⃣';
    document.getElementById('modalTitle').innerText = "Ajouter " + emoji + " (en cm)";
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('distanceInput').focus();
}

function fermerPopup() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('distanceInput').value = "";
}

// Fonction de validation
function validerSaisie() {
    const input = document.getElementById('distanceInput');
    const cm = parseFloat(input.value);

    if (!isNaN(cm) && cm > 0) {
        const metres = cm / 100; // Conversion pour le calcul
        
        const nouvelleActivite = {
            id: Date.now(),
            date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
            type: typeEnCours,
            valeurMetres: metres
        };
        
        activites.unshift(nouvelleActivite);
        sauvegarderEtAfficher();
        fermerPopup();
    } else {
        alert("Oups ! Entrez un nombre valide.");
    }
}

// LE BLOC QUI CALCULE ET AFFICHE TOUT
function sauvegarderEtAfficher() {
    localStorage.setItem('sport_data', JSON.stringify(activites));
    
    let sumK = 0;      // Total pour 🦄
    let sum3 = 0;      // Total pour 3️⃣
    let html = "";

    activites.forEach(act => {
        const isK = act.type === "K";
        
        // 1. On additionne les mètres pour les totaux du haut
        if(isK) {
            sumK += act.valeurMetres;
        } else {
            sum3 += act.valeurMetres;
        }

        // 2. On repasse en cm uniquement pour l'affichage de la ligne d'historique
        const valeurAfficheeCm = (act.valeurMetres * 100).toFixed(0);

        html += `
            <div class="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <span class="text-xl">${isK ? '🦄' : '3️⃣'}</span>
                <span class="text-xs text-slate-400 font-medium">${act.date}</span>
                <p class="font-black text-slate-800">${valeurAfficheeCm} <span class="text-[10px] font-normal text-slate-500 uppercase">cm</span></p>
            </div>`;
    });

    // 3. CALCUL DU TOTAL GÉNÉRAL
    const totalGeneral = sumK + sum3;

    // 4. MISE À JOUR DU HTML
    document.getElementById('totalK').innerText = sumK.toFixed(2) + " m";
    document.getElementById('total3').innerText = sum3.toFixed(2) + " m";
    
    // C'est ici qu'on affiche le total des deux catégories réunies
    document.getElementById('totalGeneral').innerText = totalGeneral.toFixed(2) + " m";
    
    document.getElementById('listeActivites').innerHTML = html || "<p class='text-center text-slate-400 py-4'>Aucun historique</p>";
}

function resetData() {
    if(confirm("Effacer tout l'historique ?")) {
        activites = [];
        sauvegarderEtAfficher();
    }
}

// Lancement au chargement de la page
sauvegarderEtAfficher();

