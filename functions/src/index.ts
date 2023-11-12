// @ts-nocheck
import { onCall } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as logger from 'firebase-functions/logger';
import OpenAI, { toFile } from 'openai';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';
import { PromisePool } from 'es6-promise-pool';

initializeApp({
  serviceAccountId: '830943649685-compute@developer.gserviceaccount.com',
});

const ASSISTANT_ID = 'asst_i043nPhSRtV7L6fY4phYncFJ';
const JSON_ASSISTANT_ID = 'asst_qTuEb5TistWrBBQrieoRCrpB';

const API_KEY = process.env.API_KEY

export const CreateGeneralAssistant = onCall({ region: 'europe-west1' }, async (req) => {
  try {
    const openai = new OpenAI({ apiKey: API_KEY });
    const assistant = await openai.beta.assistants.create({
      name: 'Pain Assitant',
      description: `You should help me with incrementally improving my chronic pain. I would like to get better through novel activities and not have to rely on my pain medication as much.
    I will continuously give you daily updates on my pain level, its location, what I did that day, how active I was, if I tried any therapies, what my diet was like, etc.
    You should be my assistant helping me to get better, and as I give you more information every day, you should be able to help me more and more. `,
      instructions: `You should answer to the user with concise answers, maximum length 1000 characters`,
      tools: [
        {
          type: 'function',
          function: {
            name: 'get_listoff_improvements',
            description: 'Get a list of improvements the user could make to decrease their pain',
            parameters: {
              type: 'object',
              properties: {
                commands: {
                  type: 'array',
                  items: {
                    type: 'string',
                    description: 'An improvement the user could make',
                  },
                  description: 'List of improvements the user could make',
                },
              },
              required: ['commands'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'get_one_success',
            description:
              'Get based on the user input one thing that the user is doing which they should continue doing to help with pain relief',
            parameters: {
              type: 'object',
              properties: {},
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'get_similar_activities',
            description: 'Get a list of activities that is similar to what the user previously has enjoyed',
            parameters: {
              type: 'object',
              properties: {
                commands: {
                  type: 'array',
                  items: {
                    type: 'string',
                    description: 'An activity the user would enjoy',
                  },
                  description: 'List of activities the user would enjoy',
                },
              },
              required: ['commands'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'list_activities',
            description: 'List activities of what the user has done',
            parameters: {
              type: 'object',
              properties: {
                activities: {
                  type: 'array',
                  items: {
                    type: 'string',
                    description: 'An activity the user has done',
                  },
                  description: 'List of activities the user has done ',
                },
              },
              required: ['activities'],
            },
          },
        },
      ],
      model: 'gpt-4-1106-preview',
    });

    logger.log({
      id: assistant.id,
    });

    return { id: assistant.id };
  } catch (e) {
    logger.error(e);
  }
});
export const OpenAIcompletions = onCall({ region: 'europe-west1' }, async (req) => {
  const openai = new OpenAI({ apiKey: API_KEY });
  const completion = await openai.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    prompt: 'Say this is a test.',
    max_tokens: 7,
    temperature: 0,
  });
  logger.log(completion); // It prints the completed message to the backend
  /*
  The Request response stuff
  */
  const { text } = req.data;

  return 'Hello from Firebase!' + text;
});

export const CreateUserThread = onCall({ region: 'europe-west1' }, async (req) => {
  const { userdata } = req.data;
  const openai = new OpenAI({ apiKey: API_KEY });
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: 'user',
        content: `Data of the specific user: ${userdata}`,
      },
    ],
  });
  return thread.id;
});

// We create a new GPT assistant thread for the user and pass it some data
export const runAfterOnboardingComplete = onCall({ region: 'europe-west1' }, async (req) => {
  logger.log('onboarding complete');
  const user = req.auth;
  const openai = new OpenAI({ apiKey: API_KEY });
  const thread = await openai.beta.threads.create();
  await getFirestore().collection('users').doc(user.uid).update({
    assistantThreadId: thread.id,
  });
});

export const addPainInput = onCall({ region: 'europe-west1' }, async (req) => {
  const user = req.auth;
  const { painLevel, description } = req.data;

  if (!user) {
    return {
      error: 'not authed',
    };
  }

  const userDoc = await getFirestore().collection('users').doc(user.uid).get();
  const userDocData = userDoc.data();

  const threadId = userDocData.assistantThreadId;
  if (!threadId) {
    return {
      error: 'no thread id',
    };
  }

  await addMessageToThread(threadId, description);

  // for graph
  await getFirestore()
    .collection('users')
    .doc(user.uid)
    .collection('painLevels')
    .add({ painLevel: painLevel, date: new Date() });

  await getFirestore()
    .collection('users')
    .doc(user.uid)
    .update({ ...userDocData, updateTime: new Date() });

  return { message: 'success' };
});

export const addMessageToAssistantThread = onCall({ region: 'europe-west1' }, async (req) => {
  const user = req.auth;
  const { message } = req.data;

  if (!user) {
    return {
      error: 'not authed',
    };
  }

  const userDoc = await getFirestore().collection('users').doc(user.uid).get();
  const userDocData = userDoc.data();

  const threadId = userDocData.assistantThreadId;

  if (!threadId) {
    return {
      error: 'no thread id',
    };
  }

  await addMessageToThread(threadId, message);
});

