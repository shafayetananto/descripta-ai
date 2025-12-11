import { Copy, Check } from "lucide-react";
import { motion } from "motion/react";
export default function DescriptionCard({ description, index, copiedIndex, onCopy }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="w-full max-w-sm text-black sm:m-2 mb-7 p-4 rounded-2xl shadow-xl hover:scale-105 transition-transform ease duration-300 hover:ring-2 ring-accent">
            <div className="flex justify-between m-2">
                <div className="text-[1.2rem] p-2 text-highlight">Version {index + 1}</div>
                <button className="hover:bg-accent rounded-3xl p-2 cursor-pointer" onClick={() => onCopy(description, index)}>
                    {copiedIndex === index ? (
                        <div className="flex items-center gap-2 text-green-500">
                            <Check />
                            <div>Copied!</div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-highlight">
                            <Copy />
                            <div>Copy</div>
                        </div>
                    )}
                </button>
            </div>
            <div>{description}</div>
        </motion.div>
    );
}