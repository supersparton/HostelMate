const Room = require('../models/Room');

class RoomService {
    // Initialize all 200 rooms with proper structure
    static async initializeRooms() {
        try {
            console.log('🏠 Initializing hostel rooms...');
            
            const existingRooms = await Room.countDocuments();
            if (existingRooms > 0) {
                console.log(`✅ Rooms already initialized (${existingRooms} rooms found)`);
                return;
            }

            const rooms = [];
            const totalRooms = parseInt(process.env.TOTAL_ROOMS) || 200;
            
            for (let roomNum = 1; roomNum <= totalRooms; roomNum++) {
                // Calculate floor (20 rooms per floor)
                const floor = Math.ceil(roomNum / 20);
                
                // Calculate wing (50 rooms per wing: A=1-50, B=51-100, C=101-150, D=151-200)
                let wing;
                if (roomNum <= 50) wing = 'A';
                else if (roomNum <= 100) wing = 'B';
                else if (roomNum <= 150) wing = 'C';
                else wing = 'D';

                // Determine room type and rent
                let rent = 5000; // Standard room
                let hasAC = false;
                
                // Every 10th room is AC room with higher rent
                if (roomNum % 10 === 0) {
                    rent = 7000;
                    hasAC = true;
                }

                const room = {
                    roomNumber: roomNum.toString(),
                    floor,
                    wing,
                    beds: {
                        A: { isOccupied: false, studentId: null },
                        B: { isOccupied: false, studentId: null },
                        C: { isOccupied: false, studentId: null },
                        D: { isOccupied: false, studentId: null }
                    },
                    facilities: {
                        hasAC,
                        hasAttachedBathroom: true,
                        hasBalcony: floor > 2, // Rooms above 2nd floor have balcony
                        hasFurniture: true
                    },
                    status: 'AVAILABLE',
                    rent
                };

                rooms.push(room);
            }

            // Bulk insert all rooms
            await Room.insertMany(rooms);
            
            console.log(`✅ Successfully initialized ${totalRooms} rooms`);
            console.log(`📊 Room distribution:`);
            console.log(`   • Wing A: Rooms 1-50 (Floors 1-3)`);
            console.log(`   • Wing B: Rooms 51-100 (Floors 3-5)`);
            console.log(`   • Wing C: Rooms 101-150 (Floors 6-8)`);
            console.log(`   • Wing D: Rooms 151-200 (Floors 8-10)`);
            console.log(`   • AC Rooms: ${totalRooms / 10} rooms (every 10th room)`);
            console.log(`   • Standard Rooms: ${totalRooms - (totalRooms / 10)} rooms`);

        } catch (error) {
            console.error('❌ Error initializing rooms:', error);
            throw error;
        }
    }

    // Get available rooms with filters
    static async getAvailableRooms(filters = {}) {
        try {
            const { wing, floor, hasAC, priceRange } = filters;
            
            let query = { 
                status: { $in: ['AVAILABLE', 'OCCUPIED'] }
            };

            if (wing) query.wing = wing;
            if (floor) query.floor = parseInt(floor);
            if (hasAC !== undefined) query['facilities.hasAC'] = hasAC;
            if (priceRange) {
                query.rent = { 
                    $gte: priceRange.min || 0, 
                    $lte: priceRange.max || 10000 
                };
            }

            const rooms = await Room.find(query).sort({ roomNumber: 1 });
            
            // Filter rooms that have at least one available bed
            const availableRooms = rooms.filter(room => {
                return ['A', 'B', 'C', 'D'].some(bed => !room.beds[bed].isOccupied);
            });

            return availableRooms.map(room => ({
                ...room.toObject(),
                availableBeds: ['A', 'B', 'C', 'D'].filter(bed => !room.beds[bed].isOccupied),
                occupiedBeds: ['A', 'B', 'C', 'D'].filter(bed => room.beds[bed].isOccupied).length
            }));

        } catch (error) {
            throw new Error('Error fetching available rooms: ' + error.message);
        }
    }

    // Assign room and bed to student
    static async assignRoom(studentId, roomNumber, bedLetter) {
        try {
            // Validate bed letter
            if (!['A', 'B', 'C', 'D'].includes(bedLetter)) {
                throw new Error('Invalid bed letter. Must be A, B, C, or D');
            }

            const room = await Room.findOne({ roomNumber });
            if (!room) {
                throw new Error('Room not found');
            }

            if (room.beds[bedLetter].isOccupied) {
                throw new Error(`Bed ${bedLetter} in room ${roomNumber} is already occupied`);
            }

            // Assign the bed
            room.beds[bedLetter].isOccupied = true;
            room.beds[bedLetter].studentId = studentId;

            // Update room status
            const occupiedBeds = ['A', 'B', 'C', 'D'].filter(bed => room.beds[bed].isOccupied).length;
            if (occupiedBeds === 4) {
                room.status = 'OCCUPIED';
            }

            await room.save();

            return {
                roomNumber,
                bedLetter,
                floor: room.floor,
                wing: room.wing,
                rent: room.rent,
                facilities: room.facilities
            };

        } catch (error) {
            throw new Error('Error assigning room: ' + error.message);
        }
    }

