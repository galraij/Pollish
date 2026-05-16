import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAG4ytKkwQNljyqYAhQ0g9s3CqFqrnb3Ns",
  authDomain: "pollish-8fb4d.firebaseapp.com",
  projectId: "pollish-8fb4d",
  storageBucket: "pollish-8fb4d.firebasestorage.app",
  messagingSenderId: "825870541383",
  appId: "1:825870541383:web:41980a34954ad39d360762",
  measurementId: "G-D7KK51ENQL"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
