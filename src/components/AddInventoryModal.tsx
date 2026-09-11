import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  initialItem?: InventoryItem | null;
}

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryItem['category']>('Medical');
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState('units');
  const [location, setLocation] = useState('Central Warehouse');

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name);
      setCategory(initialItem.category);
      setQuantity(initialItem.quantity);
      setUnit(initialItem.unit);
      setLocation(initialItem.location);
    } else {
      setName('');
      setCategory('Medical');
      setQuantity(100);
      setUnit('units');
      setLocation('Central Warehouse');
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let status: InventoryItem['status'] = 'In Stock';
    if (quantity === 0) status = 'Out of Stock';
    else if (quantity < 100) status = 'Low Stock';

    let iconName = 'inventory_2';
    let iconColorClass = 'text-tertiary';
    if (category === 'Medical') {
      iconName = 'medical_services';
      iconColorClass = 'text-tertiary';
    } else if (category === 'Food & Water') {
      iconName = 'water_drop';
      iconColorClass = status === 'Low Stock' ? 'text-warning' : 'text-tertiary';
    } else if (category === 'Vehicle') {
      iconName = 'local_shipping';
      iconColorClass = 'text-on-surface-variant';
    } else if (category === 'Shelter') {
      iconName = 'holiday_village';
      iconColorClass = 'text-tertiary';
    } else if (category === 'Tools & Power') {
      iconName = 'bolt';
      iconColorClass = 'text-warning';
    }

    const item: InventoryItem = {
      id: initialItem ? initialItem.id : `inv-${Date.now()}`,
      name,
      category,
      quantity: Number(quantity),
      unit,
      location,
      status,
      iconName,
      iconColorClass,
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#e4beba]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#1a1c1c]">
            {initialItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
              Item Name <span className="text-[#af101a]">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., First Aid Kit - Type A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
              >
                <option value="Medical">Medical</option>
                <option value="Food & Water">Food & Water</option>
                <option value="Vehicle">Vehicle</option>
                <option value="Shelter">Shelter</option>
                <option value="Tools & Power">Tools & Power</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
              >
                <option value="Central Warehouse">Central Warehouse</option>
                <option value="Sector North Depot">Sector North Depot</option>
                <option value="Sector South Depot">Sector South Depot</option>
                <option value="Sector East Depot">Sector East Depot</option>
                <option value="Sector West Depot">Sector West Depot</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">
                Quantity Count
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1a1c1c] mb-1">Unit Type</label>
              <input
                type="text"
                placeholder="units, kits, packs, etc."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-[#f9f9f9] border border-[#e4beba] rounded px-3 py-2 text-sm text-[#1a1c1c] focus:ring-2 focus:ring-[#4c56af] outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#e4beba] text-sm font-semibold text-[#5b403d] rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#af101a] hover:bg-[#d32f2f] text-white text-sm font-bold rounded shadow-sm"
            >
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
