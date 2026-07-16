// Firebase modüllerini import ediyoruz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, set, update, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Senin Firebase Konfigürasyonun
const firebaseConfig = {
  apiKey: "AIzaSyAIcr33ABLSw_5jPbmHH7CDAIc5GNmma_k",
  authDomain: "mesaj-4daa5.firebaseapp.com",
  databaseURL: "https://mesaj-4daa5-default-rtdb.firebaseio.com",
  projectId: "mesaj-4daa5",
  storageBucket: "mesaj-4daa5.firebasestorage.app",
  messagingSenderId: "361724107709",
  appId: "1:361724107709:web:4675793b1a32b51eb3d0d4",
  measurementId: "G-JC2SP8YBLR"
};

// Başlatma
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let isSignUpMode = false;

// Giriş/Kayıt Ekranı Değiştirme Fonksiyonu
window.toggleForm = function() {
    const title = document.getElementById("form-title");
    const btn = document.getElementById("main-btn");
    const toggle = document.getElementById("toggle-link");
    
    isSignUpMode = !isSignUpMode;
    
    if (isSignUpMode) {
        title.innerText = "Kayıt Ol";
        btn.innerText = "Kayıt Ol";
        toggle.innerText = "Zaten hesabın var mı? Giriş Yap";
    } else {
        title.innerText = "Giriş Yap";
        btn.innerText = "Giriş Yap";
        toggle.innerText = "Hesabın yok mu? Kayıt Ol";
    }
}

// Giriş & Kayıt İşlemleri
window.handleAuth = function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if(!email || !password) {
        alert("Lütfen tüm alanları doldurun!");
        return;
    }

    if (isSignUpMode) {
        // KAYIT OLMA
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const schoolNumber = email.split("@")[0]; // E-postanın başını geçici kullanıcı adı yapalım
                
                // Veri tabanına kullanıcıyı kaydet (İlk kayıt olanı admin yapabilirsin ya da manuel verirsin)
                set(ref(db, 'users/' + user.uid), {
                    email: email,
                    username: schoolNumber,
                    role: "user", // 'admin' olarak güncellenebilir
                    lastLogin: new Date().toLocaleString()
                }).then(() => {
                    window.location.href = "dashboard.html";
                });
            })
            .catch((error) => alert("Kayıt Hatası: " + error.message));
    } else {
        // GİRİŞ YAPMA
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // Son giriş saatini güncelle
                update(ref(db, 'users/' + user.uid), {
                    lastLogin: new Date().toLocaleString()
                }).then(() => {
                    window.location.href = "dashboard.html";
                });
            })
            .catch((error) => alert("Giriş Hatası: " + error.message));
    }
}

// OTOMATİK GİRİŞ TANIMA (Session Persistence)
// Kullanıcı daha önce giriş yaptıysa şifre sormadan direkt dashboard'a yönlendirir.
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Eğer index.html sayfasındaysak ve kullanıcı zaten giriş yaptıysa içeri al
        if (window.location.pathname.endsWith("index.html") || window.location.pathname === "/") {
            window.location.href = "dashboard.html";
        }
    }
});
