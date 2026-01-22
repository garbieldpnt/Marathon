function partagerStats() {
    // -----------------------------------------------------------
    // ÉTAPE 1 : TEXTES & NETTOYAGE (Inchangé)
    // -----------------------------------------------------------
    const totalGen = document.getElementById('totalGeneral').innerText.replace(' m', '');
    document.getElementById('shareTotalK').innerText = document.getElementById('totalK').innerText;
    document.getElementById('shareTotal3').innerText = document.getElementById('total3').innerText;
    document.getElementById('shareTotalGeneral').innerText = totalGen;

    let rawFact = document.getElementById('funFact').innerText;
    let cleanFact = rawFact
        .replace("C'est environ ", "")
        .replace("C'est exactement la taille de ", "PILE : ")
        .replace("En attente de data...", "");

    let texteFinal = cleanFact
        .replace(/[^a-zA-Z0-9àâäéèêëîïôöùûüçÀÂÄÉÈÊËÎÏÔÖÙÛÜÇ\s.,!?'"()\/-]/g, '')
        .trim()
        .toUpperCase();

    if (texteFinal.length === 0) texteFinal = "MON WRAPPED";

    let taillePolice = 38;
    const nbCaractères = texteFinal.length;
    if (nbCaractères > 60) taillePolice = 22;
    else if (nbCaractères > 40) taillePolice = 26;
    else if (nbCaractères > 25) taillePolice = 30;

    const solidText = document.getElementById('shareFunFactSolid');
    const hollowText = document.getElementById('shareFunFactHollow');
    solidText.style.fontSize = taillePolice + "px";
    hollowText.style.fontSize = taillePolice + "px";
    solidText.innerText = texteFinal;
    hollowText.innerText = texteFinal;

    // -----------------------------------------------------------
    // ÉTAPE 2 : CLONAGE & PRÉPARATION
    // -----------------------------------------------------------
    document.querySelectorAll('.temp-clone-trash').forEach(el => el.remove());

    const original = document.getElementById('shareCardContainer');
    const clone = original.cloneNode(true);
    const uniqueID = "clone_" + Date.now(); 
    clone.id = uniqueID;
    clone.classList.add('temp-clone-trash');

    clone.style.width = "400px";
    clone.style.height = "400px";
    clone.style.position = "fixed";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.zIndex = "-9999"; 
    clone.style.display = "block"; 
    
    document.body.appendChild(clone);

    // -----------------------------------------------------------
    // ÉTAPE 3 : GÉNÉRATION AVEC PLAN B (FALLBACK)
    // -----------------------------------------------------------

    setTimeout(() => {
        const elementToCapture = document.getElementById(uniqueID);
        if (!elementToCapture) return;

        html2canvas(elementToCapture, {
            backgroundColor: "#bc13fe",
            scale: 1, 
            useCORS: true,
            logging: false,
        }).then(canvas => {
            // Ménage
            elementToCapture.remove();

            canvas.toBlob(blob => {
                if (!blob) return;
                
                const file = new File([blob], 'my-wrapped.png', { type: 'image/png' });
                
                // --- TENTATIVE DE PARTAGE NATIF ---
                if (navigator.share && navigator.canShare({ files: [file] })) {
                    navigator.share({
                        files: [file],
                        title: 'My Wrapped',
                    }).catch(err => {
                        console.warn("Partage échoué ou annulé, passage au Plan B", err);
                        afficherImageSecours(canvas.toDataURL());
                    });
                } else {
                    // Si le navigateur ne supporte pas le partage
                    afficherImageSecours(canvas.toDataURL());
                }
            });
        }).catch(err => {
            console.error(err);
            alert("Erreur technique : " + err);
            if(document.getElementById(uniqueID)) document.getElementById(uniqueID).remove();
        });
    }, 100);
}

// --- NOUVELLE FONCTION : LE PLAN B ---
// Cette fonction affiche l'image en gros sur l'écran si le partage échoue
function afficherImageSecours(dataUrl) {
    // Création d'un fond noir
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
    overlay.style.zIndex = '10000';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.onclick = () => overlay.remove(); // Cliquer pour fermer

    // L'image générée
    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.maxWidth = '90%';
    img.style.borderRadius = '15px';
    img.style.boxShadow = '0 0 20px rgba(255,255,255,0.2)';

    // Le message d'instruction
    const msg = document.createElement('p');
    msg.innerText = "Maintiens l'image appuyée pour l'enregistrer 📸";
    msg.style.color = 'white';
    msg.style.marginTop = '20px';
    msg.style.fontFamily = 'sans-serif';
    msg.style.fontWeight = 'bold';

    overlay.appendChild(img);
    overlay.appendChild(msg);
    document.body.appendChild(overlay);
}
