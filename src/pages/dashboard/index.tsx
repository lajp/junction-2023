import Link from 'next/link';
import { useAuth, useCallableFunctionResponse, useFirestore, useFunctions, useUser } from 'reactfire';
import PainChart from '@/components/Painchart';
import { AnimateUp } from '@/components/AnimateUp';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, updateDoc } from 'firebase/firestore';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { Input } from '@/components/Input';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { httpsCallable } from 'firebase/functions';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
/*
import { chattingFunctionality } from '../../../functions/src';
*/

function Dashboard() {
  /*
  const functions = useFunctions();
  const [temp, setTemp] = useState('');
  const chattingFunctionality = httpsCallable(functions, 'chattingFunctionality');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp:any = await chattingFunctionality({ message: "Use the get_one_success function" });
        setTemp(resp.data?.message);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error if necessary
      }
    };
    fetchData();
  }, []);
  */
  /*
  Input {temp} where testing testing is currently 
  */

  const [selected, setSelected] = useState(0);

  return (
    <AnimateUp className="lg:pt-20">
      <div className="grid lg:grid-cols-[3fr_1fr] lg:min-h-full">
        <div className="max-lg:min-h-[80vh] max-w-[50rem]">
          <InputForm selected={selected} handleSelected={(n) => setSelected(n)} />
        </div>
        <AnimatePresence>
          {selected === 0 && (
            <AnimateUp className="lg:flex items-center">
              <PainChart />
            </AnimateUp>
          )}
        </AnimatePresence>
      </div>
    </AnimateUp>
  );
}

export default Dashboard;

