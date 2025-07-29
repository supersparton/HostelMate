import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { studentService } from '../../services/studentService';

const MenuView = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Get week start date (Monday)
    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    }

    // Get week end date (Sunday)
    function getWeekEnd(weekStart) {
        const end = new Date(weekStart);
        end.setDate(weekStart.getDate() + 6);
        return end;
    }

    // Format date for display
    function formatDate(date) {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    // Format day name
    function formatDayName(date) {
        return new Date(date).toLocaleDateString('en-IN', { weekday: 'long' });
    }

    // Check if date is today
    function isToday(date) {
        const today = new Date();
        const checkDate = new Date(date);
        return today.toDateString() === checkDate.toDateString();
    }

    // Get current week start and end
    const weekStart = getWeekStart(selectedDate);
    const weekEnd = getWeekEnd(weekStart);

    // Fetch menu data
    const { data: menuData, isLoading, error } = useQuery(
        ['student', 'menu'],
        () => studentService.getMenu(),
        {
            refetchInterval: 300000, // Refresh every 5 minutes
            onSuccess: (data) => {
                console.log('Student - Menu data received:', data);
                console.log('Student - Menu found:', data?.data?.data?.menu ? 'Yes' : 'No');
            },
            onError: (error) => {
                console.error('Student - Error fetching menu:', error);
            }
        }
    );

    // Navigate to different week
    const handleWeekChange = (direction) => {
        const currentDate = new Date(selectedDate);
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction * 7));
        setSelectedDate(newDate.toISOString().split('T')[0]);
    };

    // Get current meal based on time
    function getCurrentMeal() {
        const now = new Date();
        const hours = now.getHours();
        
        if (hours < 10) return 'breakfast';
        if (hours < 15) return 'lunch';
        return 'dinner';
    }

    const currentMeal = getCurrentMeal();
    const menu = menuData?.data?.data?.menu;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const meals = ['breakfast', 'lunch', 'dinner'];
    const mealNames = ['Breakfast', 'Lunch', 'Dinner'];
    const mealIcons = ['🍳', '🍽️', '🌙'];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Error loading menu: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hostel Menu</h1>
                        <p className="text-gray-600 mt-1">View daily meal schedules and menus</p>
                    </div>
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
                            Week of {formatDate(weekStart)} - {formatDate(weekEnd)}
                        </div>
                        <div className="text-sm text-gray-600">
                            {selectedDate === new Date().toISOString().split('T')[0] ? '(Current Week)' : ''}
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

            {/* Current Meal Highlight */}
            {menu && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">{mealIcons[meals.indexOf(currentMeal)]}</span>
                        <div>
                            <h2 className="text-xl font-semibold">
                                Current Meal: {mealNames[meals.indexOf(currentMeal)]}
                            </h2>
                            <p className="text-blue-100">
                                Today's {currentMeal}: {
                                    menu.menuItems?.[days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]]?.[currentMeal] || 
                                    'Menu not available'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Display */}
            {!menu ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <div className="text-yellow-800 text-lg font-medium mb-2">Menu Not Available</div>
                    <p className="text-yellow-700">
                        The menu for this week hasn't been set yet. Please check back later or contact the hostel administration.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                    {days.map((day, dayIndex) => {
                        const dayDate = new Date(weekStart);
                        dayDate.setDate(weekStart.getDate() + dayIndex);
                        const isCurrentDay = isToday(dayDate);

                        return (
                            <div 
                                key={day} 
                                className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
                                    isCurrentDay ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                                }`}
                            >
                                {/* Day Header */}
                                <div className={`p-4 text-center ${
                                    isCurrentDay 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-50 text-gray-900'
                                }`}>
                                    <div className="font-semibold">{dayNames[dayIndex]}</div>
                                    <div className={`text-sm ${
                                        isCurrentDay ? 'text-blue-100' : 'text-gray-600'
                                    }`}>
                                        {formatDate(dayDate)}
                                    </div>
                                    {isCurrentDay && (
                                        <div className="text-xs text-blue-200 font-medium mt-1">TODAY</div>
                                    )}
                                </div>

                                {/* Meals */}
                                <div className="p-4 space-y-4">
                                    {meals.map((meal, mealIndex) => (
                                        <div key={meal} className="space-y-2">
                                            <div className={`flex items-center space-x-2 ${
                                                isCurrentDay && meal === currentMeal 
                                                    ? 'text-blue-600 font-semibold' 
                                                    : 'text-gray-700'
                                            }`}>
                                                <span className="text-lg">{mealIcons[mealIndex]}</span>
                                                <span className="text-sm font-medium">{mealNames[mealIndex]}</span>
                                            </div>
                                            <div className={`text-xs p-2 rounded border ${
                                                isCurrentDay && meal === currentMeal
                                                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                                                    : 'bg-gray-50 border-gray-200 text-gray-700'
                                            }`}>
                                                {menu.menuItems?.[day]?.[meal] || (
                                                    <span className="text-gray-400 italic">Not set</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Meal Timings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🕐 Meal Timings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="text-2xl mb-2">🍳</div>
                        <div className="font-semibold text-gray-900">Breakfast</div>
                        <div className="text-sm text-gray-600">7:00 AM - 10:00 AM</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-2xl mb-2">🍽️</div>
                        <div className="font-semibold text-gray-900">Lunch</div>
                        <div className="text-sm text-gray-600">12:00 PM - 3:00 PM</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="text-2xl mb-2">🌙</div>
                        <div className="font-semibold text-gray-900">Dinner</div>
                        <div className="text-sm text-gray-600">7:00 PM - 10:00 PM</div>
                    </div>
                </div>
            </div>

            {/* Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-800 font-medium mb-2">📋 Information</h3>
                <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Meal menus are updated weekly by the hostel administration</li>
                    <li>• Current meal is highlighted based on the time of day</li>
                    <li>• Please follow the meal timings for the best dining experience</li>
                    <li>• For special dietary requirements, contact the hostel office</li>
                    <li>• Menu may change due to availability of ingredients</li>
                </ul>
            </div>
        </div>
    );
};

export default MenuView;
