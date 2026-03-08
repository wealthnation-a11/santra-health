import { useState } from "react";
import { useAdminConversations } from "@/hooks/useAdminStats";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

export default function AdminConversations() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAdminConversations(page);

  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Conversations</h2>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.conversations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No conversations found</TableCell>
              </TableRow>
            ) : (
              data?.conversations.map((conv) => (
                <TableRow key={conv.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{conv.title}</TableCell>
                  <TableCell>{conv.full_name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={conv.library_id ? "default" : "outline"}>
                      {conv.library_id ? "Library" : "General"}
                    </Badge>
                  </TableCell>
                  <TableCell>{conv.message_count}</TableCell>
                  <TableCell>{format(new Date(conv.updated_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} conversations</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
