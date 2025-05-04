import { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function CountryCard({ country, onClick }) {
  const currency = country.currencies
    ? Object.entries(country.currencies)[0]
    : null;

  const currencyCode = currency ? currency[0] : 'N/A';

  const [isHovered, setIsHovered] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const { favorites } = useAuth();
  const isFavorite = favorites?.some(fav => fav.code === country.cca3);

  // Truncate long text
  const truncateText = (text, maxLength) => {
    return text?.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const countryName = truncateText(country.name?.common || 'N/A', 20);
  const officialName = truncateText(country.name?.official || 'N/A', 30);
  const region = truncateText(country.region || 'N/A', 20);
  const capital = country.capital?.[0] ? truncateText(country.capital[0], 15) : 'N/A';
  const flagSrc = country.flags?.png || country.flag || 'default-flag-path.png';

  useEffect(() => {
    let animationFrame;
    let startTime;
    const duration = 500;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setAnimationProgress(isHovered ? progress : 1 - progress);
      
      if ((isHovered && progress < 1) || (!isHovered && progress < 1)) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isHovered]);

  // ... rest of your existing animation code ...

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative cursor-pointer bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 shadow-lg hover:shadow-xl hover:bg-gray-700/60 transition-all duration-300 hover:-translate-y-1 h-[420px] flex flex-col"
    >
      {isFavorite && (
        <div className="absolute top-4 right-4 z-10 p-2 bg-pink-500/90 rounded-full shadow-md">
          <FaHeart className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Header Section */}
      <div className="relative z-10">
        <h3 className="text-2xl font-bold font-serif text-blue-400 mb-1 group-hover:text-blue-300 transition-colors tracking-tight line-clamp-2">
          {countryName}
        </h3>
        <p className="text-xs text-gray-300 font-mono uppercase tracking-wider mb-4 line-clamp-2">
          {officialName}
        </p>
        
        {/* Divider with fade effect */}
        <div className="relative h-px bg-gradient-to-r from-transparent via-gray-600/40 to-transparent my-3 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-blue-400/30 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Details Section */}
      <div className="relative z-10 space-y-3 flex-grow">
        {/* Region */}
        <div className="flex items-baseline">
          <span className="text-xs font-medium text-gray-300/90 w-24 tracking-wider font-mono">REGION</span>
          <span className="text-gray-200 font-stretch-20% font-sans line-clamp-1" style={{ fontFamily: 'san-serif', fontSize: '1.5rem' }}>
            {region}
          </span>
        </div>
        
        {/* Faint Divider */}
        <div className="h-[0.5px] bg-gray-700/50 w-full"></div>

        {/* Capital */}
        <div className="flex items-baseline pt-1">
          <span className="text-xs font-medium text-gray-300/90 w-24 tracking-wider font-mono">CAPITAL</span>
          <span className="text-gray-200 font-light font-sans line-clamp-1">
            {capital}
          </span>
        </div>
        
        {/* Faint Divider */}
        <div className="h-[0.5px] bg-gray-700/50 w-full"></div>

        {/* Currency */}
        <div className="flex items-baseline pt-1">
          <span className="text-xs font-medium text-gray-300/90 w-24 tracking-wider font-mono">CURRENCY</span>
          <span className="text-gray-200 font-light font-sans">
            {currencyCode}
          </span>
        </div>
      </div>

      {/* Flag Section */}
      <div className="mt-5 relative">
        <div className="absolute -top-3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600/40 to-transparent"></div>
        <div className="relative overflow-hidden rounded-lg border border-gray-700/60 group-hover:border-blue-400/40 transition-all duration-300">
          <img
            src={country.flags?.png || country.flag}
            alt={`${country.name?.common} flag`}
            className="h-24 w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 via-transparent to-transparent"></div>
        </div>
      </div>

      {/* Footer Badge */}
      <div className="absolute bottom-3 right-3">
        <span className="text-xs px-2 py-1 bg-gray-800/80 text-blue-400/90 rounded-md font-mono tracking-tight border border-gray-700/50">
          EXPLORE
        </span>
      </div>
    </div>
  );
}