const addMessageToThread = async (threadId, message) => {
  const openai = new OpenAI({ apiKey: API_KEY });

  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: message,
  });
};

export const chattingFunctionality = onCall({ region: 'europe-west1' }, async (req) => {
  const user = req.auth;
  const { message } = req.data;

  if (!user) {
    logger.error('not authed');
    return {
      error: 'not authed',
    };
  }

  if (!message) {
    return {
      error: 'no message provided',
    };
  }

  const userDoc = await getFirestore().collection('users').doc(user.uid).get();
  const userDocData = userDoc.data();

  const threadId = userDocData.assistantThreadId;

  if (!threadId) {
    logger.error('no thread id');
    return {
      error: 'no thread id',
    };
  }

  logger.log('before openai create');

  const openai = new OpenAI({ apiKey: API_KEY });

  const runs = await openai.beta.threads.runs.list(threadId);
  const a = runs.data;
  logger.log({ a });

  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: message,
  });

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID,
    instructions: 'You should answer the users question',
  });
  /*
  Implementing the code that waits for the response
  */

  let status: Run.status = 'queued';
  var runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);

  logger.log('before while');

  while (status !== 'completed') {
    runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    status = runStatus.status;

    if (status === 'requires_action') {
      logger.log(runStatus);
      break;
    }
    logger.log(status);

    // Add a delay before checking again (e.g., every few seconds)
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  if (status === 'requires_action') {
    // @ts-ignore
    const toolCall = runStatus.required_action.submit_tool_outputs.tool_calls[0];
    const commands = toolCall.function.arguments;
    logger.error({ commands });
    logger.log('before parse');
    const parse = JSON.parse(commands);
    logger.log({ parse });
    try {
      await openai.beta.threads.runs.submitToolOutputs(threadId, runStatus.id, {
        tool_outputs: [
          {
            output: 'You could try doing this',
            tool_call_id: toolCall.id,
          },
        ],
      });
    } catch (e) {
      logger.error('error in submitToolOutputs');
    }
    return { commands: parse.commands };
  }

  logger.log('after while');

  const messages = await openai.beta.threads.messages.list(threadId);
  const latestMessageStr = messages?.body?.data[0]?.content[0]?.text?.value ?? 'Error in backend';
  logger.log(latestMessageStr);
  return { message: latestMessageStr };
});

// Reduce the bill :))
const MAX_CONCURRENT = 3;

// export const sendSMSReminders = onSchedule('every day 18:00', async (_event) => {
//   const db = getFirestore();
//   const userRef = db.collection('users');
//   const users = await userRef.get().then((s) => s.docs);

//   const auth = Buffer.from('u23b270b98ddd5c3edce2a14d954097f0:1E93D770BCCD138511D0400FC006C0C3').toString('base64');

//   const messageData = {
//     from: 'Restorative',
//     message:
//       "You haven't yet added your data for today! Your data helps us help you better. Add your data here: https://junction2023-datagrabbarna.web.app/login",
//   };

//   const today = new Date().toDateString();

//   const pool = new PromisePool(
//     users.map(async (user) => {
//       if (user.data().updateTime.toDate().toDateString() != today) {
//         console.log(`Sending update to ${user.id}`);
//         // TODO: Figure out user phone number
//         const phoneNumber = user.data().phoneNumber;
//         if (!phoneNumber) {
//           return;
//         }
//         const message = new URLSearchParams({ ...messageData, to: phoneNumber }).toString();

//         await fetch('https://api.46elks.com/a1/sms', {
//           method: 'post',
//           body: message,
//           headers: { Authorization: 'Basic ' + auth },
//         })
//           .then((res) => res.json())
//           .then((json) => console.log(json))
//           .catch((err) => console.log(err));
//       }
//     }),
//     MAX_CONCURRENT
//   );

//   pool.start().then(() => console.log('All reminders sent'));
// });

/*
 *  Example request: {"data": {"from": "+35812345678", "audioUrl": "https://eample.org/audio.mp3."}}
 */
export const receiveMMSAudio = onCall({ region: 'europe-west1' }, async (req: Request) => {
  try {
    const { audioUrl, from } = req.data;
    console.log(from);

    const db = getFirestore();
    const snap = await db.collection('users').where('onboarding.phoneNumber', '==', from).get();

    if (snap.empty) {
      return { error: 400, raw: 'invalid request, no such user' };
    }

    let user = undefined;
    snap.forEach((u) => (user = u.data()));

    const openai = new OpenAI({ apiKey: API_KEY });
    const audio = await fetch(audioUrl);
    const transcriptions = await openai.audio.transcriptions.create({
      file: await toFile(audio, 'audio.mp3'),
      model: 'whisper-1',
    });

    await addMessageToThread(user?.assistantThreadId, transcriptions.text);
    return { transcription: transcriptions.text };
  } catch {
    return { error: 400, raw: 'invalid request' };
  }
});
