'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionFromStorage } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  AlertTriangle,
} from 'lucide-react';
import {
  getAllNews,
  getNewsStats,
  toggleNewsActive,
  deleteNews,
} from '@/lib/news-service';
import type { News, NewsStats } from '@/types/news';
import { toast } from 'sonner';
import NewsUploadForm from '@/components/admin/NewsUploadForm';
import NewsEditForm from '@/components/admin/NewsEditForm';

type ViewMode = 'none' | 'active' | 'inactive';

export default function NewsManagementPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('none');
  const [news, setNews] = useState<News[]>([]);
  const [filteredNews, setFilteredNews] = useState<News[]>([]);
  const [stats, setStats] = useState<NewsStats>({
    totalNews: 0,
    activeNews: 0,
    inactiveNews: 0,
  });
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    const adminSession = getSessionFromStorage();
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }
    setSession(adminSession);
    loadNews();
  }, [router]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const [allNews, newsStats] = await Promise.all([
        getAllNews(),
        getNewsStats(),
      ]);
      setNews(allNews);
      setFilteredNews(allNews);
      setStats(newsStats);
    } catch (error) {
      console.error('Error loading news:', error);
      toast.error('Failed to load news');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = news;
    switch (viewMode) {
      case 'active':
        filtered = news.filter((n) => n.isActive);
        break;
      case 'inactive':
        filtered = news.filter((n) => !n.isActive);
        break;
      default:
        filtered = news;
    }
    setFilteredNews(filtered);
  }, [viewMode, news]);

  const handleToggleActive = async (newsId: string, currentStatus: boolean) => {
    try {
      setToggling(newsId);
      await toggleNewsActive(newsId, !currentStatus);
      toast.success(
        `News ${!currentStatus ? 'activated' : 'deactivated'} successfully!`
      );
      loadNews();
    } catch (error) {
      console.error('Error toggling news status:', error);
      toast.error('Failed to toggle news status');
    } finally {
      setToggling(null);
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    if (!confirm('Are you sure you want to delete this news?')) return;

    try {
      setDeleting(newsId);
      await deleteNews(newsId);
      toast.success('News deleted successfully!');
      loadNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast.error('Failed to delete news');
    } finally {
      setDeleting(null);
    }
  };

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
             News Management
          </h1>
          <p className="text-gray-400 mt-2">Manage home page news strips (8 slots)</p>
        </div>
        <Button
          onClick={() => setShowUploadForm(true)}
          className="gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold shadow-lg shadow-yellow-500/50"
        >
          <Plus className="h-5 w-5" />
          Add News
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card
          className={`cursor-pointer transition-all border-2 ${
            viewMode === 'none'
              ? 'border-yellow-500 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5'
              : 'border-yellow-500/20 hover:border-yellow-500/50'
          } bg-gradient-to-br from-gray-900/50 to-black/50 hover:shadow-lg hover:shadow-yellow-500/20`}
          onClick={() => setViewMode('none')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-yellow-400">
              📊 Total News
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
              {stats.totalNews}
            </div>
            <p className="text-xs text-gray-400 mt-1">{stats.totalNews}/8 slots used</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-2 ${
            viewMode === 'active'
              ? 'border-green-500 bg-gradient-to-br from-green-500/10 to-green-600/5'
              : 'border-green-500/20 hover:border-green-500/50'
          } bg-gradient-to-br from-gray-900/50 to-black/50 hover:shadow-lg hover:shadow-green-500/20`}
          onClick={() => setViewMode(viewMode === 'active' ? 'none' : 'active')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-green-400">
              ✅ Active
            </CardTitle>
            <Eye className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-green-400">{stats.activeNews}</div>
            <p className="text-xs text-gray-400 mt-1">On home page</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-2 ${
            viewMode === 'inactive'
              ? 'border-orange-500 bg-gradient-to-br from-orange-500/10 to-orange-600/5'
              : 'border-orange-500/20 hover:border-orange-500/50'
          } bg-gradient-to-br from-gray-900/50 to-black/50 hover:shadow-lg hover:shadow-orange-500/20`}
          onClick={() => setViewMode(viewMode === 'inactive' ? 'none' : 'inactive')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-orange-400">
              🔒 Inactive
            </CardTitle>
            <EyeOff className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-orange-400">{stats.inactiveNews}</div>
            <p className="text-xs text-gray-400 mt-1">Hidden from home page</p>
          </CardContent>
        </Card>
      </div>

      {/* News List */}
      <Card className="border-yellow-500/20 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-yellow-500/10">
          <div>
            <CardTitle className="text-yellow-400">
              {viewMode === 'active' && '✅ Active News'}
              {viewMode === 'inactive' && '🔒 Inactive News'}
              {viewMode === 'none' && '📋 All News'}
            </CardTitle>
            <p className="text-sm text-gray-400 mt-1">
              Showing {filteredNews.length} news item{filteredNews.length !== 1 ? 's' : ''}
            </p>
          </div>
          {viewMode !== 'none' && (
            <Button
              variant="outline"
              onClick={() => setViewMode('none')}
              className="text-sm border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              Clear Filter
            </Button>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500/50 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No news found</p>
              <Button
                onClick={() => setShowUploadForm(true)}
                className="gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold"
              >
                <Plus className="h-4 w-4" />
                Add First News
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNews.map((n) => (
                <div
                  key={n.id}
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-900/50 to-black/30 rounded-lg border border-yellow-500/10 hover:border-yellow-500/30 transition-all hover:shadow-lg hover:shadow-yellow-500/10"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge
                        variant="outline"
                        className="text-xs border-yellow-500/30 text-yellow-400 bg-yellow-500/5"
                      >
                        Slot {n.position}/8
                      </Badge>
                      {!n.isActive && (
                        <Badge
                          variant="destructive"
                          className="text-xs bg-orange-500/20 text-orange-300 border-orange-500/30"
                        >
                          Hidden
                        </Badge>
                      )}
                      <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30 border">
                        Active
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-white truncate">{n.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                      {n.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingNews(n)}
                      className="text-blue-400 hover:bg-blue-500/10"
                      title="Edit news"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(n.id, n.isActive)}
                      disabled={toggling === n.id}
                      className={n.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-yellow-400 hover:bg-yellow-500/10'}
                      title={n.isActive ? 'Hide news' : 'Show news'}
                    >
                      {n.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNews(n.id)}
                      disabled={deleting === n.id}
                      className="text-red-400 hover:bg-red-500/10"
                      title="Delete news"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Form Modal */}
      {showUploadForm && (
        <NewsUploadForm
          onClose={() => setShowUploadForm(false)}
          onSuccess={() => {
            setShowUploadForm(false);
            loadNews();
          }}
          existingPositions={news.map((n) => n.position)}
        />
      )}

      {/* Edit Form Modal */}
      {editingNews && (
        <NewsEditForm
          news={editingNews}
          onClose={() => setEditingNews(null)}
          onSuccess={() => {
            setEditingNews(null);
            loadNews();
          }}
        />
      )}
    </div>
  );
}
