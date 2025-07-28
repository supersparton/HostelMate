const express = require('express');
const router = express.Router();

// Home page information
router.get('/home', (req, res) => {
    res.json({
        success: true,
        data: {
            welcomeMessage: "Welcome to HostelMate - Your Digital Hostel Management Solution",
            hostelName: process.env.HOSTEL_NAME || "HostelMate Residence",
            totalRooms: process.env.TOTAL_ROOMS || 200,
            totalCapacity: (process.env.TOTAL_ROOMS || 200) * (process.env.BEDS_PER_ROOM || 4),
            features: [
                "Digital Attendance System",
                "Online Food Menu & Booking",
                "Leave Application Management", 
                "Community Discussion Forum",
                "Complaint Management System",
                "QR-based Gate Access"
            ],
            gallery: [
                {
                    title: "Hostel Building",
                    image: "/images/hostel-building.jpg",
                    description: "Modern hostel building with all amenities"
                },
                {
                    title: "Mess Hall",
                    image: "/images/mess-hall.jpg", 
                    description: "Spacious dining hall with quality food"
                },
                {
                    title: "Common Room",
                    image: "/images/common-room.jpg",
                    description: "Recreational area for students"
                },
                {
                    title: "Study Hall",
                    image: "/images/study-hall.jpg",
                    description: "Quiet study environment"
                }
            ]
        }
    });
});

// Vision and mission
router.get('/vision', (req, res) => {
    res.json({
        success: true,
        data: {
            vision: "To provide a comfortable, secure, and technologically advanced living environment that supports students' academic and personal growth.",
            mission: "Creating a digital ecosystem that streamlines hostel operations while fostering a sense of community among residents.",
            values: [
                "Excellence in Service",
                "Student-Centric Approach", 
                "Transparency in Operations",
                "Innovation in Management",
                "Community Building",
                "Safety and Security"
            ],
            objectives: [
                "Digitize all hostel operations for efficiency",
                "Provide 24/7 student support services",
                "Maintain high standards of cleanliness and hygiene",
                "Foster academic and cultural activities",
                "Ensure transparent fee structure and policies"
            ]
        }
    });
});

// Trustees and staff information
router.get('/trustees', (req, res) => {
    res.json({
        success: true,
        data: {
            trustees: [
                {
                    name: "Dr. Rajesh Kumar",
                    position: "Chairman",
                    qualification: "Ph.D. in Education Administration",
                    experience: "20+ years in educational management",
                    email: "chairman@hostelmate.com",
                    image: "/images/trustees/chairman.jpg"
                },
                {
                    name: "Prof. Sunita Sharma", 
                    position: "Vice Chairman",
                    qualification: "M.A. in Social Work",
                    experience: "15+ years in student welfare",
                    email: "vice.chairman@hostelmate.com",
                    image: "/images/trustees/vice-chairman.jpg"
                }
            ],
            wardens: [
                {
                    name: "Mr. Amit Patel",
                    position: "Chief Warden",
                    qualification: "M.Sc. in Management",
                    experience: "10+ years in hostel management",
                    phone: "9876543210",
                    email: "chief.warden@hostelmate.com",
                    image: "/images/staff/chief-warden.jpg"
                },
                {
                    name: "Ms. Priya Singh",
                    position: "Assistant Warden",
                    qualification: "B.A. in Psychology",
                    experience: "5+ years in student counseling",
                    phone: "9876543211", 
                    email: "assistant.warden@hostelmate.com",
                    image: "/images/staff/assistant-warden.jpg"
                }
            ]
        }
    });
});

// Location and contact information
router.get('/contact', (req, res) => {
    res.json({
        success: true,
        data: {
            address: {
                street: "123 University Road",
                city: "Ahmedabad",
                state: "Gujarat",
                country: "India",
                pincode: "382421",
                landmark: "Near Adani University"
            },
            coordinates: {
                latitude: 23.0225,
                longitude: 72.5714
            },
            contactNumbers: {
                main: "+91-2717-123456",
                emergency: "+91-9876543210",
                warden: "+91-9876543211"
            },
            email: {
                general: "info@hostelmate.com",
                admissions: "admissions@hostelmate.com",
                complaints: "complaints@hostelmate.com"
            },
            officeHours: {
                weekdays: "9:00 AM - 6:00 PM",
                saturday: "9:00 AM - 2:00 PM", 
                sunday: "Closed"
            },
            emergencyServices: {
                medical: "Available 24/7",
                security: "24/7 Security Guards",
                maintenance: "24/7 Emergency Support"
            }
        }
    });
});

