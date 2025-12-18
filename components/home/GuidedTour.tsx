'use client';

import React from 'react';
import Joyride, { Step, CallBackProps } from 'react-joyride';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

interface GuidedTourProps {
  run: boolean;
  onFinish: () => void;
}

const steps: Step[] = [
  {
    target: '#tour-step-1',
    content:
      'Welcome to Indcric! This is the main screen where you can select a quiz format. The cube will rotate through different formats.',
    disableBeacon: true,
  },
  {
    target: '#tour-step-2',
    content:
      'Here you can see live stats about the game, including when the next quiz starts, how many people are playing, and total winners.',
  },
  {
    target: '#tour-step-3',
    content:
      'These buttons help you move around the app. You can see the leaderboard, your history, rewards, and your profile.',
    placement: 'top',
  },
  {
    target: '#nav-rewards-tab',
    content:
      'Tap the Rewards tab to view your prizes, scratch cards, and partner offers. The tour will continue there.',
    placement: 'top',
  },
];

export default function GuidedTour({ run, onFinish }: GuidedTourProps) {
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, index, action, type } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

    // When the user clicks "Next" on the last step, go to /rewards
    const isLastStep = index === steps.length - 1;
    const advanced =
      type === 'step:after' && (action === 'next' || action === 'start');

    if (isLastStep && advanced) {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('indcric-start-rewards-tour', 'true');
      }
      router.push('/rewards');
    }

    if (finishedStatuses.includes(status)) {
      onFinish();
    }
  };

  if (!run) return null;

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{
        back: 'Prev',
        close: 'End Tour',
        last: 'Next', // we navigate on last "Next"
        next: 'Next',
        skip: 'Skip Tour',
      }}
      styles={{
        options: {
          arrowColor:
            resolvedTheme === 'dark' ? 'hsl(var(--card) / 1)' : '#FFFFFF',
          backgroundColor:
            resolvedTheme === 'dark' ? 'hsl(var(--card) / 1)' : '#000000',
          primaryColor: '#FFD700',
          textColor: '#C0C0C0',
          zIndex: 1000,
        },
        tooltip: {
          backgroundColor: '#000000',
          color: '#C0C0C0',
          boxShadow: '0 0 15px rgba(255, 215, 0, 0.75)',
          borderRadius: 8,
        },
      }}
    />
  );
}