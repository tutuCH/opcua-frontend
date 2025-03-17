import Factory from '../factory';
import PostSearch from '../post-search';

// ----------------------------------------------------------------------

export default function FactoryView() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-row items-center justify-between mb-10">
        <h1 className="text-2xl font-bold tracking-tight">工廠</h1>
      </div>

      {/* 
      <div className="flex flex-row items-center justify-between mb-10">
        <PostSearch posts={posts} />
        <PostSort
          options={[
            { value: 'latest', label: 'Latest' },
            { value: 'popular', label: 'Popular' },
            { value: 'oldest', label: 'Oldest' },
          ]}
        />
      </div> 
      */}
      
      <div className="grid grid-cols-1 gap-6">
        <Factory />
      </div>
    </div>
  );
}
