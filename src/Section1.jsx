import { FileText, MessageSquare, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
const steps = [
    {
        id: 1,
        icon: FileText,
        title: "Enter Details",
        description:
            "Provide your product name, key features, and target audience to give the AI context about your product.",
    },
    {
        id: 2,
        icon: MessageSquare,
        title: "Select Tone",
        description:
            "Choose the perfect tone for your product description. Professional for business, casual for lifestyle, or SEO for search visibility.",
    },
    {
        id: 3,
        icon: CheckCircle2,
        title: "Get Results",
        description:
            "Receive perfectly crafted product descriptions in seconds. Copy and use them anywhere instantly.",
    },
];
export default function Section1() {
    return (
        <section className="flex flex-col justify-center items-center p-2 gap-4 bg-gray-100 py-16">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="font-extrabold text-2xl md:text-3xl lg:text-4xl text-primary">
                How It Works
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-center text-[1.4rem]">Three simple steps to create amazing product descriptions</motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (<motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="shadow-xl p-4 w-full max-w-xs sm:max-w-sm md:max-w-sm lg:max-w-sm mx-auto rounded-2xl flex flex-col gap-6  items-center hover:scale-105 transition-transform ease duration-300">
                        <Icon size="40px" className="text-purple-400" />
                        <h2 className="text-[1.4rem] font-bold">{step.title}</h2>
                        <div className="text-[rgba(0,0,0,0.6)]">{step.description}</div>
                    </motion.div>
                    )
                })}
            </div>
        </section>
    );
}