// Rules and regulations
router.get('/rules', (req, res) => {
    res.json({
        success: true,
        data: {
            generalRules: [
                "Students must maintain discipline and follow hostel timings",
                "Entry and exit through QR code scanning is mandatory",
                "Visitors are allowed only during specified hours (10 AM - 6 PM)",
                "No outside food is allowed in hostel premises",
                "Smoking and alcohol consumption strictly prohibited",
                "Students must keep their rooms clean and tidy",
                "Loud music and noise prohibited after 10 PM",
                "Students must report any maintenance issues immediately"
            ],
            timings: {
                gateClosing: "11:00 PM",
                gateOpening: "5:00 AM",
                messBreakfast: "7:00 AM - 9:00 AM",
                messLunch: "12:00 PM - 2:00 PM", 
                messDinner: "7:00 PM - 9:00 PM",
                studyHours: "6:00 PM - 10:00 PM",
                visitorHours: "10:00 AM - 6:00 PM"
            },
            leavePolicy: {
                maxLeaveDays: 30,
                advanceNotice: "24 hours minimum",
                approvalRequired: "For leaves > 7 days",
                emergencyContact: "Must provide emergency contact"
            },
            disciplinaryActions: [
                "Warning for first offense",
                "Fine for repeated violations",
                "Suspension for serious misconduct",
                "Termination for severe violations"
            ]
        }
    });
});

// Fee structure
router.get('/fees', (req, res) => {
    res.json({
        success: true,
        data: {
            roomTypes: [
                {
                    type: "Standard Room (4-seater)",
                    monthlyRent: 5000,
                    facilities: ["Basic furniture", "Attached bathroom", "Wi-Fi", "Power backup"],
                    securityDeposit: 10000
                },
                {
                    type: "AC Room (4-seater)",
                    monthlyRent: 7000,
                    facilities: ["Air conditioning", "Premium furniture", "Attached bathroom", "Wi-Fi", "Power backup"],
                    securityDeposit: 15000
                }
            ],
            additionalCharges: {
                messCharges: 3000,
                electricityCharges: "As per usage",
                laundryCharges: 500,
                internetCharges: "Included",
                maintenanceCharges: 200
            },
            paymentSchedule: {
                rentDueDate: "5th of every month",
                messChargesDueDate: "1st of every month",
                lateFee: 100,
                lateFeeDays: "After 10 days of due date"
            },
            refundPolicy: {
                securityDeposit: "Refundable after room inspection",
                advanceRent: "Non-refundable",
                noticePeriod: "30 days for leaving hostel"
            },
            scholarships: [
                {
                    type: "Merit-based",
                    discount: "20% on rent",
                    criteria: "Above 85% marks"
                },
                {
                    type: "Need-based", 
                    discount: "30% on rent",
                    criteria: "Family income < 2 LPA"
                }
            ]
        }
    });
});

// Contact form submission
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Here you would typically save to database or send email
        // For now, we'll just return success
        
        res.json({
            success: true,
            message: "Thank you for contacting us. We'll get back to you soon!",
            data: {
                inquiryId: `INQ${Date.now()}`,
                submittedAt: new Date()
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to submit inquiry",
            error: error.message
        });
    }
});

// Facilities information
router.get('/facilities', (req, res) => {
    res.json({
        success: true,
        data: {
            accommodation: [
                "200 well-furnished rooms",
                "4 students per room", 
                "Attached bathrooms",
                "24/7 water supply",
                "Power backup",
                "Wi-Fi connectivity"
            ],
            dining: [
                "Spacious mess hall",
                "Nutritious vegetarian meals",
                "Weekly menu planning",
                "Special festival meals", 
                "Hygienic food preparation",
                "Online meal booking"
            ],
            recreational: [
                "Common TV room",
                "Indoor games facility",
                "Outdoor sports ground",
                "Gymnasium",
                "Library and reading room",
                "Music and cultural room"
            ],
            services: [
                "24/7 security",
                "Medical first aid",
                "Laundry service",
                "Housekeeping",
                "Maintenance support",
                "Digital attendance system"
            ],
            safety: [
                "CCTV surveillance",
                "Fire safety equipment",
                "Emergency exits",
                "Security guards",
                "Visitor registration",
                "Emergency contact system"
            ]
        }
    });
});

module.exports = router;
