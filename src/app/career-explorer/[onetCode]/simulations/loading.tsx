export default function SimulationsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700" />
        <div className="mt-2 h-4 w-96 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-4">
              <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse dark:bg-gray-700" />
            </div>

            <div className="mb-2 h-6 w-48 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
            <div className="mb-4 space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse dark:bg-gray-700" />
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full dark:bg-gray-700">
                <div className="h-2 w-1/3 bg-gray-300 rounded-full animate-pulse dark:bg-gray-600" />
              </div>
            </div>

            <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
} 