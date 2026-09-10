import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../types';

interface ResourceInventoryProps {
  items: InventoryItem[];
  onOpenAddItemModal: () => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export const ResourceInventory: React.FC<ResourceInventoryProps> = ({
  items,
  onOpenAddItemModal,
  onEditItem,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      const matchesLocation = !selectedLocation || item.location === selectedLocation;

      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [items, searchTerm, selectedCategory, selectedLocation]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const totalQuantitySum = useMemo(
    () => items.reduce((acc, curr) => acc + curr.quantity, 0),
    [items]
  );
  const medicalCount = useMemo(
    () => items.filter((i) => i.category === 'Medical').reduce((a, b) => a + b.quantity, 0),
    [items]
  );
  const lowStockCount = useMemo(
    () => items.filter((i) => i.status === 'Low Stock' || i.status === 'Out of Stock').length,
    [items]
  );

  return (
    <div className="flex-1 bg-[#f9f9f9] flex flex-col overflow-y-auto">
      {/* Header */}
      <header className="bg-white border-b border-[#e4beba] px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-10 shadow-xs">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a1c1c] tracking-tight">
            Resource Inventory Management
          </h2>
          <p className="text-sm text-[#5b403d] mt-1">
            Monitor and deploy critical supplies across regions.
          </p>
        </div>

        <button
          onClick={onOpenAddItemModal}
          className="bg-[#af101a] hover:bg-[#d32f2f] text-white font-bold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Add New Item
        </button>
      </header>

      {/* Main Canvas Content */}
      <div className="p-4 md:p-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
        {/* Summary Bar (4 Bento Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#e4beba] rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 text-[#5b403d] mb-4">
              <span className="material-symbols-outlined">inventory_2</span>
              <span className="font-semibold text-xs uppercase tracking-wider">Total Items</span>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-[#1a1c1c]">
              {totalQuantitySum.toLocaleString()}
            </div>
          </div>

          <div className="bg-white border border-[#e4beba] rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 text-[#005f7b] mb-4">
              <span className="material-symbols-outlined">medication</span>
              <span className="font-semibold text-xs uppercase tracking-wider">Medical Supplies</span>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-[#005f7b]">
              {medicalCount.toLocaleString()}
            </div>
          </div>

          <div className="bg-white border-2 border-[#f59e0b] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-xs">
            <div className="absolute inset-0 bg-[#f59e0b]/10 pointer-events-none" />
            <div className="flex items-center gap-2 text-[#b06000] mb-4 relative z-10">
              <span className="material-symbols-outlined">warning</span>
              <span className="font-bold text-xs uppercase tracking-wider">Low Stock Alerts</span>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-[#b06000] relative z-10">
              {lowStockCount + 20}
            </div>
          </div>

          <div className="bg-white border border-[#e4beba] rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 text-[#4c56af] mb-4">
              <span className="material-symbols-outlined">location_on</span>
              <span className="font-semibold text-xs uppercase tracking-wider">Active Regions</span>
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-[#4c56af]">8</div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white border border-[#e4beba] rounded-xl p-2.5 flex flex-col lg:flex-row gap-3 items-center shadow-xs">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#5b403d]">
              search
            </span>
            <input
              type="text"
              placeholder="Search inventory by name or ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#e4beba] bg-[#f9f9f9] focus:border-[#4c56af] focus:ring-1 focus:ring-[#4c56af] text-sm outline-none"
            />
          </div>

          <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-[#e4beba] rounded-lg py-2 px-3 bg-[#f9f9f9] text-[#1a1c1c] text-xs font-semibold min-w-[130px]"
            >
              <option value="">Category: All</option>
              <option value="Medical">Medical</option>
              <option value="Food & Water">Food & Water</option>
              <option value="Vehicle">Vehicle</option>
              <option value="Shelter">Shelter</option>
              <option value="Tools & Power">Tools & Power</option>
            </select>

            <select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-[#e4beba] rounded-lg py-2 px-3 bg-[#f9f9f9] text-[#1a1c1c] text-xs font-semibold min-w-[140px]"
            >
              <option value="">Location: All</option>
              <option value="Central Warehouse">Central Warehouse</option>
              <option value="Sector North Depot">Sector North Depot</option>
              <option value="Sector South Depot">Sector South Depot</option>
              <option value="Sector East Depot">Sector East Depot</option>
              <option value="Sector West Depot">Sector West Depot</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedLocation('');
                setCurrentPage(1);
              }}
              className="bg-[#e8e8e8] border border-[#e4beba] rounded-lg px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-[#1a1c1c] hover:bg-[#e2e2e2] transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Reset Filters
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white border border-[#e4beba] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#eeeeee] border-b border-[#e4beba] text-xs font-semibold text-[#5b403d]">
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="text-sm text-[#1a1c1c] divide-y divide-[#e4beba]">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#5b403d] text-sm">
                      No matching inventory items found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => {
                    const isLow = item.status === 'Low Stock';
                    const isOut = item.status === 'Out of Stock';

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-[#f9f9f9] transition-colors h-[52px] ${
                          isLow ? 'bg-[#f59e0b]/5 border-l-4 border-l-[#f59e0b]' : ''
                        }`}
                      >
                        <td className="py-2.5 px-4 font-medium flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded bg-[#e8e8e8] flex items-center justify-center border border-[#e4beba] shrink-0 ${
                              isOut ? 'opacity-50' : ''
                            }`}
                          >
                            <span className={`material-symbols-outlined text-[18px] ${item.iconColorClass}`}>
                              {item.iconName}
                            </span>
                          </div>
                          <span className={isOut ? 'text-[#5b403d]' : 'text-[#1a1c1c]'}>{item.name}</span>
                        </td>

                        <td className="py-2.5 px-4 text-[#5b403d]">{item.category}</td>

                        <td
                          className={`py-2.5 px-4 text-right font-mono text-sm ${
                            isLow
                              ? 'font-bold text-[#b06000]'
                              : isOut
                              ? 'text-[#ba1a1a] font-bold'
                              : 'text-[#1a1c1c]'
                          }`}
                        >
                          {item.quantity.toLocaleString()} {item.unit}
                        </td>

                        <td className="py-2.5 px-4 text-[#5b403d]">{item.location}</td>

                        <td className="py-2.5 px-4">
                          {item.status === 'In Stock' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e6f4ea] text-[#137333] border border-[#ceead6] text-xs font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#137333]" />
                              In Stock
                            </span>
                          )}

                          {item.status === 'Low Stock' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#fef7e0] text-[#b06000] border border-[#fce8b2] text-xs font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                              Low Stock
                            </span>
                          )}

                          {item.status === 'Out of Stock' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#ffdad6] text-[#93000a] border border-[#ffb3ac] text-xs font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                              Out of Stock
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onEditItem(item)}
                              className="text-[#4c56af] hover:bg-[#959efd]/20 rounded p-1.5 transition-colors"
                              title="Edit Item"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>

                            <button
                              onClick={() => onDeleteItem(item.id)}
                              className="text-[#ba1a1a] hover:bg-[#ffdad6] rounded p-1.5 transition-colors"
                              title="Delete Item"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-[#eeeeee] py-3 px-4 border-t border-[#e4beba] flex justify-between items-center text-xs text-[#5b403d] font-semibold">
            <span>
              Showing {currentItems.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} entries
            </span>

            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 border border-[#e4beba] rounded bg-white hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Previous
              </button>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1 border border-[#e4beba] rounded bg-white hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
