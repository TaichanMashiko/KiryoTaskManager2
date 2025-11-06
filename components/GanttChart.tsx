
import React from 'react';
import { GanttChartIcon } from './icons';

const GanttChart: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 bg-gray-800/50 rounded-lg p-8 text-center">
      <GanttChartIcon className="w-16 h-16 text-indigo-500 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Gantt Chart Feature</h2>
      <p className="text-gray-400">
        This feature is currently under development and will be implemented in Step 2.
      </p>
       <p className="text-gray-500 mt-4 text-sm">
        It will provide a timeline view of all tasks based on their start and due dates.
      </p>
    </div>
  );
};

export default GanttChart;
