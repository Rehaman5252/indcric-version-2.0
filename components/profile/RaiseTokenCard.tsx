'use client';

import React, { memo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Ticket, Send, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

interface SupportTicket {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: any;
  messageCount: number;
}

const RaiseTokenCardComponent = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [showNew, setShowNew] = useState(true);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketCount, setTicketCount] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
  });

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile || !formData.title.trim() || !formData.description.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
      });
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, 'supportTickets'), {
        userId: user.uid,
        userName: profile.fullName || profile.name || user.displayName || 'User',
        userEmail: user.email || '',
        userPhone: profile.phone || '',
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: 'open',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messageCount: 0,
      });

      toast({
        title: 'Success!',
        description: 'Support ticket created successfully!',
      });

      setFormData({ title: '', description: '', priority: 'medium' });
      setShowNew(false);
      await loadTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to create support ticket',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'supportTickets'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const userTickets: SupportTicket[] = [];

      querySnapshot.forEach((doc) => {
        userTickets.push({
          id: doc.id,
          ...doc.data(),
        } as SupportTicket);
      });

      setTickets(userTickets);
      setTicketCount(userTickets.length);
    } catch (error) {
      console.error('Error loading tickets:', error);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadTickets();
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
      'in-progress': 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
      resolved: 'bg-green-500/20 text-green-700 dark:text-green-400',
      closed: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
    };
    return colors[status] || colors.closed;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[priority] || colors.medium;
  };

  return (
    <Card className="bg-card shadow-lg border border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ticket className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg font-semibold">Raise Token</CardTitle>
              <CardDescription>Create and track your support requests</CardDescription>
            </div>
          </div>
          {ticketCount > 0 && (
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {ticketCount} Active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <Button
            onClick={() => setOpen(true)}
            size="lg"
            className="w-full justify-between text-base py-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            <span>{ticketCount > 0 ? `View ${ticketCount} Tickets` : 'Create New Token'}</span>
            <ChevronRight className="h-5 w-5" />
          </Button>

          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {showNew ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Create Support Token</DialogTitle>
                  <DialogDescription>
                    Describe your issue and we'll get back to you soon.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateTicket} className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Brief title of your issue"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe your issue in detail..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={loading}
                      rows={5}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                      disabled={loading}
                      className="w-full p-2 border rounded bg-background text-foreground"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <DialogFooter className="pt-4 border-t flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setOpen(false);
                        setShowNew(true);
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !formData.title.trim() || !formData.description.trim()}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {loading ? 'Creating...' : 'Create Token'}
                    </Button>
                  </DialogFooter>
                </form>

                {ticketCount > 0 && (
                  <div className="pt-4 border-t">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setShowNew(false);
                        loadTickets();
                      }}
                    >
                      View My {ticketCount} Tokens
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">My Support Tokens</DialogTitle>
                  <DialogDescription>
                    Track all your support requests here
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-4">
                  {tickets.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No tokens created yet</p>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={() => setShowNew(true)}
                      >
                        Create Your First Token
                      </Button>
                    </div>
                  ) : (
                    tickets.map((ticket) => (
                      <Card key={ticket.id} className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-foreground">{ticket.title}</h3>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {ticket.description.substring(0, 100)}...
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {ticket.messageCount || 0} messages
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <DialogFooter className="pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNew(true)}
                    className="w-full"
                  >
                    Create New Token
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

const RaiseTokenCard = memo(RaiseTokenCardComponent);
export default RaiseTokenCard;
