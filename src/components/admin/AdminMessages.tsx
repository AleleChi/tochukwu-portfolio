import React, { useState } from "react";
import { Mail, Check, Archive, Trash2, Eye, Inbox, AlertCircle, MessageSquare, Send, X, CornerDownRight } from "lucide-react";

interface ReplyItem {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  date: string;
}

interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  organization?: string | null;
  category?: string | null;
  status?: "New" | "Read" | "Archived" | "Replied";
  replies?: ReplyItem[];
}

interface AdminMessagesProps {
  submissions: ContactSubmission[];
  onRefresh: () => void;
  onAddToast?: (type: "success" | "error" | "info" | "warning", title: string, message: string) => void;
}

export default function AdminMessages({ submissions, onRefresh, onAddToast }: AdminMessagesProps) {
  const [activeFilter, setActiveFilter] = useState<"All" | "New" | "Read" | "Archived" | "Replied">("All");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  const [composingReplyId, setComposingReplyId] = useState<number | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const handleUpdateStatus = async (id: number, newStatus: "New" | "Read" | "Archived") => {
    setUpdatingId(id);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/messages/${id}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        onAddToast?.("success", "Message Status", `Message status updated to ${newStatus}.`);
        onRefresh();
      } else {
        const errorMsg = data.error || "Failed to mutate status.";
        onAddToast?.("error", "Status Update Failed", errorMsg);
        setErrorMessage(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Network error: failed to establish connection with server router.";
      onAddToast?.("error", "Status Update Failed", errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm("Are you certain you wish to permanently delete this message record? This action cannot be undone.")) {
      return;
    }
    setUpdatingId(id);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        onAddToast?.("success", "Message Management", "Item removed successfully.");
        onRefresh();
      } else {
        const errorMsg = data.error || "Failed to delete record.";
        onAddToast?.("error", "Delete Failed", errorMsg);
        setErrorMessage(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Network error: failed to establish connection with server router.";
      onAddToast?.("error", "Delete Failed", errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenReplyComposer = (sub: ContactSubmission) => {
    setComposingReplyId(sub.id);
    setReplySubject(`Re: Your enquiry — Tochukwu Ogunaka`);
    setReplyMessage("");
    setErrorMessage(null);
  };

  const handleSendReply = async (id: number) => {
    if (!replyMessage.trim()) {
      setErrorMessage("Reply message body cannot be blank.");
      onAddToast?.("warning", "Blank Reply", "Reply message body cannot be blank.");
      return;
    }
    setSendingReply(true);
    setErrorMessage(null);
    onAddToast?.("info", "Inquiry Response", "Sending reply email...");
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/messages/${id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: replySubject,
          message: replyMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        onAddToast?.("success", "Inquiry Response", "Reply sent. Message status updated.");
        setComposingReplyId(null);
        setReplyMessage("");
        setReplySubject("");
        onRefresh();
      } else {
        const errorMsg = data.error || "Failed directing message reply.";
        onAddToast?.("error", "Reply Failed", errorMsg);
        setErrorMessage(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Network error: failed to send reply to recipient.";
      onAddToast?.("error", "Reply Failed", errorMsg);
      setErrorMessage(errorMsg);
    } finally {
      setSendingReply(false);
    }
  };

  // Filter logic
  const filteredSubmissions = submissions.filter(sub => {
    // Default status fallback if not present
    const status = sub.status || "New";
    if (activeFilter === "All") return true;
    return status === activeFilter;
  });

  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE) || 1;
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New":
        return (
          <span className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/25 animate-pulse">
            New
          </span>
        );
      case "Replied":
        return (
          <span className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            Replied
          </span>
        );
      case "Read":
        return (
          <span className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider bg-white/5 text-[#D5D3CC] border border-white/5">
            Read
          </span>
        );
      case "Archived":
        return (
          <span className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700/30">
            Archived
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[9px] font-mono font-bold uppercase tracking-wider bg-[#C9A84C]/15 text-[#C9A84C]">
            New
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn max-w-5xl">
      <div className="border-b border-white/5 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h4 className="text-2xl font-serif font-bold text-white tracking-tight">Messages</h4>
          <p className="text-xs text-[#8E8E93] font-mono uppercase tracking-wider mt-1">
            Review, organize, and triage enquiries from prospective clients and collaborators.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-[#111112] border border-white/5 p-1 self-start font-mono text-[10px] flex-wrap gap-1">
          {(["All", "New", "Replied", "Read", "Archived"] as const).map((filter) => {
            const count = filter === "All" 
              ? submissions.length 
              : submissions.filter(s => (s.status || "New") === filter).length;
            
            return (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 uppercase font-medium tracking-wider transition-colors cursor-pointer ${
                  activeFilter === filter 
                    ? "text-[#111112] bg-[#C9A84C]" 
                    : "text-[#8E8E93] hover:text-[#FDFBF7]"
                }`}
              >
                {filter} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 text-xs font-mono bg-red-500/10 text-red-400 border border-red-500/15 rounded-none flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {filteredSubmissions.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-white/10 rounded-none flex flex-col gap-4 justify-center items-center bg-[#1C1C1E]/50">
          <Inbox className="w-10 h-10 text-[#8E8E93]/40" />
          <p className="text-sm font-sans font-light text-[#8E8E93]">No messages correspond to the current filter selection.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {paginatedSubmissions.map((sub) => {
            const currentStatus = sub.status || "New";
            return (
              <div 
                key={sub.id} 
                className={`p-6 border rounded-none bg-[#1C1C1E] flex flex-col gap-4 transition-all text-left ${
                  currentStatus === "New" 
                    ? "border-[#C9A84C]/35 bg-[#C9A84C]/[0.02]" 
                    : "border-white/5 hover:border-white/15"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className="font-serif text-base font-bold text-white">{sub.name}</span>
                      {getStatusBadge(currentStatus)}
                    </div>
                    <span className="text-xs font-mono text-[#8E8E93]">{sub.email}</span>
                    {sub.organization && (
                      <span className="text-[10px] font-mono text-[#C9A84C]/95 uppercase tracking-wider mt-0.5">
                        Org: {sub.organization}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:items-end text-left md:text-right font-mono text-[10px] text-[#8E8E93]">
                    <span className="uppercase text-[#C9A84C] font-semibold">Enquiry Log</span>
                    <span>{new Date(sub.date || Date.now()).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-[9px] font-mono uppercase text-[#8E8E93] tracking-wider">Inquiry Category</span>
                    <h5 className="text-xs font-mono font-medium text-[#C9A84C]">{sub.category || "General Inquiry"}</h5>
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-[9px] font-mono uppercase text-[#8E8E93] tracking-wider">Subject Headline</span>
                    <h5 className="text-sm font-serif font-bold text-[#FDFBF7]">{sub.subject}</h5>
                  </div>

                  <div className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-[9px] font-mono uppercase text-[#8E8E93] tracking-wider">Message Content</span>
                    <p className="text-xs text-[#D5D3CC] leading-relaxed font-sans whitespace-pre-wrap bg-[#111112] p-4 border border-white/5 font-light select-all mt-1">
                      {sub.message}
                    </p>
                  </div>
                </div>

                {/* Reply History */}
                {sub.replies && sub.replies.length > 0 && (
                  <div className="p-4 bg-[#111112]/40 border border-[#C9A84C]/10 rounded-none flex flex-col gap-3.5 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>Reply History ({sub.replies.length})</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {sub.replies.map((rep) => (
                        <div key={rep.id} className="border-l-2 border-[#C9A84C]/30 pl-3.5 py-1.5 flex flex-col gap-1.5 text-xs bg-[#111112]/20">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono text-[#8E8E93]">
                            <span>To: <strong className="text-[#D5D3CC]">{rep.recipient}</strong></span>
                            <span>{new Date(rep.date).toLocaleString()}</span>
                          </div>
                          <span className="font-serif font-bold text-[#FDFBF7] text-xs">Subject: {rep.subject}</span>
                          <p className="text-[#D5D3CC] font-sans font-light leading-relaxed whitespace-pre-wrap italic">
                            {rep.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Composer Inline */}
                {composingReplyId === sub.id && (
                  <div className="p-5 bg-[#111112] border border-[#C9A84C]/30 flex flex-col gap-4 mt-2">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#C9A84C]" />
                        <span className="font-serif text-sm font-bold text-white">Compose Response Correspondence</span>
                      </div>
                      <button 
                        onClick={() => setComposingReplyId(null)}
                        className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#8E8E93] tracking-wider">Recipient Address</span>
                      <input 
                        type="text" 
                        value={sub.email} 
                        disabled
                        className="text-xs text-zinc-400 font-mono bg-zinc-900 border border-white/5 p-2.5 rounded-none cursor-not-allowed select-none w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#8E8E93] tracking-wider">Subject Title</span>
                      <input 
                        type="text" 
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        className="text-xs text-[#FDFBF7] font-serif font-bold bg-[#1C1C1E] border border-white/10 p-2.5 focus:border-[#C9A84C] outline-none w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-[#8E8E93] tracking-wider">Message Content</span>
                      <textarea 
                        rows={6}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your professional reply here..."
                        className="text-xs text-[#D5D3CC] leading-relaxed font-sans placeholder-zinc-600 bg-[#1C1C1E] border border-white/10 p-3 focus:border-[#C9A84C] outline-none resize-y w-full"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-3">
                      <button 
                        type="button"
                        onClick={() => setComposingReplyId(null)}
                        className="px-4 py-2 hover:bg-white/5 text-xs font-mono text-[#D5D3CC] uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button"
                        disabled={sendingReply}
                        onClick={() => handleSendReply(sub.id)}
                        className="px-4.5 py-2 bg-[#C9A84C] text-[#111112] hover:bg-[#C9A84C]/90 disabled:opacity-50 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-all"
                      >
                        {sendingReply ? (
                          <span>Sending...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Send Reply</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Card Action Rails */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 mt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {composingReplyId !== sub.id && (
                      <button
                        onClick={() => handleOpenReplyComposer(sub)}
                        disabled={updatingId === sub.id}
                        className="px-3.5 py-1.5 bg-[#C9A84C] text-[#111112] hover:bg-[#C9A84C]/90 transition-all font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <MessageSquare className="w-3 h-3" />
                        Reply
                      </button>
                    )}
                    {currentStatus === "New" && (
                      <button
                        onClick={() => handleUpdateStatus(sub.id, "Read")}
                        disabled={updatingId === sub.id}
                        className="px-3.5 py-1.5 bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20 border border-[#C9A84C]/20 transition-all font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" />
                        Mark as Read
                      </button>
                    )}
                    {currentStatus !== "Archived" && (
                      <button
                        onClick={() => handleUpdateStatus(sub.id, "Archived")}
                        disabled={updatingId === sub.id}
                        className="px-3.5 py-1.5 border border-white/10 hover:bg-white/5 text-[#D5D3CC] transition-all font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Archive className="w-3 h-3" />
                        Archive
                      </button>
                    )}
                    {currentStatus !== "New" && (
                      <button
                        onClick={() => handleUpdateStatus(sub.id, "New")}
                        disabled={updatingId === sub.id}
                        className="px-3.5 py-1.5 border border-[#C9A84C]/25 text-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Inbox className="w-3 h-3" />
                        Mark unread
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteMessage(sub.id)}
                    disabled={updatingId === sub.id}
                    className="px-3.5 py-1.5 text-red-400 bg-red-400/5 hover:bg-red-400/15 border border-red-500/20 font-mono text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
              <span className="text-[10px] font-mono text-[#8E8E93] uppercase">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredSubmissions.length)} of {filteredSubmissions.length} message records
              </span>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-[#D5D3CC] cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-white bg-white/5 border border-white/5">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-white/5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 text-[#D5D3CC] cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
