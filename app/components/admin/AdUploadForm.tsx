// app/components/admin/AdUploadForm.tsx - UPDATED WITH FILE UPLOAD & BLACK/GOLD THEME
'use client';

import { useState, useRef } from 'react';
import { uploadAd } from '@/lib/ad-service';
import { uploadAdFile } from '@/lib/ad-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const AD_SLOTS = [
  'T20', 'IPL', 'ODI', 'WPL', 'Test', 'Mixed',
  'Q1_Q2', 'Q2_Q3', 'Q3_Q4', 'Q4_Q5', 'AfterQuiz',
  'Q1_HINT', 'Q2_HINT', 'Q3_HINT', 'Q4_HINT', 'Q5_HINT'
];

interface AdUploadFormProps {
  onSuccess?: () => void;
}

export default function AdUploadForm({ onSuccess }: AdUploadFormProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    adSlot: '',
    adType: 'image' as 'image' | 'video',
    mediaUrl: '',
    redirectUrl: '',
    revenue: 0,
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'revenue' 
        ? Number(value) 
        : value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, WebP, MP4, or MOV.');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);

    // Determine ad type from file
    const isVideo = file.type.startsWith('video/');
    setFormData(prev => ({
      ...prev,
      adType: isVideo ? 'video' : 'image'
    }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    if (!formData.adSlot) {
      toast.error('Please select an ad slot');
      return;
    }
    if (!selectedFile) {
      toast.error('Please select a media file');
      return;
    }
    if (!formData.redirectUrl.trim()) {
      toast.error('Redirect URL is required');
      return;
    }
    if (formData.revenue <= 0) {
      toast.error('Revenue must be greater than 0');
      return;
    }

    try {
      setLoading(true);

      // Upload file to Firebase Storage
      setUploading(true);
      const mediaUrl = await uploadAdFile(
        selectedFile,
        formData.adSlot as any,
        formData.companyName
      );
      setUploading(false);

      // Create ad with uploaded file URL
      const adId = await uploadAd({
        companyName: formData.companyName,
        adSlot: formData.adSlot,
        adType: formData.adType,
        mediaUrl: mediaUrl,
        redirectUrl: formData.redirectUrl,
        revenue: formData.revenue,
        isActive: formData.isActive,
        viewCount: 0,
        clickCount: 0,
      });

      toast.success(`✅ Ad uploaded successfully! ID: ${adId.substring(0, 8)}`);

      // Reset form
      setFormData({
        companyName: '',
        adSlot: '',
        adType: 'image',
        mediaUrl: '',
        redirectUrl: '',
        revenue: 0,
        isActive: true,
      });
      handleRemoveFile();

      // Trigger refresh in parent
      onSuccess?.();

    } catch (error: any) {
      console.error('Error uploading ad:', error);
      const errorMessage = error.message || 'Failed to upload ad';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 sm:p-6 lg:p-8">
      <Card className="bg-black border-yellow-600/50 shadow-2xl max-w-3xl mx-auto">
        <CardHeader className="border-b border-yellow-600/30 bg-gradient-to-r from-gray-900 to-black">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
              <Upload className="h-6 w-6 text-black" />
            </div>
            <span className="text-white">Upload New Advertisement</span>
          </CardTitle>
          <p className="text-gray-400 text-sm mt-2">Upload and configure your ad to run across multiple slots</p>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Company Name */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-yellow-500">
                Company Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g., Google, Nike, BMW"
                disabled={loading}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-yellow-500/20 py-3"
              />
            </div>

            {/* Ad Slot */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-yellow-500">
                Ad Slot <span className="text-red-500">*</span>
              </label>
              <select
                name="adSlot"
                value={formData.adSlot}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-500 focus:ring-yellow-500/20 focus:ring-2"
              >
                <option value="" className="bg-gray-800">-- Select an ad slot --</option>
                <optgroup label="🎲 Cube Faces (6)" className="bg-gray-800">
                  {['T20', 'IPL', 'ODI', 'WPL', 'Test', 'Mixed'].map(slot => (
                    <option key={slot} value={slot} className="bg-gray-800">{slot}</option>
                  ))}
                </optgroup>
                <optgroup label="❓ Quiz Flow (5)" className="bg-gray-800">
                  {['Q1_Q2', 'Q2_Q3', 'Q3_Q4', 'Q4_Q5', 'AfterQuiz'].map(slot => (
                    <option key={slot} value={slot} className="bg-gray-800">{slot}</option>
                  ))}
                </optgroup>
                <optgroup label="💡 Hint Ads (5)" className="bg-gray-800">
                  {['Q1_HINT', 'Q2_HINT', 'Q3_HINT', 'Q4_HINT', 'Q5_HINT'].map(slot => (
                    <option key={slot} value={slot} className="bg-gray-800">{slot}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Ad Type and Revenue - Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Ad Type */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-yellow-500">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="adType"
                  value={formData.adType}
                  onChange={handleChange}
                  disabled={loading || selectedFile !== null}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-yellow-500 focus:ring-yellow-500/20 focus:ring-2"
                >
                  <option value="image" className="bg-gray-800">📷 Image</option>
                  <option value="video" className="bg-gray-800">🎬 Video</option>
                </select>
              </div>

              {/* Revenue */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-yellow-500">
                  Revenue (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-semibold">₹</span>
                  <Input
                    name="revenue"
                    type="number"
                    value={formData.revenue}
                    onChange={handleChange}
                    placeholder="50000"
                    disabled={loading}
                    min="0"
                    step="1000"
                    required
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-yellow-500/20 py-3 pl-8"
                  />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-yellow-500">
                Media File <span className="text-red-500">*</span>
              </label>
              
              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-yellow-600/50 hover:border-yellow-500 rounded-lg p-8 text-center cursor-pointer transition-all duration-200 bg-gray-800/50 hover:bg-gray-800"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    disabled={loading}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-lg">
                      <ImageIcon className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Click to upload or drag and drop</p>
                      <p className="text-gray-400 text-sm">JPG, PNG, WebP, MP4 or MOV (Max 50MB)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 border border-yellow-600/50 rounded-lg p-4 space-y-3">
                  {/* Preview */}
                  <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                    {formData.adType === 'image' ? (
                      <img
                        src={previewUrl!}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <video
                        src={previewUrl!}
                        className="w-full h-48 object-cover"
                        controls
                      />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white text-sm font-semibold truncate">{selectedFile.name}</p>
                      <p className="text-gray-400 text-xs">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={loading}
                      className="ml-3 p-2 bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Redirect URL */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-yellow-500">
                Redirect URL <span className="text-red-500">*</span>
              </label>
              <Input
                name="redirectUrl"
                value={formData.redirectUrl}
                onChange={handleChange}
                placeholder="https://example.com/campaign"
                type="url"
                disabled={loading}
                required
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-yellow-500 focus:ring-yellow-500/20 py-3"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={loading}
                className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500/20 cursor-pointer"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-white cursor-pointer">
                Activate immediately after upload
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 rounded-lg gap-2 text-base transition-all duration-200 disabled:opacity-50"
            >
              {loading || uploading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  {uploading ? 'Uploading File...' : 'Processing...'}
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Upload Advertisement
                </>
              )}
            </Button>

            {/* Info Box */}
            <div className="bg-yellow-500/10 border border-yellow-600/30 rounded-lg p-4 space-y-2">
              <p className="text-yellow-500 font-semibold text-sm">💡 Important Information</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>✓ Revenue is recorded permanently when you create this ad</li>
                <li>✓ Deleting an ad later won't reduce your total revenue</li>
                <li>✓ All files are encrypted and stored securely in Firebase Storage</li>
              </ul>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}