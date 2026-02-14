const Badge = ({ status, children, className = '' }) => {
    const getStatusClass = () => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return 'badge-pending';
            case 'CONFIRMED':
                return 'badge-confirmed';
            case 'COMPLETED':
                return 'badge-completed';
            case 'CANCELLED':
                return 'badge-cancelled';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    return <span className={`badge ${getStatusClass()} ${className}`}>{children || status}</span>;
};

export default Badge;
