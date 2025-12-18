'use client';

import { useEffect, useState } from 'react';
import { getSessionFromStorage } from '@/lib/admin-auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader,
  Trash2,
} from 'lucide-react';
import {
  getAllSupportTickets,
  getTicketMessages,
  addTicketMessage,
  updateTicketStatus,
  updateTicketPriority,
  deleteSupportTicket,
  SupportTicket,
  SupportMessage,
} from '@/lib/support-service';
import { toast } from 'sonner';

type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high';

export default function AdminSupportPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  useEffect(() => {
    const adminSession = getSessionFromStorage();
    if (!adminSession) {
      router.push('/admin/login');
      return;
    }
    setSession(adminSession);
    loadTickets();
  }, [router]);

  const loadTickets = async () => {
    try {
      setTicketsLoading(true);
      const allTickets = await getAllSupportTickets();
      setTickets(allTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Failed to load support tickets');
    } finally {
      setTicketsLoading(false);
    }
  };

  const loadTicketMessages = async (ticket: SupportTicket) => {
    try {
      setSelectedTicket(ticket);
      const ticketMessages = await getTicketMessages(ticket.id);
      setMessages(ticketMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!session?.email) {
      toast.error('Admin session not found');
      return;
    }

    try {
      setSending(true);
      await addTicketMessage(
        selectedTicket.id,
        session.uid || 'admin',
        'Support Team',
        replyText,
        true
      );

      setReplyText('');
      const updatedMessages = await getTicketMessages(selectedTicket.id);
      setMessages(updatedMessages);
      toast.success('Reply sent successfully');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!selectedTicket) return;

    try {
      await updateTicketStatus(selectedTicket.id, status);
      const updatedTicket = { ...selectedTicket, status };
      setSelectedTicket(updatedTicket);
      setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
      toast.success(`Ticket status updated to ${status}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    if (!selectedTicket) return;

    try {
      await updateTicketPriority(selectedTicket.id, priority);
      const updatedTicket = { ...selectedTicket, priority };
      setSelectedTicket(updatedTicket);
      setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)));
      toast.success(`Ticket priority updated to ${priority}`);
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      setDeletingId(ticketId);
      await deleteSupportTicket(ticketId);
      setTickets((prev) => prev.filter((t) => t.id !== ticketId));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
        setMessages([]);
      }
      toast.success('Ticket deleted successfully');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Failed to delete ticket');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'closed':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30';
      case 'resolved':
        return 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30';
      case 'closed':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100';
    }
  };

  // Get count for each status
  const getStatusCounts = () => {
    return {
      open: tickets.filter((t) => t.status === 'open').length,
      'in-progress': tickets.filter((t) => t.status === 'in-progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
      closed: tickets.filter((t) => t.status === 'closed').length,
    };
  };

  // Filter tickets by status
  const filteredTickets =
    statusFilter === 'all' ? tickets : tickets.filter((t) => t.status === statusFilter);

  const counts = getStatusCounts();

  if (!session) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-black text-white">🆘 Support Tickets</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Status Sections */}
        <div className="lg:col-span-1 space-y-3">
          {/* All Tickets */}
          <button
            onClick={() => setStatusFilter('all')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              statusFilter === 'all'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-secondary/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold">All Tickets</span>
              <Badge variant="secondary">{tickets.length}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">View all support tickets</p>
          </button>

          {/* Open */}
          <button
            onClick={() => setStatusFilter('open')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              statusFilter === 'open'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-secondary/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="font-semibold">Open</span>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                {counts.open}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">New support requests</p>
          </button>

          {/* In Progress */}
          <button
            onClick={() => setStatusFilter('in-progress')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              statusFilter === 'in-progress'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-secondary/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="font-semibold">In Progress</span>
              </div>
              <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">
                {counts['in-progress']}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </button>

          {/* Resolved */}
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              statusFilter === 'resolved'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-secondary/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="font-semibold">Resolved</span>
              </div>
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">
                {counts.resolved}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Fixed issues</p>
          </button>

          {/* Closed */}
          <button
            onClick={() => setStatusFilter('closed')}
            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
              statusFilter === 'closed'
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-secondary/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-gray-500" />
                <span className="font-semibold">Closed</span>
              </div>
              <Badge className="bg-gray-500/20 text-gray-700 dark:text-gray-400">
                {counts.closed}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Archived tickets</p>
          </button>
        </div>

        {/* Center Panel - Tickets List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {statusFilter === 'all' ? 'All Tickets' : statusFilter}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <div className="text-center py-8">
                  <Loader className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-muted-foreground text-sm">Loading tickets...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No tickets in this section</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="relative group p-3 rounded-lg border-2 border-border hover:bg-secondary/50 transition-all"
                    >
                      <button
                        onClick={() => loadTicketMessages(ticket)}
                        className={`w-full text-left transition-all ${
                          selectedTicket?.id === ticket.id
                            ? 'border-primary bg-primary/5'
                            : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">
                            {ticket.title}
                          </h4>
                          {getStatusIcon(ticket.status)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                          {ticket.userName}
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className={getStatusColor(ticket.status)}
                            variant="outline"
                          >
                            {ticket.status}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      </button>

                      <button
                        onClick={() => handleDeleteTicket(ticket.id)}
                        disabled={deletingId === ticket.id}
                        className="absolute top-2 right-2 p-1.5 bg-destructive/80 hover:bg-destructive text-white rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        title="Delete ticket"
                      >
                        {deletingId === ticket.id ? (
                          <Loader className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Ticket Details & Messages */}
        <div className="lg:col-span-1">
          {selectedTicket ? (
            <div className="space-y-4">
              {/* Ticket Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{selectedTicket.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ticket ID: {selectedTicket.id.substring(0, 8)}...
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteTicket(selectedTicket.id)}
                      disabled={deletingId === selectedTicket.id}
                      className="p-2 rounded bg-destructive/80 hover:bg-destructive text-white disabled:opacity-50"
                    >
                      {deletingId === selectedTicket.id ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      From
                    </p>
                    <p className="font-semibold">{selectedTicket.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedTicket.userEmail} • {selectedTicket.userPhone}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">
                      Description
                    </p>
                    <p className="text-sm">{selectedTicket.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(v) => handleStatusChange(v as TicketStatus)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select
                        value={selectedTicket.priority}
                        onValueChange={(v) => handlePriorityChange(v as TicketPriority)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Conversation ({messages.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.isAdmin
                            ? 'bg-primary/10 border border-primary/20 ml-8'
                            : 'bg-secondary/50 border border-border mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold">{msg.senderName}</p>
                          <p className="text-xs text-muted-foreground">
                            {msg.timestamp?.toDate?.().toLocaleString()}
                          </p>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  {selectedTicket.status !== 'closed' && (
                    <form onSubmit={handleSendReply} className="space-y-2 pt-4 border-t">
                      <Textarea
                        placeholder="Type your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={sending}
                        rows={3}
                      />
                      <Button
                        type="submit"
                        disabled={sending || !replyText.trim()}
                        className="w-full"
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {sending ? 'Sending...' : 'Send Reply'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a ticket to view details and messages
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}