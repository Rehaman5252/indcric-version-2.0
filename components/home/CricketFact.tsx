'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Lightbulb } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// ✅ Hardcoded cricket facts
const CRICKET_FACTS = [
  "Did you know? The first cricket match was played in 1844 between USA and Canada!",
  "A googly is a type of delivery in cricket that looks like a leg-break but turns the opposite way.",
  "The word 'cricket' comes from the Old French word 'criquet', which means a stick or club.",
  "MS Dhoni is known for his helicopter shot - one of the most unique batting shots in cricket.",
  "The stumps in cricket are 28 inches (71.1 cm) tall - standardized since 1835.",
  "A cricket ball must weigh between 5.5 and 5.75 ounces (155.9 to 163 grams).",
  "The fastest cricket ball ever bowled was 170.3 km/h by Shoaib Akhtar in 2011.",
  "Virat Kohli is the fastest to reach 12,000 ODI runs in international cricket history.",
  "The boundary in cricket is typically 70-75 meters from the stumps.",
  "A cricket match between England and Australia, known as 'The Ashes', has been played since 1882.",

  // ------- 90 NEW FACTS BELOW --------

  "Sachin Tendulkar is the only player to have scored 100 international centuries.",
  "The first-ever Cricket World Cup was held in 1975 in England.",
  "Muttiah Muralitharan holds the record for the most Test wickets: 800.",
  "ODI cricket was introduced in 1971 in a match between Australia and England.",
  "The longest cricket match lasted 10 days between England and South Africa in 1939.",
  "Chris Gayle is the only player to hit a six off the first ball of a Test match.",
  "The highest individual score in ODIs is 264 by Rohit Sharma.",
  "AB de Villiers holds the record for the fastest ODI century—off 31 balls.",
  "Wasim Akram has the most wickets in ODIs for a left-arm bowler.",
  "The term 'hat-trick' originated in cricket when a bowler took three wickets in three balls.",

  "Jim Laker took 19 wickets in a single Test match—an unbroken record.",
  "Lasith Malinga is the only bowler with two World Cup hat-tricks.",
  "The ICC was founded in 1909 as the Imperial Cricket Conference.",
  "The first pink-ball Test was played in 2015 between Australia and New Zealand.",
  "The MCG in Australia can hold over 100,000 spectators.",
  "The highest team total in ODIs is 498 by England.",
  "The shortest completed Test match lasted just 5 hours between Australia and South Africa in 1932.",
  "In cricket, the term 'duck' refers to scoring zero runs.",
  "Don Bradman's Test average of 99.94 is considered the greatest sporting statistic.",
  "Ricky Ponting has won the most ICC trophies as a captain.",

  "Yuvraj Singh hit six sixes in an over in the 2007 T20 World Cup.",
  "The first T20 International was played in 2005 between Australia and New Zealand.",
  "Kumar Sangakkara scored four consecutive ODI centuries – a record.",
  "Imran Khan led Pakistan to its first World Cup win in 1992.",
  "Shane Warne took over 1,000 international wickets.",
  "England is considered the birthplace of cricket.",
  "The first women’s World Cup was held in 1973—two years before the men's edition.",
  "The term 'maiden over' means an over in which no runs are scored.",
  "A 'nightwatchman' is a lower-order batter sent in to protect a main batter at the end of the day.",
  "The Super Over was introduced to break ties in limited-overs cricket.",

  "The heaviest cricket bat allowed weighs 1.4 kg.",
  "Bowling speeds above 150 km/h are considered express pace.",
  "Ravichandran Ashwin is one of the fastest to reach 300 Test wickets.",
  "The first IPL season was played in 2008.",
  "Chennai Super Kings and Mumbai Indians are the most successful IPL teams.",
  "Sir Garfield Sobers is regarded as one of the greatest all-rounders ever.",
  "A 'beamer' is an illegal delivery that reaches the batter above waist height without bouncing.",
  "The term 'follow-on' allows a team to bat again immediately under certain conditions.",
  "The hottest recorded cricket venue temperature was 54°C in Sharjah.",
  "Ben Stokes played one of the greatest Test innings in 2019 at Headingley.",

  "The first cricket laws were written in 1744.",
  "The heaviest defeat in Test cricket by runs was England losing by 675 against Australia.",
  "Anil Kumble once bowled with a broken jaw to help India.",
  "A cricket pitch must be exactly 22 yards long.",
  "The shortest format recognized by ICC is T10 cricket.",
  "The 'Doosra' was popularized by Saqlain Mushtaq.",
  "South Africa is known as the 'chokers' due to close World Cup misses.",
  "The 2019 World Cup final was decided on a boundary count rule.",
  "Herschelle Gibbs once hit six sixes in an over in international cricket.",
  "The Qasim Stadium pitch once produced 77 wickets in a single match.",

  "Virender Sehwag is the only Indian to score two Test triple centuries.",
  "Glenn McGrath holds the record for most World Cup wickets.",
  "The longest six in cricket is 158 meters by Shahid Afridi.",
  "Rahul Dravid has faced the most balls in Test cricket history.",
  "The first-ever IPL auction was won by MS Dhoni for CSK.",
  "Umpire Billy Bowden is famous for his crooked finger signal.",
  "The term 'chinaman' refers to a left-arm unorthodox spin bowler.",
  "A stump mic is used to capture on-field audio during matches.",
  "The ICC T20I rankings started officially in 2011.",
  "The first cricket radio commentary was in 1922 in Australia.",

  "Bangladesh became a Test-playing nation in 2000.",
  "The first DRS system was introduced in 2008.",
  "SuperSport Park is known for its fast outfields.",
  "Shubman Gill holds one of the highest ODI scores for India.",
  "Cricket balls have a seam with 6 rows of stitches.",
  "The World Test Championship began in 2019.",
  "The first-ever day-night ODI was in 1979.",
  "New Zealand has the smallest Test venue: Basin Reserve.",
  "Australia has won the most Cricket World Cups.",
  "The term 'sledging' refers to players verbally unsettling opponents.",

  "The first cricket bat was shaped like a hockey stick.",
  "Kapil Dev was the youngest World Cup–winning captain.",
  "A tie in Test cricket is extremely rare—only two matches ever.",
  "The first-ever IPL Orange Cap was won by Shaun Marsh.",
  "Slip fielding is considered the toughest fielding position.",
  "Spin bowlers rely heavily on revolutions per minute (RPM).",
  "Kieron Pollard once hit six sixes in a T20I over.",
  "The Adelaide Oval is one of the most picturesque cricket grounds.",
  "Sunil Gavaskar was the first to score 10,000 Test runs.",
  "The 'powerplay' was introduced in ODIs in 1991.",

  "Dale Steyn is considered one of the greatest fast bowlers of the modern era.",
  "The IPL is the richest cricket league in the world.",
  "A Test match can last up to 5 days and still end in a draw.",
  "The first use of a third umpire was in 1992.",
  "Rohit Sharma holds the record for most ODI double centuries.",
  "Cricket umpires traditionally wear white coats in Tests.",
  "The BCCI is the richest cricket board globally.",
  "A 'golden duck' means getting out on the first ball.",
  "The Ranji Trophy is India’s premier domestic first-class tournament.",
  "Afghanistan became a Test nation in 2017.",

  "The average cricket ball can last 80 overs before being replaced.",
  "The term 'LBW' stands for leg-before-wicket.",
  "Floodlights were first used in cricket in 1952 in England.",
  "The maximum number of balls in a Test match (without extras) is 540 overs.",
  "The Caribbean is famous for producing legendary fast bowlers.",
  "Fielders cannot wear gloves except the wicketkeeper.",
  "The first cricket helmet was used in the 1970s.",
  "A 'yorker' is a delivery aimed at the batter’s toes.",
  "The ICC Hall of Fame was launched in 2009.",
  "Virat Kohli has the most runs in T20I cricket."
];


export default function CricketFact({ format }: { format: string }) {
  // ✅ ONLY ONE STATE: currentIndex
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ FIXED: Simple function - no dependencies causing resets
  const handleNextFact = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % CRICKET_FACTS.length);
  }, []);

  const currentFact = CRICKET_FACTS[currentIndex];

  return (
    <Card className="bg-card/80 shadow-lg border border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="text-primary" />
          Dressing Room Banter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fact Display */}
        <div className="min-h-[80px] flex items-center justify-center text-center px-2">
          <AnimatePresence mode="wait">
            <motion.p
              key={`fact-${currentIndex}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {currentFact}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Fact counter */}
        

        {/* Next Delivery Button */}
        <div className="flex justify-center">
          <Button
            variant="default"
            size="sm"
            onClick={handleNextFact}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Next Delivery
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
