import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ChatView } from '@/components/jurata/ChatView';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getConversation, deleteConversation } from '@/lib/services/chat';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { useChatMetadata } from '@/hooks/use-chat-metadata';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';

export function ChatDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t, i18n } = useTranslation();

  const { data: conversation, isLoading, error } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => getConversation(id!),
    enabled: !!id,
    retry: false
  });

  useEffect(() => {
    if (!isLoading && (!conversation || error)) {
      navigate('/request', { replace: true });
    }
  }, [conversation, isLoading, error, navigate]);

  useChatMetadata(id);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setIsDeleting(true);
      await deleteConversation(id);
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      await queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      toast.success(t('toast.conversationDeleted'));
      navigate('/request', { replace: true });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error(t('toast.errorDeletingConversation'));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (!id) {
    navigate('/request', { replace: true });
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[calc(100vh-12rem)]" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold">{t('chatDetail.conversationNotFound')}</h2>
        <p className="text-muted-foreground">
          {t('chatDetail.conversationNotFoundDescription')}
        </p>
      </div>
    );
  }

  const formattedDate = format(
    new Date(conversation.created_at), 
    i18n.language === 'de' ? "d. MMMM yyyy" : "MMMM d, yyyy", 
    { locale: i18n.language === 'de' ? de : enUS }
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative pb-10">
      <div className="pb-5">
        <div className="space-y-6">
          <Breadcrumb
            items={[
              { label: t('navigation.jurataAI'), href: '/request' },
              {
                label: t('chatDetail.conversationFrom', { date: formattedDate }),
                href: `/request/${id}`,
              },
            ]}
          />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">
                {conversation.title || t('chatDetail.conversationFrom', { date: formattedDate })}
              </h3>
              {conversation.metadata?.summary && (
                <p className="text-sm text-muted-foreground mt-1">
                  {conversation.metadata.summary}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {conversation.metadata?.topics && conversation.metadata.topics.length > 0 && (
            <div className="flex gap-2">
              {conversation.metadata.topics.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 -mt-20 pt-20">
        <ChatView conversationId={id} />
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('chatDetail.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('chatDetail.deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t('chatDetail.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('chatDetail.deleteDialog.deleting') : t('chatDetail.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}