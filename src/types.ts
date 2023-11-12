import { Timestamp } from 'firebase/firestore';

export type UserDocData = {
  name: string;
  email: string;
  photoURL: string;
  uid: string;
  provider: string;
  onboardingData?: OnboardingData;
};

export type OnboardingData = {
  timestampOnboarded: Timestamp;
};
