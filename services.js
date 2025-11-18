// services.js

// 1. Import Firebase Functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 2. Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBjhAwiM7liOmO98ACNPq3eEdE4oasAIes",
  authDomain: "greencart-ae8c9.firebaseapp.com",
  projectId: "greencart-ae8c9",
  storageBucket: "greencart-ae8c9.firebasestorage.app",
  messagingSenderId: "321216625878",
  appId: "1:321216625878:web:0d8809900ccd1634cedd77",
  measurementId: "G-S7J4E0WCVV"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- Core Hashing Function (SHA-256) ---
async function hashData(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileList = document.getElementById('fileList');

    // Helper: Read file inputs into a string
    async function getFileContentsString(fileInput) {
        let contentString = '';
        if (!fileInput || !fileInput.files) return '';

        for (const file of fileInput.files) {
            const reader = new FileReader();
            const fileReadPromise = new Promise((resolve) => {
                reader.onload = (event) => {
                    // Combine name, size, and content for unique hash
                    contentString += `${file.name}:${file.size}:${event.target.result}|`; 
                    resolve();
                };
                reader.readAsDataURL(file);
            });
            await fileReadPromise;
        }
        return contentString;
    }

    uploadBtn.addEventListener('click', async () => {
        // 1. Get Values from Inputs
        const serviceName = document.getElementById('serviceName').value;
        const providerCountry = document.getElementById('providerCountry').value;
        const providerCompany = document.getElementById('providerCompany').value;
        const receiverCountry = document.getElementById('receiverCountry').value;
        const receiverCompany = document.getElementById('receiverCompany').value;
        const serviceDate = document.getElementById('serviceDate').value;
        
        const contractInput = document.getElementById('contractFile');
        const additionalFilesInput = document.getElementById('additionalFiles');

        // Basic Validation
        if (!serviceName || !providerCompany || !receiverCompany) {
            alert("Please fill in the required Company and Service fields.");
            return;
        }

        uploadBtn.disabled = true;
        uploadBtn.textContent = "Hashing & Uploading...";

        try {
            // 2. Process Files for Hashing
            const contractString = await getFileContentsString(contractInput);
            const docsString = await getFileContentsString(additionalFilesInput);

            // 3. Create the string to be Hashed (The Blockchain 'Block' Data)
            const dataToVerify = `
                Service:${serviceName}
                Provider:${providerCompany}(${providerCountry})
                Receiver:${receiverCompany}(${receiverCountry})
                Date:${serviceDate}
                ContractData:${contractString}
                DocsData:${docsString}
            `;

            // 4. Generate Audit Hash
            const auditHash = await hashData(dataToVerify);

            // 5. Create Database Record
            const serviceRecord = {
                service_name: serviceName,
                provider: { company: providerCompany, country: providerCountry },
                receiver: { company: receiverCompany, country: receiverCountry },
                service_date: serviceDate,
                audit_hash: auditHash, // The Immutable Proof
                verified: true,
                type: "Service Export",
                created_at: serverTimestamp()
            };

            // 6. Save to 'services' Collection in Firestore
            const docRef = await addDoc(collection(db, "services"), serviceRecord);

            // 7. Update UI
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${serviceName}</strong> (Ref: ${docRef.id})<br>
                <span style="color: #00ff9f;">✅ Verified Contract & Service</span><br>
                <small>Audit Hash: ${auditHash}</small>
            `;
            fileList.appendChild(li);

            alert("Service Export Verified and Uploaded Successfully!");

        } catch (error) {
            console.error("Upload failed:", error);
            alert("Error uploading service. Check console.");
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = "Verify & Upload Service";
        }
    });
});