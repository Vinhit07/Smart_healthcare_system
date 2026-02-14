const Badge = ({ status, children, className = '' }) => {
    const getStatusClass = () => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'bg-amber-100 text-amber-800';
            case 'CONFIRMED':
                return 'bg-indigo-100 text-indigo-800';
            case 'COMPLETED':
            case 'SUCCESS':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
            case 'DANGER':
                return 'bg-red-100 text-red-800';
            case 'WARNING':
            case 'IN_PROGRESS':
                return 'bg-yellow-100 text-yellow-800';
            case 'OPEN':
                return 'bg-blue-100 text-blue-800';
            case 'CLOSED':
                return 'bg-slate-100 text-slate-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass()} ${className}`}>
            {children || status}
        </span>
    );
};

export default Badge;
