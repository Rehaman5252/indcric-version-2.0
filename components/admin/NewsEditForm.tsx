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
import { X } from 'lucide-react';
import { updateNews } from '@/lib/news-service';
import type { News } from '@/types/news';
import { toast } from 'sonner';

interface NewsEditFormProps {
  news: News;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewsEditForm({
  news,
  onClose,
  onSuccess,
}: NewsEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(news.title);
  const [description, setDescription] = useState(news.description);
  const [redirectUrl, setRedirectUrl] = useState(news.redirectUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !redirectUrl) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await updateNews(news.id, {
        title,
        description,
        redirectUrl,
      });
      toast.success('News updated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error updating news:', error);
      toast.error('Failed to update news');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <CardTitle>✏️ Edit News</CardTitle>
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
            {/* Current Image Preview */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Current Image
              </label>
              <img
                src={news.imageUrl}
                alt={news.title}
                className="max-h-32 rounded-lg"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Note: Cannot change image in edit mode. Delete and re-add to change image.
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Title *
              </label>
              <Input
                placeholder="News title"
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
                placeholder="Short description"
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
                placeholder="https://example.com"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Updating...' : 'Update News'}
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
