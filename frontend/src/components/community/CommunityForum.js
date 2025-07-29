import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { studentService } from '../../services/studentService';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import Navigation from '../layout/Navigation.jsx';
import { 
  MessageSquare, 
  Plus, 
  ArrowUp, 
  ArrowDown,
  MessageCircle,
  Clock,
  User,
  Tag,
  Search,
  Filter,
  XCircle,
  Edit,
  Trash2,
  Shield,
  Send
} from 'lucide-react';

const CommunityForum = () => {
  const { user, isAdmin } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedComments, setExpandedComments] = useState({});
  const [newComments, setNewComments] = useState({});
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'DISCUSSION',
    category: 'GENERAL',
    isAnonymous: false
  });

  // Choose service based on user type
  const service = isAdmin() ? adminService : studentService;

  // Fetch community posts
  const { data: postsData, isLoading, error } = useQuery(
    ['community', 'posts'],
    () => service.getCommunityPosts(),
    {
      onSuccess: (data) => {
        console.log('Community posts data received:', data);
      },
      onError: (error) => {
        console.error('Error fetching community posts:', error);
      },
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  );

  // Create post mutation
  const createPostMutation = useMutation(
    (postData) => service.createCommunityPost(postData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['community', 'posts']);
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          type: 'DISCUSSION',
          category: 'GENERAL',
          isAnonymous: false
        });
        alert('Post created successfully!');
      },
      onError: (error) => {
        console.error('Error creating post:', error);
        alert('Error creating post: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  // Vote mutation
  const voteMutation = useMutation(
    ({ postId, voteType }) => service.voteCommunityPost(postId, voteType),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['community', 'posts']);
      },
      onError: (error) => {
        console.error('Error voting:', error);
        alert('Error voting: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  // Comment mutation
  const commentMutation = useMutation(
    ({ postId, comment }) => service.commentCommunityPost(postId, comment),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['community', 'posts']);
        setNewComments(prev => ({
          ...prev,
          [variables.postId]: ''
        }));
      },
      onError: (error) => {
        console.error('Error commenting:', error);
        alert('Error adding comment: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  // Delete post mutation (admin only)
  const deletePostMutation = useMutation(
    (postId) => adminService.deletePost(postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['community', 'posts']);
        alert('Post deleted successfully!');
      },
      onError: (error) => {
        console.error('Error deleting post:', error);
        alert('Error deleting post: ' + (error.response?.data?.message || error.message));
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    createPostMutation.mutate(formData);
  };

  const handleVote = (postId, voteType) => {
    voteMutation.mutate({ postId, voteType });
  };

  const handleComment = (postId) => {
    const comment = newComments[postId];
    if (!comment || comment.trim().length === 0) {
      alert('Please enter a comment');
      return;
    }

    commentMutation.mutate({ postId, comment });
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SUGGESTION': return 'text-blue-600 bg-blue-100';
      case 'PROBLEM': return 'text-red-600 bg-red-100';
      case 'SOLUTION': return 'text-green-600 bg-green-100';
      case 'DISCUSSION': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'FOOD': return 'text-orange-600 bg-orange-100';
      case 'FACILITIES': return 'text-blue-600 bg-blue-100';
      case 'RULES': return 'text-red-600 bg-red-100';
      case 'EVENTS': return 'text-green-600 bg-green-100';
      case 'MAINTENANCE': return 'text-yellow-600 bg-yellow-100';
      case 'GENERAL': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const posts = postsData?.data?.data?.posts || [];
  
  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesType = filterType === 'ALL' || post.type === filterType;
    const matchesCategory = filterCategory === 'ALL' || post.category === filterCategory;
    const matchesSearch = searchTerm === '' || 
                         post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading community posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Error loading community posts</p>
            <p className="text-gray-500 text-sm mt-2">{error.message}</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Forum</h1>
          <p className="text-gray-600">Connect, share, and discuss with your hostel community</p>
        </div>

        {/* Filters and Create Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Types</option>
                <option value="DISCUSSION">Discussion</option>
                <option value="SUGGESTION">Suggestion</option>
                <option value="PROBLEM">Problem</option>
                <option value="SOLUTION">Solution</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Categories</option>
                <option value="GENERAL">General</option>
                <option value="FOOD">Food</option>
                <option value="FACILITIES">Facilities</option>
                <option value="RULES">Rules</option>
                <option value="EVENTS">Events</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </div>

            {/* Create Post Button */}
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Create Post
            </button>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      maxLength={150}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter post title"
                    />
                  </div>

                  {/* Type and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type *
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="DISCUSSION">Discussion</option>
                        <option value="SUGGESTION">Suggestion</option>
                        <option value="PROBLEM">Problem</option>
                        <option value="SOLUTION">Solution</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="GENERAL">General</option>
                        <option value="FOOD">Food</option>
                        <option value="FACILITIES">Facilities</option>
                        <option value="RULES">Rules</option>
                        <option value="EVENTS">Events</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      maxLength={2000}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe your post in detail..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description.length}/2000 characters
                    </p>
                  </div>

                  {/* Anonymous Option */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isAnonymous"
                      checked={formData.isAnonymous}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Post anonymously
                    </label>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={createPostMutation.isLoading}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createPostMutation.isLoading ? 'Creating...' : 'Create Post'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-500 mb-4">
                {posts.length === 0 
                  ? "Be the first to start a discussion!"
                  : "No posts match your current filters."
                }
              </p>
              {posts.length === 0 && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create First Post
                </button>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Voting Section */}
                  <div className="flex lg:flex-col items-center lg:items-start gap-1 lg:w-16">
                    <button
                      onClick={() => handleVote(post._id, 'UP')}
                      className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-green-600 transition-colors"
                      disabled={voteMutation.isLoading}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-bold text-gray-700 min-w-[2rem] text-center">
                      {(post.votes?.upvotes || 0) - (post.votes?.downvotes || 0)}
                    </span>
                    <button
                      onClick={() => handleVote(post._id, 'DOWN')}
                      className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
                      disabled={voteMutation.isLoading}
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(post.type)}`}>
                        {post.type}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </span>
                    </div>

                    {/* Meta information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        {post.adminPost ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        {post.isAnonymous ? 'Anonymous' : 
                         post.adminPost ? `Admin: ${post.adminPost.adminName}` :
                         post.studentId?.userId?.name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(post.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments?.length || 0} comments
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.description}</p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 mb-4">
                      <button
                        onClick={() => toggleComments(post._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {expandedComments[post._id] ? 'Hide' : 'Show'} Comments
                      </button>
                      
                      {isAdmin() && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this post?')) {
                              deletePostMutation.mutate(post._id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                          disabled={deletePostMutation.isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Comments Section */}
                    {expandedComments[post._id] && (
                      <div className="border-t pt-4">
                        {/* Add Comment */}
                        <div className="mb-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={newComments[post._id] || ''}
                              onChange={(e) => setNewComments(prev => ({
                                ...prev,
                                [post._id]: e.target.value
                              }))}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              maxLength={500}
                            />
                            <button
                              onClick={() => handleComment(post._id)}
                              disabled={commentMutation.isLoading}
                              className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3">
                          {post.comments?.map((comment, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="flex items-center gap-1">
                                  {comment.adminId ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                                  <span className="text-sm font-medium text-gray-700">
                                    {comment.adminName || comment.studentId?.userId?.name || 'Unknown'}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatDate(comment.commentedAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results Summary */}
        {filteredPosts.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Showing {filteredPosts.length} of {posts.length} posts
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityForum;
