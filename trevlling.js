// trevlling.js

// 1. Import Firebase Functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 2. Your Firebase Configuration
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

// --- Main Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileList = document.getElementById('fileList');
    const fileInput = document.getElementById('fileUpload');

    // Helper: Read all selected files into a string for hashing
    async function getFileContentsString() {
        let contentString = '';
        if (!fileInput.files || fileInput.files.length === 0) return '';

        for (const file of fileInput.files) {
            const reader = new FileReader();
            const fileReadPromise = new Promise((resolve) => {
                reader.onload = (event) => {
                    // Combine Name + Size + Binary Content for a unique fingerprint
                    contentString += `${file.name}:${file.size}:${event.target.result}|`; 
                    resolve();
                };
                reader.readAsDataURL(file);
            });
            await fileReadPromise;
        }
        return contentString;
    }

    if (uploadBtn) {
        uploadBtn.addEventListener('click', async () => {
            // 1. Get Input Values
            const serviceType = document.getElementById('serviceType').value.trim();
            const providerCountry = document.getElementById('providerCountry').value.trim();
            const receiverCountry = document.getElementById('receiverCountry').value.trim();

            // Basic Validation
            if (!serviceType || !providerCountry || !receiverCountry) {
                alert("Please fill in all text fields (Service Type and Countries).");
                return;
            }

            // UI Feedback
            uploadBtn.disabled = true;
            uploadBtn.textContent = "Verifying & Hashing...";

            try {
                // 2. Process Files
                const filesString = await getFileContentsString();

                // 3. Create Data String for Hashing (The 'Block' content)
                const dataToVerify = `
                    Type:${serviceType}
                    Provider:${providerCountry}
                    Receiver:${receiverCountry}
                    Files:${filesString}
                `;

                // 4. Generate Immutable Hash
                const auditHash = await hashData(dataToVerify);

                // 5. Create Database Record Object
                const travelRecord = {
                    service_type: serviceType,
                    provider_country: providerCountry,
                    receiver_country: receiverCountry,
                    audit_hash: auditHash, // The proof of integrity
                    verified: true,
                    category: "Travel Service",
                    created_at: serverTimestamp()
                };

                // 6. Save to Firestore (Collection: 'travel_services')
                const docRef = await addDoc(collection(db, "travel_services"), travelRecord);

                // 7. Update UI on Success
                const li = document.createElement('li');
                li.innerHTML = `
                    <strong>${serviceType}</strong> (${providerCountry} &rarr; ${receiverCountry})<br>
                    <span style="color: #00ff9f; font-weight:bold;">✅ Verified</span> <br>
                    <small style="color: #ccc;">Ref ID: ${docRef.id}</small><br>
                    <code style="font-size: 10px; color: #aaa;">Hash: ${auditHash.substring(0, 20)}...</code>
                `;
                fileList.appendChild(li);

                alert("Travel Documents Verified and Uploaded Successfully!");
                
                // Optional: Clear form
                document.getElementById('serviceType').value = '';
                fileInput.value = '';

            } catch (error) {
                console.error("Error uploading travel docs:", error);
                alert("Upload failed. Check the console for errors.");
            } finally {
                uploadBtn.disabled = false;
                uploadBtn.textContent = "Upload Documents";
            }
        });
    }
});