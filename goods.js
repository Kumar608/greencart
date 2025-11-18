// goods.js

// 1. Import Firebase Functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 2. Your Firebase Config (SAME AS LOGIN PAGE)
const firebaseConfig = {
  apiKey: "AIzaSyBjhAwiM7liOmO98ACNPq3eEdE4oasAIes",
  authDomain: "greencart-ae8c9.firebaseapp.com",
  projectId: "greencart-ae8c9",
  storageBucket: "greencart-ae8c9.firebasestorage.app",
  messagingSenderId: "321216625878",
  appId: "1:321216625878:web:0d8809900ccd1634cedd77",
  measurementId: "G-S7J4E0WCVV"
};

// 3. Initialize Firebase & Database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Access the Firestore Database

// --- Core Hashing Function (SHA-256) ---
async function hashData(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// --- Main Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const goodsNameInput = document.getElementById('goodsName');
    const countryInput = document.getElementById('country');
    const fileList = document.getElementById('fileList');

    const fileUploadDocs = document.getElementById('fileUploadDocs'); 
    const fileUploadGst = document.getElementById('fileUploadGst');
    const fileUploadPic = document.getElementById('fileUploadPic');

    if(uploadBtn) {
        uploadBtn.addEventListener('click', handleGoodsUpload);
    }

    // Helper: Convert all files to a single string
    async function getFileContentsString() {
        let contentString = '';
        const files = [
            ...(fileUploadDocs.files ? fileUploadDocs.files : []),
            ...(fileUploadGst.files ? fileUploadGst.files : []),
            ...(fileUploadPic.files ? fileUploadPic.files : [])
        ];

        for (const file of files) {
            const reader = new FileReader();
            const fileReadPromise = new Promise((resolve) => {
                reader.onload = (event) => {
                    contentString += `${file.name}:${file.size}:${event.target.result}|`; 
                    resolve();
                };
                reader.readAsDataURL(file);
            });
            await fileReadPromise;
        }
        return contentString;
    }

    async function handleGoodsUpload() {
        const goodsName = goodsNameInput.value.trim();
        const country = countryInput.value.trim();
        
        if (!goodsName || !country) {
            alert("Please enter Goods Name and Export Country.");
            return;
        }

        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Hashing & Uploading...';

        try {
            // 1. Generate the Digital Fingerprint (Hash)
            const fileContentsString = await getFileContentsString();
            const verifiableData = `Name:${goodsName} Country:${country} Files:${fileContentsString}`;
            const transactionHash = await hashData(verifiableData);
            
            // 2. Create the Record Object
            const transactionRecord = {
                goods_name: goodsName,
                export_country: country,
                audit_hash: transactionHash, // The blockchain-like proof
                verified: true,
                created_at: serverTimestamp() // Uses server time for accuracy
            };

            // 3. SAVE TO FIREBASE FIRESTORE (The "Block")
            // We verify the data, then store it in a collection called 'exports'
            const docRef = await addDoc(collection(db, "exports"), transactionRecord);
            
            console.log("Document written with ID: ", docRef.id);
            
            // 4. Update UI
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>${goodsName}</strong> (ID: ${docRef.id}) <br>
                <span style="color:green">✅ Verified & Recorded on Ledger</span><br>
                <code style="font-size:10px; color:#555;">Hash: ${transactionHash}</code>
            `;
            fileList.appendChild(listItem);
            
            alert(`Success! Verification Record saved to database with ID: ${docRef.id}`);

        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Error saving to database. Check console.");
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload & Verify';
        }
    }
});