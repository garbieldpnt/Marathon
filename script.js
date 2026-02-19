
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
