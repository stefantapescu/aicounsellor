'use client';

function SimulationErrorMessage({ errorMessage }: { errorMessage: string }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Error Loading Simulation</h2>
      <p className="text-red-600 dark:text-red-300">{errorMessage}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

export default SimulationErrorMessage; 