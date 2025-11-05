import React, { useState } from 'react';
import { HelpCircle, Upload, X, AlertCircle } from 'lucide-react';
import doubtService from '../services/doubtService';
import { 
  validateTitle, 
  validateSubject, 
  validateDescription, 
  validateCategory, 
  validateImage,
  validateDoubtForm 
} from '../utils/doubtValidation';

const AskDoubt = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [doubtCategory, setDoubtCategory] = useState('small');
  const [doubtDescription, setDoubtDescription] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Validation errors state
  const [errors, setErrors] = useState({
    title: '',
    subject: '',
    description: '',
    category: '',
    image: ''
  });

  const handleImageUpload = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    
    // Validate image
    const imageValidation = validateImage(file);
    if (!imageValidation.valid) {
      setErrors(prev => ({ ...prev, image: imageValidation.error }));
      e.target.value = ''; // Clear the input
      return;
    }
    
    // Clear image error if valid
    setErrors(prev => ({ ...prev, image: '' }));
    setUploadedImage(file);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const clearForm = () => {
    setTitle('');
    setSubject('');
    setDoubtCategory('small');
    setDoubtDescription('');
    setUploadedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
  };

  // Real-time validation handlers
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    const validation = validateTitle(value);
    setErrors(prev => ({ ...prev, title: validation.error }));
  };

  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setSubject(value);
    const validation = validateSubject(value);
    setErrors(prev => ({ ...prev, subject: validation.error }));
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDoubtDescription(value);
    const validation = validateDescription(value);
    setErrors(prev => ({ ...prev, description: validation.error }));
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setDoubtCategory(value);
    const validation = validateCategory(value);
    setErrors(prev => ({ ...prev, category: validation.error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({
      title: '',
      subject: '',
      description: '',
      category: '',
      image: ''
    });
    
    // Validate all fields
    const formData = {
      title,
      subject,
      category: doubtCategory,
      description: doubtDescription,
      image: uploadedImage
    };
    
    const validation = validateDoubtForm(formData);
    
    if (!validation.valid) {
      // Set all validation errors
      setErrors(validation.errors);
      
      // Scroll to first error
      const firstErrorField = Object.keys(validation.errors).find(key => validation.errors[key]);
      if (firstErrorField) {
        const errorElement = document.getElementById(firstErrorField === 'description' ? 'description' : firstErrorField);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          errorElement.focus();
        }
      }
      
      return;
    }
    
    setUploading(true);

    try {
      const doubtData = {
        title: title.trim(),
        subject: subject.trim(),
        category: doubtCategory,
        description: doubtDescription.trim(),
        imagePath: null,
        tags: []
      };
      
      const result = await doubtService.createDoubt(doubtData);
      
      // Check if backend returned errors
      if (!result.success) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        } else {
          alert(result.error || 'Failed to submit doubt. Please check your input and try again.');
        }
        setUploading(false);
        return;
      }
      
      // Redirect to awaiting page
      const doubtId = result.doubtId;
      
      if (doubtId) {
        window.location.href = `/dashboard/awaiting/${doubtId}`;
        return;
      }
      
      // Fallback
      window.location.href = `/dashboard/awaiting/temp-${Date.now()}`;
      
    } catch (error) {
      alert(`Failed to submit doubt: ${error.message || 'Please check your input and try again.'}`);
    } finally {
      setUploading(false);
    }
  };

  if (!isFormOpen) {
    return (
      <button
        onClick={() => setIsFormOpen(true)}
        className="flex items-center border bg-blue-500 border-blue-600 hover:bg-blue-600 transition-colors text-white rounded-md h-9 px-4 py-2 cursor-pointer"
      >
        Ask a Doubt
        <HelpCircle className="ml-2 w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white text-gray-800 border border-gray-200 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Ask Your Doubt
              </h2>
              <p className="text-gray-600 mt-1">
                Fill in the details below to get help with your doubt.
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form id="askDoubtForm" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Title Field */}
          <div className="space-y-2">
            <label htmlFor="title" className="block text-gray-700 text-sm font-medium">
              Doubt Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
              className={`w-full bg-gray-50 border ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              } text-gray-900 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
              placeholder="Enter a clear title for your doubt (min 3 characters)"
              maxLength={200}
              required
            />
            {errors.title && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.title}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">{title.length}/200 characters</p>
          </div>

          {/* Subject Select */}
          <div className="space-y-2">
            <label htmlFor="subject" className="block text-gray-700 text-sm font-medium">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              id="subject"
              value={subject}
              onChange={handleSubjectChange}
              className={`w-full bg-gray-50 border ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              } text-gray-900 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
              required
            >
              <option value="">Select a subject</option>
              <option value="operating systems">Operating Systems</option>
              <option value="artificial intelligence">Artificial Intelligence</option>
              <option value="database management systems">Database Management Systems</option>
              <option value="data structures and algorithms">Data Structures and Algorithms</option>
              <option value="java">Java</option>
              <option value="mern">MERN</option>
            </select>
            {errors.subject && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.subject}</span>
              </div>
            )}
          </div>

          {/* Doubt Category */}
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-medium">
              Doubt Category
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="doubtCategory"
                  value="small"
                  checked={doubtCategory === "small"}
                  onChange={handleCategoryChange}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700">Quick 20-Minute Session</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="doubtCategory"
                  value="medium"
                  checked={doubtCategory === "medium"}
                  onChange={handleCategoryChange}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700">Medium Topic — Unpacking Concepts in 30 Minutes</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="doubtCategory"
                  value="large"
                  checked={doubtCategory === "large"}
                  onChange={handleCategoryChange}
                  className="text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700">Large Topic — Understand the Entire Chapter in 60 Minutes</span>
              </label>
            </div>
            {errors.category && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.category}</span>
              </div>
            )}
          </div>

          {/* Doubt Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-gray-700 text-sm font-medium">
              Describe your doubt <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={doubtDescription}
              onChange={handleDescriptionChange}
              placeholder="What are you having trouble with? Be as detailed as possible (minimum 10 characters)."
              className={`w-full min-h-[100px] bg-gray-50 border ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } text-gray-900 rounded-md px-3 py-2 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-vertical`}
              maxLength={5000}
              required
            />
            {errors.description && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.description}</span>
              </div>
            )}
            <p className="text-xs text-gray-500">
              {doubtDescription.length}/5000 characters (minimum 10 required)
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-gray-700 text-sm font-medium">
              Upload reference image (optional)
            </label>
            {errors.image && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.image}</span>
              </div>
            )}
            <div className="border border-gray-300 bg-gray-50 rounded-md p-4">
              <input
                type="file"
                id="image-upload"
                accept="image/png, image/jpeg"
                className="hidden"
                onChange={handleImageUpload}
                onClick={(e) => (e.currentTarget.value = "")}
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer group"
              >
                {imagePreview ? (
                  <div className="relative w-full text-center">
                    <img
                      src={imagePreview}
                      alt="Doubt reference preview"
                      className="mx-auto max-h-[200px] w-auto object-contain rounded"
                    />
                    <p className="text-sm text-center mt-2 text-gray-600 break-all">
                      {uploadedImage?.name}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setUploadedImage(null);
                        if (imagePreview) {
                          URL.revokeObjectURL(imagePreview);
                        }
                        setImagePreview(null);
                      }}
                      className="mt-2 border border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800 bg-white rounded-md px-3 py-1 text-sm"
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center text-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2 group-hover:text-gray-600 transition-colors" />
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload an image
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 2MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => setIsFormOpen(false)}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 bg-white rounded-md px-4 py-2 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="askDoubtForm"
            disabled={uploading}
            className="bg-blue-500 border border-blue-600 hover:bg-blue-600 hover:border-blue-700 text-white rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? "Submitting..." : "Submit Doubt"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AskDoubt;