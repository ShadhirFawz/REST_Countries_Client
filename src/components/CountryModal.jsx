import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { 
  FaGlobe, 
  FaCity, 
  FaUsers, 
  FaRulerCombined,
  FaMoneyBillWave,
  FaLanguage,
  FaClock,
  FaCarSide,
  FaMapMarkerAlt,
  FaLandmark,
  FaFlag,
  FaFutbol,
  FaCalendarWeek,
  FaShare,
  FaCamera,
  FaHeart,
  FaRegHeart
} from "react-icons/fa";
import AnimatedCloseButton from "./AnimatedCloseButoon";
import html2canvas from "html2canvas";  
import { toBlob, toPng } from 'html-to-image';
import { addFavorite, removeFavorite } from '../services/api'
import { useAuth } from "../context/AuthContext";

export default function CountryModal({ country, onClose }) {
  const { token, favorites, loadFavorites } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const contentRef = useRef(null);
  const cardRef = useRef(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showScreenshotButton, setShowScreenshotButton] = useState(false);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Extract data
  const currency = country.currencies ? Object.entries(country.currencies)[0] : null;
  const currencyLabel = currency ? `${currency[1].name} (${currency[0]}) ${currency[1].symbol ? `- ${currency[1].symbol}` : ''}` : 'N/A';
  const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';
  const population = country.population ? country.population.toLocaleString() : 'N/A';
  const area = country.area ? `${country.area.toLocaleString()} km²` : 'N/A';
  const coordinates = country.latlng ? country.latlng.map(coord => coord.toFixed(2)).join(', ') : 'N/A';
  const timezones = country.timezones ? country.timezones.join(', ') : 'N/A';
  const borders = country.borders && country.borders.length ? country.borders.join(', ') : 'None';
  const drivingSide = country.car?.side ? `${country.car.side} (${country.car.signs?.join(', ') || ''})` : 'N/A';

  useEffect(() => {
    setIsFavorite(favorites?.some(fav => fav.code === country.cca3) || false);
  }, [favorites, country.cca3]);

  const toggleFavorite = async () => {
    if (!token) {
      showToast('Please login to add favorites', 'error');
      return;
    }
  
    setFavoriteLoading(true);
    const wasFavorite = isFavorite;
    setIsFavorite(!wasFavorite); // Optimistic update
  
    try {
      if (wasFavorite) {
        await removeFavorite(country.cca3);
        showToast('Removed from favorites', 'info');
      } else {
        await addFavorite({
          code: country.cca3,
          name: country.name.common,
          flag: country.flags.png
        });
        showToast('Added to favorites', 'success');
      }
      await loadFavorites(); // Final sync with server
    } catch (err) {
      setIsFavorite(wasFavorite); // Revert if error
      showToast(err.response?.data?.message || 'Error updating favorites', 'error');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };
  

  const handleTakeScreenshot = async () => {
    if (!cardRef.current || isTakingScreenshot) return;
    
    setIsTakingScreenshot(true);
    setShowScreenshotButton(false);
  
    try {
      // First try html-to-image which is more reliable
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });
  
      // Create download link
      const link = document.createElement('a');
      link.download = `${country.name?.common || 'country'}-card.png`;
      link.href = dataUrl;
      
      // Required for Firefox
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Revoke the object URL after download
      setTimeout(() => {
        URL.revokeObjectURL(dataUrl);
      }, 100);
  
      showToast('Image downloaded successfully!');
    } catch (error) {
      console.error('Error taking screenshot:', error);
      showToast('Failed to download image', 'error');
      
      // Fallback to html2canvas if html-to-image fails
      try {
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
        });
        
        canvas.toBlob((blob) => {
          const link = document.createElement('a');
          link.download = `${country.name?.common || 'country'}-card.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        }, 'image/png');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setIsTakingScreenshot(false);
    }
  };

  // Hide scrollbar but keep functionality
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.scrollbarWidth = 'none';
      contentRef.current.style.msOverflowStyle = 'none';
    }
    // Disable scrolling on mount
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/50"
    >
      
      {/* Close Button - Now outside the card container */}
      <AnimatedCloseButton onClick={handleClose} />

      <motion.button
        className="absolute top-35 right-116 z-50 p-2 rounded-full bg-gray-900/80 hover:bg-pink-500/80 transition-colors cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleFavorite}
        disabled={favoriteLoading}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        {favoriteLoading ? (
          <div className="w-5 h-5 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
        ) : isFavorite ? (
          <FaHeart className="h-5 w-5 text-pink-500" />
        ) : (
          <FaRegHeart className="h-5 w-5 text-gray-300 hover:text-pink-400" />
        )}
      </motion.button>

      {/* Screenshot Button - Appears below share button on hover */}
      <motion.button
        className="absolute top-20 right-116 z-50 p-2 rounded-full bg-gray-900/80 hover:bg-blue-500 transition-colors cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleTakeScreenshot} // Directly call download function
        aria-label="Download country card"
      >
        <FaCamera className="h-5 w-5 text-gray-300" />
      </motion.button>

      {/* Loading indicator when processing */}
      {isTakingScreenshot && (
        <motion.div
          className="absolute top-16 left-5 z-50 p-2 bg-gray-900/80 rounded-full"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
      
      {/* ID Card Container */}
      <motion.div
        ref={cardRef}
        initial={{ scale: 0.95 }}
        animate={{ scale: isOpen ? 1 : 0.95 }}
        className="relative w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border-2 border-gray-700/50 shadow-2xl overflow-hidden z-10"
      >
        {/* Header Strip */}
        <div className="h-3 bg-gradient-to-r from-blue-500 to-blue-600"></div>

        {/* ID Card Body */}
        <div className="p-6">
          {/* Flag & Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-12 overflow-hidden rounded-md border-2 border-gray-600/50 shadow">
              <img 
                src={country.flags?.png} 
                alt={`${country.name?.common} flag`} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{country.name?.common}</h2>
              <p className="text-sm text-gray-300">{country.name?.official}</p>
            </div>
          </div>

          {/* ID Card Grid */}
          <div className="grid grid-cols-1 gap-4">
            {/* Row 1: Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <InfoField 
                icon={<FaGlobe className="text-blue-400" />}
                label="Region" 
                value={`${country.region}${country.subregion ? ` (${country.subregion})` : ''}`}
              />
              <InfoField 
                icon={<FaCity className="text-blue-400" />}
                label="Capital" 
                value={country.capital?.[0] || 'N/A'}
              />
            </div>

            {/* Row 2: Demographics */}
            <div className="grid grid-cols-2 gap-4">
              <InfoField 
                icon={<FaUsers className="text-blue-400" />}
                label="Population" 
                value={population}
              />
              <InfoField 
                icon={<FaRulerCombined className="text-blue-400" />}
                label="Area" 
                value={area}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-700/50 my-2"></div>

            {/* Row 3: Cultural Info */}
            <div className="grid grid-cols-2 gap-4">
              <InfoField 
                icon={<FaMoneyBillWave className="text-blue-400" />}
                label="Currency" 
                value={currencyLabel}
              />
              <InfoField 
                icon={<FaLanguage className="text-blue-400" />}
                label="Languages" 
                value={languages}
              />
            </div>

            {/* Row 4: Technical Info */}
            <div className="grid grid-cols-2 gap-4">
              <InfoField 
                icon={<FaClock className="text-blue-400" />}
                label="Timezones" 
                value={timezones}
              />
              <InfoField 
                icon={<FaCarSide className="text-blue-400" />}
                label="Driving Side" 
                value={drivingSide}
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-700/50 my-2"></div>

            {/* Row 5: Geographical Info */}
            <InfoField 
              icon={<FaMapMarkerAlt className="text-blue-400" />}
              label="Coordinates" 
              value={coordinates}
              copyable
              onCopy={() => copyToClipboard(coordinates)}
            />

            {/* Row 6: International Info */}
            <div className="grid grid-cols-2 gap-4">
              <InfoField 
                icon={<FaLandmark className="text-blue-400" />}
                label="UN Member" 
                value={country.unMember ? 'Yes' : 'No'}
              />
              <InfoField 
                icon={<FaFlag className="text-blue-400" />}
                label="Country Codes" 
                value={`${country.cca2}/${country.cca3}`}
              />
            </div>

            {/* Row 7: Miscellaneous */}
            <div className="grid grid-cols-2 gap-4">
              <InfoField 
                icon={<FaFutbol className="text-blue-400" />}
                label="FIFA Code" 
                value={country.fifa || 'N/A'}
              />
              <InfoField 
                icon={<FaCalendarWeek className="text-blue-400" />}
                label="Week Starts" 
                value={country.startOfWeek || 'N/A'}
              />
            </div>
          </div>

          {/* Footer with Map Links */}
          <div className="mt-6 pt-4 border-t border-gray-700/50 flex justify-center gap-3">
            <MapLink 
              href={country.maps?.googleMaps} 
              text="Google Maps"
            />
            <MapLink 
              href={country.maps?.openStreetMaps} 
              text="OpenStreetMap"
            />
          </div>
        </div>
      </motion.div>

      {/* Notification */}
      {isCopied && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg"
        >
          Copied to clipboard!
        </motion.div>
      )}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-md shadow-lg z-50 ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
          } text-white`}
        >
          {toast.message}
        </motion.div>
      )}
    </motion.div>
    
  );
}

// Reusable Info Field Component
const InfoField = ({ icon, label, value, copyable = false, onCopy = () => {} }) => (
  <div className="flex items-start gap-3 group">
    <div className="mt-1">{icon}</div>
    <div className="flex-1">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-200">{value}</p>
        {copyable && (
          <button 
            onClick={onCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-400"
            title="Copy"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  </div>
);

// Reusable Map Link Component
const MapLink = ({ href, text }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="px-3 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs rounded-md flex items-center gap-2 transition-colors"
  >
    <FaMapMarkerAlt className="text-xs" />
    {text}
  </a>
);