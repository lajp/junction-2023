import { httpsCallable } from 'firebase/functions';
import { useState } from 'react';
import { useFunctions } from 'reactfire';

export const TestingChat = () => {
  const functions = useFunctions();
  const func = httpsCallable(functions, 'addMessageToAssistantThread');
  const afterOnboarding = httpsCallable(functions, 'runAfterOnboardingComplete');
  const chattingFunctionality = httpsCallable(functions, 'chattingFunctionality');
  const createAssistant = httpsCallable(functions, 'CreateGeneralAssistant');

  const [text, setText] = useState('');
  const [text2, setText2] = useState('');

  console.log(text2);

  // Today I had lower back pain after lifting heavy weights.

  return (
    <div>
      <button className="py-2 px- mb-8 bg-amber-400 rounded-md" onClick={() => afterOnboarding()}>
        Run after onboarding complete
      </button>
      <h1 className="text-2xl">Testing form</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          func({ message: text });
        }}
      >
        <div className="form-control w-full max-w-xs">
          <label className="label">{/* <span className="label-text">What is your name?</span> */}</label>
          <input
            onChange={(e) => setText(e.currentTarget.value)}
            value={text}
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
          />
        </div>
        <button className="py-2 px-5 bg-purple-200 mb-4 rounded-md">Submit form</button>
      </form>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await chattingFunctionality({ message: text2 });
        }}
      >
        <div className="form-control w-full max-w-xs">
          <input
            onChange={(e) => setText2(e.currentTarget.value)}
            value={text2}
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full max-w-xs"
          />
        </div>
        <button className="py-2 px-5 bg-green-200 mb-4 rounded-md">Chatting functionality call</button>
      </form>
      <button
        onClick={() => {
          createAssistant();
        }}
        className="py-2 px-5 bg-green-200 mb-4 rounded-md"
      >
        Create assistant
      </button>
    </div>
  );
};
