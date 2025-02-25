import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingSkeleton({ length = 8 }) {
  return (
    <>
      {Array.from({ length }).map((_, index) => (
        <Skeleton key={index} className="h-[125px] w-[calc(50%-1rem)] lg:w-[250px] rounded-xl" />
      ))}
    </>
  );
}
