const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');

class QRService {
    // Generate QR code for student attendance
    static async generateStudentQR(student) {
        try {
            const qrData = {
                studentId: student._id,
                studentCode: student.studentId,
                roomNumber: student.roomNumber,
                timestamp: Date.now(),
                type: 'STUDENT_QR'
            };

            // Create a JWT token for security
            const token = jwt.sign(qrData, process.env.JWT_ACCESS_SECRET, { expiresIn: '24h' });
            
            const qrCodeDataURL = await QRCode.toDataURL(token);
            
            return {
                qrCode: qrCodeDataURL,
                token,
                data: qrData
            };
        } catch (error) {
            throw new Error('Error generating QR code: ' + error.message);
        }
    }

    // Generate QR code for specific attendance type
    static async generateAttendanceQR(student, type, location = 'MAIN_GATE') {
        try {
            const qrData = {
                studentId: student._id,
                studentCode: student.studentId,
                roomNumber: student.roomNumber,
                type, // DINNER, GATE_IN, GATE_OUT
                location,
                timestamp: Date.now(),
                validUntil: Date.now() + (30 * 60 * 1000) // Valid for 30 minutes
            };

            const token = jwt.sign(qrData, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
            const qrCodeDataURL = await QRCode.toDataURL(token);
            
            return {
                qrCode: qrCodeDataURL,
                token,
                data: qrData,
                validUntil: new Date(qrData.validUntil)
            };
        } catch (error) {
            throw new Error('Error generating attendance QR code: ' + error.message);
        }
    }

    // Verify and decode QR code
    static verifyQR(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            
            // Check if QR code is still valid
            if (decoded.validUntil && Date.now() > decoded.validUntil) {
                throw new Error('QR code has expired');
            }
            
            return {
                valid: true,
                data: decoded
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    // Generate QR for room access
    static async generateRoomQR(roomNumber, bedLetter, studentId) {
        try {
            const qrData = {
                roomNumber,
                bedLetter,
                studentId,
                type: 'ROOM_ACCESS',
                timestamp: Date.now(),
                validUntil: Date.now() + (24 * 60 * 60 * 1000) // Valid for 24 hours
            };

            const token = jwt.sign(qrData, process.env.JWT_ACCESS_SECRET, { expiresIn: '24h' });
            const qrCodeDataURL = await QRCode.toDataURL(token);
            
            return {
                qrCode: qrCodeDataURL,
                token,
                data: qrData
            };
        } catch (error) {
            throw new Error('Error generating room QR code: ' + error.message);
        }
    }

    // Generate QR for meal booking confirmation
    static async generateMealQR(mealBooking) {
        try {
            const qrData = {
                bookingId: mealBooking._id,
                studentId: mealBooking.studentId,
                date: mealBooking.date,
                mealType: mealBooking.mealType,
                type: 'MEAL_CONFIRMATION',
                timestamp: Date.now()
            };

            const token = jwt.sign(qrData, process.env.JWT_ACCESS_SECRET, { expiresIn: '24h' });
            const qrCodeDataURL = await QRCode.toDataURL(token);
            
            return {
                qrCode: qrCodeDataURL,
                token,
                data: qrData
            };
        } catch (error) {
            throw new Error('Error generating meal QR code: ' + error.message);
        }
    }

    // Batch generate QR codes for multiple students
    static async generateBatchQR(students, type = 'STUDENT_QR') {
        try {
            const qrCodes = [];
            
            for (const student of students) {
                const qr = await this.generateStudentQR(student);
                qrCodes.push({
                    studentId: student._id,
                    studentCode: student.studentId,
                    roomNumber: student.roomNumber,
                    qrCode: qr.qrCode,
                    token: qr.token
                });
            }
            
            return qrCodes;
        } catch (error) {
            throw new Error('Error generating batch QR codes: ' + error.message);
        }
    }

    // Generate admin QR for scanning student QRs
    static async generateAdminScannerQR(adminId, location = 'MAIN_GATE') {
        try {
            const qrData = {
                adminId,
                type: 'ADMIN_SCANNER',
                location,
                timestamp: Date.now(),
                validUntil: Date.now() + (8 * 60 * 60 * 1000) // Valid for 8 hours
            };

            const token = jwt.sign(qrData, process.env.JWT_ACCESS_SECRET, { expiresIn: '8h' });
            const qrCodeDataURL = await QRCode.toDataURL(token);
            
            return {
                qrCode: qrCodeDataURL,
                token,
                data: qrData,
                validUntil: new Date(qrData.validUntil)
            };
        } catch (error) {
            throw new Error('Error generating admin scanner QR: ' + error.message);
        }
    }

    // Generate QR codes for leave application (entry and exit)
    static async generateLeaveQRCodes(leaveApplication, student) {
        try {
            const baseData = {
                leaveApplicationId: leaveApplication._id,
                studentId: student._id,
                studentCode: student.studentId,
                roomNumber: student.roomNumber,
                leaveType: leaveApplication.leaveType,
                fromDate: leaveApplication.fromDate,
                toDate: leaveApplication.toDate,
                timestamp: Date.now()
            };

            // Generate Entry QR Code (for exiting the hostel)
            const entryQRData = {
                ...baseData,
                type: 'LEAVE_ENTRY',
                action: 'EXIT_HOSTEL',
                validFrom: new Date(leaveApplication.fromDate),
                validUntil: new Date(new Date(leaveApplication.fromDate).getTime() + (24 * 60 * 60 * 1000)) // Valid for 24 hours from start date
            };

            // Generate Exit QR Code (for re-entering the hostel)
            const exitQRData = {
                ...baseData,
                type: 'LEAVE_EXIT',
                action: 'ENTER_HOSTEL',
                validFrom: new Date(leaveApplication.toDate),
                validUntil: new Date(new Date(leaveApplication.toDate).getTime() + (24 * 60 * 60 * 1000)) // Valid for 24 hours from end date
            };

            const entryToken = jwt.sign(entryQRData, process.env.JWT_ACCESS_SECRET, { expiresIn: '30d' });
            const exitToken = jwt.sign(exitQRData, process.env.JWT_ACCESS_SECRET, { expiresIn: '30d' });

            const entryQRCode = await QRCode.toDataURL(entryToken);
            const exitQRCode = await QRCode.toDataURL(exitToken);

            return {
                entryQR: {
                    qrCode: entryQRCode,
                    code: entryToken, // Store the token as 'code' to match model
                    data: entryQRData,
                    purpose: 'Exit Hostel - Show this when leaving'
                },
                exitQR: {
                    qrCode: exitQRCode,
                    code: exitToken, // Store the token as 'code' to match model
                    data: exitQRData,
                    purpose: 'Enter Hostel - Show this when returning'
                }
            };
        } catch (error) {
            throw new Error('Error generating leave QR codes: ' + error.message);
        }
    }

    // Verify leave QR code and mark as used
    static async verifyLeaveQR(token, leaveApplicationModel) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            
            // Check if it's a leave-related QR
            if (!['LEAVE_ENTRY', 'LEAVE_EXIT'].includes(decoded.type)) {
                return {
                    valid: false,
                    error: 'Invalid QR code type for leave management'
                };
            }

            // Check validity period
            const now = new Date();
            if (decoded.validFrom && now < new Date(decoded.validFrom)) {
                return {
                    valid: false,
                    error: 'QR code is not yet valid'
                };
            }
            
            if (decoded.validUntil && now > new Date(decoded.validUntil)) {
                return {
                    valid: false,
                    error: 'QR code has expired'
                };
            }

            // Find the leave application
            const leaveApp = await leaveApplicationModel.findById(decoded.leaveApplicationId);
            if (!leaveApp) {
                return {
                    valid: false,
                    error: 'Leave application not found'
                };
            }

            // Check if leave is approved
            if (leaveApp.status !== 'APPROVED') {
                return {
                    valid: false,
                    error: 'Leave application is not approved'
                };
            }

            // Check if QR code was already used
            const qrField = decoded.type === 'LEAVE_ENTRY' ? 'entryQRCode' : 'exitQRCode';
            if (leaveApp[qrField].used) {
                return {
                    valid: false,
                    error: 'QR code has already been used',
                    usedAt: leaveApp[qrField].usedAt
                };
            }

            return {
                valid: true,
                data: decoded,
                leaveApplication: leaveApp,
                qrType: decoded.type,
                action: decoded.action
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    // Mark leave QR code as used
    static async markLeaveQRAsUsed(leaveApplicationId, qrType, leaveApplicationModel) {
        try {
            const qrField = qrType === 'LEAVE_ENTRY' ? 'entryQRCode' : 'exitQRCode';
            const updateData = {
                [`${qrField}.used`]: true,
                [`${qrField}.usedAt`]: new Date()
            };

            const updatedLeave = await leaveApplicationModel.findByIdAndUpdate(
                leaveApplicationId,
                updateData,
                { new: true }
            );

            return updatedLeave;
        } catch (error) {
            throw new Error('Error marking QR code as used: ' + error.message);
        }
    }

    // Generate QR code with custom options
    static async generateCustomQR(data, options = {}) {
        try {
            const defaultOptions = {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            };

            const qrOptions = { ...defaultOptions, ...options };
            const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(data), qrOptions);
            
            return qrCodeDataURL;
        } catch (error) {
            throw new Error('Error generating custom QR code: ' + error.message);
        }
    }
}

module.exports = QRService;
