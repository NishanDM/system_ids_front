import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Search, AlertTriangle, Package } from "lucide-react";

const LowItemNotifications = () => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const containerRef = useRef(null);

  // Fetch low stock items
  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/stock`
        );

        const data = response.data || [];

        const allowedLabels = [
          "Back Glass",
          "Tempered Glass",
          "Battery",
          "Back Cover",
        ];

        const lowItems = data
          .filter(
            (item) => item.qty <= 5 && allowedLabels.includes(item.label)
          )
          .map((item) => {
            const {
              description = "",
              compatibility = "",
              brand = "",
            } = item.attributes || {};

            const nameParts = [
              item.label,
              description || compatibility,
            ].filter(Boolean);

            return {
              id: item._id,
              label: item.label,
              description,
              compatibility,
              brand,
              qty: item.qty,
              name: nameParts.join(" - "),
            };
          });

        setAllItems(lowItems);
        setFilteredItems(lowItems);
      } catch (error) {
        console.error("Error fetching low stock items:", error);
      }
    };

    fetchLowStockItems();
  }, []);

  // Smart search
  useEffect(() => {
    const query = searchInput.trim().toLowerCase();

    if (!query) {
      setFilteredItems(allItems);
    } else {
      const filtered = allItems.filter((item) => {
        const combined =
          `${item.label} ${item.description} ${item.compatibility} ${item.brand}`.toLowerCase();

        return combined.includes(query);
      });

      setFilteredItems(filtered);
    }
  }, [searchInput, allItems]);

  return (
    <div className="mt-10 w-full">

      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <AlertTriangle className="text-red-500" size={22} />
        <h2 className="text-2xl font-bold text-gray-800">
          Low Stock Alerts
        </h2>
      </div>


      {/* No items */}
      {filteredItems.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <Package size={40} className="mx-auto mb-2 opacity-50" />
          No low stock items found
        </div>
      ) : (
        <div className="overflow-hidden relative w-full">

          {/* Scroll Container */}
          <div
            ref={containerRef}
            className="flex gap-6 animate-slideX"
            style={{
              width: `${filteredItems.length * 280 * 2}px`,
            }}
          >
            {[...filteredItems, ...filteredItems].map((item, idx) => (
              <div
                key={idx}
                className="
                  min-w-[260px]
                  bg-white
                  border border-gray-200
                  rounded-xl
                  shadow-md
                  hover:shadow-xl
                  hover:-translate-y-1
                  transition-all
                  duration-300
                  p-4
                  relative
                  hover:cursor-pointer
                  hover:bg-gray-100
                "
              >
                {/* Low Stock Badge */}
                <div className="
                  absolute top-2 right-2
                  bg-red-500
                  text-white
                  text-xs
                  font-bold
                  px-2 py-1
                  rounded-full
                ">
                  LOW
                </div>

                {/* Title */}
                <h3 className="font-semibold text-gray-800 mb-2">
                  {item.name}
                </h3>

                {/* Details */}
                <div className="text-sm text-gray-600 space-y-1">

                  {item.brand && (
                    <p>
                      <span className="font-medium text-gray-800">
                        Brand:
                      </span>{" "}
                      {item.brand}
                    </p>
                  )}

                  {item.compatibility && (
                    <p>
                      <span className="font-medium text-gray-800">
                        For:
                      </span>{" "}
                      {item.compatibility}
                    </p>
                  )}

                  {item.description && (
                    <p className="text-gray-500 text-xs">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Quantity */}
                <div className="mt-3 flex justify-between items-center">

                  <span className="text-sm text-gray-500">
                    Quantity Left
                  </span>

                  <span className="
                    font-bold
                    text-red-600
                    bg-red-50
                    px-3 py-1
                    rounded-lg
                  ">
                    {item.qty}
                  </span>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes slideX {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .animate-slideX {
          animation: slideX ${Math.max(filteredItems.length * 5, 15)}s linear infinite;
        }
      `}</style>

    </div>
  );
};

export default LowItemNotifications;