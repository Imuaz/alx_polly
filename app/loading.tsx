import { MinimalLoading } from '@/components/ui/minimal-loading';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <MinimalLoading message="Loading your application..." size="lg" />
    </div>
  );
}

