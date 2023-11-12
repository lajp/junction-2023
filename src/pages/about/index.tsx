import { AnimateUp } from '@/components/AnimateUp';
import React from 'react';

const About = () => {
  return (
    <div className="min-h-[80vh] flex items-center">
      <AnimateUp className="max-w-[100ch] mx-auto">
        <h1 className="font-bold text-5xl mb-8 leading-[1.2]">
          Chronic Pain Relief,
          <br />
          <span className="text-teal-600">One Insight at a Time.</span>
        </h1>
        <div className="text-2xl space-y-5">
          <p>
            Restorative is a platform dedicated to helping you manage and understand your chronic pain through
            alternative treatments. We believe in the power of data and insights to transform the way you approach pain
            relief.
          </p>
          <p>
            Chronic pain is as unique as you are. Take charge of your well-being as our platform becomes your AI-driven
            companion in understanding and managing your pain. Track your pain levels while trying alternative
            treatments, and uncover invaluable insights into what truly works best for you.
          </p>
          <p>
            Whether you're exploring mindfulness, physical therapy or other holistic approaches, Restorative is here to
            support your journey. Our user-friendly interface makes it easy to log your experiences, identify patterns,
            and discover effective strategies for chronic pain relief.
          </p>
        </div>
      </AnimateUp>
    </div>
  );
};

export default About;
