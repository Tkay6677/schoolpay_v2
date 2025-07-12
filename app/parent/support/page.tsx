"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  Reply,
  Loader2,
  Send,
  Inbox,
  Paperclip
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  _id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  attachment?: string;
  attachmentUrl?: string;
  adminResponse?: string;
  adminResponseDate?: string;
  replies?: Array<{
    _id: string;
    message: string;
    from: 'parent' | 'admin';
    createdAt: string;
  }>;
}

export default function ParentSupportPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchTickets = async () => {
    if (!user || !token) return;
    setLoadingTickets(true);
    try {
      const res = await fetch("/api/parent/support", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTickets(data);
    } catch {
      // ignore error
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user, token, feedback]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setFeedback({ type: "error", message: "Please fill in all required fields" });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("message", message);
      formData.append("priority", priority);
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/parent/support", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setFeedback({ type: "success", message: "Support ticket submitted successfully!" });
      setSubject("");
      setMessage("");
      setPriority("medium");
      setFile(null);
      
      // Refresh tickets list
      fetchTickets();
    } catch (error: any) {
      setFeedback({ type: "error", message: error.message || "Failed to submit ticket" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    
    try {
      setIsReplying(true);
      const res = await fetch(`/api/parent/support/${selectedTicket._id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: replyMessage }),
      });
      
      if (!res.ok) throw new Error("Failed to send reply");
      
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
      
      setReplyMessage("");
      fetchTickets(); // Refresh the list to get updated ticket
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
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
    return ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
           ticket.message.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (!user) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>You need to be logged in to access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-2">Support & Complaints</h1>
      <p className="text-muted-foreground mb-6">Submit a support request or complaint. Our team will respond as soon as possible.</p>
      
      {/* New Ticket Form */}
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle>Submit a Request</CardTitle>
          <CardDescription>Fill out the form below to contact support.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {feedback && (
              <div className={`flex items-center gap-2 p-3 rounded-md ${feedback.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                {feedback.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span>{feedback.message}</span>
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject *
                </label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">
                  Priority
                </label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message *
                </label>
                <Textarea
                  id="message"
                  placeholder="Please describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Attachment (optional)</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Paperclip className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">{file ? file.name : "Attach a file (screenshot, PDF, etc.)"}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    accept="image/*,application/pdf"
                  />
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" className="gap-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your tickets..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Your Support Tickets</CardTitle>
          <CardDescription>Track the status of your support requests and view responses.</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTickets ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Inbox className="mx-auto mb-2 h-8 w-8" />
              No support requests found.
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
                      <span>Created: {formatDate(ticket.createdAt)}</span>
                      {ticket.attachment && (
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          Has attachment
                        </span>
                      )}
                      {ticket.adminResponse && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Reply className="h-3 w-3" />
                          Admin responded
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    {getStatusBadge(ticket.status)}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{ticket.subject}</DialogTitle>
                          <DialogDescription>
                            Support ticket created on {formatDate(ticket.createdAt)}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          {/* Original Message */}
                          <div className="space-y-2">
                            <h4 className="font-medium">Your Message:</h4>
                            <div className="p-3 bg-muted rounded-md">
                              <p className="whitespace-pre-wrap">{ticket.message}</p>
                            </div>
                          </div>
                          
                          {/* Attachment */}
                          {ticket.attachment && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Your Attachment:</h4>
                              <a
                                href={ticket.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:underline"
                              >
                                <Download className="h-4 w-4" />
                                View attachment
                              </a>
                            </div>
                          )}
                          
                          {/* Admin Response */}
                          {ticket.adminResponse && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Admin Response:</h4>
                              <div className="p-3 bg-blue-50 rounded-md">
                                <p className="whitespace-pre-wrap">{ticket.adminResponse}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Responded on {formatDate(ticket.adminResponseDate!)}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Replies */}
                          {ticket.replies && ticket.replies.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Conversation:</h4>
                              <div className="space-y-3">
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
                                      {reply.from === 'admin' ? 'Admin' : 'You'} - {formatDate(reply.createdAt)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Reply Form */}
                          {ticket.status !== 'closed' && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Add Reply:</h4>
                              <Textarea
                                placeholder="Type your reply..."
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                rows={3}
                              />
                            </div>
                          )}
                        </div>
                        
                        <DialogFooter>
                          {ticket.status !== 'closed' && (
                            <Button
                              onClick={handleReply}
                              disabled={!replyMessage.trim() || isReplying}
                            >
                              {isReplying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Send Reply
                            </Button>
                          )}
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