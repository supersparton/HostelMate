const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    // Send admission acceptance email
    async sendAdmissionAcceptance(student, roomDetails) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.userId.email,
                subject: 'Hostel Admission Approved - Welcome to HostelMate!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                            <h1>Congratulations! Your Admission is Approved</h1>
                        </div>
                        
                        <div style="padding: 20px; background-color: #f9f9f9;">
                            <h2>Dear ${student.userId.name},</h2>
                            
                            <p>We are pleased to inform you that your hostel admission application has been <strong>approved</strong>!</p>
                            
                            <div style="background-color: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                                <h3>Your Room Details:</h3>
                                <ul>
                                    <li><strong>Student ID:</strong> ${student.studentId}</li>
                                    <li><strong>Room Number:</strong> ${roomDetails.roomNumber}</li>
                                    <li><strong>Bed:</strong> ${roomDetails.bedLetter}</li>
                                    <li><strong>Floor:</strong> ${roomDetails.floor}</li>
                                    <li><strong>Wing:</strong> ${roomDetails.wing}</li>
                                </ul>
                            </div>
                            
                            <h3>Next Steps:</h3>
                            <ol>
                                <li>Visit the hostel office with the following documents:
                                    <ul>
                                        <li>This admission email (printed copy)</li>
                                        <li>Original ID proof</li>
                                        <li>Fee payment receipt</li>
                                        <li>Medical certificate</li>
                                    </ul>
                                </li>
                                <li>Complete the check-in process</li>
                                <li>Collect your room keys and hostel ID card</li>
                                <li>Download the HostelMate app to access digital services</li>
                            </ol>
                            
                            <div style="background-color: #fff3cd; padding: 15px; border: 1px solid #ffeaa7; margin: 20px 0;">
                                <h4>Important Information:</h4>
                                <p>Please report to the hostel office within 7 days of receiving this email. Failure to do so may result in cancellation of your admission.</p>
                            </div>
                            
                            <h3>Contact Information:</h3>
                            <p>
                                <strong>Hostel Office:</strong> ${process.env.HOSTEL_PHONE || '+91-XXX-XXX-XXXX'}<br>
                                <strong>Email:</strong> ${process.env.ADMIN_EMAIL}<br>
                                <strong>Office Hours:</strong> 9:00 AM - 6:00 PM (Monday to Saturday)
                            </p>
                            
                            <p>Welcome to the HostelMate family! We look forward to providing you with a comfortable and secure living experience.</p>
                            
                            <p>Best regards,<br>
                            HostelMate Administration</p>
                        </div>
                        
                        <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
                            This is an automated email. Please do not reply to this message.
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Admission acceptance email sent to:', student.userId.email);
            
        } catch (error) {
            console.error('❌ Error sending admission acceptance email:', error);
            throw new Error('Failed to send admission acceptance email');
        }
    }

    // Send admission rejection email
    async sendAdmissionRejection(student, reason) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.userId.email,
                subject: 'Hostel Admission Status Update',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #f44336; color: white; padding: 20px; text-align: center;">
                            <h1>Admission Application Status</h1>
                        </div>
                        
                        <div style="padding: 20px; background-color: #f9f9f9;">
                            <h2>Dear ${student.userId.name},</h2>
                            
                            <p>Thank you for your interest in HostelMate. After careful consideration, we regret to inform you that we are unable to approve your hostel admission application at this time.</p>
                            
                            ${reason ? `
                                <div style="background-color: white; padding: 15px; border-left: 4px solid #f44336; margin: 20px 0;">
                                    <h3>Reason:</h3>
                                    <p>${reason}</p>
                                </div>
                            ` : ''}
                            
                            <h3>What's Next:</h3>
                            <ul>
                                <li>You may reapply for the next admission cycle</li>
                                <li>Consider applying for our waiting list</li>
                                <li>Contact our admission office for guidance on improving your application</li>
                            </ul>
                            
                            <h3>Contact Information:</h3>
                            <p>
                                If you have any questions or would like feedback on your application, please contact:<br>
                                <strong>Admission Office:</strong> ${process.env.HOSTEL_PHONE || '+91-XXX-XXX-XXXX'}<br>
                                <strong>Email:</strong> ${process.env.ADMIN_EMAIL}
                            </p>
                            
                            <p>We appreciate your interest in HostelMate and wish you the best in your accommodation search.</p>
                            
                            <p>Best regards,<br>
                            HostelMate Admission Team</p>
                        </div>
                        
                        <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
                            This is an automated email. Please do not reply to this message.
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Admission rejection email sent to:', student.userId.email);
            
        } catch (error) {
            console.error('❌ Error sending admission rejection email:', error);
            throw new Error('Failed to send admission rejection email');
        }
    }

    // Send leave approval/rejection notification
    async sendLeaveNotification(student, leaveApplication, isApproved, rejectionReason = null) {
        try {
            const status = isApproved ? 'Approved' : 'Rejected';
            const statusColor = isApproved ? '#4CAF50' : '#f44336';
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.userId.email,
                subject: `Leave Application ${status} - ${leaveApplication._id}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center;">
                            <h1>Leave Application ${status}</h1>
                        </div>
                        
                        <div style="padding: 20px; background-color: #f9f9f9;">
                            <h2>Dear ${student.userId.name},</h2>
                            
                            <p>Your leave application has been <strong>${status.toLowerCase()}</strong>.</p>
                            
                            <div style="background-color: white; padding: 15px; border-left: 4px solid ${statusColor}; margin: 20px 0;">
                                <h3>Leave Details:</h3>
                                <ul>
                                    <li><strong>Application ID:</strong> ${leaveApplication._id}</li>
                                    <li><strong>From Date:</strong> ${new Date(leaveApplication.fromDate).toDateString()}</li>
                                    <li><strong>To Date:</strong> ${new Date(leaveApplication.toDate).toDateString()}</li>
                                    <li><strong>Duration:</strong> ${leaveApplication.duration} days</li>
                                    <li><strong>Reason:</strong> ${leaveApplication.reason}</li>
                                    <li><strong>Status:</strong> ${status}</li>
                                </ul>
                            </div>
                            
                            ${!isApproved && rejectionReason ? `
                                <div style="background-color: #ffebee; padding: 15px; border: 1px solid #ffcdd2; margin: 20px 0;">
                                    <h4>Rejection Reason:</h4>
                                    <p>${rejectionReason}</p>
                                </div>
                            ` : ''}
                            
                            ${isApproved ? `
                                <div style="background-color: #e8f5e8; padding: 15px; border: 1px solid #c8e6c9; margin: 20px 0;">
                                    <h4>Important Reminders:</h4>
                                    <ul>
                                        <li>Ensure you provide emergency contact details to the warden</li>
                                        <li>Return to hostel by the specified date</li>
                                        <li>Inform the office immediately upon your return</li>
                                        <li>Late return may affect future leave applications</li>
                                    </ul>
                                </div>
                            ` : ''}
                            
                            <p>If you have any questions, please contact the hostel administration.</p>
                            
                            <p>Best regards,<br>
                            HostelMate Administration</p>
                        </div>
                        
                        <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
                            This is an automated email. Please do not reply to this message.
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Leave ${status.toLowerCase()} email sent to:`, student.userId.email);
            
        } catch (error) {
            console.error(`❌ Error sending leave ${status.toLowerCase()} email:`, error);
            throw new Error(`Failed to send leave ${status.toLowerCase()} email`);
        }
    }

    // Send complaint acknowledgment and updates
    async sendComplaintNotification(student, complaint, type = 'acknowledgment') {
        try {
            let subject, content;
            
            switch (type) {
                case 'acknowledgment':
                    subject = `Complaint Received - #${complaint._id}`;
                    content = `
                        <p>We have received your complaint and our team will review it shortly.</p>
                        <p><strong>Expected Resolution:</strong> ${complaint.estimatedResolutionDate ? new Date(complaint.estimatedResolutionDate).toDateString() : 'Within 3-5 business days'}</p>
                    `;
                    break;
                case 'resolved':
                    subject = `Complaint Resolved - #${complaint._id}`;
                    content = `
                        <p>Your complaint has been <strong>resolved</strong>.</p>
                        ${complaint.adminResponse ? `
                            <div style="background-color: #e8f5e8; padding: 15px; border: 1px solid #c8e6c9; margin: 20px 0;">
                                <h4>Resolution Details:</h4>
                                <p>${complaint.adminResponse}</p>
                            </div>
                        ` : ''}
                    `;
                    break;
                case 'update':
                    subject = `Complaint Update - #${complaint._id}`;
                    content = `
                        <p>There's an update on your complaint.</p>
                        ${complaint.adminResponse ? `
                            <div style="background-color: #fff3cd; padding: 15px; border: 1px solid #ffeaa7; margin: 20px 0;">
                                <h4>Update:</h4>
                                <p>${complaint.adminResponse}</p>
                            </div>
                        ` : ''}
                    `;
                    break;
            }
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: student.userId.email,
                subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #2196F3; color: white; padding: 20px; text-align: center;">
                            <h1>Complaint ${type === 'acknowledgment' ? 'Received' : type === 'resolved' ? 'Resolved' : 'Update'}</h1>
                        </div>
                        
                        <div style="padding: 20px; background-color: #f9f9f9;">
                            <h2>Dear ${student.userId.name},</h2>
                            
                            ${content}
                            
                            <div style="background-color: white; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
                                <h3>Complaint Details:</h3>
                                <ul>
                                    <li><strong>Complaint ID:</strong> ${complaint._id}</li>
                                    <li><strong>Title:</strong> ${complaint.title}</li>
                                    <li><strong>Category:</strong> ${complaint.category}</li>
                                    <li><strong>Priority:</strong> ${complaint.priority}</li>
                                    <li><strong>Status:</strong> ${complaint.status}</li>
                                    <li><strong>Submitted:</strong> ${new Date(complaint.createdAt).toDateString()}</li>
                                </ul>
                            </div>
                            
                            <p>You can track your complaint status by logging into the HostelMate portal.</p>
                            
                            <p>Best regards,<br>
                            HostelMate Support Team</p>
                        </div>
                        
                        <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
                            This is an automated email. Please do not reply to this message.
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Complaint ${type} email sent to:`, student.userId.email);
            
        } catch (error) {
            console.error(`❌ Error sending complaint ${type} email:`, error);
            throw new Error(`Failed to send complaint ${type} email`);
        }
    }

    // Send weekly menu notification
    async sendMenuNotification(students, menu) {
        try {
            const emailPromises = students.map(async (student) => {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: student.userId.email,
                    subject: 'Weekly Menu Update - HostelMate',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background-color: #FF9800; color: white; padding: 20px; text-align: center;">
                                <h1>This Week's Menu</h1>
                                <p>Week of ${new Date(menu.weekStartDate).toDateString()}</p>
                            </div>
                            
                            <div style="padding: 20px; background-color: #f9f9f9;">
                                <h2>Dear ${student.userId.name},</h2>
                                
                                <p>The menu for this week has been updated. Here's what's on the menu:</p>
                                
                                ${Object.keys(menu.menuItems).map(day => `
                                    <div style="background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px;">
                                        <h3 style="color: #FF9800; text-transform: capitalize;">${day}</h3>
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>Breakfast:</strong></td>
                                                <td style="padding: 5px; border-bottom: 1px solid #eee;">${menu.menuItems[day].breakfast || 'Not specified'}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px; border-bottom: 1px solid #eee;"><strong>Lunch:</strong></td>
                                                <td style="padding: 5px; border-bottom: 1px solid #eee;">${menu.menuItems[day].lunch || 'Not specified'}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px;"><strong>Dinner:</strong></td>
                                                <td style="padding: 5px;">${menu.menuItems[day].dinner || 'Not specified'}</td>
                                            </tr>
                                        </table>
                                    </div>
                                `).join('')}
                                
                                <div style="background-color: #e3f2fd; padding: 15px; border: 1px solid #2196F3; margin: 20px 0;">
                                    <h4>Reminder:</h4>
                                    <p>Don't forget to book your meals in advance through the HostelMate app!</p>
                                </div>
                                
                                <p>Enjoy your meals!</p>
                                
                                <p>Best regards,<br>
                                HostelMate Kitchen Team</p>
                            </div>
                            
                            <div style="background-color: #333; color: white; padding: 10px; text-align: center; font-size: 12px;">
                                This is an automated email. Please do not reply to this message.
                            </div>
                        </div>
                    `
                };

                return this.transporter.sendMail(mailOptions);
            });

            await Promise.all(emailPromises);
            console.log(`✅ Menu notification emails sent to ${students.length} students`);
            
        } catch (error) {
            console.error('❌ Error sending menu notification emails:', error);
            throw new Error('Failed to send menu notification emails');
        }
    }

    // Test email configuration
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service is ready');
            return true;
        } catch (error) {
            console.error('❌ Email service configuration error:', error);
            return false;
        }
    }
}

module.exports = new EmailService();
