'use client';

import { AdSlot } from '@/types/ads';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AdSlotSelectorProps {
  selectedSlot: AdSlot | null;
  onSelectSlot: (slot: AdSlot) => void;
}

export default function AdSlotSelector({
  selectedSlot,
  onSelectSlot,
}: AdSlotSelectorProps) {
  // ✅ COMPLETE SLOT LIST - 16 TOTAL
  const slotGroups = [
    {
      title: '🎲 CUBE FACES (6 Slots)',
      slots: [
        { value: 'T20' as AdSlot, label: 'T20 Cricket' },
        { value: 'ODI' as AdSlot, label: 'ODI League' },
        { value: 'Test' as AdSlot, label: 'Test Cricket' },
        { value: 'Womens' as AdSlot, label: "Women's Premier" },
        { value: 'IPL' as AdSlot, label: 'IPL League' },
        { value: 'Mixed' as AdSlot, label: 'Mixed Format' },
      ],
    },
    {
      title: '❓ QUIZ FLOW (5 Slots)',
      slots: [
        { value: 'Q1_Q2' as AdSlot, label: 'Between Q1→Q2' },
        { value: 'Q2_Q3' as AdSlot, label: 'Between Q2→Q3' },
        { value: 'Q3_Q4' as AdSlot, label: 'Between Q3→Q4 (Video)' },
        { value: 'Q4_Q5' as AdSlot, label: 'Between Q4→Q5' },
        { value: 'AfterQuiz' as AdSlot, label: 'After Quiz (Video)' },
      ],
    },
    {
      title: '💡 HINT ADS (5 Slots) - NEW!',
      slots: [
        { value: 'Q1_HINT' as AdSlot, label: '💡 Question 1 Hint' },
        { value: 'Q2_HINT' as AdSlot, label: '💡 Question 2 Hint' },
        { value: 'Q3_HINT' as AdSlot, label: '💡 Question 3 Hint' },
        { value: 'Q4_HINT' as AdSlot, label: '💡 Question 4 Hint' },
        { value: 'Q5_HINT' as AdSlot, label: '💡 Question 5 Hint' },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          📍 Select Ad Slot (16 Available)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {slotGroups.map(group => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">
                {group.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {group.slots.map(slot => (
                  <button
                    key={slot.value}
                    onClick={() => onSelectSlot(slot.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedSlot === slot.value
                        ? 'bg-yellow-600 text-white border-2 border-yellow-500 ring-2 ring-yellow-400'
                        : 'bg-gray-900 text-gray-300 border-2 border-gray-700 hover:border-yellow-500 hover:text-yellow-400'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Display selected slot info */}
        {selectedSlot && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500 rounded-lg">
            <p className="text-sm text-blue-400">
              ✅ Selected: <span className="font-bold">{selectedSlot}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
