import axios from "axios";
import { AlertCircle, Calendar, Download, FileText, Filter, Search, Tag, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/navbar";

const Documents = () => {
  const [guidances, setGuidances] = useState([]);
  const [filteredGuidances, setFilteredGuidances] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchGuidances = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No token found. Please log in.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:3000/api/guidances/getall", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setGuidances(response.data);
      setFilteredGuidances(response.data);
      setLoading(false);
    } catch (error) {
      setError("Error fetching documents");
      setLoading(false);
      console.error("Error fetching guidances:", error.message);
    }
  };

  useEffect(() => {
    fetchGuidances();
  }, []);

  useEffect(() => {
    const results = guidances.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.category && doc.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (selectedCategory !== "All") {
      const categoryFiltered = results.filter(doc =>
        doc.category === selectedCategory
      );
      setFilteredGuidances(categoryFiltered);
    } else {
      setFilteredGuidances(results);
    }
  }, [searchTerm, guidances, selectedCategory]);

  const getImageSource = (thumbnail) => {
    if (!thumbnail) return "/api/placeholder/400/400";
    if (thumbnail.startsWith("data:image/")) return thumbnail;
    if (thumbnail.startsWith("http")) return thumbnail;
    return `http://localhost:3000/${thumbnail}`;
  };

  const handleCardClick = (id) => {
    navigate(`/documents/${id}`);
  };

  // Extract unique categories
  const categories = ["All", ...new Set(guidances.filter(doc => doc.category).map(doc => doc.category))];

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Truncate text helper
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="p-4 md:p-10 max-w-7xl mx-auto pt-24">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-300 dark:bg-gray-700 rounded mb-8"></div>
            <div className="w-full max-w-md h-10 bg-gray-300 dark:bg-gray-700 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6">
                  <div className="flex space-x-4 items-center mb-4">
                    <div className="h-16 w-16 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="p-4 md:p-10 max-w-md mx-auto pt-24">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">Error Loading Documents</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => fetchGuidances()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="p-4 md:p-10 max-w-7xl mx-auto pt-24">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Detailed Guidelines
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access official documents, guidance materials, and regulatory references.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X size={18} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
              )}
            </div>

            <div className="relative min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Pills (only shown if categories exist) */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedCategory === category
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredGuidances.length} {filteredGuidances.length === 1 ? "document" : "documents"}
          {searchTerm && ` for "${searchTerm}"`}
          {selectedCategory !== "All" && ` in ${selectedCategory}`}
        </div>

        {/* No Results Message */}
        {filteredGuidances.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No documents found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuidances.map((doc) => (
            <div
              key={doc._id}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 shadow-md hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col"
              onClick={() => handleCardClick(doc._id)}
            >
              <div className="p-5">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                    <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      {doc.title}
                    </h3>
                    {doc.category && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Tag size={14} className="mr-1" />
                        <span>{doc.category}</span>
                      </div>
                    )}
                  </div>
                </div>

                {doc.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {truncateText(doc.description, 120)}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <span>{formatDate(doc.updatedAt || doc.createdAt)}</span>
                  </div>

                  {doc.fileSize && (
                    <div className="flex items-center">
                      <Download size={14} className="mr-1" />
                      <span>{doc.fileSize}</span>
                    </div>
                  )}

                  {doc.fileType && (
                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs uppercase">
                      {doc.fileType}
                    </span>
                  )}
                </div>
              </div>

              {/* Preview thumbnail if available */}
              {doc.thumbnail && (
                <div className="mt-auto border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750 flex items-center">
                  <img
                    src={getImageSource(doc.thumbnail)}
                    alt={doc.title}
                    className="w-12 h-12 rounded object-cover mr-3"
                  />
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    View Document
                  </span>
                </div>
              )}

              {/* CTA button if no thumbnail */}
              {!doc.thumbnail && (
                <div className="mt-auto border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750">
                  <button className="w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                    View Document Details
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Documents;