const InputForm = (props: { selected: number; handleSelected: (n: number) => void }) => {
  const auth = useAuth();
  const addPainInput = httpsCallable(useFunctions(), 'addPainInput');

  const displayName = auth.currentUser?.displayName;

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const schema = z.object({
    text: z.string().max(1000).optional(),
    painLevel: z.string().optional(),
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      text: '',
      painLevel: '',
    },
  });

  const [currentInputIndex, setCurrentInputIndex] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    form.setFocus(inputs[currentInputIndex]?.name);
  }, [currentInputIndex]);

  const [formData, setFormData] = useState({
    text: '',
    painLevel: '',
  });

  useEffect(() => {
    form.setValue('text', transcript);
  }, [transcript]);

  const handleStepSubmit = async (data: z.infer<typeof schema>) => {
    if (currentInputIndex === 0) {
      const text = data.text!;
      if (text.length < 20) {
        form.setError('text', { message: 'Please enter a description of at least 20 characters' });
        return;
      }
      SpeechRecognition.stopListening();
    }

    if (currentInputIndex === 1) {
      const painLevel = data.painLevel!;
      if (painLevel.length === 0) {
        form.setError('painLevel', { message: 'Please enter a valid number' });
        return;
      }
      const parsedInt = parseInt(painLevel);

      if (isNaN(parsedInt)) {
        form.setError('painLevel', { message: 'Please enter a valid number' });
        return;
      }

      if (parsedInt > 10) {
        form.setError('painLevel', { message: 'Please enter a number between 0 and 10' });
        return;
      }
      if (parsedInt < 0) {
        form.setError('painLevel', { message: 'Please enter a number between 0 and 10' });
        return;
      }

      // @ts-expect-error
      data.painLevel = parsedInt;
    }

    // Update formData with new values
    setFormData((prevFormData) => ({ ...prevFormData, ...data }));

    // Check if it's the last input, otherwise move to the next step
    if (currentInputIndex < inputs.length - 1) {
      setCurrentInputIndex(currentInputIndex + 1);
    } else {
      try {
        setCurrentInputIndex(-1);
        addPainInput({
          description: `${data.text}. The pain level associated with this log was ${data.painLevel} out of 10.`,
          painLevel: data.painLevel,
        }).then(() => {
          form.reset();
          setHasSubmitted(true);
          setCurrentInputIndex(0);
        });

        // toast.promise(delayPromise, {
        //   loading: 'Recording your log...',
        //   success: 'Done!',
        // });
      } catch (e) {
        toast.error('Something went wrong, please try again');
      }
    }
  };
  const inputs = [
    {
      name: 'text',
      label: !hasSubmitted ? `Welcome${displayName ? `, ${displayName}.` : '.'}` : 'Thank you for your input.',
      placeholder: !hasSubmitted ? 'How have you been feeling recently?' : 'Write another log?',
    },
    {
      name: 'painLevel',
      label: 'How much pain did you feel today on average?',
      placeholder: 'Enter a number between 0 and 10.',
    },
  ] as const;

  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === 3) {
          return 0;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-[11vh]">
      <div
        className="h-full flex flex-col justify-center"
        onClick={() => {
          form.setFocus(inputs[currentInputIndex]?.name);
        }}
      >
        <div className="px-4 md:px-12">
          <form onSubmit={form.handleSubmit(handleStepSubmit)}>
            <div className="form-control w-full">
              <span className="isolate inline-flex rounded-md w-min shadow-sm mb-4">
                <LayoutGroup>
                  <button
                    type="button"
                    onClick={() => {
                      props.handleSelected(0);
                    }}
                    className={`${
                      props.selected === 0 ? 'bg-gray-100' : 'bg-white'
                    } transition relative whitespace-nowrap inline-flex items-center rounded-l-full px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 focus:z-10`}
                  >
                    Pain logger
                  </button>
                  <button
                    type="button"
                    onClick={() => props.handleSelected(1)}
                    className={`${
                      props.selected === 1 ? 'bg-gray-100' : 'bg-white'
                    } transition relative whitespace-nowrap -ml-px inline-flex items-center rounded-r-full px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 focus:z-10`}
                  >
                    Suggestions
                  </button>
                </LayoutGroup>
              </span>
              {inputs.map((input, index) => {
                if (index === currentInputIndex && props.selected === 0) {
                  return (
                    <AnimateUp key={input.name} className="relative">
                      <Input
                        isTextArea
                        type="text"
                        label={input.label}
                        speechRecog={index === 0}
                        onMicChange={(shouldListen) => {
                          if (shouldListen) {
                            SpeechRecognition.startListening({ continuous: true });
                          } else {
                            SpeechRecognition.stopListening();
                          }
                        }}
                        listening={listening}
                        error={form.formState.errors[input.name]?.message}
                        placeholder={input.placeholder}
                        onSubmit={form.handleSubmit(handleStepSubmit)}
                        {...form.register(input.name)}
                      />
                    </AnimateUp>
                  );
                }
              })}
              {currentInputIndex === -1 && props.selected === 0 && (
                <AnimateUp className="relative">
                  <Input type="text" disabled label={`Loading${'.'.repeat(dots)}`} />
                </AnimateUp>
              )}
              {props.selected === 1 && <Suggestions />}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const Suggestions = () => {
  const getSuggestions = httpsCallable(useFunctions(), 'chattingFunctionality');
  const [suggestions, setSuggestions] = useState<string[] | null>(null);

  useEffect(() => {
    getSuggestions({
      message: 'Get a list of improvements or suggestions that I could do to decrease my pain',
    }).then((res) => {
      const data = res.data as any | null;
      if (data?.commands) {
        setSuggestions(data.commands);
      }
      console.log(res);
    });
  }, []);

  return (
    <AnimateUp className="relative">
      <div className="mb-2">
        <label className="font-bold text-2xl sm:text-3xl">
          <span>Suggestions</span>
        </label>
      </div>
      {!suggestions ? (
        <Suggestion index={1} text={'Loading suggestions'} />
      ) : (
        <div className="space-y-1">
          {suggestions.slice(0, 4).map((text, i) => {
            return <Suggestion key={i} text={text} index={i} />;
          })}
        </div>
      )}
    </AnimateUp>
  );
};

const Suggestion = (props: { text: string; index: number }) => {
  return (
    <AnimateUp delay={props.index * 0.2}>
      <li className="transition relative w-full overflow-auto resize-none font-medium text-2xl sm:text-3xl text-neutral-800">
        <span className="relative right-4">{props.text.charAt(0).toUpperCase() + props.text.slice(1)}</span>
      </li>
    </AnimateUp>
  );
};
