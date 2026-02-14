const Card = ({ title, value, icon: Icon, trend, className = '' }) => {
    return (
        <div className={`card ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">{title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="bg-indigo-100 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-indigo-600" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Card;
