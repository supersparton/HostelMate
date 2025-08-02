import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { studentService } from '../../services/studentService';
import Navigation from '../../components/layout/Navigation.jsx';
import { 
  User, 
  Camera, 
  Edit3, 
  Save, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Home, 
  School, 
  Heart, 
  Users, 
  AlertCircle,
  Upload,
  Trash2,
  Check,
  UserCheck,
  Building,
  Bed
} from 'lucide-react';

const StudentProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showImageUpload, setShowImageUpload] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch profile data
  const { data: profileData, isLoading, error } = useQuery(
    ['student', 'profile'],
    () => studentService.getProfile(),
    {
      onSuccess: (data) => {
        // Try multiple possible paths for the profile data
        let profile = null;
        
        if (data?.data?.data?.profile) {
          profile = data.data.data.profile;
        } else if (data?.data?.profile) {
          profile = data.data.profile;
        } else if (data?.profile) {
          profile = data.profile;
        }
        
        setEditData(profile || {});
      },
      onError: (error) => {
        console.error('Error fetching profile:', error);
      }
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (profileData) => studentService.updateProfile(profileData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['student', 'profile']);
        setIsEditing(false);
        alert('Profile updated successfully!');
      },
      onError: (error) => {
        alert('Error updating profile: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  // Upload profile picture mutation
  const uploadPictureMutation = useMutation(
    (file) => studentService.uploadProfilePicture(file),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['student', 'profile']);
        setShowImageUpload(false);
        alert('Profile picture updated successfully!');
      },
      onError: (error) => {
        console.error('Error uploading picture:', error);
        alert('Error uploading picture: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  // Delete profile picture mutation
  const deletePictureMutation = useMutation(
    () => studentService.deleteProfilePicture(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['student', 'profile']);
        alert('Profile picture deleted successfully!');
      },
      onError: (error) => {
        console.error('Error deleting picture:', error);
        alert('Error deleting picture: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = () => {
    if (!editData) return;
    
    const updatePayload = {
      address: editData.address,
      alternatePhone: editData.alternatePhone,
      parentName: editData.parentName,
      parentPhone: editData.parentPhone,
      emergencyContact: editData.emergencyContact,
      collegeName: editData.collegeName,
      department: editData.department,
      dateOfBirth: editData.dateOfBirth,
      bloodGroup: editData.bloodGroup,
      nationality: editData.nationality,
      guardianName: editData.guardianName,
      guardianPhone: editData.guardianPhone,
      guardianRelation: editData.guardianRelation
    };

    updateProfileMutation.mutate(updatePayload);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      uploadPictureMutation.mutate(file);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Error loading profile</p>
            <p className="text-gray-500 text-sm mt-2">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Access the profile data with fallback paths
  let profile = null;
  if (profileData?.data?.data?.profile) {
    profile = profileData.data.data.profile;
  } else if (profileData?.data?.profile) {
    profile = profileData.data.profile;
  } else if (profileData?.profile) {
    profile = profileData.profile;
  }
  
  const currentData = isEditing ? editData : profile;

  // Show message if no profile data is available
  if (!isLoading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <p className="text-orange-600">No profile data found</p>
            <p className="text-gray-500 text-sm mt-2">Please contact support if this issue persists</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
                  {profile?.profilePicture?.secure_url ? (
                    <img
                      src={profile.profilePicture.secure_url}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Camera Icon */}
                <button
                  onClick={() => setShowImageUpload(true)}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Basic Info */}
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {profile?.userId?.name || 'Student Name'}
                </h2>
                <p className="text-blue-100 mb-1">Student ID: {profile?.studentId}</p>
                <p className="text-blue-100 mb-1">Email: {profile?.userId?.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
                  {profile?.roomNumber && (
                    <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      Room {profile.roomNumber}{profile.bedLetter}
                    </span>
                  )}
                  <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <School className="w-4 h-4" />
                    Year {profile?.year}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <div className="md:ml-auto">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={updateProfileMutation.isLoading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {updateProfileMutation.isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditData(profile);
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={currentData?.userId?.phone || ''}
                        onChange={(e) => handleInputChange('userId.phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        pattern="[0-9]{10}"
                        maxLength="10"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {profile?.userId?.phone || 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Alternate Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alternate Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={currentData?.alternatePhone || ''}
                        onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        pattern="[0-9]{10}"
                        maxLength="10"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        {profile?.alternatePhone || 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formatDateForInput(currentData?.dateOfBirth)}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {formatDate(profile?.dateOfBirth) || 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group
                    </label>
                    {isEditing ? (
                      <select
                        value={currentData?.bloodGroup || ''}
                        onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-gray-500" />
                        {profile?.bloodGroup || 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nationality
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentData?.nationality || ''}
                        onChange={(e) => handleInputChange('nationality', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile?.nationality || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic & Hostel Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Academic & Hostel Information
                </h3>
                <div className="space-y-4">
                  {/* College Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      College Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentData?.collegeName || ''}
                        onChange={(e) => handleInputChange('collegeName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your college name"
                      />
                    ) : (
                      <p className="text-gray-900 flex items-center gap-2">
                        <School className="w-4 h-4 text-gray-500" />
                        {profile?.collegeName || 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentData?.department || ''}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Computer Science, Engineering"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {profile?.department || 'Not provided'}
                      </p>
                    )}
                  </div>

                  {/* Course and Year (Read-only) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course
                      </label>
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        {profile?.course || 'Not assigned'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                        Year {profile?.year || 'Not assigned'}
                      </p>
                    </div>
                  </div>

                  {/* Room Information (Read-only) */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Bed className="w-4 h-4" />
                      Hostel Accommodation
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700">Room Number:</span>
                        <p className="font-medium">{profile?.roomNumber || 'Not assigned'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700">Bed:</span>
                        <p className="font-medium">{profile?.bedLetter || 'Not assigned'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Street */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData?.address?.street || ''}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter street address"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profile?.address?.street || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData?.address?.city || ''}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profile?.address?.city || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData?.address?.state || ''}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter state"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profile?.address?.state || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={currentData?.address?.pincode || ''}
                      onChange={(e) => handleInputChange('address.pincode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter pincode"
                      pattern="[0-9]{6}"
                      maxLength="6"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profile?.address?.pincode || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Emergency Contacts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parent Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-3">Parent Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Parent Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={currentData?.parentName || ''}
                          onChange={(e) => handleInputChange('parentName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.parentName || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-1">
                        Parent Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={currentData?.parentPhone || ''}
                          onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          pattern="[0-9]{10}"
                          maxLength="10"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.parentPhone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-3">Guardian Information</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">
                        Guardian Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={currentData?.guardianName || ''}
                          onChange={(e) => handleInputChange('guardianName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.guardianName || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">
                        Guardian Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={currentData?.guardianPhone || ''}
                          onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          pattern="[0-9]{10}"
                          maxLength="10"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.guardianPhone || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">
                        Relation
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={currentData?.guardianRelation || ''}
                          onChange={(e) => handleInputChange('guardianRelation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., Uncle, Aunt, Sibling"
                        />
                      ) : (
                        <p className="text-gray-900">{profile?.guardianRelation || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={currentData?.emergencyContact || ''}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Emergency contact number"
                    pattern="[0-9]{10}"
                    maxLength="10"
                  />
                ) : (
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-red-500" />
                    {profile?.emergencyContact || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload Modal */}
        {showImageUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Update Profile Picture</h3>
                  <button
                    onClick={() => setShowImageUpload(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Upload Button */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadPictureMutation.isLoading}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      {uploadPictureMutation.isLoading ? 'Uploading...' : 'Choose Image'}
                    </button>
                  </div>

                  {/* Delete Button */}
                  {profile?.profilePicture?.secure_url && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete your profile picture?')) {
                          deletePictureMutation.mutate();
                          setShowImageUpload(false);
                        }
                      }}
                      disabled={deletePictureMutation.isLoading}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      {deletePictureMutation.isLoading ? 'Deleting...' : 'Delete Picture'}
                    </button>
                  )}

                  <p className="text-sm text-gray-500 text-center">
                    Supported formats: JPG, PNG, GIF (Max 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
