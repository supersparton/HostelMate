import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminService } from '../../services/adminService';

const MenuManagement = () => {
    const [selectedWeek, setSelectedWeek] = useState(getWeekStart(new Date()));
    const [editMode, setEditMode] = useState(false);
    const [menuData, setMenuData] = useState({
        monday: { breakfast: '', lunch: '', dinner: '' },
        tuesday: { breakfast: '', lunch: '', dinner: '' },
        wednesday: { breakfast: '', lunch: '', dinner: '' },
        thursday: { breakfast: '', lunch: '', dinner: '' },
        friday: { breakfast: '', lunch: '', dinner: '' },
        saturday: { breakfast: '', lunch: '', dinner: '' },
        sunday: { breakfast: '', lunch: '', dinner: '' }
    });

    const queryClient = useQueryClient();

    // Get week start date (Monday)
    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff)).toISOString().split('T')[0];
    }

    // Get week end date (Sunday)
    function getWeekEnd(weekStart) {
        const start = new Date(weekStart);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return end.toISOString().split('T')[0];
    }

    // Format date for display
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    // Fetch current menu
    const { data: currentMenuData, isLoading, error } = useQuery(
        ['admin', 'current-menu'],
        () => adminService.getCurrentMenu(),
        {
            onSuccess: (data) => {
                console.log('Frontend - Menu data received:', data);
                console.log('Frontend - data.data:', data?.data);
                console.log('Frontend - data.data.data:', data?.data?.data);
                console.log('Frontend - data.data.data.menu:', data?.data?.data?.menu);
                if (data?.data?.data?.menu) {
                    const menu = data.data.data.menu;
                    console.log('Frontend - Setting menu data:', menu.menuItems);
                    console.log('Frontend - Menu items structure:', JSON.stringify(menu.menuItems, null, 2));
                    setMenuData(menu.menuItems);
                    setSelectedWeek(new Date(menu.weekStartDate).toISOString().split('T')[0]);
                } else {
                    console.log('Frontend - No menu data found');
                    console.log('Frontend - Available data keys:', Object.keys(data || {}));
                    console.log('Frontend - data.data keys:', Object.keys(data?.data || {}));
                    console.log('Frontend - data.data.data keys:', Object.keys(data?.data?.data || {}));
                }
            },
            onError: (error) => {
                console.error('Frontend - Error fetching menu:', error);
            }
        }
    );

    // Create/Update menu mutation
    const updateMenuMutation = useMutation(
        (data) => {
            console.log('Frontend - Sending menu data:', data);
            return adminService.createOrUpdateMenu(data);
        },
        {
            onSuccess: (response) => {
                console.log('Frontend - Menu save response:', response);
                console.log('Frontend - Saved menu data:', response?.data?.data?.menu);
                // Add a small delay before invalidating queries to ensure backend is ready
                setTimeout(() => {
                    queryClient.invalidateQueries(['admin', 'current-menu']);
                }, 100);
                setEditMode(false);
                alert('Menu updated successfully!');
            },
            onError: (error) => {
                console.error('Frontend - Menu save error:', error);
                alert('Error updating menu: ' + (error.response?.data?.message || error.message));
            }
        }
    );

    const handleMealChange = (day, meal, value) => {
        setMenuData(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                [meal]: value
            }
        }));
    };

    const handleSave = () => {
        const payload = {
            weekStartDate: selectedWeek,
            menuItems: menuData
        };
        updateMenuMutation.mutate(payload);
    };

    const handleCancel = () => {
        // Reset to original data
        if (currentMenuData?.data?.menu) {
            setMenuData(currentMenuData.data.menu.menuItems);
        }
        setEditMode(false);
    };

    const handleWeekChange = (direction) => {
        const currentWeek = new Date(selectedWeek);
        const newWeek = new Date(currentWeek);
        newWeek.setDate(currentWeek.getDate() + (direction * 7));
        setSelectedWeek(newWeek.toISOString().split('T')[0]);
        
        // Reset menu data for new week
        setMenuData({
            monday: { breakfast: '', lunch: '', dinner: '' },
            tuesday: { breakfast: '', lunch: '', dinner: '' },
            wednesday: { breakfast: '', lunch: '', dinner: '' },
            thursday: { breakfast: '', lunch: '', dinner: '' },
            friday: { breakfast: '', lunch: '', dinner: '' },
            saturday: { breakfast: '', lunch: '', dinner: '' },
            sunday: { breakfast: '', lunch: '', dinner: '' }
        });
        setEditMode(true);
    };

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const meals = ['breakfast', 'lunch', 'dinner'];
    const mealNames = ['Breakfast', 'Lunch', 'Dinner'];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
                        <p className="text-gray-600 mt-1">Manage weekly meal menus for the hostel</p>
                    </div>
                    {!editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Edit Menu
                        </button>
                    )}
                </div>

                {/* Week Navigation */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <button
                        onClick={() => handleWeekChange(-1)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        ← Previous Week
                    </button>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                            Week of {formatDate(selectedWeek)} - {formatDate(getWeekEnd(selectedWeek))}
                        </div>
                        <div className="text-sm text-gray-600">
                            {selectedWeek === getWeekStart(new Date()) ? '(Current Week)' : ''}
                        </div>
                    </div>
                    <button
                        onClick={() => handleWeekChange(1)}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Next Week →
                    </button>
                </div>
            </div>

            {/* Menu Grid */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                    Day
                                </th>
                                {mealNames.map(meal => (
                                    <th key={meal} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {meal}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {days.map((day, dayIndex) => (
                                <tr key={day} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {dayNames[dayIndex]}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {formatDate(new Date(new Date(selectedWeek).getTime() + dayIndex * 24 * 60 * 60 * 1000))}
                                        </div>
                                    </td>
                                    {meals.map(meal => (
                                        <td key={meal} className="px-6 py-4">
                                            {editMode ? (
                                                <textarea
                                                    value={menuData[day][meal]}
                                                    onChange={(e) => handleMealChange(day, meal, e.target.value)}
                                                    placeholder={`Enter ${meal} menu...`}
                                                    className="w-full min-h-[80px] p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-900 min-h-[80px] p-2 bg-gray-50 rounded border">
                                                    {menuData[day][meal] || (
                                                        <span className="text-gray-400 italic">No menu set</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Buttons */}
            {editMode && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={updateMenuMutation.isLoading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {updateMenuMutation.isLoading ? 'Saving...' : 'Save Menu'}
                        </button>
                    </div>
                </div>
            )}

                            {/* Debug and Cleanup Tools (only in development) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                        <h3 className="text-yellow-800 font-medium mb-2">🔧 Debug Tools</h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => {
                                    adminService.debugMenus()
                                        .then(response => console.log('Debug info:', response.data))
                                        .catch(error => console.error('Debug error:', error));
                                }}
                                className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded text-sm hover:bg-yellow-300"
                            >
                                Debug Menus
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm('This will remove duplicate menus. Continue?')) {
                                        adminService.cleanupMenus()
                                            .then(response => {
                                                alert(response.data.message);
                                                queryClient.invalidateQueries(['admin', 'current-menu']);
                                            })
                                            .catch(error => console.error('Cleanup error:', error));
                                    }
                                }}
                                className="px-3 py-1 bg-red-200 text-red-800 rounded text-sm hover:bg-red-300"
                            >
                                Cleanup Duplicates
                            </button>
                        </div>
                    </div>
                )}

                {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-800 font-medium mb-2">📝 Instructions</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Use the week navigation to view and edit menus for different weeks</li>
                    <li>• Click "Edit Menu" to modify the current week's menu</li>
                    <li>• Enter detailed menu items for each meal (e.g., "Rice, Dal, Sabji, Roti, Pickle")</li>
                    <li>• Students will be able to view these menus in their menu section</li>
                    <li>• Save your changes to make them visible to students</li>
                </ul>
            </div>
        </div>
    );
};

export default MenuManagement;
