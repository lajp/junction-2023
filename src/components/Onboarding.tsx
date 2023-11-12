import { httpsCallable } from 'firebase/functions';
import { forwardRef, useEffect, useState, useRef, use } from 'react';
import { useFirestore, useFunctions, useUser } from 'reactfire';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { Input } from './Input';
import { runAfterOnboardingComplete } from '../../functions/src';

export const OnBoardingForm = () => {
  const afterOnboarding = httpsCallable(useFunctions(), 'runAfterOnboardingComplete');

  const schema = z.object({
    phoneNumber: z.string().max(100).optional(),
    ageYears: z.string().max(100).optional(),
    preExistingDiagnoses: z.string().max(100).optional(),
    painHistoryDescription: z.string().max(100).optional(),
    alternativeTreatmentsOfInterest: z.string().max(100).optional(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      phoneNumber: '',
      ageYears: '',
      preExistingDiagnoses: '',
      painHistoryDescription: '',
      alternativeTreatmentsOfInterest: '',
    },
  });

  const router = useRouter();
  const db = useFirestore();
  const user = useUser();
  const [currentInputIndex, setCurrentInputIndex] = useState<number>(0);

  useEffect(() => {
    form.setFocus(inputs[currentInputIndex].name);
  }, [currentInputIndex]);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumber: '',
    ageYears: '',
    preExistingDiagnoses: '',
    painHistoryDescription: '',
    alternativeTreatmentsOfInterest: '',
  });

  const handleStepSubmit = async (data: z.infer<typeof schema>) => {
    if (currentInputIndex === 0) {
      const phoneNumber = data.phoneNumber!;
      if (phoneNumber.length === 0) {
        form.setError('phoneNumber', { message: 'Please enter a valid phone number' });
        return;
      }

      const regex = /(\+)?\d{5,15}/;

      const trimmed = phoneNumber.replace(/\s/g, '');

      if (!trimmed.match(regex)) {
        form.setError('phoneNumber', { message: 'Please enter a valid phone number' });
        return;
      }
    }

    if (currentInputIndex === 1) {
      const ageYears = data.ageYears!;
      if (ageYears.length === 0) {
        form.setError('ageYears', { message: 'Please enter a valid number' });
        return;
      }
      const parsedInt = parseInt(ageYears);

      if (isNaN(parsedInt)) {
        form.setError('ageYears', { message: 'Please enter a valid number' });
        return;
      }

      if (parsedInt > 100) {
        form.setError('ageYears', { message: 'You are too old!' });
        return;
      }
      if (parsedInt < 10) {
        form.setError('ageYears', { message: 'You are too young!' });
        return;
      }
    }

    // Update formData with new values
    setFormData((prevFormData) => ({ ...prevFormData, ...data }));

    // Check if it's the last input, otherwise move to the next step
    if (currentInputIndex < inputs.length - 1) {
      setCurrentInputIndex(currentInputIndex + 1);
    } else {
      const ref = doc(db, 'users', user.data!.uid);
      try {
        if (loading) {
          return;
        }
        setLoading(true);
        const delayPromise = new Promise((resolve) => setTimeout(resolve, 1800));

        toast.promise(delayPromise, {
          loading: 'Initializing...',
          success: 'Success!',
          error: 'Something went wrong, please try again',
        });

        delayPromise.then(() => {
          updateDoc(ref, {
            onboarding: {
              ...formData,
              ageYears: parseInt(formData.ageYears),
            },
          }).then(() => {
            afterOnboarding().then((res) => {
              router.push('/dashboard');
            });
          });
        });
      } catch (e) {
        toast.error('Something went wrong, please try again');
      }
    }
  };
  const inputs = [
    {
      name: 'phoneNumber',
      label: 'What is your phone number?',
      placeholder: 'Start typing...',
    },
    {
      name: 'ageYears',
      label: 'How old are you?',
      placeholder: 'Start typing...',
    },
    {
      name: 'preExistingDiagnoses',
      label: 'What pre-existing diagnoses do you have?',
      placeholder: 'Start typing...',
    },
    {
      name: 'painHistoryDescription',
      label: 'Describe your pain history',
      placeholder: 'Start typing...',
    },
    {
      name: 'alternativeTreatmentsOfInterest',
      label: 'What alternative treatments are you interested in?',
      placeholder: 'Start typing...',
    },
  ] as const;

  return (
    <div
      className="min-h-screen flex flex-col justify-center"
      onClick={() => {
        form.setFocus(inputs[currentInputIndex].name);
      }}
    >
      <div className="px-4 md:px-12">
        <form onSubmit={form.handleSubmit(handleStepSubmit)}>
          <div className="form-control w-full">
            {inputs.map((input, index) => {
              if (index === currentInputIndex) {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={input.name}
                    className="relative"
                  >
                    <Input
                      type="text"
                      label={input.label}
                      error={form.formState.errors[input.name]?.message}
                      placeholder={input.placeholder}
                      {...form.register(input.name)}
                    />
                  </motion.div>
                );
              }
            })}
          </div>
        </form>
      </div>
    </div>
  );
};