    // Release room and bed when student leaves
    static async releaseRoom(studentId, roomNumber, bedLetter) {
        try {
            const room = await Room.findOne({ roomNumber });
            if (!room) {
                throw new Error('Room not found');
            }

            if (!room.beds[bedLetter].isOccupied || 
                room.beds[bedLetter].studentId.toString() !== studentId.toString()) {
                throw new Error('Bed assignment mismatch');
            }

            // Release the bed
            room.beds[bedLetter].isOccupied = false;
            room.beds[bedLetter].studentId = null;

            // Update room status
            const occupiedBeds = ['A', 'B', 'C', 'D'].filter(bed => room.beds[bed].isOccupied).length;
            if (occupiedBeds === 0) {
                room.status = 'AVAILABLE';
            } else {
                room.status = 'OCCUPIED';
            }

            await room.save();

            return { success: true, message: 'Room released successfully' };

        } catch (error) {
            throw new Error('Error releasing room: ' + error.message);
        }
    }

    // Get room statistics
    static async getRoomStatistics() {
        try {
            const totalRooms = await Room.countDocuments();
            const availableRooms = await Room.countDocuments({ status: 'AVAILABLE' });
            const occupiedRooms = await Room.countDocuments({ status: 'OCCUPIED' });
            const maintenanceRooms = await Room.countDocuments({ status: 'MAINTENANCE' });

            // Calculate bed statistics
            const rooms = await Room.find({});
            let totalBeds = 0;
            let occupiedBeds = 0;

            rooms.forEach(room => {
                ['A', 'B', 'C', 'D'].forEach(bed => {
                    totalBeds++;
                    if (room.beds[bed].isOccupied) {
                        occupiedBeds++;
                    }
                });
            });

            // Wing-wise statistics
            const wingStats = await Room.aggregate([
                {
                    $group: {
                        _id: '$wing',
                        totalRooms: { $sum: 1 },
                        availableRooms: {
                            $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] }
                        },
                        occupiedRooms: {
                            $sum: { $cond: [{ $eq: ['$status', 'OCCUPIED'] }, 1, 0] }
                        },
                        averageRent: { $avg: '$rent' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Floor-wise statistics
            const floorStats = await Room.aggregate([
                {
                    $group: {
                        _id: '$floor',
                        totalRooms: { $sum: 1 },
                        availableRooms: {
                            $sum: { $cond: [{ $eq: ['$status', 'AVAILABLE'] }, 1, 0] }
                        },
                        occupiedRooms: {
                            $sum: { $cond: [{ $eq: ['$status', 'OCCUPIED'] }, 1, 0] }
                        }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return {
                overall: {
                    totalRooms,
                    availableRooms,
                    occupiedRooms,
                    maintenanceRooms,
                    occupancyRate: Math.round((occupiedRooms / totalRooms) * 100),
                    totalBeds,
                    occupiedBeds,
                    availableBeds: totalBeds - occupiedBeds,
                    bedOccupancyRate: Math.round((occupiedBeds / totalBeds) * 100)
                },
                byWing: wingStats,
                byFloor: floorStats
            };

        } catch (error) {
            throw new Error('Error getting room statistics: ' + error.message);
        }
    }

    // Find optimal room for student (closest available bed)
    static async findOptimalRoom(preferences = {}) {
        try {
            const { wing, floor, hasAC, budget } = preferences;
            
            let query = { 
                status: { $in: ['AVAILABLE', 'OCCUPIED'] }
            };

            if (wing) query.wing = wing;
            if (floor) query.floor = floor;
            if (hasAC !== undefined) query['facilities.hasAC'] = hasAC;
            if (budget) query.rent = { $lte: budget };

            const rooms = await Room.find(query).sort({ roomNumber: 1 });
            
            // Find rooms with available beds
            const availableRooms = [];
            
            for (const room of rooms) {
                const availableBeds = ['A', 'B', 'C', 'D'].filter(bed => !room.beds[bed].isOccupied);
                
                if (availableBeds.length > 0) {
                    availableRooms.push({
                        room,
                        availableBeds,
                        occupancy: 4 - availableBeds.length,
                        score: this.calculateRoomScore(room, preferences)
                    });
                }
            }

            // Sort by score (higher is better)
            availableRooms.sort((a, b) => b.score - a.score);

            return availableRooms.slice(0, 5); // Return top 5 options

        } catch (error) {
            throw new Error('Error finding optimal room: ' + error.message);
        }
    }

    // Calculate room suitability score based on preferences
    static calculateRoomScore(room, preferences) {
        let score = 0;
        
        // Preference matching
        if (preferences.wing === room.wing) score += 20;
        if (preferences.floor === room.floor) score += 15;
        if (preferences.hasAC === room.facilities.hasAC) score += 10;
        
        // Facility bonuses
        if (room.facilities.hasBalcony) score += 5;
        if (room.facilities.hasAttachedBathroom) score += 5;
        
        // Lower occupancy bonus (more privacy)
        const occupancy = ['A', 'B', 'C', 'D'].filter(bed => room.beds[bed].isOccupied).length;
        score += (4 - occupancy) * 3;
        
        // Budget consideration
        if (preferences.budget) {
            if (room.rent <= preferences.budget * 0.8) score += 10;
            else if (room.rent <= preferences.budget) score += 5;
            else score -= 5;
        }
        
        return score;
    }

    // Schedule room maintenance
    static async scheduleRoomMaintenance(roomNumber, maintenanceDate, reason) {
        try {
            const room = await Room.findOne({ roomNumber });
            if (!room) {
                throw new Error('Room not found');
            }

            room.status = 'MAINTENANCE';
            room.maintenanceScheduled = new Date(maintenanceDate);
            
            await room.save();

            return { success: true, message: 'Room maintenance scheduled' };

        } catch (error) {
            throw new Error('Error scheduling maintenance: ' + error.message);
        }
    }
}

module.exports = RoomService;
