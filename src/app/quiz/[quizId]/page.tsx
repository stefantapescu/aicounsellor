// This page component now only renders the client component.
// Data fetching and logic are moved to QuizClientComponent.
import QuizClientComponent from './QuizClientComponent';

export default function Page() {
  // The actual quiz ID will be extracted from the URL params within the client component
  return (
    <div className="container mx-auto mt-10 max-w-2xl">
      {/* Title can also be set dynamically within the client component after fetching data */}
      <h1 className="mb-6 text-center text-3xl font-bold text-gray-800">
        Quiz Loading...
      </h1>
      <QuizClientComponent />
    </div>
  );
}
