"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  Reply,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminDashboardHeader } from "@/components/admin/dashboard-header";

interface SupportTicket {
  _id: string;
  parentId: string;
  parentName: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  attachment?: string;
  adminResponse?: string;
  adminResponseDate?: string;
  replies?: { _id: string; message: string; from: 'admin' | 'parent'; createdAt: string }[];
}

export default function AdminSupportPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && token) {
      fetchTickets();
    }
  }, [user, token]);

  // Auto-scroll to bottom of conversation when ticket is selected
  useEffect(() => {
    if (selectedTicket && conversationRef.current) {
      setTimeout(() => {
        conversationRef.current?.scrollTo({
          top: conversationRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/support", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTickets(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load support tickets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedTicket || !responseMessage.trim()) return;
    
    try {
      setIsResponding(true);
      const res = await fetch(`/api/admin/support/${selectedTicket._id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response: responseMessage }),
      });
      
      if (!res.ok) throw new Error("Failed to send response");
      
      toast({
        title: "Success",
        description: "Response sent successfully",
      });
      
      setResponseMessage("");
      fetchTickets(); // Refresh the list to get updated ticket
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send response",
        variant: "destructive",
      });
    } finally {
      setIsResponding(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/admin/support/${ticketId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) throw new Error("Failed to update status");
      
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
      
      fetchTickets(); // Refresh the list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Open
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Resolved
          </Badge>
        );
      case "closed":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Closed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>You need administrator access to view this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6 animate-in fade-in duration-500">
      <AdminDashboardHeader username={user.name} />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Management</h1>
          <p className="text-muted-foreground">
            Manage and respond to parent support requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {filteredTickets.length} tickets
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            View and manage parent support requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-2 text-muted-foreground">No support tickets found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{ticket.subject}</h3>
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>From: {ticket.parentName}</span>
                      <span>Created: {formatDate(ticket.createdAt)}</span>
                      {ticket.attachment && (
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          Has attachment
                        </span>
                      )}
                      {ticket.replies && ticket.replies.length > 0 && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <MessageSquare className="h-3 w-3" />
                          {ticket.replies.length} {ticket.replies.length === 1 ? 'reply' : 'replies'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    {getStatusBadge(ticket.status)}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{ticket.subject}</DialogTitle>
                          <DialogDescription>
                            Support request from {ticket.parentName}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Message:</h4>
                            <div className="p-3 bg-muted rounded-md">
                              <p className="whitespace-pre-wrap">{ticket.message}</p>
                            </div>
                          </div>
                          
                          {ticket.attachment && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Attachment:</h4>
                              <a
                                href={`/support-uploads/${ticket.attachment}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:underline"
                              >
                                <Download className="h-4 w-4" />
                                View attachment
                              </a>
                            </div>
                          )}
                          
                          {/* Full Conversation Thread */}
                          {(ticket.adminResponse || (ticket.replies && ticket.replies.length > 0)) && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Conversation:</h4>
                              <div ref={conversationRef} className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3 bg-gray-50">
                                {/* Show admin response if it exists and no replies yet */}
                                {ticket.adminResponse && (!ticket.replies || ticket.replies.length === 0) && (
                                  <div className="p-3 bg-blue-50 rounded-md ml-4">
                                    <p className="whitespace-pre-wrap">{ticket.adminResponse}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                      Admin - {formatDate(ticket.adminResponseDate!)}
                                    </p>
                                  </div>
                                )}
                                
                                {/* Show all replies in chronological order */}
                                {ticket.replies && ticket.replies.length > 0 && (
                                  <>
                                    {ticket.replies.map((reply) => (
                                      <div
                                        key={reply._id}
                                        className={`p-3 rounded-md ${
                                          reply.from === 'admin' 
                                            ? 'bg-blue-50 ml-4' 
                                            : 'bg-green-50 mr-4'
                                        }`}
                                      >
                                        <p className="whitespace-pre-wrap">{reply.message}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                          {reply.from === 'admin' ? 'Admin' : 'Parent'} - {formatDate(reply.createdAt)}
                                        </p>
                                      </div>
                                    ))}
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Reply Form - Always show for ongoing conversations */}
                          {ticket.status !== 'closed' && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Send Reply:</h4>
                              <Textarea
                                placeholder="Type your reply..."
                                value={responseMessage}
                                onChange={(e) => setResponseMessage(e.target.value)}
                                rows={4}
                              />
                            </div>
                          )}
                        </div>
                        
                        <DialogFooter>
                          {ticket.status !== 'closed' && (
                            <Button
                              onClick={() => {
                                setSelectedTicket(ticket);
                                handleRespond();
                              }}
                              disabled={!responseMessage.trim() || isResponding}
                            >
                              {isResponding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Send Reply
                            </Button>
                          )}
                          
                          <Select
                            value={ticket.status}
                            onValueChange={(status) => handleUpdateStatus(ticket._id, status)}
                            disabled={isUpdatingStatus}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 