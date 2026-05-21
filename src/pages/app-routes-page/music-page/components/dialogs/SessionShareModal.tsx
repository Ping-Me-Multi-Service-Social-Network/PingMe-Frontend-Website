import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axiosClient from '@/lib/axiosClient';

interface SessionShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
}

interface SessionTokenResponse {
  token: string;
  shareLink: string;
  expiresAt: string;
}

function normalizeShareLink(rawLink: string): string {
  try {
    const currentOrigin = globalThis.location.origin;
    const parsed = new URL(rawLink, currentOrigin);
    // Force invite links to open on current app host to avoid landing-page 404 on other domains.
    return `${currentOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return rawLink;
  }
}

/**
 * Modal for sharing co-listening session with non-friends
 * Generates a JWT token that allows non-friends to join via link
 * Token expires after 10 minutes for security
 */
export const SessionShareModal: React.FC<SessionShareModalProps> = ({
  open,
  onOpenChange,
  sessionId,
}) => {
  const [shareData, setShareData] = useState<SessionTokenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (open) {
      generateShareToken();
    }
  }, [open]);

  const generateShareToken = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosClient.post<SessionTokenResponse>(
        `/music-service/music/sessions/${sessionId}/share-token`
      );
      setShareData({
        ...response.data,
        shareLink: normalizeShareLink(response.data.shareLink),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate share token';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform: 'whatsapp' | 'telegram' | 'email') => {
    if (!shareData) return;

    const message = `🎵 Join my listening session!\n\n${shareData.shareLink}`;
    const encodedMessage = encodeURIComponent(message);

    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedMessage}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareData.shareLink)}&text=Join%20my%20listening%20session`;
        break;
      case 'email':
        url = `mailto:?subject=Join%20my%20music%20session&body=${encodedMessage}`;
        break;
    }

    globalThis.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-green-500" />
            Share Session
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Generate a temporary invite link for non-friends to join your listening session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Token Expiry Warning */}
          <div className="flex gap-2 p-3 bg-amber-900/30 border border-amber-700/50 rounded-lg">
            <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200">
              <p className="font-medium">Token expires in 10 minutes</p>
              <p className="text-xs text-amber-300 mt-1">Generate new tokens to keep sharing your session</p>
            </div>
          </div>

          {error && (
            <div className="flex gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {shareData && (
            <>
              {/* Share Link */}
              <div className="space-y-2">
                <label htmlFor="share-link-input" className="block text-sm font-medium text-zinc-300">Share Link</label>
                <div className="flex gap-2">
                  <input
                    id="share-link-input"
                    type="text"
                    value={shareData.shareLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-100 truncate"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(shareData.shareLink, 'Link')}
                    className={`${copied ? 'text-green-500' : 'text-zinc-400'}`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Token */}
              <div className="space-y-2">
                <label htmlFor="token-input" className="block text-sm font-medium text-zinc-300">Token</label>
                <div className="flex gap-2">
                  <input
                    id="token-input"
                    type="password"
                    value={shareData.token}
                    readOnly
                    className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-100 font-mono text-xs truncate"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(shareData.token, 'Token')}
                    className={`${copied ? 'text-green-500' : 'text-zinc-400'}`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Share Options */}
              <div className="space-y-2">
                <span className="block text-sm font-medium text-zinc-300">Share Via</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareVia('whatsapp')}
                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-green-900/20"
                  >
                    WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareVia('telegram')}
                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-blue-900/20"
                  >
                    Telegram
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareVia('email')}
                    className="flex-1 border-zinc-700 text-zinc-300 hover:bg-purple-900/20"
                  >
                    Email
                  </Button>
                </div>
              </div>
            </>
          )}

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
              </div>
              <p className="text-sm text-zinc-400 mt-2">Generating share link...</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-zinc-700 text-zinc-300"
          >
            Close
          </Button>
          {shareData && (
            <Button
              onClick={generateShareToken}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              Generate New Token
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
