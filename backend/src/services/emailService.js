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

    // Send admission acceptance email with login credentials
    async sendAdmissionAcceptance(applicantData, roomDetails, loginCredentials) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: applicantData.email,
                subject: '🎉 Congratulations! Your Hostel Admission is Approved - Welcome to HostelMate!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
                            <p style="margin: 10px 0 0 0; font-size: 18px;">Your Hostel Admission is Approved</p>
                        </div>
                        
                        <div style="padding: 30px; background-color: #f9f9f9;">
                            <h2 style="color: #333; margin-top: 0;">Dear ${applicantData.name},</h2>
                            
                            <p style="font-size: 16px; line-height: 1.6; color: #555;">
                                We are delighted to inform you that your hostel admission application has been <strong style="color: #4CAF50;">APPROVED</strong>! 
                                Welcome to the HostelMate family.
                            </p>
                            
                            <div style="background-color: white; padding: 20px; border-left: 4px solid #4CAF50; margin: 25px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3 style="color: #4CAF50; margin-top: 0;">🏠 Your Room Assignment</h3>
                                <div style="display: grid; gap: 8px;">
                                    <p style="margin: 0;"><strong>Student ID:</strong> ${applicantData.studentId}</p>
                                    <p style="margin: 0;"><strong>Room Number:</strong> ${roomDetails.roomNumber}</p>
                                    <p style="margin: 0;"><strong>Bed:</strong> ${roomDetails.bedLetter}</p>
                                    <p style="margin: 0;"><strong>Floor:</strong> ${roomDetails.floor}</p>
                                    <p style="margin: 0;"><strong>Wing:</strong> ${roomDetails.wing}</p>
                                </div>
                            </div>

                            <div style="background-color: #e8f5e8; padding: 20px; border: 1px solid #4CAF50; margin: 25px 0; border-radius: 4px;">
                                <h3 style="color: #2e7d32; margin-top: 0;">🔐 Your HostelMate Login Credentials</h3>
                                <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
                                    <p style="margin: 0 0 10px 0;"><strong>Username:</strong> <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 3px; font-family: monospace;">${loginCredentials.email}</code></p>
                                    <p style="margin: 0;"><strong>Password:</strong> <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 3px; font-family: monospace;">${loginCredentials.password}</code></p>
                                </div>
                                <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
                                    <strong>Important:</strong> Please change your password after your first login for security.
                                </p>
                            </div>
                            
                            <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 25px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3 style="color: #333; margin-top: 0;">📋 Next Steps</h3>
                                <ol style="line-height: 1.8; color: #555;">
                                    <li><strong>Report to Hostel Office</strong> within 7 days with:
                                        <ul style="margin: 10px 0; padding-left: 20px;">
                                            <li>This admission email (printed copy)</li>
                                            <li>Original ID proof (Aadhar/Passport)</li>
                                            <li>Fee payment receipt</li>
                                            <li>Medical certificate</li>
                                            <li>Passport-size photographs (2 copies)</li>
                                        </ul>
                                    </li>
                                    <li><strong>Complete check-in process</strong> and collect your room keys</li>
                                    <li><strong>Receive your hostel ID card</strong> and access cards</li>
                                    <li><strong>Login to HostelMate portal</strong> using the credentials above</li>
                                    <li><strong>Complete your profile</strong> and upload required documents</li>
                                </ol>
                            </div>
                            
                            <div style="background-color: #fff3cd; padding: 20px; border: 1px solid #ffc107; margin: 25px 0; border-radius: 4px;">
                                <h4 style="color: #856404; margin-top: 0;">⚠️ Important Notice</h4>
                                <p style="margin: 0; color: #856404; line-height: 1.6;">
                                    Please report to the hostel office within <strong>7 days</strong> of receiving this email. 
                                    Failure to complete check-in within this timeframe may result in cancellation of your admission 
                                    and your room may be allocated to another student.
                                </p>
                            </div>
                            
                            <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 25px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3 style="color: #333; margin-top: 0;">📞 Contact Information</h3>
                                <div style="line-height: 1.8; color: #555;">
                                    <p style="margin: 0;"><strong>Hostel Office:</strong> ${process.env.HOSTEL_PHONE || '+91-XXX-XXX-XXXX'}</p>
                                    <p style="margin: 0;"><strong>Email:</strong> ${process.env.ADMIN_EMAIL || 'admin@hostelmate.com'}</p>
                                    <p style="margin: 0;"><strong>Office Hours:</strong> 9:00 AM - 6:00 PM (Monday to Saturday)</p>
                                    <p style="margin: 0;"><strong>Emergency Contact:</strong> ${process.env.EMERGENCY_CONTACT || '+91-XXX-XXX-XXXX'}</p>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <p style="font-size: 18px; color: #4CAF50; font-weight: bold;">Welcome to HostelMate! 🏠</p>
                                <p style="color: #666; line-height: 1.6;">
                                    We're excited to provide you with a comfortable, secure, and enriching living experience. 
                                    Our team is here to support you throughout your stay.
                                </p>
                            </div>
                            
                            <p style="margin-bottom: 0; color: #333;">
                                Best regards,<br>
                                <strong>The HostelMate Administration Team</strong>
                            </p>
                        </div>
                        
                        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                            <p style="margin: 0;">This is an automated email. Please do not reply to this message.</p>
                            <p style="margin: 5px 0 0 0;">For support, please contact us through the official channels mentioned above.</p>
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Admission acceptance email sent to:', applicantData.email);
            
        } catch (error) {
            console.error('❌ Error sending admission acceptance email:', error);
            throw new Error('Failed to send admission acceptance email');
        }
    }

    // Send leave application approval email with QR codes
    async sendLeaveApprovalEmail(userEmail, studentData, leaveData, qrCodes) {
        try {
            const formatDate = (date) => {
                return new Date(date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: '✅ Leave Application Approved - QR Codes Attached',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px;">🎉 Leave Application Approved!</h1>
                            <p style="margin: 10px 0 0 0; font-size: 18px;">Your leave request has been successfully approved</p>
                        </div>
                        
                        <div style="padding: 30px; background-color: #f9f9f9;">
                            <h2 style="color: #333; margin-top: 0;">Dear ${studentData.name},</h2>
                            
                            <p style="font-size: 16px; line-height: 1.6; color: #555;">
                                Congratulations! Your leave application has been <strong style="color: #4CAF50;">APPROVED</strong> by the administration.
                            </p>
                            
                            <div style="background-color: white; padding: 20px; border-left: 4px solid #4CAF50; margin: 25px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3 style="color: #4CAF50; margin-top: 0;">📋 Leave Details</h3>
                                <div style="display: grid; gap: 8px;">
                                    <p style="margin: 0;"><strong>Leave Type:</strong> ${leaveData.leaveType}</p>
                                    <p style="margin: 0;"><strong>From Date:</strong> ${formatDate(leaveData.fromDate)}</p>
                                    <p style="margin: 0;"><strong>To Date:</strong> ${formatDate(leaveData.toDate)}</p>
                                    <p style="margin: 0;"><strong>Total Days:</strong> ${leaveData.totalDays} days</p>
                                    <p style="margin: 0;"><strong>Reason:</strong> ${leaveData.reason}</p>
                                    ${leaveData.adminComments ? `<p style="margin: 0;"><strong>Admin Comments:</strong> ${leaveData.adminComments}</p>` : ''}
                                </div>
                            </div>

                            <div style="background-color: #fff3cd; padding: 20px; border: 1px solid #ffc107; margin: 25px 0; border-radius: 4px;">
                                <h3 style="color: #856404; margin-top: 0;">⚠️ Important Instructions</h3>
                                <ul style="margin: 0; color: #856404;">
                                    <li>Save both QR codes below to your phone</li>
                                    <li>Show the <strong>EXIT QR Code</strong> to security when leaving the hostel</li>
                                    <li>Show the <strong>ENTRY QR Code</strong> to security when returning</li>
                                    <li>QR codes are valid for 24 hours from the respective dates</li>
                                    <li>Each QR code can only be used once</li>
                                </ul>
                            </div>

                            <div style="background-color: white; padding: 20px; border-left: 4px solid #ff6b6b; margin: 25px 0; border-radius: 4px; text-align: center;">
                                <h3 style="color: #dc3545; margin-top: 0;">🚪 EXIT QR Code (Show when leaving hostel)</h3>
                                <p style="margin: 10px 0;"><strong>Valid from:</strong> ${formatDate(leaveData.fromDate)}</p>
                                <img src="${qrCodes.entryQR.qrCode}" alt="Exit QR Code" style="max-width: 200px; border: 2px solid #ddd; border-radius: 8px; margin: 10px 0;" />
                                <p style="margin: 0; color: #dc3545; font-weight: bold;">${qrCodes.entryQR.purpose}</p>
                            </div>

                            <div style="background-color: white; padding: 20px; border-left: 4px solid #28a745; margin: 25px 0; border-radius: 4px; text-align: center;">
                                <h3 style="color: #28a745; margin-top: 0;">🏠 ENTRY QR Code (Show when returning to hostel)</h3>
                                <p style="margin: 10px 0;"><strong>Valid from:</strong> ${formatDate(leaveData.toDate)}</p>
                                <img src="${qrCodes.exitQR.qrCode}" alt="Entry QR Code" style="max-width: 200px; border: 2px solid #ddd; border-radius: 8px; margin: 10px 0;" />
                                <p style="margin: 0; color: #28a745; font-weight: bold;">${qrCodes.exitQR.purpose}</p>
                            </div>

                            <div style="background-color: #d1ecf1; padding: 20px; border: 1px solid #bee5eb; margin: 25px 0; border-radius: 4px;">
                                <h3 style="color: #0c5460; margin-top: 0;">📱 How to Use</h3>
                                <ol style="margin: 0; color: #0c5460;">
                                    <li>Save this email or take screenshots of the QR codes</li>
                                    <li>When leaving: Show EXIT QR code to security</li>
                                    <li>When returning: Show ENTRY QR code to security</li>
                                    <li>Keep your student ID card with you at all times</li>
                                </ol>
                            </div>

                            <p style="font-size: 16px; color: #555;">Have a safe trip and return on time!</p>
                            
                            <p style="font-size: 16px; color: #333;">
                                Best regards,<br>
                                <strong>Hostel Administration Team</strong>
                            </p>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; border-top: 1px solid #dee2e6;">
                            <p style="margin: 0;">This is an automated email. For queries, contact the hostel office.</p>
                            <p style="margin: 10px 0 0 0;">© 2024 Hostel Management System</p>
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Leave approval email sent to:', userEmail);
            
        } catch (error) {
            console.error('❌ Error sending leave approval email:', error);
            throw new Error('Failed to send leave approval email');
        }
    }

    // Send leave application rejection email
    async sendLeaveRejectionEmail(userEmail, studentData, leaveData, rejectionReason) {
        try {
            const formatDate = (date) => {
                return new Date(date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            };

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: '📋 Leave Application Status - Review Required',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a52); color: white; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px;">📋 Leave Application Status</h1>
                            <p style="margin: 10px 0 0 0; font-size: 18px;">Regarding your recent leave request</p>
                        </div>
                        
                        <div style="padding: 30px; background-color: #f9f9f9;">
                            <h2 style="color: #333; margin-top: 0;">Dear ${studentData.name},</h2>
                            
                            <p style="font-size: 16px; line-height: 1.6; color: #555;">
                                Thank you for submitting your leave application. After careful consideration, we regret to inform you that your leave request cannot be approved at this time.
                            </p>
                            
                            <div style="background-color: white; padding: 20px; border-left: 4px solid #ffc107; margin: 25px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3 style="color: #856404; margin-top: 0;">📋 Your Leave Request</h3>
                                <div style="display: grid; gap: 8px;">
                                    <p style="margin: 0;"><strong>Leave Type:</strong> ${leaveData.leaveType}</p>
                                    <p style="margin: 0;"><strong>Requested From:</strong> ${formatDate(leaveData.fromDate)}</p>
                                    <p style="margin: 0;"><strong>Requested To:</strong> ${formatDate(leaveData.toDate)}</p>
                                    <p style="margin: 0;"><strong>Total Days:</strong> ${leaveData.totalDays} days</p>
                                    <p style="margin: 0;"><strong>Reason:</strong> ${leaveData.reason}</p>
                                </div>
                            </div>

                            <div style="background-color: #f8d7da; padding: 20px; border: 1px solid #f5c6cb; margin: 25px 0; border-radius: 4px;">
                                <h3 style="color: #721c24; margin-top: 0;">❌ Reason for Rejection</h3>
                                <p style="margin: 0; color: #721c24;">
                                    ${rejectionReason || leaveData.adminComments || 'Administrative decision - please contact the hostel office for more details.'}
                                </p>
                            </div>

                            <div style="background-color: #d1ecf1; padding: 20px; border: 1px solid #bee5eb; margin: 25px 0; border-radius: 4px;">
                                <h3 style="color: #0c5460; margin-top: 0;">🔄 Next Steps</h3>
                                <ul style="margin: 0; color: #0c5460;">
                                    <li>You may reapply with modified dates if circumstances allow</li>
                                    <li>Contact the hostel office for clarification on the rejection reason</li>
                                    <li>For urgent matters, please speak directly with the hostel warden</li>
                                    <li>Emergency leave requests should be made through proper channels</li>
                                </ul>
                            </div>

                            <p style="font-size: 16px; color: #555;">
                                We understand this may be disappointing, and we encourage you to reach out if you have any questions or would like to discuss alternative arrangements.
                            </p>
                            
                            <p style="font-size: 16px; color: #333;">
                                Thank you for your understanding.<br><br>
                                Best regards,<br>
                                <strong>Hostel Administration Team</strong>
                            </p>
                        </div>
                        
                        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; border-top: 1px solid #dee2e6;">
                            <p style="margin: 0;">For questions or appeals, please contact the hostel office during business hours.</p>
                            <p style="margin: 10px 0 0 0;">© 2024 Hostel Management System</p>
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Leave rejection email sent to:', userEmail);
            
        } catch (error) {
            console.error('❌ Error sending leave rejection email:', error);
            throw new Error('Failed to send leave rejection email');
        }
    }

    // Send admission rejection email
    async sendAdmissionRejection(applicantData, reason) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: applicantData.email,
                subject: '📋 Hostel Admission Application Status Update',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #f44336, #d32f2f); color: white; padding: 30px; text-align: center;">
                            <h1 style="margin: 0; font-size: 28px;">📋 Application Status Update</h1>
                            <p style="margin: 10px 0 0 0; font-size: 18px;">Hostel Admission Decision</p>
                        </div>
                        
                        <div style="padding: 30px; background-color: #f9f9f9;">
                            <h2 style="color: #333; margin-top: 0;">Dear ${applicantData.name},</h2>
                            
                            <p style="font-size: 16px; line-height: 1.6; color: #555;">
                                Thank you for your interest in HostelMate and for taking the time to submit your hostel admission application. 
                                After careful consideration of all applications, we regret to inform you that we are unable to approve 
                                your application at this time.
                            </p>
                            
                            ${reason ? `
                                <div style="background-color: white; padding: 20px; border-left: 4px solid #f44336; margin: 25px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    <h3 style="color: #f44336; margin-top: 0;">📝 Review Comments</h3>
                                    <p style="margin: 0; color: #555; line-height: 1.6;">${reason}</p>
                                </div>
                            ` : ''}
                            
                            <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 25px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3 style="color: #333; margin-top: 0;">🔄 What's Next?</h3>
                                <ul style="line-height: 1.8; color: #555; padding-left: 20px;">
                                    <li><strong>Reapply Next Cycle:</strong> You may reapply for the next admission cycle when applications open</li>
                                    <li><strong>Waiting List:</strong> Consider joining our waiting list for any last-minute openings</li>
                                    <li><strong>Alternative Options:</strong> Contact our admission office for guidance on alternative accommodation options</li>
                                    <li><strong>Application Improvement:</strong> Request feedback to strengthen your future applications</li>
                                </ul>
                            </div>
                            
                            <div style="background-color: #e3f2fd; padding: 20px; border: 1px solid #2196f3; margin: 25px 0; border-radius: 4px;">
                                <h4 style="color: #1976d2; margin-top: 0;">💡 Future Opportunities</h4>
                                <p style="margin: 0; color: #1976d2; line-height: 1.6;">
                                    We encourage you to stay in touch with us. Many students successfully gain admission in subsequent cycles. 
                                    Please don't hesitate to reach out if you have any questions about improving your application.
                                </p>
                            </div>
                            
                            <div style="background-color: white; padding: 20px; border-radius: 4px; margin: 25px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <h3 style="color: #333; margin-top: 0;">📞 Contact Information</h3>
                                <div style="line-height: 1.8; color: #555;">
                                    <p style="margin: 0;"><strong>Admission Office:</strong> ${process.env.HOSTEL_PHONE || '+91-XXX-XXX-XXXX'}</p>
                                    <p style="margin: 0;"><strong>Email:</strong> ${process.env.ADMIN_EMAIL || 'admin@hostelmate.com'}</p>
                                    <p style="margin: 0;"><strong>Office Hours:</strong> 9:00 AM - 6:00 PM (Monday to Saturday)</p>
                                </div>
                                <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
                                    If you have any questions or would like feedback on your application, please don't hesitate to contact us.
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <p style="color: #666; line-height: 1.6;">
                                    We appreciate your interest in HostelMate and wish you the very best in finding suitable accommodation. 
                                    Thank you for considering us for your hostel needs.
                                </p>
                            </div>
                            
                            <p style="margin-bottom: 0; color: #333;">
                                Best regards,<br>
                                <strong>The HostelMate Admission Team</strong>
                            </p>
                        </div>
                        
                        <div style="background-color: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
                            <p style="margin: 0;">This is an automated email. Please do not reply to this message.</p>
                            <p style="margin: 5px 0 0 0;">For inquiries, please contact us through the official channels mentioned above.</p>
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Admission rejection email sent to:', applicantData.email);
            
        } catch (error) {
            console.error('❌ Error sending admission rejection email:', error);
            throw new Error('Failed to send admission rejection email');
        }
    }

    // Send leave application status update
    async sendLeaveApplicationUpdate(studentEmail, studentName, leaveApplication, status) {
        try {
            const statusColor = status === 'APPROVED' ? '#4CAF50' : '#f44336';
            const statusText = status === 'APPROVED' ? 'Approved' : 'Rejected';
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: studentEmail,
                subject: `Leave Application ${statusText} - ${leaveApplication._id}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center;">
                            <h1>Leave Application ${statusText}</h1>
                        </div>
                        
                        <div style="padding: 20px; background-color: #f9f9f9;">
                            <h2>Dear ${studentName},</h2>
                            
                            <p>Your leave application has been <strong>${statusText.toLowerCase()}</strong>.</p>
                            
                            <div style="background-color: white; padding: 15px; border-left: 4px solid ${statusColor}; margin: 20px 0;">
                                <h3>Leave Details:</h3>
                                <ul>
                                    <li><strong>Leave Type:</strong> ${leaveApplication.leaveType}</li>
                                    <li><strong>From:</strong> ${new Date(leaveApplication.startDate).toLocaleDateString()}</li>
                                    <li><strong>To:</strong> ${new Date(leaveApplication.endDate).toLocaleDateString()}</li>
                                    <li><strong>Reason:</strong> ${leaveApplication.reason}</li>
                                </ul>
                            </div>
                            
                            ${leaveApplication.adminComments ? `
                                <div style="background-color: white; padding: 15px; border: 1px solid #ddd; margin: 20px 0;">
                                    <h3>Admin Comments:</h3>
                                    <p>${leaveApplication.adminComments}</p>
                                </div>
                            ` : ''}
                            
                            <p>If you have any questions, please contact the hostel administration.</p>
                            
                            <p>Best regards,<br>
                            HostelMate Administration</p>
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Leave application status email sent to:', studentEmail);
            
        } catch (error) {
            console.error('❌ Error sending leave application status email:', error);
            throw new Error('Failed to send leave application status email');
        }
    }

    // Send complaint status update
    async sendComplaintUpdate(studentEmail, studentName, complaint, status) {
        try {
            const statusColor = status === 'RESOLVED' ? '#4CAF50' : '#ff9800';
            
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: studentEmail,
                subject: `Complaint Status Update - ${complaint._id}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: ${statusColor}; color: white; padding: 20px; text-align: center;">
                            <h1>Complaint Status Update</h1>
                        </div>
                        
                        <div style="padding: 20px; background-color: #f9f9f9;">
                            <h2>Dear ${studentName},</h2>
                            
                            <p>Your complaint has been updated to: <strong>${status}</strong></p>
                            
                            <div style="background-color: white; padding: 15px; border-left: 4px solid ${statusColor}; margin: 20px 0;">
                                <h3>Complaint Details:</h3>
                                <ul>
                                    <li><strong>Category:</strong> ${complaint.category}</li>
                                    <li><strong>Subject:</strong> ${complaint.subject}</li>
                                    <li><strong>Status:</strong> ${status}</li>
                                    <li><strong>Priority:</strong> ${complaint.priority}</li>
                                </ul>
                            </div>
                            
                            ${complaint.adminResponse ? `
                                <div style="background-color: white; padding: 15px; border: 1px solid #ddd; margin: 20px 0;">
                                    <h3>Admin Response:</h3>
                                    <p>${complaint.adminResponse}</p>
                                </div>
                            ` : ''}
                            
                            <p>Thank you for your patience. If you have any further questions, please don't hesitate to contact us.</p>
                            
                            <p>Best regards,<br>
                            HostelMate Administration</p>
                        </div>
                    </div>
                `
            };

            await this.transporter.sendMail(mailOptions);
            console.log('✅ Complaint status email sent to:', studentEmail);
            
        } catch (error) {
            console.error('❌ Error sending complaint status email:', error);
            throw new Error('Failed to send complaint status email');
        }
    }

    // Test email configuration
    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service connection verified');
            return true;
        } catch (error) {
            console.error('❌ Email service connection failed:', error);
            return false;
        }
    }
}

module.exports = new EmailService();