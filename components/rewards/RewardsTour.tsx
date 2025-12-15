'use client';

import React from 'react';
import Joyride, { Step, CallBackProps } from 'react-joyride';
import { useTheme } from 'next-themes';

interface RewardsTourProps {
  run: boolean;
  onFinish: () => void;
}

const steps: Step[] = [
  {
    target: '#rewards-awards',
    content:
      'This section shows your Man of the Match awards and the scratch cards you can score by piling on runs in our quizzes.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '#rewards-empty',
    content:
      'When you have no rewards on the board yet, this area tells you how to open your account and unlock your first scratch card by playing a quiz.',
    placement: 'top',
  },
  {
    target: '#rewards-partners',
    content:
      'Here you will find exclusive partner offers and sponsored deals you can scoop like boundary shots, and you can always review the full playing conditions in the legal policies at the end of your profile page.',
    placement: 'top',
  },
];

export default function RewardsTour({ run, onFinish }: RewardsTourProps) {
  const { resolvedTheme } = useTheme();

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];

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
        last: 'End Tour',
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