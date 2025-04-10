// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB-XawiwFbCOxyLpgNUIoW7MySWblx5zI8",
    authDomain: "notes-zone-2005.firebaseapp.com",
    projectId: "notes-zone-2005",
    storageBucket: "notes-zone-2005.firebasestorage.app",
    messagingSenderId: "729445577922",
    appId: "1:729445577922:web:4d87e4f19c37c32b13775b",
    measurementId: "G-9TER2ZYDCN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}

const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (e) => {
    e.preventDefault(); // Use the event object passed to the callback
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;

    const auth = getAuth();
    const db = getFirestore();

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            const userData = {
                email: email,
                firstName: firstName,
                lastName: lastName,
            };
            showMessage('Account Created Successfully', 'signUpMessage');
            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData) // Removed unnecessary semicolon
                .then(() => {
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error("error writing document", error);
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode == 'auth/email-already-in-use') {
                showMessage('Email Address Already Exists !!!', 'signUpMessage');
            } else {
                showMessage('unable to create User', 'signUpMessage');
            }
        });
});

const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (e) => {
    e.preventDefault(); // Use the event object passed to the callback
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem('loggedInUser', user.uid);
            showMessage('Login Successful', 'signInMessage');
            window.location.href = 'index.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode == 'auth/invalid-credential') {
                showMessage('Incorrect Email or Password', 'signInMessage');
            } else {
                showMessage('Account does not exit', 'signInMessage');
            }
        });
});

// Social Sign-In Functions
// Google Sign-In
window.signInWithGoogle = function() {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    
    signInWithPopup(auth, provider)
        .then((result) => {
            // Google sign-in succeeded
            const user = result.user;
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            
            // Store user data in Firestore
            const db = getFirestore();
            const userData = {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                provider: 'google'
            };
            
            setDoc(doc(db, "users", user.uid), userData, { merge: true })
                .then(() => {
                    localStorage.setItem('loggedInUser', user.uid);
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error("Error writing document:", error);
                    showMessage(error.message, loginForm.classList.contains('hidden') ? 'signUpMessage' : 'signInMessage');
                });
        })
        .catch((error) => {
            // Handle errors
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData?.email;
            const credential = GoogleAuthProvider.credentialFromError(error);
            
            console.error("Google Sign-In Error:", errorCode, errorMessage);
            showMessage(`Sign-in error: ${errorMessage}`, loginForm.classList.contains('hidden') ? 'signUpMessage' : 'signInMessage');
        });
};

// Facebook Sign-In
window.signInWithFacebook = function() {
    const auth = getAuth();
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');
    
    signInWithPopup(auth, provider)
        .then((result) => {
            // Facebook sign-in succeeded
            const user = result.user;
            const credential = FacebookAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            
            // Store user data in Firestore
            const db = getFirestore();
            const userData = {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                provider: 'facebook'
            };
            
            setDoc(doc(db, "users", user.uid), userData, { merge: true })
                .then(() => {
                    localStorage.setItem('loggedInUser', user.uid);
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error("Error writing document:", error);
                    showMessage(error.message, loginForm.classList.contains('hidden') ? 'signUpMessage' : 'signInMessage');
                });
        })
        .catch((error) => {
            // Handle errors
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData?.email;
            const credential = FacebookAuthProvider.credentialFromError(error);
            
            console.error("Facebook Sign-In Error:", errorCode, errorMessage);
            showMessage(`Sign-in error: ${errorMessage}`, loginForm.classList.contains('hidden') ? 'signUpMessage' : 'signInMessage');
        });
};

// Apple Sign-In
window.signInWithApple = function() {
    const auth = getAuth();
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    
    signInWithPopup(auth, provider)
        .then((result) => {
            // Apple sign-in succeeded
            const user = result.user;
            const credential = OAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            
            // Store user data in Firestore
            const db = getFirestore();
            const userData = {
                email: user.email,
                displayName: user.displayName || "Apple User", // Apple might not provide displayName
                photoURL: user.photoURL,
                provider: 'apple'
            };
            
            setDoc(doc(db, "users", user.uid), userData, { merge: true })
                .then(() => {
                    localStorage.setItem('loggedInUser', user.uid);
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error("Error writing document:", error);
                    showMessage(error.message, loginForm.classList.contains('hidden') ? 'signUpMessage' : 'signInMessage');
                });
        })
        .catch((error) => {
            // Handle errors
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.customData?.email;
            const credential = OAuthProvider.credentialFromError(error);
            
            console.error("Apple Sign-In Error:", errorCode, errorMessage);
            showMessage(`Sign-in error: ${errorMessage}`, loginForm.classList.contains('hidden') ? 'signUpMessage' : 'signInMessage');
        });
};
