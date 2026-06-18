import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8 flex flex-col">
      <div className="h-16 flex items-center justify-center mb-10 mt-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
      </div>
      
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="h-24 md:h-32 bg-card rounded-2xl border border-border shadow-sm animate-pulse flex items-center p-6">
           <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
           <div className="ml-4 space-y-3 flex-1">
             <div className="h-4 bg-gray-200 rounded w-1/4"></div>
             <div className="h-3 bg-gray-200 rounded w-1/3"></div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-card border border-border rounded-2xl animate-pulse p-5 flex flex-col justify-between">
              <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
          
          <div className="md:col-span-3 h-[400px] bg-card border border-border rounded-2xl animate-pulse"></div>
          <div className="h-[400px] bg-card border border-border rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
