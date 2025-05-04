// src/pages/Home.jsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getAllCountries, searchCountries, getFavorites } from '../services/api';
import CountryCard from '../components/CountryCard';
import CountryModal from '../components/CountryModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ProfileDrawer from '../components/ProfileDrawer';
import SearchBar from '../components/SearchBar';
import { FaSync, FaChevronLeft, FaChevronRight  } from 'react-icons/fa'

export default function Home() {
  const { token, favorites, loadFavorites } = useAuth();
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedKeyword, setSelectedKeyword] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);
  const [isHoveringRight, setIsHoveringRight] = useState(false);
  const [scrollInterval, setScrollInterval] = useState(null);
  const favoritesContainerRef = useRef(null);
  const observer = useRef();
  const itemsPerPage = 5;

  const styles = `
  .favorites-scroll-container::-webkit-scrollbar {
    display: none;
  }
  .favorites-scroll-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .refresh-spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

  // Categorized keywords
  const keywordCategories = {
    'Regions': ['Europe', 'Asia', 'Africa', 'Americas', 'Oceania'],
    'Languages': ['English', 'Spanish', 'French', 'German', 'Arabic'],
    'Subregions': ['Western Europe', 'Northern Africa', 'South America', 'Central America']
  };

  // Mouse position tracker
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await fetchCountries();
        if (token) {
          await loadFavorites(); // Load favorites if user is authenticated
        }
      } catch (err) {
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
  
    initializeData();
  }, [token]);

  useEffect(() => {
    console.log('Current favorites:', favorites);
    console.log('Current token:', token);
  }, [favorites, token]);

  const handleRefreshFavorites = async () => {
    try {
      setFavoritesLoading(true);
      await loadFavorites(); // This will update the favorites in AuthContext
    } catch (err) {
      console.error('Error refreshing favorites:', err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const startScrolling = (direction) => {
    if (!favoritesContainerRef.current) return;
    
    const scrollStep = direction === 'left' ? -20 : 20;
    
    const interval = setInterval(() => {
      favoritesContainerRef.current.scrollLeft += scrollStep;
    }, 30);
    
    setScrollInterval(interval);
  };
  
  const stopScrolling = () => {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      setScrollInterval(null);
    }
  };

  useEffect(() => {
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [scrollInterval]);

  const getFullCountryData = (fav) => {
    return countries.find(c => c.cca3 === fav.code);
  };

  const handleSearch = async (query, filterType = 'name') => {
    // If empty query or cleared filter, reset to show all countries
    if (!query.trim() && filterType === 'name') {
      resetSearch();
      return;
    }

    setSearchLoading(true);
    setError(null);
    try {
      const results = await searchCountries(query, filterType);
      setCountries(results);
      setSearchMode(query.trim() !== '');
      setPage(1);
      setHasMore(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error searching countries');
      setCountries([]);
      setSearchMode(false);
      resetSearch();
    } finally {
      setSearchLoading(false);
    }
  };

  // Modify fetchCountries to handle resetting search mode
  const fetchCountries = useCallback(async () => {
    if (loading || !hasMore || searchMode) return;
    
    setLoading(true);
    try {
      // Change this to fetch paginated data from server
      const paginatedData = await getAllCountries(page, itemsPerPage);
      
      setCountries(prev => {
        // Filter out duplicates before adding new countries
        const existingCodes = new Set(prev.map(c => c.cca3));
        const newCountries = paginatedData.filter(
          country => !existingCodes.has(country.cca3)
        );
        return [...prev, ...newCountries];
      });
      
      setHasMore(paginatedData.length === itemsPerPage);
      setPage(prev => prev + 1);
    } catch (err) {
      setError('Failed to load countries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, searchMode]);

  // Add a reset function
  const resetSearch = useCallback(() => {
    setSearchMode(false);
    setPage(1);
    setHasMore(true);
    setCountries([]);
    setError(null);
    fetchCountries();
  }, [fetchCountries]);

  const lastCountryElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchCountries();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchCountries]);

  const filteredCountries = selectedKeyword
    ? countries.filter(country =>
        country.region === selectedKeyword ||
        country.subregion === selectedKeyword ||
        (country.languages && Object.values(country.languages).includes(selectedKeyword))
      )
    : countries;

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedKeyword && countries.length === 0) {
      resetSearch();
    }
  }, [selectedKeyword, countries, resetSearch]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* Mouse hover background effect */}
      <style>{styles}</style>
      <motion.div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(750px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 98%)`,
        }}
        transition={{ type: 'spring', damping: 30 }}
      />

      {/* Profile Drawer */}
      <ProfileDrawer />

      {/* Filter Sidebar */}
      <div 
        className="fixed left-0 top-0 h-full w-56 pt-15 pb-4 px-4 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700/50 overflow-y-auto z-10"
        style={{
          scrollbarWidth: 'none',  // For Firefox
          msOverflowStyle: 'none', // For IE/Edge
        }}
      >
        {/* WebKit browsers (Chrome, Safari) need a pseudo-element */}
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }`}
        </style>
        <h2 className="text-xl font-normal font-stretch-90% mb-4 text-gray-100">Filter By</h2>
        
        {Object.entries(keywordCategories).map(([category, keywords]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">{category}</h3>
            <div className="space-y-2">
              {keywords.map((kw) => (
                <label key={kw} className="flex items-center space-x-3 cursor-pointer group">
                  <div 
                    className={`w-4 h-4 border rounded-sm flex items-center justify-center transition-colors ${
                      selectedKeyword === kw 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'border-gray-500 group-hover:border-blue-400'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedKeyword(selectedKeyword === kw ? null : kw);
                    }}
                  >
                    {selectedKeyword === kw && (
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span 
                    className="text-sm text-gray-300 group-hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedKeyword(selectedKeyword === kw ? null : kw);
                    }}
                  >
                    {kw}
                  </span>
                  <input
                    type="radio"
                    name="keyword-filter"
                    className="hidden"
                    checked={selectedKeyword === kw}
                    onChange={() => {}}
                  />
                </label>
              ))}
            </div>
            {/* Faint Divider */}
            <div className="h-[0.5px] bg-gray-700/50 w-full my-4"></div>
          </div>
        ))}
        
        {/* Clear filters button */}
        {selectedKeyword && (
          <button
            onClick={() => {
              setSelectedKeyword(null);
              resetSearch(); // Use the same reset function
            }}
            className="w-full mt-2 px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-700 rounded-md text-gray-300 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 ml-45 transition-all duration-300 pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-light font-serif text-gray-100">
              Browse Countries
            </h1>
            {searchMode && (
              <button
                onClick={resetSearch}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md text-gray-300 transition-colors"
              >
                Show All Countries
              </button>
            )}
          </div>

          <SearchBar onSearch={handleSearch} isLoading={searchLoading} />

          {/* Favorites Horizontal Scroll Section */}
          {!searchMode && token && (
            <div className="mb-8">
              <div className="flex items-center justify-start mb-4">
                <h2 className="text-xl font-light text-gray-200">
                  Your Favorites
                </h2>
                <button
                  onClick={handleRefreshFavorites}
                  className="flex items-center pl-3.5 text-sm cursor-pointer text-blue-400 hover:text-blue-300 transition-colors"
                  disabled={!token || favoritesLoading}
                >
                  <FaSync className={`mr-2 ${favoritesLoading ? 'refresh-spin' : ''}`} />
                  
                </button>
              </div>
              
              {favorites.length > 0 ? (
                <div className="relative group">
                  {/* Left scroll indicator and hover zone */}
                  <div 
                    className="absolute left-0 top-0 h-full w-20 flex items-center justify-start pl-2 z-20"
                    onMouseEnter={() => {
                      setIsHoveringLeft(true);
                      startScrolling('left');
                    }}
                    onMouseLeave={() => {
                      setIsHoveringLeft(false);
                      stopScrolling();
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ 
                        opacity: isHoveringLeft ? 1 : 0,
                        x: isHoveringLeft ? 0 : -10
                      }}
                      transition={{ duration: 0.2 }}
                      className="bg-black/50 rounded-full p-2"
                    >
                      <FaChevronLeft className="text-white text-xl" />
                    </motion.div>
                  </div>
                  
                  {/* Right scroll indicator and hover zone */}
                  <div 
                    className="absolute right-0 top-0 h-full w-20 flex items-center justify-end pr-2 z-20"
                    onMouseEnter={() => {
                      setIsHoveringRight(true);
                      startScrolling('right');
                    }}
                    onMouseLeave={() => {
                      setIsHoveringRight(false);
                      stopScrolling();
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ 
                        opacity: isHoveringRight ? 1 : 0,
                        x: isHoveringRight ? 0 : 10
                      }}
                      transition={{ duration: 0.2 }}
                      className="bg-black/50 rounded-full p-2"
                    >
                      <FaChevronRight className="text-white text-xl" />
                    </motion.div>
                  </div>
                  <div ref={favoritesContainerRef}
                  className="favorites-scroll-container overflow-x-auto pb-4">
                    <div className="flex space-x-6" style={{ minWidth: 'max-content' }}>
                      {favorites.map(fav => {
                        const fullData = getFullCountryData(fav);
                        if (!fullData) return null;
                        return (
                          <div key={fav.code} className="flex-shrink-0 w-64 relative">
                            <CountryCard
                              country={fullData}
                              onClick={() => setSelectedCountry(fullData)}
                              isFavorite={true} // Pass this prop to show filled heart
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Gradient fade effects */}
                  <div className="h-[5px] bg-gray-700/50 w-full rounded-ful"></div>
                </div>
              ) : (
                <div className="text-gray-400">
                  You haven't added any favorites yet
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-900 bg-opacity-20 text-red-300 border border-red-700 rounded-md max-w-3xl mx-auto">
              {error}
            </div>
          )}

          {/* Country Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCountries.map((country, index) => (
              <motion.div 
                key={`${country.cca3}-${index}`}
                ref={filteredCountries.length === index + 1 ? lastCountryElementRef : null}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <CountryCard
                  country={country}
                  onClick={() => setSelectedCountry(country)}
                />
              </motion.div>
            ))}
          </div>

          {/* Loading states */}
          {loading && (
            <div className="flex justify-center mt-8 py-4">
              <LoadingSpinner />
            </div>
          )}
          {!hasMore && !loading && countries.length > 0 && (
            <div className="text-center mt-8 text-gray-400">
              You've reached the end of the list
            </div>
          )}
        </div>
      </div>

      {selectedCountry && (
        <CountryModal country={selectedCountry} onClose={() => setSelectedCountry(null)} />
      )}
    </div>
  );
}