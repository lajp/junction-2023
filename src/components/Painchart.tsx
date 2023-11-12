import _ from 'lodash';

import { BarChart } from '@mui/x-charts/BarChart';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useWindowSize } from '@/lib/utils';
import { useAuth, useFirestoreCollectionData } from 'reactfire';
import { useEffect, useState } from 'react';
import { useFirestore } from 'reactfire';

import { collection, doc, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { AnimateUp } from './AnimateUp';

export type painLevelData = {
  painLevel: number;
  date: Date;
};

const graphData: painLevelData[] = [
  {
    painLevel: 0,
    date: new Date('2023-11-03T10:20:30Z'),
  },
  {
    painLevel: 0,
    date: new Date('2023-11-04T09:15:00Z'),
  },
  {
    painLevel: 0,
    date: new Date('2023-11-05T12:45:00Z'),
  },
  {
    painLevel: 0,
    date: new Date('2023-11-06T08:30:00Z'),
  },
  {
    painLevel: 0,
    date: new Date('2023-11-07T11:00:00Z'),
  },
  {
    painLevel: 0,
    date: new Date('2023-11-08T15:20:00Z'),
  },
  {
    painLevel: 0,
    date: new Date('2023-11-09T07:50:00Z'),
  },
];

const avgPainLevel = (data: painLevelData[]): number => {
  if (data.length == 0) {
    return NaN;
  } else {
    return _.sumBy(data, (d: painLevelData) => d.painLevel) / data.length;
  }
};

const preProcess = (data: painLevelData[]) => {
  const groupedByDate = _.groupBy(data, (d: painLevelData) => d.date.toDateString());
  const dayAndAverage = Object.entries(groupedByDate).map(([_key, values]) => {
    return { date: values[0].date, pain: avgPainLevel(values) };
  });

  // Add 0 for days with no data
  const tempNow = _.minBy(dayAndAverage, (d) => d.date);
  const tempLast = _.maxBy(dayAndAverage, (d) => d.date);

  if (tempNow && tempLast) {
    let now = { ...tempNow, date: new Date(tempNow.date) };
    const last = { ...tempLast };
    while (now.date.toDateString() != last.date?.toDateString()) {
      if (!dayAndAverage.find((d) => d.date.toDateString() == now.date.toDateString())) {
        dayAndAverage.push({ date: new Date(now.date), pain: 0 });
      }
      now.date.setDate(now.date.getDate() + 1);
    }
  }
  return dayAndAverage.sort((a, b) => a.date.getTime() - b.date.getTime());
};

function PainChart() {
  const router = useRouter();
  const auth = useAuth();
  if (!auth.currentUser) {
    return;
  }

  const db = useFirestore();
  const [data, setData] = useState(new Array());

  const painLevelRef = collection(doc(collection(db, 'users'), auth.currentUser.uid), 'painLevels');
  const painLevelsCol = useFirestoreCollectionData(painLevelRef);

  useEffect(() => {
    const getData = async () => {
      const painLevels = await getDocs(painLevelRef);
      const painLevelData: painLevelData[] = [];
      painLevels.forEach((p) => {
        const data = p.data();
        const painLevel = data.painLevel;
        const date = data.date.toDate();
        if (painLevel && date) {
          painLevelData.push({ painLevel: painLevel, date: date });
        }
      });
      const preProcessed = preProcess(painLevelData).slice(-7);
      setData(preProcessed);
    };

    getData();
  }, [painLevelsCol.data]);

  const mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = createTheme({ palette: { mode } });

  const [width] = useWindowSize();

  return (
    <AnimatePresence>
      {data.length === 0 ? (
        <motion.div className="h-[18rem] ring-1 ring-gray-100 xl:h-[22rem] aspect-[4/3] bg-neutral-100 text-neutral-400 rounded-xl flex items-center justify-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            Write your first log to view the graph
          </motion.p>
        </motion.div>
      ) : (
        <ThemeProvider theme={theme}>
          <BarChart
            xAxis={[
              {
                id: 'barCategories',
                data: data.map((d) => d.date.toDateString()),
                scaleType: 'band',
              },
            ]}
            yAxis={[{ min: 0, max: 10 }]}
            series={[
              {
                data: data.map((d) => d.pain),
                label: 'Average pain level',
              },
            ]}
            width={Math.min(width - 630, 700)}
            height={480}
          />
        </ThemeProvider>
      )}
    </AnimatePresence>
  );
}

export default PainChart;
