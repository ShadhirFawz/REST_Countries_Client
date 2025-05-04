// src/components/LoadingSpinner.jsx
export default function LoadingSpinner() {
    return (
      <div className="flex justify-center items-center">
        <div className="relative w-12 h-12">
          {/* Outer ring with gradient */}
          <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin"></div>
          {/* Inner ring */}
          <div className="absolute w-8 h-8 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-300 border-t-transparent animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }