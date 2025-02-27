import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getAuth, onAuthStateChanged, updateProfile, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);

        // Fetch additional user details from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || '');
          setEmail(userData.email || '');
          setProfilePhoto(userData.photoURL || user.photoURL);
        } else {
          setName(user.displayName || '');
          setEmail(user.email || '');
          setProfilePhoto(user.photoURL);
        }

        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
      setProfilePhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    if (user) {
      setLoading(true);

      // Update profile photo
      let photoURL = profilePhoto;
      if (photoFile) {
        const photoRef = ref(storage, `profilePhotos/${user.uid}`);
        await uploadBytes(photoRef, photoFile);
        photoURL = await getDownloadURL(photoRef);
        await updateProfile(user, { photoURL });
      }

      // Update Firestore
      await setDoc(doc(db, 'users', user.uid), { name, email, photoURL }, { merge: true });

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: name });

      // Fetch the latest user details
      const updatedUser = auth.currentUser;
      if (updatedUser) {
        setUser(updatedUser);
        setProfilePhoto(photoURL);
        setName(updatedUser.displayName || '');
        setEmail(updatedUser.email || '');

        // Fetch additional user details from Firestore
        const userDoc = await getDoc(doc(db, 'users', updatedUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || '');
          setEmail(userData.email || '');
          setProfilePhoto(userData.photoURL || updatedUser.photoURL);
        }
      }

      setLoading(false);
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      router.push('/login');
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <nav className="w-full bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" legacyBehavior>
                <a>
                  <img className="h-8 w-8" src="/images/LosPollosHermanosLogo.png" alt="Los Pollos Hermanos logo" />
                </a>
              </Link>
            </div>
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
                >
                  <img className="h-8 w-8 rounded-full" src={profilePhoto || "/images/account-icon.png"} alt="Account" />
                </button>
                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                    <Link href="/profile" legacyBehavior>
                      <a className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                    </Link>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center w-full max-w-md">
          {loading ? (
            <div className="space-y-4">
              <div className="skeleton skeleton-circle mx-auto"></div>
              <div className="skeleton skeleton-title mx-auto"></div>
              <div className="skeleton skeleton-text mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="relative group">
                <img src={profilePhoto || '/images/account-icon.png'} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-4" />
                <label htmlFor="photo-upload" className="absolute inset-0 bg-gray-800 bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full cursor-pointer transition-opacity">
                  <FontAwesomeIcon icon={faPen} className="text-white" />
                </label>
                <input id="photo-upload" type="file" className="hidden" onChange={handlePhotoChange} />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-left">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block text-left">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <button onClick={handleSave} className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;