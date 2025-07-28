# MongoDB Atlas Setup Guide for HostelMate

This guide will help you set up MongoDB Atlas for your HostelMate application.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Start Free" or "Sign Up"
3. Create your account with email and password
4. Verify your email address

## Step 2: Create a New Cluster

1. After logging in, click "Create a New Cluster"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select a cloud provider and region (choose the closest to your location)
4. Give your cluster a name (e.g., "HostelMate-Cluster")
5. Click "Create Cluster" (this may take 1-3 minutes)

## Step 3: Create Database User

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication method
4. Enter a username (e.g., `hostelmate-user`)
5. Enter a strong password (save this password!)
6. Under "Database User Privileges", select "Read and write to any database"
7. Click "Add User"

## Step 4: Configure Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development, you can click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: For production, you should specify your specific IP addresses
4. Click "Confirm"

## Step 5: Get Connection String

1. Go back to "Clusters" in the left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as driver and version "4.1 or later"
5. Copy the connection string (it will look like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your .env File

1. Open the `backend/.env` file in your project
2. Replace the placeholder values in the MONGODB_URI with your actual credentials:

```env
# Before (placeholder):
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/hostelmate?retryWrites=true&w=majority

# After (with your actual values):
MONGODB_URI=mongodb+srv://hostelmate-user:your-password@cluster0.xxxxx.mongodb.net/hostelmate?retryWrites=true&w=majority
```

**Important**: 
- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Replace `<cluster-url>` with your actual cluster URL
- Make sure to include `/hostelmate` before the `?` to specify the database name

## Step 7: Test Connection

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. You should see:
   ```
   ✅ Connected to MongoDB Atlas
   🚀 Initializing HostelMate services...
   ✅ All services initialized successfully
   🚀 HostelMate Backend Server running on port 5000
   ```

## Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Double-check your username and password
   - Make sure there are no special characters that need URL encoding

2. **Network Timeout**
   - Check your Network Access settings in MongoDB Atlas
   - Make sure your IP address is whitelisted

3. **Database Connection Error**
   - Verify your connection string format
   - Make sure you included the database name (`/hostelmate`)

4. **Special Characters in Password**
   - If your password contains special characters, you may need to URL encode them:
     - `@` becomes `%40`
     - `#` becomes `%23`
     - `$` becomes `%24`
     - etc.

### Example Working Connection String:
```
mongodb+srv://hostelmate-user:MyPassword123@cluster0.abcde.mongodb.net/hostelmate?retryWrites=true&w=majority
```

## Security Best Practices

1. **Never commit your .env file to version control**
   - Add `.env` to your `.gitignore` file

2. **Use strong passwords**
   - Mix of uppercase, lowercase, numbers, and symbols

3. **Restrict IP access in production**
   - Only allow IPs that need access to your database

4. **Create separate users for different environments**
   - Different users for development, staging, and production

## Next Steps

Once your MongoDB Atlas connection is working:

1. Test your APIs using the provided test script:
   ```bash
   node test-apis.js
   ```

2. Your database will be automatically populated with:
   - Default admin user
   - 200 hostel rooms (numbered 101-320)
   - Initial data structures

3. You can view your data in MongoDB Atlas by going to "Browse Collections"

## Support

If you encounter any issues:
1. Check the server logs for detailed error messages
2. Verify your connection string format
3. Ensure your MongoDB Atlas cluster is running
4. Contact MongoDB Atlas support if needed

Happy coding! 🚀
