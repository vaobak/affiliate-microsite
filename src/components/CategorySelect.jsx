import { useState } from 'react';
import { getAllCategories, addCustomCategory } from '../utils/categories';

export default function CategorySelect({ value, onChange }) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const categories = getAllCategories();

  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue === 'Custom') {
      setShowCustomInput(true);
      setCustomValue('');
    } else {
      setShowCustomInput(false);
      onChange(selectedValue);
    }
  };

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      addCustomCategory(customValue.trim());
      onChange(customValue.trim());
      setShowCustomInput(false);
      setCustomValue('');
    }
  };

  return (
    <div className="space-y-3">
      <select
        value={showCustomInput ? 'Custom' : value}
        onChange={handleSelectChange}
        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      {showCustomInput && (
        <div className="flex gap-2">
          <input
            type="text"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            placeholder="Enter custom category"
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
            onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCustomInput(false);
              setCustomValue('');
            }}
            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
