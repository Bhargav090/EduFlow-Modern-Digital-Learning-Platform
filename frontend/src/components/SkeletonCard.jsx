const SkeletonCard = () => {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            {/* Image Placeholder */}
            <div className="w-full h-40 bg-slate-200 rounded-xl animate-pulse mb-4" />
            
            {/* Content Placeholders */}
            <div className="space-y-3">
                {/* Title */}
                <div className="h-6 bg-slate-200 rounded-md animate-pulse w-3/4" />
                
                {/* Description lines */}
                <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded-md animate-pulse w-full" />
                    <div className="h-4 bg-slate-200 rounded-md animate-pulse w-2/3" />
                </div>
                
                {/* Footer/Meta */}
                <div className="flex items-center justify-between pt-4 mt-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                        <div className="h-4 w-24 bg-slate-200 rounded-md animate-pulse" />
                    </div>
                    <div className="h-8 w-20 bg-slate-200 rounded-lg animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
