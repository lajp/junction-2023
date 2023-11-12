import { useFirestore, useFirestoreDocData, useSigninCheck } from 'reactfire';
import { Login } from './Login';
import { useRouter } from 'next/router';
import { UserDocData } from '@/types';
import { User } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { OnBoardingForm } from './Onboarding';
import { AnimatePresence, motion } from 'framer-motion';

export const Wrappers = ({ children }: { children: React.ReactNode }) => {
  return <AuthWrapper>{children}</AuthWrapper>;
};

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const singinCheck = useSigninCheck();

  // return <>{children}</>;

  if (singinCheck.status === 'error') {
    return <div>Error: {singinCheck.error?.message}</div>;
  }

  if (singinCheck.status === 'loading') {
    return null;
  }

  if (!singinCheck.data.user) {
    return <Login />;
  }

  return <OnboardingWrapper user={singinCheck.data.user}>{children}</OnboardingWrapper>;
};

export const OnboardingWrapper = ({ children, user }: { children: React.ReactNode; user: User }) => {
  const db = useFirestore();
  const userDocData = useFirestoreDocData(doc(db, 'users', user.uid));

  if (userDocData.status === 'error') {
    return <p>Error loading user document in onboarding wrapper</p>;
  }

  if (userDocData.status === 'loading') {
    return null;
  }

  const data = userDocData.data;

  if (!data) {
    return null;
  }

  return (
    <AnimatePresence>
      {!data.onboarding ? (
        <OnBoardingForm />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
