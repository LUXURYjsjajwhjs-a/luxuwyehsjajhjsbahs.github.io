var map = L.map('map', {
    center: [33.85, 35.85],
    zoom: 8,
    zoomControl: false
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: ''
}).addTo(map);

/* ICONS */
const goldIconUrl = 'gold_star.png';
const purpleIconUrl = 'purple_star.png';
const diamondIconUrl = 'lebanon_diamond.png';

function getIcon(type, tier) {
    let url = (type === "purple") ? purpleIconUrl : goldIconUrl;
    let className = (type === "purple") ? "star-icon vip-glow" : "star-icon";
    return L.divIcon({
        className: '',
        html: `<img src="${url}" class="${className}" style="width:16px; height:16px;">`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
}

/* LEBANON DIAMOND */
const diamondIcon = L.divIcon({
    className: '',
    html: `<img src="${diamondIconUrl}" class="diamond-icon">`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
});

const lebanonDiamond = L.marker([33.9, 35.85], { icon: diamondIcon }).addTo(map);
lebanonDiamond.on('click', function() {
    L.popup({ closeButton: false })
        .setLatLng([33.9, 35.85])
        .setContent(`
            <div style="text-align:center; color:#C0C0C0;">
                <h3 style="margin:0;">💎 LEBANON DIAMOND 💎</h3>
                <p style="font-size:11px;">The Ultimate National Symbol</p>
                <b style="font-size:16px;">$600 / month</b><br><br>
                <button onclick="openOrder('Lebanon Diamond', 600)" 
                    style="background:#000; color:#fff; border:1px solid #fff; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:bold;">
                    🔐 UNLOCK DIAMOND
                </button>
            </div>
        `)
        .openOn(map);
});

/* RENDER MARKERS */
let markers = [];
function render() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    let bounds = map.getBounds();
    
    // Always show Purple stars in bounds
    let vips = towns.filter(t => t.type === 'purple' && bounds.contains([t.lat, t.lng]));
    
    // Gold stars filtered by zoom
    let normals = towns.filter(t => t.type === 'gold' && bounds.contains([t.lat, t.lng])).slice(0, 120);

    let visible = [...vips, ...normals];

    visible.forEach(t => {
        let marker = L.marker([t.lat, t.lng], {
            icon: getIcon(t.type, t.tier)
        }).addTo(map);

        marker.town = t;
        marker.on('click', function() {
            let t = this.town;
            let color = (t.type === "purple") ? "#b56cff" : "#D4AF37";
            let title = t.status === "owned" ? `⭐ ${t.name.toUpperCase()} ⭐` : (t.type === "purple" ? `VIP: ${t.name}` : t.name);
            
            let content = t.status === "owned" ? `
                <div style="text-align:center; color:${color}; min-width:150px;">
                    <b style="font-size:14px;">${title}</b><br><br>
                    <span style="color:#fff;">Owner: ${t.owner}</span><br>
                    <span style="font-size:11px; color:#888;">${t.date}</span><br><br>
                    <a href="${t.link}" target="_blank" style="color:${color}; text-decoration:none; font-weight:bold; font-size:12px;">VIEW PROFILE →</a>
                </div>
            ` : `
                <div style="text-align:center; color:${color}; min-width:150px;">
                    <b style="font-size:14px;">${title}</b><br><br>
                    <span style="color:#888;">$${t.priceMonth}/mo | $${t.priceYear}/yr</span><br><br>
                    <button onclick="openOrder('${t.name}', ${t.priceMonth})" 
                        style="background:#000; color:${color}; border:1px solid ${color}; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:bold;">
                        🔐 UNLOCK NOW
                    </button>
                </div>
            `;

            L.popup({ closeButton: false }).setLatLng([t.lat, t.lng]).setContent(content).openOn(map);
        });
        markers.push(marker);
    });
}

map.on('moveend zoomend', render);
render();

/* TOP OWNED LIST */
function updateTopOwned() {
    const container = document.getElementById("top-owned-list");
    container.innerHTML = "";
    const owned = towns.filter(t => t.status === "owned");
    
    if (owned.length === 0) {
        container.innerHTML = "<p style='color:#444; width:100%; text-align:center; font-size:12px;'>No owners yet.</p>";
        return;
    }

    owned.forEach(t => {
        let color = (t.type === "purple") ? "#b56cff" : "#D4AF37";
        let div = document.createElement("div");
        div.className = "owned-item";
        div.style.borderColor = color;
        div.style.color = color;
        div.innerHTML = `
            <span class="owned-name" style="color:${color}">${t.name}</span>
            <span class="owned-owner" style="color:${color}">${t.owner}</span>
            <button class="view-btn" style="border-color:${color}; color:${color}" onclick="goToStar(${t.lat}, ${t.lng})">VIEW</button>
        `;
        container.appendChild(div);
    });
}
updateTopOwned();

function goToStar(lat, lng) {
    map.flyTo([lat, lng], 15, { duration: 1.5 });
}

/* SEARCH */
document.getElementById("q").addEventListener("input", function() {
    let v = this.value.toLowerCase();
    let list = document.getElementById("list");
    list.innerHTML = "";
    if (!v) return;

    towns.filter(t => t.name.toLowerCase().includes(v)).slice(0, 5).forEach(r => {
        let d = document.createElement("div");
        d.className = "sug";
        d.innerHTML = r.name;
        d.onclick = function() {
            map.flyTo([r.lat, r.lng], 15, { duration: 1 });
            document.getElementById("q").value = r.name;
            document.getElementById("list").innerHTML = "";
        };
        list.appendChild(d);
    });
});

/* ORDER MODAL */
let currentPrice = 0;
function openOrder(name, price) {
    currentPrice = price;
    document.getElementById("starName").value = name;
    
    const modalBox = document.querySelector(".orderBox");
    const town = towns.find(t => t.name === name);
    const color = (name === "Lebanon Diamond") ? "#C0C0C0" : ((town && town.type === "purple") ? "#b56cff" : "#D4AF37");
    
    modalBox.style.borderColor = color;
    modalBox.style.color = color;
    document.querySelector(".unlockSubmit").style.background = color;
    document.querySelector(".closeBtn").style.borderColor = color;
    document.querySelector(".closeBtn").style.color = color;
    
    // Change input border colors
    const inputs = modalBox.querySelectorAll("input, select, textarea");
    inputs.forEach(input => {
        if(input.id !== "starName") input.style.borderColor = color;
    });

    document.getElementById("orderModal").style.display = "flex";
    updateTotalPrice();
}

function closeOrder() {
    document.getElementById("orderModal").style.display = "none";
}

function updateTotalPrice() {
    let m = parseInt(document.getElementById("months").value);
    let total = (m === 12) ? (currentPrice * 10) : (currentPrice * m);
    document.getElementById("totalPrice").value = "$" + total;
}

document.getElementById("months").addEventListener("change", updateTotalPrice);

document.getElementById("form").onsubmit = function(e) {
    e.preventDefault();

    // Validate: at least one social media filled
    const ig = document.getElementById("social_instagram").value.trim();
    const tt = document.getElementById("social_tiktok").value.trim();
    const sc = document.getElementById("social_snapchat").value.trim();
    if (!ig && !tt && !sc) {
        const socialBox = document.getElementById("social_instagram").closest("div").parentElement;
        socialBox.style.borderColor = "#ff4444";
        document.getElementById("social_instagram").style.borderColor = "#ff4444";
        document.getElementById("social_tiktok").style.borderColor = "#ff4444";
        document.getElementById("social_snapchat").style.borderColor = "#ff4444";
        document.getElementById("social_instagram").scrollIntoView({ behavior: "smooth", block: "center" });
        document.getElementById("social_instagram").placeholder = "⚠️ At least one required!";
        return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "...";
    btn.disabled = true;

    fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(this)
    }).then(res => {
        if (res.ok) {
            alert("Order sent! We will contact you.");
            closeOrder();
        } else {
            alert("Error. Try again.");
        }
    }).finally(() => {
        btn.innerText = "SUBMIT";
        btn.disabled = false;
    });
};
