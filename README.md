# NOTE: DUE TO OPENAI OUTAGE, THE DEMO IS NOT WORKING. PLEASE SEE THE VIDEO DEMO INSTEAD.

[https://status.openai.com/](https://status.openai.com/)

# Restorative

_This project was developed for Junction 2023_\
As stated in the challenge the goal was to develop a digital solution to enchane chronic pain managment while reducing risks of opiod missuse. The solution should prioritze non-phramacological approaches.\
From the hackerpack we also decided to use the [46elks](https://46elks.com/) API

## Description

Restorative is a web application that allows users that experience chronic pain to track it and get feedback using artifical intelligence

Chronic pain imposes a significant personal and economic burden, impacting more than 30% of the global population in some form[1](<https://www.thelancet.com/article/S0140-6736(21)00393-7/fulltext>). Every patient has their own challenges[2](https://n.neurology.org/content/65/3/437.short) and we want to make it easier for the patient to get personalized feedback on their chronic pain. The feedback will be given by visualizations, chatting and personally developed insights. This will hopefully allow for a more personalized care where less opiates and addicting drugs are required.

**The main features are the following**

### Seemless speech and text input

The user can create an account and inputs relevant data which is stored in the model. After the account is created the user can input data on the dashboard. The user can on the dashboard input a general state of main and how they feel. The OpenAI API assistant will store each input and base other functionality in the application on these inputs. This allows the user to get a continously improving and more personalized assistant. The user also inputs their pain level. The dashboard also has an speech input. The speech input only works in the newest edition of chrome

The MMS implemenation is currently in mock when it comes to speech input due to the impossiblity of sending audio files over 46elks. The user can however make an input Using SMS and will be sent a reminder (once a day) if they forget to report their pain level.

### Responsive chatting

Continously improving chatting using assistants. For each chatting interaction a run is created on the users personal thread which analyzes all the inputted data for that user to formulate a response.

### Data visualization

The previous day average pain inputs are organized on the dashboard in an interactive bar chart.

### AI powered personal insights

(mocked!) The Ai powered inputs uses the Assistant functions to allow the end user to get relevant data based on the previous input. One such function is the get_one_success which returns "one thing that the user is doing which they should continue doing to help with pain relief"

## Technical implementation

The majority of the data and all the AI implementations are handled using the [OpenAI Assitants Beta API](https://platform.openai.com/docs/assistants/overview). The onboarding data is handled by the firebase documents but ultimately parsed to the OpenAI. Every user has a different thread that continues to grow when requests are made and data inputted. To summarize every user has the same initial configuration of the "Assistants" but each user has a personalized thread defined in the onboarding process. This makes the application easily scalable.

### Technologies used

    -npm (9.6.6)
    -node (v20.2.0)
    -firebase
    -TypeScript
    - Node.js
    - React.js
    - tailwindCSS

## The current limitiations

The sources of the response from regular inputs are currently unrelated. The use of OPENAI API also make the language learning model a black box.

## Online Deployment

The production deployment can be found at [https://junction2023-datagrabbarna.web.app/](https://junction2023-datagrabbarna.web.app/).

Pushing to main will automatically trigger a new deployment

## The future vision

Restorative currently lack some features that we deem vital. Connection with the google calender API, to make it possible for the AI to recommend tasks and input them in google calender. A map implementation with data on the closest places to do pain reliefing theraphy (like acupuncture) would have been nice.

## Getting Started

After cloning the repo, install dependencies:

```bash
npm install
```

Then if you haven't already, install the Firebase CLI globally on your machine:

```bash
npm install -g firebase-tools
```

Login to Firebase if you haven't already:

```bash
firebase login
```

Running the development server is a bit more complex since we need to spin up an instance of the database, auth service, and functions service locally.
You cannot just run `npm run dev`.
Instead you need to start Firebase emulators using the following command in the root of the repo:

```bash
firebase emulators:start
```

If prompted, run the following command before the one above:

```bash
firebase experiments:enable webframeworks
```

This will start the Firebase emulators for the database, auth, and functions services.
You should be able to view the frontend locally on **port 3009** and the Firebase emulators UI on **port 4000**.
The **Firebase Emulators UI** can be used to create mock users locally, watch function logs, and change data in the database, all locally.

**Important**: if you are developing Firebase functions, and want them to automatically reload when you make changes in dev, you need to cd into the functions directory in a separate terminal window and run `npm run build:watch`. This will compile the Typescript functions into Javascript and watch for changes.

For more info on using Firebase Emulators, see the docs: [https://firebase.google.com/docs/emulator-suite](https://firebase.google.com/docs/emulator-suite)

So, you should have one terminal process running `firebase emulators:start` in the root of the repo and another terminal process running `npm run build:watch` in /functions.

## Info

- The project uses [Firebase](https://firebase.google.com/) for hosting, database (Firestore), and auth.
- We use Reactfire as a wrapper around the Firebase SDK for frontend querying. Reactfire offers a number of React hooks that make it easier to interact with all Firebase services so you don't have to write useEffects everywhere. For more complex queries, you should use the Firebase SDK directly.
- For custom server logic, we use 2nd gen Firebase Functions. These are written in Typescript and can be found in the `functions` folder. You can find the docs here [https://firebase.google.com/docs/functions](https://firebase.google.com/docs/functions). Functions can be called directly by the frontend by using the `onCall` method, or they can be run on certain events such as a Database document write using `onDocumentWritten`. **Note**: The `functions` directory has its own package.json and node_modules folder. For dependencies that should only be used in the frontend, install them in the root package.json. For dependencies that should only be used in the backend, such as the OpenAI sdk, you should `cd` into the functions directory and install the dependency from there.
- We use DaisyUI for styling. It's a Tailwind CSS component library that makes it easier to write CSS. You can find the docs here [https://daisyui.com/](https://daisyui.com/).
- We use React Hook Form for handling form submission logic and custom validation. You can find the docs here [https://react-hook-form.com/](https://react-hook-form.com/).
- We use the OpenAI NodeJS SDK for interacting with their services in Typescript. You can find the docs here [https://platform.openai.com/docs/overview](https://platform.openai.com/docs/overview). We try to use their Assistants API [https://platform.openai.com/docs/assistants/overview](https://platform.openai.com/docs/assistants/overview) for most of our use cases. Check out the docs on the Assistants API and also check out OpenAI GPT Function Calling [https://platform.openai.com/docs/guides/function-calling](https://platform.openai.com/docs/guides/function-calling).

## Junction Descrition submitted

Chronic pain imposes a significant personal and economic burden, impacting more than 30% of the global population in some form. Every patient has their own challenges and we want to make it easier for the patient to get personalized feedback on their chronic pain. The feedback will be given by visualizations, chatting and personally developed insights. This will hopefully allow for a more personalized care where less opiates and addicting drugs are required.  
**That is our goal with Restorative**

# Restorative

Restorative is a web application that empowers indviduals with chronic pain by enabling them to monitor data and receive AI-driven feedback

### Seemless speech and text input

After the account is created the user can input data on the dashboard. The input a general pain situation using speech(newest chrome version) or text. The OpenAI API assistant will store each input and base other functionality in the application on these inputs. This allows the user to get a continously improving and more personalized assistant.

The MMS implementation functions with text, but presently, it is only mocked with speech because sending audio files over 46elks is impossible. The user will be sent a reminder (once a day) if they forget to report their pain level.

### Responsive chatting

Continously improving chatting using assistants.

### Data visualization

The previous day average pain inputs are organized on the dashboard in an interactive bar chart.

### AI powered personal insights

(mocked!) The Ai powered inputs uses the Assistant functions to allow the end user to get relevant data based on the previous input. One such function is the get_one_success which returns "one thing that the user is doing which they should continue doing to help with pain relief"

## Technical implementation

The majority of the data and all the AI implementations are handled using the [OpenAI Assitants Beta API](https://platform.openai.com/docs/assistants/overview). The onboarding data is handled by the firebase documents but ultimately parsed to the OpenAI. Every user has a different thread that continues to grow when requests are made and data inputted. To summarize every user has the same initial configuration of the "Assistants" but each user has a personalized thread defined in the onboarding process. This makes the application easily scalable.

## The current limitiations

The sources of the response from regular inputs are currently unrelated. The use of OPENAI API also make the language learning model a black box.

## Online Deployment

The production deployment can be found at [https://junction2023-datagrabbarna.web.app/](https://junction2023-datagrabbarna.web.app/).

## The future vision

Restorative currently lack some features that we deem vital. Connection with the google calender API, to make it possible for the AI to recommend tasks and input them in google calender.  
** More information available in the readME**
