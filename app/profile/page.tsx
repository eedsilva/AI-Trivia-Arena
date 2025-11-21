'use client';
import { useState } from 'react';
import { FormCard } from '../../components/FormCard';
import { Input } from '../../components/global/Input';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [social, setSocial] = useState('');
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <FormCard title="Create Your Profile" description="Let’s get you set up for the arena.">
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Social Media (Optional)"
            placeholder="Link your profile"
            value={social}
            onChange={(e) => setSocial(e.target.value)}
          />
          <PrimaryButton onClick={() => router.push('/settings')} disabled={!name.trim()}>
            Continue
          </PrimaryButton>
        </div>
      </FormCard>
    </main>
  );
}
