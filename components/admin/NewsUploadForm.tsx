'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Upload, AlertTriangle } from 'lucide-react';
import { uploadNewsImage, createNews } from '@/lib/news-service';
import { useAuth } from '@/context/AuthProvider';
import { toast } from 'sonner';

interface NewsUploadFormProps {
  onClose: () => void;
  onSuccess: () => void;
  existingPositions: number[];
}

export default function NewsUploadForm({
  onClose,
  onSuccess,
  existingPositions,
}: NewsUploadFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [position, setPosition] = useState<string>('');

  const availableSlots = Array.from({ length: 8 }, (_, i) => i + 1).filter(
    (slot) => !existingPositions.includes(slot)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title || !description || !redirectUrl || !position) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!user?.uid) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setLoading(true);

      // Upload image
      const imageUrl = await uploadNewsImage(file, parseInt(position));

      // Create news
      await createNews(
        title,
        description,
        imageUrl,
        redirectUrl,
        parseInt(position),
        user.uid
      );

      toast.success('News added successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error uploading news:', error);
      toast.error('Failed to add news');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3 sticky top-0 bg-background border-b">
          <CardTitle>📰 Add News</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Position Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Slot Position *
              </label>
              {availableSlots.length === 0 ? (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-200">
                    All 8 news slots are filled. Delete or edit existing news to add more.
                  </p>
                </div>
              ) : (
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot.toString()}>
                        Slot {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Image *
              </label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                  disabled={loading}
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  {preview ? (
                    <>
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded mb-2"
                      />
                      <p className="text-sm text-muted-foreground">
                        {file?.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Click to upload image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WebP up to 10MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Title *
              </label>
              <Input
                placeholder="e.g., Cricket World Cup Updates"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Description *
              </label>
              <Input
                placeholder="e.g., Latest news and highlights"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Redirect URL */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Link/URL *
              </label>
              <Input
                type="url"
                placeholder="https://example.com or /news/article-id"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading || availableSlots.length === 0}
                className="flex-1"
              >
                {loading ? 'Adding...' : 'Add News'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
