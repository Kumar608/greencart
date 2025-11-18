// dashboard.js

// 1. Import Firebase Functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 2. Firebase Config (Same as your other files)
const firebaseConfig = {
  apiKey: "AIzaSyBjhAwiM7liOmO98ACNPq3eEdE4oasAIes",
  authDomain: "greencart-ae8c9.firebaseapp.com",
  projectId: "greencart-ae8c9",
  storageBucket: "greencart-ae8c9.firebasestorage.app",
  messagingSenderId: "321216625878",
  appId: "1:321216625878:web:0d8809900ccd1634cedd77",
  measurementId: "G-S7J4E0WCVV"
};

// 3. Initialize
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. Main Logic
async function loadDashboardData() {
    const ledgerBody = document.getElementById('ledgerBody');
    
    // Stats Elements
    const totalEl = document.getElementById('totalCount');
    const goodsEl = document.getElementById('goodsCount');
    const servicesEl = document.getElementById('servicesCount');
    const travelEl = document.getElementById('travelCount');

    try {
        // --- FETCH DATA FROM ALL 3 COLLECTIONS PARALLEL ---
        const [goodsSnap, servicesSnap, travelSnap] = await Promise.all([
            getDocs(collection(db, "exports")),
            getDocs(collection(db, "services")),
            getDocs(collection(db, "travel_services"))
        ]);

        let allRecords = [];

        // --- PROCESS GOODS ---
        goodsSnap.forEach(doc => {
            const data = doc.data();
            allRecords.push({
                type: 'Goods',
                title: data.goods_name,
                detail: `To: ${data.export_country}`,
                hash: data.audit_hash,
                date: data.created_at ? data.created_at.toDate() : new Date(),
                rawDate: data.created_at
            });
        });

        // --- PROCESS SERVICES ---
        servicesSnap.forEach(doc => {
            const data = doc.data();
            allRecords.push({
                type: 'Service',
                title: data.service_name,
                detail: `Provider: ${data.provider.company}`,
                hash: data.audit_hash,
                date: data.created_at ? data.created_at.toDate() : new Date(),
                rawDate: data.created_at
            });
        });

        // --- PROCESS TRAVEL ---
        travelSnap.forEach(doc => {
            const data = doc.data();
            allRecords.push({
                type: 'Travel',
                title: data.service_type,
                detail: `${data.provider_country} ➝ ${data.receiver_country}`,
                hash: data.audit_hash,
                date: data.created_at ? data.created_at.toDate() : new Date(),
                rawDate: data.created_at
            });
        });

        // --- UPDATE STATS ---
        totalEl.textContent = allRecords.length;
        goodsEl.textContent = goodsSnap.size;
        servicesEl.textContent = servicesSnap.size;
        travelEl.textContent = travelSnap.size;

        // --- SORT BY DATE (NEWEST FIRST) ---
        allRecords.sort((a, b) => b.date - a.date);

        // --- RENDER TO TABLE ---
        ledgerBody.innerHTML = '';

        if (allRecords.length === 0) {
            ledgerBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px;">No records found in the blockchain ledger.</td></tr>`;
            return;
        }

        allRecords.forEach(record => {
            // Determine Badge Color Class
            let badgeClass = 'badge-goods';
            if(record.type === 'Service') badgeClass = 'badge-service';
            if(record.type === 'Travel') badgeClass = 'badge-travel';

            const row = `
                <tr>
                    <td class="timestamp">${record.date.toLocaleString()}</td>
                    <td><span class="badge ${badgeClass}">${record.type}</span></td>
                    <td>
                        <strong style="color:#fff">${record.title}</strong><br>
                        <small style="color:#8b949e">${record.detail}</small>
                    </td>
                    <td>
                        <div class="hash-code" title="${record.hash}">
                            ${record.hash}
                        </div>
                    </td>
                    <td style="text-align:center;">
                        <i class="fas fa-check-circle verified-icon" title="Verified Immutable Record"></i>
                    </td>
                </tr>
            `;
            ledgerBody.innerHTML += row;
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        ledgerBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#ff5f5f;">Error loading ledger data. Please check console.</td></tr>`;
    }
}

// Load on startup
document.addEventListener('DOMContentLoaded', loadDashboardData);