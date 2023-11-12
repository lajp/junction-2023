import { firebaseConfig } from '@/lib/firebase';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth'; // Firebase v9+
import { getFirestore } from 'firebase/firestore'; // Firebase v9+
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { ReactNode } from 'react';
import { Toaster } from 'sonner';

import {
  FirebaseAppProvider,
  FirestoreProvider,
  AuthProvider,
  useFirebaseApp,
  AnalyticsProvider,
  StorageProvider,
  FunctionsProvider,
} from 'reactfire';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <FirebaseComponents>{children}</FirebaseComponents>
    </FirebaseAppProvider>
  );
}

function FirebaseComponents({ children }: { children: ReactNode }) {
  const app = useFirebaseApp();
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);
  const functions = getFunctions(app, 'europe-west1');
  const analytics = getAnalytics(app);

  if (process.env.NODE_ENV === "development") {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }

  return (
    <AuthProvider sdk={auth}>
      <Toaster expand position="bottom-center" />
      <FirestoreProvider sdk={db}>
        <StorageProvider sdk={storage}>
          <FunctionsProvider sdk={functions}>
            <AnalyticsProvider sdk={analytics}>{children}</AnalyticsProvider>
          </FunctionsProvider>
        </StorageProvider>
      </FirestoreProvider>
    </AuthProvider>
  );
}
