'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { useUserStore } from '../../lib/store/userStore';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UserModal({ open, onClose, onSuccess }: UserModalProps) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Don't subscribe to store to prevent re-renders - call action directly
  const setUser = useUserStore.getState().setUser;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setIsLoading(true);

    try {
      // Generate a unique user ID
      const user_id = crypto.randomUUID();

      // Create user in Supabase via API
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user_id,
          username: username.trim(),
          avatar_url: avatarUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      // Save to store and cache
      setUser({
        username: username.trim(),
        user_id,
      });

      // Start game session
      const sessionResponse = await fetch('/api/start-game-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id }),
      });

      if (!sessionResponse.ok) {
        const data = await sessionResponse.json();
        throw new Error(data.error || 'Failed to start game session');
      }

      // Trigger success callback
      onSuccess?.();

      // Close modal (will trigger Modal's closing animation)
      onClose();

      // Wait for animation to complete, then navigate
      setTimeout(() => {
        router.push('/game');
      }, 300);
    } catch (err) {
      console.error('Error creating user or starting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Only allow closing if not loading
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Welcome to AI Trivia Arena"
      preventClose={isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-sm text-white/60 mb-4">Create your profile to start playing</div>

        <Input
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          required
          autoFocus
        />

        <Input
          label="Avatar URL (Optional)"
          placeholder="Link to your avatar image"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          disabled={isLoading}
        />

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !username.trim()} className="flex-1">
            {isLoading ? 'Creating...' : 'Start Playing'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
