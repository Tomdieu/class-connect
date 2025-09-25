import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Enhanced stat card with dynamic colors and animations
interface StatCardProps {
    icon: React.ReactNode;
    value: React.ReactNode;
    label: string;
    delay?: number;
    gradient?: string;
}

const StatCard: React.FC<StatCardProps> = ({
    icon,
    value,
    label,
    delay = 0,
    gradient = "bg-gradient-to-br from-primary-500 to-primary-600",
}) => {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.3,
    });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay }}
            whileHover={{ scale: 1.05, translateY: -8 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center border border-primary/10 overflow-hidden relative group"
        >
            <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-primary/10 transition-all duration-500 group-hover:scale-150"></div>
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-primary/5 transition-all duration-700 group-hover:scale-150"></div>

            <div className={`p-5 rounded-full ${gradient} text-white mb-5 shadow-lg relative z-10`}>
                {icon}
            </div>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight relative z-10">
                {inView ? (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                    >
                        {value}
                    </motion.span>
                ) : (
                    value
                )}
            </h3>
            <p className="text-gray-600 font-medium relative z-10">{label}</p>
        </motion.div>
    );
};


export default StatCard;